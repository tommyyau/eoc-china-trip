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

            // CSS styles
            const styles = `
                .cover {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: white;
                    padding: 60px 30px;
                    min-height: 280mm;
                    page-break-after: always;
                    text-align: center;
                }
                .cover h1 {
                    font-size: 42pt;
                    margin: 80px 0 10px 0;
                    font-weight: 700;
                }
                .cover h2 {
                    font-size: 36pt;
                    margin: 0 0 30px 0;
                    font-weight: 700;
                }
                .cover .subtitle {
                    font-size: 14pt;
                    opacity: 0.9;
                    margin-bottom: 8px;
                }
                .cover .divider {
                    width: 80px;
                    height: 3px;
                    background: #d84315;
                    margin: 30px auto;
                }
                .journey-box {
                    background: white;
                    color: #333;
                    border-radius: 8px;
                    padding: 25px 30px;
                    margin: 30px auto;
                    max-width: 400px;
                    text-align: left;
                }
                .journey-box h3 {
                    text-align: center;
                    font-size: 14pt;
                    margin: 0 0 15px 0;
                    color: #333;
                }
                .journey-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                    font-size: 11pt;
                }
                .journey-row:last-child { border-bottom: none; }

                .content { padding: 20px 25px; }

                .region-header {
                    background: #d84315;
                    color: white;
                    padding: 12px 20px;
                    margin: 25px -25px 15px -25px;
                    text-align: center;
                }
                .region-header h2 {
                    margin: 0;
                    font-size: 16pt;
                    font-weight: 600;
                }
                .region-header .days {
                    font-size: 10pt;
                    opacity: 0.9;
                    margin-top: 4px;
                }

                .day-card {
                    margin: 20px 0;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .day-badge {
                    display: inline-block;
                    background: #1976d2;
                    color: white;
                    padding: 3px 10px;
                    border-radius: 4px;
                    font-size: 9pt;
                    font-weight: 600;
                    margin-right: 10px;
                }
                .day-meta {
                    display: inline;
                    color: #666;
                    font-size: 10pt;
                }
                .day-title {
                    font-size: 14pt;
                    font-weight: 600;
                    margin: 8px 0;
                    color: #222;
                }
                .day-desc {
                    color: #555;
                    font-size: 10pt;
                    margin-bottom: 10px;
                    line-height: 1.5;
                }

                .segment {
                    margin: 12px 0 12px 10px;
                    padding-left: 12px;
                    border-left: 2px solid #e0e0e0;
                }
                .segment-time {
                    display: inline-block;
                    background: #f5f5f5;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 8pt;
                    color: #666;
                    margin-right: 8px;
                }
                .segment-title {
                    font-weight: 600;
                    font-size: 11pt;
                    color: #333;
                    display: inline;
                }
                .segment-duration {
                    color: #999;
                    font-size: 9pt;
                    margin-left: 8px;
                }
                .segment-desc {
                    color: #666;
                    font-size: 9pt;
                    margin: 5px 0;
                    line-height: 1.4;
                }
                .segment-highlights {
                    color: #1976d2;
                    font-size: 9pt;
                    margin-top: 5px;
                }

                .day-footer {
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px solid #eee;
                    font-size: 9pt;
                    display: flex;
                    gap: 30px;
                }
                .day-footer .meals { color: #1976d2; }
                .day-footer .stay { color: #388e3c; }

                .info-page {
                    page-break-before: always;
                    padding: 20px 25px;
                }
                .info-header {
                    background: #1976d2;
                    color: white;
                    padding: 12px 20px;
                    margin: 0 -25px 20px -25px;
                    text-align: center;
                }
                .info-header h2 {
                    margin: 0;
                    font-size: 14pt;
                }
                .price-section h3 {
                    color: #d84315;
                    font-size: 12pt;
                    margin: 0 0 10px 0;
                }
                .price-box {
                    background: #d84315;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 6px;
                    text-align: center;
                    font-weight: 600;
                    margin-bottom: 10px;
                }
                .price-details {
                    color: #666;
                    font-size: 9pt;
                    margin-bottom: 15px;
                }
                .includes-section h4 {
                    color: #388e3c;
                    font-size: 10pt;
                    margin: 15px 0 8px 0;
                    text-transform: uppercase;
                }
                .includes-section ul {
                    margin: 0;
                    padding-left: 20px;
                    font-size: 10pt;
                    color: #555;
                }
                .includes-section li { margin: 4px 0; }
                .not-included h4 {
                    color: #999;
                }
                .not-included ul { color: #888; }
            `;

            // Build HTML
            let html = `<style>${styles}</style>`;

            // Cover page
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
                        <div class="days">${dayRange}</div>
                    </div>
                `;

                for (const day of regionDays) {
                    const dayLabel = isChinese ? `第${day.day}天` : `Day ${day.day}`;

                    html += `
                        <div class="day-card">
                            <div>
                                <span class="day-badge">${dayLabel}</span>
                                <span class="day-meta">${day.date} • ${t(day.location) || ''}</span>
                            </div>
                            <div class="day-title">${day.title ? t(day.title) : ''}</div>
                            ${t(day.description) ? `<div class="day-desc">${t(day.description)}</div>` : ''}
                    `;

                    // Segments
                    const validSegments = (day.segments || []).filter(seg => seg && seg.title);
                    for (const segment of validSegments) {
                        const segTime = t(segment.time);
                        html += `
                            <div class="segment">
                                ${segTime ? `<span class="segment-time">${segTime}</span>` : ''}
                                <span class="segment-title">${t(segment.title)}</span>
                                ${segment.duration ? `<span class="segment-duration">(${segment.duration})</span>` : ''}
                                ${t(segment.description) ? `<div class="segment-desc">${t(segment.description)}</div>` : ''}
                                ${segment.highlights && segment.highlights.length > 0
                                    ? `<div class="segment-highlights">${segment.highlights.map(h => t(h)).join(' • ')}</div>`
                                    : ''}
                            </div>
                        `;
                    }

                    // Footer
                    const meals = t(day.meals);
                    const accom = day.accommodation?.name || '';
                    if (meals || (accom && accom !== 'N/A')) {
                        html += `<div class="day-footer">`;
                        if (meals) html += `<span class="meals">${ui.meals}: ${meals}</span>`;
                        if (accom && accom !== 'N/A') {
                            const rating = day.accommodation?.rating ? ` (${day.accommodation.rating})` : '';
                            html += `<span class="stay">${ui.stay}: ${accom}${rating}</span>`;
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
                margin: 0,
                filename: ui.filename,
                image: { type: 'jpeg', quality: 0.92 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
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
