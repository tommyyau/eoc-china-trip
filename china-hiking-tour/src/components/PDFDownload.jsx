import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { itineraryData } from '../data/cmsData';
import { destinationRegions } from '../data/destinationRegions';
import infoData from '../data/info-page.json';

// Colors
const COLORS = {
    primary: [216, 67, 21],      // Red
    secondary: [25, 118, 210],   // Blue
    dark: [33, 33, 33],
    medium: [100, 100, 100],
    light: [150, 150, 150],
    success: [56, 142, 60],
    white: [255, 255, 255],
    offWhite: [248, 248, 248],
};

// Page dimensions (A4)
const PAGE = {
    width: 210,
    height: 297,
    marginX: 15,
    marginY: 15,
    contentWidth: 180,
};

// Chinese font URL - Noto Sans SC static OTF from noto-cjk repo (subset for Simplified Chinese only, ~8MB)
const CHINESE_FONT_URL = 'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf';

// Get localized text from bilingual object or string
function getText(value, lang) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value[lang]) return value[lang];
    if (typeof value === 'object' && value.en) return value.en;
    return '';
}

// Load Chinese font and add to jsPDF
async function loadChineseFont(doc, setProgress) {
    try {
        setProgress('加载中文字体... (约8MB)');

        const response = await fetch(CHINESE_FONT_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const fontData = await response.arrayBuffer();
        if (fontData.byteLength < 5000000) {
            throw new Error('Font file too small, may be corrupted');
        }

        setProgress('处理字体数据...');

        // Convert to base64 in chunks to avoid call stack issues
        const bytes = new Uint8Array(fontData);
        let binary = '';
        const chunkSize = 32768;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.slice(i, i + chunkSize));
        }
        const fontBase64 = btoa(binary);

        doc.addFileToVFS('NotoSansSC-Regular.otf', fontBase64);
        doc.addFont('NotoSansSC-Regular.otf', 'NotoSansSC', 'normal');

        console.log('Chinese font loaded successfully, size:', fontData.byteLength);
        return true;
    } catch (error) {
        console.error('Failed to load Chinese font:', error);
        return false;
    }
}

const PDFDownload = ({ label, variant = 'default' }) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const { language } = useLanguage();

    const isChinese = language === 'cn';

    // Get localized content
    const t = (value) => getText(value, language);

    // UI labels
    const labels = {
        en: {
            yourJourney: 'Your Journey',
            days: 'Days',
            day: 'Day',
            essentialInfo: 'Essential Information',
            meals: 'Meals',
            stay: 'Stay',
            page: 'Page',
            of: 'of',
            title: 'China 2026',
            subtitle: 'Hiking Trip',
            adventure: '14 Days of Adventure',
            dates: 'May 8 - May 22, 2026',
            filename: 'China_2026_Hiking_Trip_Itinerary.pdf',
        },
        cn: {
            yourJourney: '您的旅程',
            days: '天',
            day: '第',
            essentialInfo: '重要信息',
            meals: '餐食',
            stay: '住宿',
            page: '第',
            of: '页，共',
            title: '2026中国',
            subtitle: '徒步之旅',
            adventure: '14天探险之旅',
            dates: '2026年5月8日 - 5月22日',
            filename: '2026中国徒步之旅行程.pdf',
        }
    };
    const ui = labels[language] || labels.en;

    const generatePDF = async () => {
        try {
            setLoading(true);
            setProgress('Initializing...');

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Load Chinese font if needed
            let fontLoaded = false;
            if (isChinese) {
                fontLoaded = await loadChineseFont(doc, setProgress);
                if (!fontLoaded) {
                    alert('Failed to load Chinese font. Generating English PDF instead.');
                }
            }

            // Set font helper
            const setFont = (style = 'normal', size = 10) => {
                if (isChinese && fontLoaded) {
                    doc.setFont('NotoSansSC', 'normal');
                } else {
                    doc.setFont('helvetica', style);
                }
                doc.setFontSize(size);
            };

            let currentY = PAGE.marginY;

            // Helper: Add new page if needed
            const checkNewPage = (neededHeight) => {
                if (currentY + neededHeight > PAGE.height - PAGE.marginY) {
                    doc.addPage();
                    currentY = PAGE.marginY;
                    return true;
                }
                return false;
            };

            // ===== COVER PAGE =====
            setProgress(isChinese ? '生成封面...' : 'Creating cover...');

            // Dark background
            doc.setFillColor(33, 33, 33);
            doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

            // Title
            setFont('bold', 36);
            doc.setTextColor(...COLORS.white);
            doc.text(ui.title, PAGE.width / 2, 70, { align: 'center' });
            doc.text(ui.subtitle, PAGE.width / 2, 85, { align: 'center' });

            // Subtitle
            setFont('normal', 14);
            doc.text(ui.adventure, PAGE.width / 2, 105, { align: 'center' });
            doc.text(ui.dates, PAGE.width / 2, 115, { align: 'center' });

            // Decorative line
            doc.setDrawColor(...COLORS.primary);
            doc.setLineWidth(1);
            doc.line(PAGE.width / 2 - 30, 125, PAGE.width / 2 + 30, 125);

            // Region overview box
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(PAGE.marginX, 140, PAGE.contentWidth, 95, 3, 3, 'F');

            setFont('bold', 12);
            doc.setTextColor(...COLORS.dark);
            doc.text(ui.yourJourney, PAGE.width / 2, 152, { align: 'center' });

            // Region list
            setFont('normal', 10);
            let regionY = 164;
            destinationRegions.forEach((region, idx) => {
                const dayRange = region.days.length > 1
                    ? (isChinese ? `第${region.days[0]}-${region.days[region.days.length - 1]}天` : `Days ${region.days[0]}-${region.days[region.days.length - 1]}`)
                    : (isChinese ? `第${region.days[0]}天` : `Day ${region.days[0]}`);
                doc.setTextColor(...COLORS.medium);
                doc.text(t(region.name), PAGE.marginX + 20, regionY);
                doc.text(dayRange, PAGE.width - PAGE.marginX - 20, regionY, { align: 'right' });
                if (idx < destinationRegions.length - 1) {
                    doc.setDrawColor(220, 220, 220);
                    doc.setLineWidth(0.2);
                    doc.line(PAGE.marginX + 15, regionY + 4, PAGE.width - PAGE.marginX - 15, regionY + 4);
                }
                regionY += 11;
            });

            // ===== ITINERARY PAGES =====
            doc.addPage();
            currentY = PAGE.marginY;

            // Group days by region (filter out any undefined entries and Day 0)
            const getDaysByRegion = (regionId) => {
                return itineraryData.filter(day => day && day.day > 0 && day.region === regionId);
            };

            for (const region of destinationRegions) {
                const regionDays = getDaysByRegion(region.id);
                if (regionDays.length === 0) continue;

                setProgress(isChinese ? `处理 ${t(region.name)}...` : `Processing ${t(region.name)}...`);

                // Region Header
                checkNewPage(30);

                // Region header background
                doc.setFillColor(...COLORS.primary);
                doc.rect(0, currentY - 5, PAGE.width, 22, 'F');

                setFont('bold', 16);
                doc.setTextColor(...COLORS.white);
                doc.text(t(region.name), PAGE.width / 2, currentY + 6, { align: 'center' });

                setFont('normal', 10);
                const dayRange = region.days.length > 1
                    ? (isChinese ? `第${region.days[0]} - ${region.days[region.days.length - 1]}天` : `Days ${region.days[0]} - ${region.days[region.days.length - 1]}`)
                    : (isChinese ? `第${region.days[0]}天` : `Day ${region.days[0]}`);
                doc.text(dayRange, PAGE.width / 2, currentY + 13, { align: 'center' });

                currentY += 25;

                // Days in this region
                for (const day of regionDays) {
                    // Day header
                    checkNewPage(25);

                    // Day badge
                    doc.setFillColor(...COLORS.secondary);
                    doc.roundedRect(PAGE.marginX, currentY, 22, 8, 1, 1, 'F');
                    setFont('bold', 8);
                    doc.setTextColor(...COLORS.white);
                    const dayLabel = isChinese ? `第${day.day}天` : `Day ${day.day}`;
                    doc.text(dayLabel, PAGE.marginX + 11, currentY + 5.5, { align: 'center' });

                    // Date and location
                    setFont('normal', 9);
                    doc.setTextColor(...COLORS.medium);
                    doc.text(`${day.date} • ${t(day.location) || ''}`, PAGE.marginX + 27, currentY + 5.5);

                    currentY += 12;

                    // Title
                    setFont('bold', 13);
                    doc.setTextColor(...COLORS.dark);
                    const dayTitle = day.title ? t(day.title) : '';
                    doc.text(dayTitle, PAGE.marginX, currentY);
                    currentY += 7;

                    // Day description
                    const dayDesc = t(day.description);
                    if (dayDesc) {
                        setFont('normal', 9);
                        doc.setTextColor(...COLORS.medium);
                        const descLines = doc.splitTextToSize(dayDesc, PAGE.contentWidth);

                        if (currentY + (descLines.length * 4) > PAGE.height - PAGE.marginY) {
                            doc.addPage();
                            currentY = PAGE.marginY;
                        }

                        doc.text(descLines, PAGE.marginX, currentY);
                        currentY += descLines.length * 4 + 3;
                    }

                    // Segments
                    const validSegments = (day.segments || []).filter(seg => seg && seg.title);
                    if (validSegments.length > 0) {
                        for (const segment of validSegments) {
                            const segDesc = t(segment.description);
                            const segDescLines = segDesc
                                ? doc.splitTextToSize(segDesc, PAGE.contentWidth - 15)
                                : [];
                            const hasHighlights = segment.highlights && segment.highlights.length > 0;
                            const segHeight = 20 + (segDescLines.length * 4) + (hasHighlights ? 6 : 0);

                            checkNewPage(segHeight);

                            // Segment time badge
                            const segTime = t(segment.time);
                            if (segTime) {
                                doc.setFillColor(240, 240, 240);
                                const badgeWidth = isChinese ? 16 : 20;
                                doc.roundedRect(PAGE.marginX, currentY, badgeWidth, 5, 1, 1, 'F');
                                setFont('normal', 7);
                                doc.setTextColor(...COLORS.medium);
                                doc.text(segTime, PAGE.marginX + badgeWidth / 2, currentY + 3.5, { align: 'center' });
                            }

                            // Segment title
                            setFont('bold', 10);
                            doc.setTextColor(...COLORS.dark);
                            const titleX = segTime ? PAGE.marginX + (isChinese ? 20 : 24) : PAGE.marginX;
                            doc.text(t(segment.title) || '', titleX, currentY + 4);

                            // Duration
                            if (segment.duration) {
                                setFont('normal', 8);
                                doc.setTextColor(...COLORS.light);
                                doc.text(`(${segment.duration})`, PAGE.width - PAGE.marginX, currentY + 4, { align: 'right' });
                            }

                            currentY += 12;

                            // Segment description
                            if (segDesc) {
                                setFont('normal', 8);
                                doc.setTextColor(...COLORS.medium);
                                doc.text(segDescLines, PAGE.marginX + 5, currentY);
                                currentY += segDescLines.length * 3.5 + 2;
                            }

                            // Segment highlights
                            if (hasHighlights) {
                                setFont('normal', 8);
                                doc.setTextColor(...COLORS.secondary);
                                const highlightText = segment.highlights.map(h => t(h)).join(' • ');
                                const highlightLines = doc.splitTextToSize(highlightText, PAGE.contentWidth - 10);
                                doc.text(highlightLines, PAGE.marginX + 5, currentY);
                                currentY += highlightLines.length * 3.5 + 2;
                            }

                            currentY += 3;
                        }
                    }

                    // Meals & Accommodation footer
                    const meals = t(day.meals);
                    const accom = day.accommodation?.name || '';
                    if (meals || accom) {
                        checkNewPage(12);

                        doc.setDrawColor(220, 220, 220);
                        doc.setLineWidth(0.3);
                        doc.line(PAGE.marginX, currentY, PAGE.width - PAGE.marginX, currentY);
                        currentY += 5;

                        setFont('normal', 8);

                        if (meals) {
                            doc.setTextColor(...COLORS.secondary);
                            doc.text(`${ui.meals}: ${meals}`, PAGE.marginX, currentY);
                        }

                        if (accom && accom !== 'N/A' && accom !== '') {
                            doc.setTextColor(...COLORS.success);
                            const accomText = day.accommodation?.rating
                                ? `${ui.stay}: ${accom} (${day.accommodation.rating})`
                                : `${ui.stay}: ${accom}`;
                            doc.text(accomText, PAGE.width / 2, currentY);
                        }

                        currentY += 8;
                    }

                    currentY += 5;
                }

                currentY += 5;
            }

            // ===== INFORMATION PAGE =====
            setProgress(isChinese ? '添加信息页...' : 'Adding information...');
            doc.addPage();
            currentY = PAGE.marginY;

            // Info Header
            doc.setFillColor(...COLORS.secondary);
            doc.rect(0, currentY - 5, PAGE.width, 18, 'F');
            setFont('bold', 14);
            doc.setTextColor(...COLORS.white);
            doc.text(ui.essentialInfo, PAGE.width / 2, currentY + 6, { align: 'center' });
            currentY += 22;

            // Price Section
            setFont('bold', 12);
            doc.setTextColor(...COLORS.primary);
            doc.text(isChinese ? '价格信息' : 'Price Information', PAGE.marginX, currentY);
            currentY += 8;

            // Price badge
            const priceText = `${infoData.price.amount} ${t(infoData.price.perPerson)} • ${t(infoData.price.dates)}`;
            setFont('bold', 9);
            const priceLines = doc.splitTextToSize(priceText, PAGE.contentWidth - 10);
            const priceBoxHeight = 8 + (priceLines.length * 5);

            doc.setFillColor(...COLORS.primary);
            doc.roundedRect(PAGE.marginX, currentY, PAGE.contentWidth, priceBoxHeight, 2, 2, 'F');
            doc.setTextColor(...COLORS.white);

            let priceY = currentY + 6;
            priceLines.forEach((line) => {
                doc.text(line, PAGE.width / 2, priceY, { align: 'center' });
                priceY += 5;
            });
            currentY += priceBoxHeight + 6;

            // Price details
            setFont('normal', 8);
            doc.setTextColor(...COLORS.medium);
            doc.text(t(infoData.price.basis), PAGE.marginX, currentY);
            currentY += 4;
            doc.text(t(infoData.price.singleSupplement), PAGE.marginX, currentY);
            currentY += 8;

            // Includes
            setFont('bold', 10);
            doc.setTextColor(...COLORS.success);
            doc.text(t(infoData.included.title).toUpperCase(), PAGE.marginX, currentY);
            currentY += 5;

            setFont('normal', 9);
            doc.setTextColor(...COLORS.medium);
            infoData.included.items.forEach((item) => {
                doc.text(`+ ${t(item.text)}`, PAGE.marginX + 3, currentY);
                currentY += 5;
            });

            currentY += 6;

            // Not Included
            setFont('bold', 10);
            doc.setTextColor(...COLORS.light);
            doc.text(t(infoData.notIncluded.title).toUpperCase(), PAGE.marginX, currentY);
            currentY += 5;

            setFont('normal', 9);
            doc.setTextColor(...COLORS.light);
            infoData.notIncluded.items.forEach((item) => {
                const text = t(item.text);
                if (text) {
                    doc.text(`- ${text}`, PAGE.marginX + 3, currentY);
                    currentY += 5;
                }
            });

            // ===== PAGE NUMBERS =====
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                setFont('normal', 8);
                doc.setTextColor(...COLORS.light);
                const pageText = isChinese
                    ? `${ui.page}${i}${ui.of}${pageCount}页`
                    : `${ui.page} ${i} ${ui.of} ${pageCount}`;
                doc.text(pageText, PAGE.width / 2, PAGE.height - 8, { align: 'center' });
                if (i > 1) {
                    const footerText = isChinese ? '2026中国徒步之旅' : 'China 2026 Hiking Trip';
                    doc.text(footerText, PAGE.marginX, PAGE.height - 8);
                }
            }

            // Save
            setProgress(isChinese ? '下载中...' : 'Downloading...');
            doc.save(ui.filename);
            setProgress('');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Failed to generate PDF: ${error.message}`);
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    const isLight = variant === 'light';

    return (
        <button
            onClick={generatePDF}
            disabled={loading}
            style={{
                padding: '0.875rem 2rem',
                fontSize: '1.0625rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderRadius: '8px',
                border: isLight ? '2px solid white' : '2px solid var(--primary-blue)',
                background: isLight ? 'rgba(255,255,255,0.15)' : 'white',
                color: isLight ? 'white' : 'var(--primary-blue)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.8 : 1,
                backdropFilter: isLight ? 'blur(10px)' : 'none',
            }}
            onMouseEnter={(e) => {
                if (!loading) {
                    if (isLight) {
                        e.target.style.background = 'rgba(255,255,255,0.25)';
                    } else {
                        e.target.style.background = 'var(--primary-blue)';
                        e.target.style.color = 'white';
                    }
                }
            }}
            onMouseLeave={(e) => {
                if (!loading) {
                    if (isLight) {
                        e.target.style.background = 'rgba(255,255,255,0.15)';
                    } else {
                        e.target.style.background = 'white';
                        e.target.style.color = 'var(--primary-blue)';
                    }
                }
            }}
        >
            {loading ? (
                <>
                    <Loader className="animate-spin" size={20} />
                    {progress || (isChinese ? '生成中...' : 'Generating...')}
                </>
            ) : (
                <>
                    <Download size={20} />
                    {label}
                </>
            )}
        </button>
    );
};

export default PDFDownload;
