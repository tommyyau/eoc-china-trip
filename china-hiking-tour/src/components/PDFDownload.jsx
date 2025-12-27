import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Download, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { itineraryData } from '../data/cmsData';
import { destinationRegions } from '../data/destinationRegions';
import infoData from '../data/info-page.json';

// Get localized text from bilingual object or string
function getText(value, lang) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value[lang]) return value[lang];
    if (typeof value === 'object' && value.en) return value.en;
    return '';
}

const PDFDownload = ({ label, variant = 'default' }) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const { language } = useLanguage();

    const isChinese = language === 'cn';

    // UI labels
    const ui = isChinese ? {
        yourJourney: '您的旅程',
        day: '第',
        dayUnit: '天',
        essentialInfo: '重要信息',
        meals: '餐食',
        stay: '住宿',
        title: '2026中国',
        subtitle: '徒步之旅',
        adventure: '14天探险之旅',
        dates: '2026年5月8日 - 5月22日',
        filename: '2026中国徒步之旅行程.pdf',
        priceInfo: '价格信息',
    } : {
        yourJourney: 'Your Journey',
        day: 'Day ',
        dayUnit: '',
        essentialInfo: 'Essential Information',
        meals: 'Meals',
        stay: 'Stay',
        title: 'China 2026',
        subtitle: 'Hiking Trip',
        adventure: '14 Days of Adventure',
        dates: 'May 8 - May 22, 2026',
        filename: 'China_2026_Hiking_Trip_Itinerary.pdf',
        priceInfo: 'Price Information',
    };

    const t = (value) => getText(value, language);

    // Get days for a region
    const getDaysByRegion = (regionId) => {
        return itineraryData.filter(day => day && day.day > 0 && day.region === regionId);
    };

    const generatePDF = async () => {
        try {
            setLoading(true);
            setProgress(isChinese ? '生成中...' : 'Generating...');

            // Create HTML content
            const container = document.createElement('div');
            container.style.width = '210mm';
            container.style.background = 'white';
            container.style.fontFamily = isChinese
                ? '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
                : '"Helvetica Neue", Helvetica, Arial, sans-serif';
            container.style.color = '#333';
            container.style.fontSize = '11pt';
            container.style.lineHeight = '1.4';

            // CSS styles - Clean, compact PDF design
            const styles = `
                * { box-sizing: border-box; }

                /* ===== COVER PAGE ===== */
                .cover {
                    text-align: center;
                    padding: 60px 40px 40px 40px;
                }
                .cover h1 {
                    font-size: 42pt;
                    margin: 0 0 5px 0;
                    font-weight: 700;
                    color: #1a365d;
                }
                .cover h2 {
                    font-size: 28pt;
                    margin: 0 0 25px 0;
                    font-weight: 300;
                    color: #4a5568;
                }
                .cover .subtitle {
                    font-size: 12pt;
                    color: #718096;
                    margin-bottom: 4px;
                }
                .cover .divider {
                    width: 50px;
                    height: 3px;
                    background: #c53030;
                    margin: 25px auto;
                }
                .journey-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 20px 25px;
                    margin: 25px auto 0 auto;
                    max-width: 340px;
                    text-align: left;
                }
                .journey-box h3 {
                    text-align: center;
                    font-size: 9pt;
                    margin: 0 0 15px 0;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 600;
                }
                .journey-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 10pt;
                }
                .journey-row:last-child { border-bottom: none; }
                .journey-row span:first-child { color: #334155; font-weight: 500; }
                .journey-row span:last-child { color: #64748b; }

                /* ===== CONTENT PAGES ===== */
                .content {
                    padding: 15px 25px;
                }

                /* ===== REGION HEADER - Starts new page ===== */
                .region-header {
                    page-break-before: always;
                    margin: 0 0 15px 0;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #1a365d;
                }
                .region-header h2 {
                    margin: 0;
                    font-size: 14pt;
                    font-weight: 700;
                    color: #1a365d;
                    display: inline;
                }
                .region-header .days {
                    font-size: 10pt;
                    color: #64748b;
                    margin-left: 12px;
                }

                /* ===== DAY CARDS - Continuous flow ===== */
                .day-card {
                    margin: 20px 0;
                    padding-bottom: 20px;
                    border-bottom: 1px dashed #cbd5e1;
                }
                .day-card:last-child {
                    border-bottom: none;
                }
                .day-header-line {
                    color: #c53030;
                    font-size: 10pt;
                    font-weight: 700;
                    margin-bottom: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .day-header-line .day-num {
                    text-transform: uppercase;
                }
                .day-header-line .separator {
                    color: #94a3b8;
                }
                .day-header-line .day-meta {
                    color: #64748b;
                    font-weight: 500;
                }
                .day-title {
                    font-size: 14pt;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    color: #1e293b;
                    line-height: 1.3;
                }
                .day-desc {
                    color: #475569;
                    font-size: 10pt;
                    margin-bottom: 15px;
                    line-height: 1.55;
                }

                /* ===== SEGMENTS - Compact with time labels ===== */
                .segment {
                    margin: 12px 0;
                    padding-left: 15px;
                }
                .segment-time-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 6px;
                }
                .segment-time {
                    font-size: 8pt;
                    font-weight: 700;
                    color: #1a365d;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }
                .segment-time-line {
                    flex: 1;
                    height: 1px;
                    background: #cbd5e1;
                    margin-left: 10px;
                }
                .segment-content {
                    padding-left: 2px;
                }
                .segment-title-row {
                    margin-bottom: 4px;
                }
                .segment-bullet {
                    color: #c53030;
                    margin-right: 6px;
                }
                .segment-title {
                    font-weight: 600;
                    font-size: 11pt;
                    color: #1e293b;
                }
                .segment-duration {
                    color: #64748b;
                    font-size: 9pt;
                    margin-left: 8px;
                }
                .segment-desc {
                    color: #475569;
                    font-size: 9pt;
                    margin: 4px 0;
                    line-height: 1.5;
                    padding-left: 14px;
                }
                .segment-highlights {
                    color: #64748b;
                    font-size: 8pt;
                    margin-top: 4px;
                    padding-left: 14px;
                    font-style: italic;
                }

                /* ===== DAY FOOTER ===== */
                .day-footer {
                    margin-top: 12px;
                    padding-top: 10px;
                    border-top: 1px solid #e2e8f0;
                    font-size: 9pt;
                    color: #64748b;
                }
                .day-footer .label {
                    font-weight: 600;
                    color: #475569;
                }
                .day-footer .divider {
                    margin: 0 15px;
                    color: #cbd5e1;
                }

                /* ===== INFO PAGE ===== */
                .info-page {
                    page-break-before: always;
                    padding: 20px 25px;
                }
                .info-header {
                    margin-bottom: 20px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #1a365d;
                }
                .info-header h2 {
                    margin: 0;
                    font-size: 14pt;
                    font-weight: 700;
                    color: #1a365d;
                }
                .price-section {
                    margin-bottom: 20px;
                }
                .price-section h3 {
                    color: #1e293b;
                    font-size: 11pt;
                    margin: 0 0 10px 0;
                    font-weight: 600;
                }
                .price-box {
                    background: #c53030;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 6px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 12pt;
                    margin-bottom: 8px;
                }
                .price-details {
                    color: #64748b;
                    font-size: 9pt;
                    line-height: 1.5;
                }
                .includes-section {
                    margin-bottom: 15px;
                }
                .includes-section h4 {
                    color: #166534;
                    font-size: 10pt;
                    margin: 15px 0 8px 0;
                    font-weight: 600;
                }
                .includes-section ul {
                    margin: 0;
                    padding-left: 18px;
                    font-size: 9pt;
                    color: #475569;
                    line-height: 1.5;
                }
                .includes-section li { margin: 3px 0; }
                .not-included h4 { color: #64748b; }
                .not-included ul { color: #64748b; }
            `;

            // Build HTML
            let html = `<style>${styles}</style>`;

            // Cover page - simple, no forced page break
            html += `
                <div class="cover">
                    <h1>${ui.title}</h1>
                    <h2>${ui.subtitle}</h2>
                    <div class="subtitle">${ui.adventure}</div>
                    <div class="subtitle">${ui.dates}</div>
                    <div class="divider"></div>
                    <div class="journey-box">
                        <h3>${ui.yourJourney}</h3>
                        ${destinationRegions.map(region => {
                            const dayRange = region.days.length > 1
                                ? (isChinese ? `第${region.days[0]}-${region.days[region.days.length - 1]}天` : `Days ${region.days[0]}-${region.days[region.days.length - 1]}`)
                                : (isChinese ? `第${region.days[0]}天` : `Day ${region.days[0]}`);
                            return `<div class="journey-row"><span>${t(region.name)}</span><span>${dayRange}</span></div>`;
                        }).join('')}
                    </div>
                </div>
            `;

            // Itinerary pages
            html += '<div class="content">';

            for (const region of destinationRegions) {
                const regionDays = getDaysByRegion(region.id);
                if (regionDays.length === 0) continue;

                const dayRange = region.days.length > 1
                    ? (isChinese ? `第${region.days[0]} - ${region.days[region.days.length - 1]}天` : `Days ${region.days[0]} - ${region.days[region.days.length - 1]}`)
                    : (isChinese ? `第${region.days[0]}天` : `Day ${region.days[0]}`);

                html += `
                    <div class="region-header">
                        <h2>${t(region.name)}</h2>
                        <span class="days">${dayRange}</span>
                    </div>
                `;

                for (const day of regionDays) {
                    const dayLabel = isChinese ? `第${day.day}天` : `Day ${day.day}`;

                    html += `
                        <div class="day-card">
                            <div class="day-header-line">
                                <span class="day-num">${dayLabel}</span>
                                <span class="separator">•</span>
                                <span class="day-meta">${day.date}</span>
                                <span class="separator">•</span>
                                <span class="day-meta">${t(day.location) || ''}</span>
                            </div>
                            <div class="day-title">${day.title ? t(day.title) : ''}</div>
                            ${t(day.description) ? `<div class="day-desc">${t(day.description)}</div>` : ''}
                    `;

                    // Segments - compact with time labels
                    const validSegments = (day.segments || []).filter(seg => seg && seg.title);
                    for (const segment of validSegments) {
                        const segTime = t(segment.time);
                        html += `
                            <div class="segment">
                                ${segTime ? `
                                    <div class="segment-time-row">
                                        <span class="segment-time">${segTime}</span>
                                        <span class="segment-time-line"></span>
                                    </div>
                                ` : ''}
                                <div class="segment-content">
                                    <div class="segment-title-row">
                                        <span class="segment-bullet">▸</span>
                                        <span class="segment-title">${t(segment.title)}</span>
                                        ${segment.duration ? `<span class="segment-duration">(${segment.duration})</span>` : ''}
                                    </div>
                                    ${t(segment.description) ? `<div class="segment-desc">${t(segment.description)}</div>` : ''}
                                    ${segment.highlights && segment.highlights.length > 0
                                        ? `<div class="segment-highlights">${segment.highlights.map(h => t(h)).join(' • ')}</div>`
                                        : ''}
                                </div>
                            </div>
                        `;
                    }

                    // Footer - inline style
                    const meals = t(day.meals);
                    const accom = day.accommodation?.name || '';
                    if (meals || (accom && accom !== 'N/A')) {
                        html += `<div class="day-footer">`;
                        if (meals) html += `<span class="label">${ui.meals}:</span> ${meals}`;
                        if (meals && accom && accom !== 'N/A') html += `<span class="divider">|</span>`;
                        if (accom && accom !== 'N/A') {
                            const rating = day.accommodation?.rating ? ` (${day.accommodation.rating})` : '';
                            html += `<span class="label">${ui.stay}:</span> ${accom}${rating}`;
                        }
                        html += `</div>`;
                    }

                    html += '</div>';
                }
            }

            html += '</div>';

            // Info page
            html += `
                <div class="info-page">
                    <div class="info-header">
                        <h2>${ui.essentialInfo}</h2>
                    </div>

                    <div class="price-section">
                        <h3>${ui.priceInfo}</h3>
                        <div class="price-box">
                            ${infoData.price.amount} ${t(infoData.price.perPerson)} • ${t(infoData.price.dates)}
                        </div>
                        <div class="price-details">
                            ${t(infoData.price.basis)}<br>
                            ${t(infoData.price.singleSupplement)}
                        </div>
                    </div>
                    <div class="includes-section">
                        <h4>${t(infoData.included.title)}</h4>
                        <ul>
                            ${infoData.included.items.map(item => `<li>${t(item.text)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="includes-section not-included">
                        <h4>${t(infoData.notIncluded.title)}</h4>
                        <ul>
                            ${infoData.notIncluded.items.map(item => `<li>${t(item.text)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            document.body.appendChild(container);

            // Generate PDF
            const opt = {
                margin: [10, 10, 15, 10], // top, left, bottom, right in mm
                filename: ui.filename,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    backgroundColor: '#ffffff',
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            await html2pdf().set(opt).from(container).save();

            // Clean up
            document.body.removeChild(container);
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
