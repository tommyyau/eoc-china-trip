import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, Loader } from 'lucide-react';
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

// Strip non-ASCII characters (Chinese, etc.) that cause encoding issues in PDF
function sanitizeText(text) {
    if (!text) return '';
    // Keep only ASCII printable characters and common punctuation
    return text.replace(/[^\x20-\x7E\n\r\t]/g, '').replace(/\s+/g, ' ').trim();
}

const PDFDownload = ({ label, variant = 'default' }) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');

    const generatePDF = async () => {
        try {
            setLoading(true);
            setProgress('Generating PDF...');

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

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
            // Dark background
            doc.setFillColor(33, 33, 33);
            doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

            // Title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(36);
            doc.setTextColor(...COLORS.white);
            doc.text('China 2026', PAGE.width / 2, 70, { align: 'center' });
            doc.text('Hiking Trip', PAGE.width / 2, 85, { align: 'center' });

            // Subtitle
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('15 Days of Adventure', PAGE.width / 2, 105, { align: 'center' });
            doc.text('May 8 - May 22, 2026', PAGE.width / 2, 115, { align: 'center' });

            // Decorative line
            doc.setDrawColor(...COLORS.primary);
            doc.setLineWidth(1);
            doc.line(PAGE.width / 2 - 30, 125, PAGE.width / 2 + 30, 125);

            // Region overview box
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(PAGE.marginX, 140, PAGE.contentWidth, 95, 3, 3, 'F');

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.dark);
            doc.text('Your Journey', PAGE.width / 2, 152, { align: 'center' });

            // Region list
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            let regionY = 164;
            destinationRegions.forEach((region, idx) => {
                const dayRange = region.days.length > 1
                    ? `Days ${region.days[0]}-${region.days[region.days.length - 1]}`
                    : `Day ${region.days[0]}`;
                doc.setTextColor(...COLORS.medium);
                doc.text(`${region.name.en}`, PAGE.marginX + 20, regionY);
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

            // Group days by region
            const getDaysByRegion = (regionId) => {
                return itineraryData.filter(day => day.region === regionId);
            };

            for (const region of destinationRegions) {
                const regionDays = getDaysByRegion(region.id);
                if (regionDays.length === 0) continue;

                setProgress(`Processing ${region.name.en}...`);

                // Region Header
                checkNewPage(30);

                // Region header background
                doc.setFillColor(...COLORS.primary);
                doc.rect(0, currentY - 5, PAGE.width, 22, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(...COLORS.white);
                doc.text(region.name.en, PAGE.width / 2, currentY + 6, { align: 'center' });

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const dayRange = region.days.length > 1
                    ? `Days ${region.days[0]} - ${region.days[region.days.length - 1]}`
                    : `Day ${region.days[0]}`;
                doc.text(dayRange, PAGE.width / 2, currentY + 13, { align: 'center' });

                currentY += 25;

                // Days in this region
                for (const day of regionDays) {
                    // Day header
                    checkNewPage(25);

                    // Day badge and title
                    doc.setFillColor(...COLORS.secondary);
                    doc.roundedRect(PAGE.marginX, currentY, 22, 8, 1, 1, 'F');
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8);
                    doc.setTextColor(...COLORS.white);
                    doc.text(`Day ${day.day}`, PAGE.marginX + 11, currentY + 5.5, { align: 'center' });

                    // Date and location
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(...COLORS.medium);
                    doc.text(`${day.date} • ${day.location || ''}`, PAGE.marginX + 27, currentY + 5.5);

                    currentY += 12;

                    // Title
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(13);
                    doc.setTextColor(...COLORS.dark);
                    doc.text(sanitizeText(day.title) || '', PAGE.marginX, currentY);
                    currentY += 7;

                    // Day description (if any)
                    const cleanDayDesc = sanitizeText(day.description);
                    if (cleanDayDesc) {
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(9);
                        doc.setTextColor(...COLORS.medium);
                        const descLines = doc.splitTextToSize(cleanDayDesc, PAGE.contentWidth);

                        // Check if we need new page for description
                        if (currentY + (descLines.length * 4) > PAGE.height - PAGE.marginY) {
                            doc.addPage();
                            currentY = PAGE.marginY;
                        }

                        doc.text(descLines, PAGE.marginX, currentY);
                        currentY += descLines.length * 4 + 3;
                    }

                    // Segments
                    if (day.segments && day.segments.length > 0) {
                        for (const segment of day.segments) {
                            // Sanitize description text to remove Chinese characters
                            const cleanDescription = sanitizeText(segment.description);
                            const segDescLines = cleanDescription
                                ? doc.splitTextToSize(cleanDescription, PAGE.contentWidth - 15)
                                : [];
                            const segHeight = 20 + (segDescLines.length * 4) + (segment.highlights?.length ? 6 : 0);

                            checkNewPage(segHeight);

                            // Segment time badge
                            if (segment.time) {
                                doc.setFillColor(240, 240, 240);
                                doc.roundedRect(PAGE.marginX, currentY, 20, 5, 1, 1, 'F');
                                doc.setFont('helvetica', 'normal');
                                doc.setFontSize(7);
                                doc.setTextColor(...COLORS.medium);
                                doc.text(segment.time, PAGE.marginX + 10, currentY + 3.5, { align: 'center' });
                            }

                            // Segment title
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(10);
                            doc.setTextColor(...COLORS.dark);
                            const titleX = segment.time ? PAGE.marginX + 24 : PAGE.marginX;
                            doc.text(sanitizeText(segment.title) || '', titleX, currentY + 4);

                            // Duration (if any)
                            if (segment.duration) {
                                doc.setFont('helvetica', 'normal');
                                doc.setFontSize(8);
                                doc.setTextColor(...COLORS.light);
                                doc.text(`(${segment.duration})`, PAGE.width - PAGE.marginX, currentY + 4, { align: 'right' });
                            }

                            currentY += 12;

                            // Segment description
                            if (cleanDescription) {
                                doc.setFont('helvetica', 'normal');
                                doc.setFontSize(8);
                                doc.setTextColor(...COLORS.medium);
                                doc.text(segDescLines, PAGE.marginX + 5, currentY);
                                currentY += segDescLines.length * 3.5 + 2;
                            }

                            // Segment highlights
                            if (segment.highlights && segment.highlights.length > 0) {
                                doc.setFont('helvetica', 'italic');
                                doc.setFontSize(8);
                                doc.setTextColor(...COLORS.secondary);
                                const highlightText = segment.highlights.map(h => sanitizeText(h)).join(' • ');
                                const highlightLines = doc.splitTextToSize(highlightText, PAGE.contentWidth - 10);
                                doc.text(highlightLines, PAGE.marginX + 5, currentY);
                                currentY += highlightLines.length * 3.5 + 2;
                            }

                            currentY += 3;
                        }
                    }

                    // Meals & Accommodation footer
                    const accom = day.accommodation?.name || '';
                    if (day.meals || accom) {
                        checkNewPage(12);

                        doc.setDrawColor(220, 220, 220);
                        doc.setLineWidth(0.3);
                        doc.line(PAGE.marginX, currentY, PAGE.width - PAGE.marginX, currentY);
                        currentY += 5;

                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8);

                        if (day.meals) {
                            doc.setTextColor(...COLORS.secondary);
                            doc.text(`Meals: ${day.meals}`, PAGE.marginX, currentY);
                        }

                        if (accom && accom !== 'N/A' && accom !== '') {
                            doc.setTextColor(...COLORS.success);
                            const accomText = day.accommodation?.rating
                                ? `Stay: ${accom} (${day.accommodation.rating})`
                                : `Stay: ${accom}`;
                            doc.text(accomText, PAGE.width / 2, currentY);
                        }

                        currentY += 8;
                    }

                    currentY += 5;
                }

                currentY += 5;
            }

            // ===== INFORMATION PAGE =====
            setProgress('Adding information...');
            doc.addPage();
            currentY = PAGE.marginY;

            // Info Header
            doc.setFillColor(...COLORS.secondary);
            doc.rect(0, currentY - 5, PAGE.width, 18, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(...COLORS.white);
            doc.text('Essential Information', PAGE.width / 2, currentY + 6, { align: 'center' });
            currentY += 22;

            // Visa Section
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(...COLORS.secondary);
            doc.text(infoData.visa.title.en, PAGE.marginX, currentY);
            currentY += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.medium);
            infoData.visa.items.forEach((item) => {
                const text = item.en;
                const lines = doc.splitTextToSize(`• ${text}`, PAGE.contentWidth - 5);
                doc.text(lines, PAGE.marginX + 3, currentY);
                currentY += lines.length * 4 + 2;
            });

            currentY += 8;

            // Cost Section
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(...COLORS.primary);
            doc.text(infoData.cost.title.en, PAGE.marginX, currentY);
            currentY += 8;

            // Price badge
            doc.setFillColor(...COLORS.primary);
            doc.roundedRect(PAGE.marginX, currentY, PAGE.contentWidth, 10, 2, 2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.white);
            doc.text(infoData.cost.price.en, PAGE.width / 2, currentY + 7, { align: 'center' });
            currentY += 16;

            // Includes
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.success);
            doc.text(infoData.cost.includesTitle.en.toUpperCase(), PAGE.marginX, currentY);
            currentY += 5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.medium);
            infoData.cost.includes.forEach((item) => {
                doc.text(`+ ${item.en}`, PAGE.marginX + 3, currentY);
                currentY += 5;
            });

            currentY += 6;

            // Excludes
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.light);
            doc.text(infoData.cost.excludesTitle.en.toUpperCase(), PAGE.marginX, currentY);
            currentY += 5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.light);
            infoData.cost.excludes.forEach((item) => {
                if (item.en) {
                    doc.text(`- ${item.en}`, PAGE.marginX + 3, currentY);
                    currentY += 5;
                }
            });

            // ===== PAGE NUMBERS =====
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(...COLORS.light);
                doc.text(`Page ${i} of ${pageCount}`, PAGE.width / 2, PAGE.height - 8, { align: 'center' });
                if (i > 1) {
                    doc.text('China 2026 Hiking Trip', PAGE.marginX, PAGE.height - 8);
                }
            }

            // Save
            setProgress('Downloading...');
            doc.save('China_2026_Hiking_Trip_Itinerary.pdf');
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
                    {progress || 'Generating...'}
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
