import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, Loader } from 'lucide-react';
import { itineraryData } from '../data/itineraryData';

const PDFDownload = ({ label }) => {
    const [loading, setLoading] = useState(false);

    const generatePDF = () => {
        try {
            setLoading(true);
            const doc = new jsPDF();

            // Set font
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(216, 67, 21); // Primary red
            doc.text("China Hiking Tour 2026", 105, 20, { align: "center" });

            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text("May 8 - May 23, 2026", 105, 30, { align: "center" });

            let yPos = 50;

            itineraryData.forEach((day) => {
                // Add new page if content overflows
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                // Day Header
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.setTextColor(216, 67, 21);
                doc.text(`Day ${day.day} - ${day.date}: ${day.title.en}`, 20, yPos);

                yPos += 7;

                // Location
                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Location: ${day.location.en}`, 20, yPos);

                yPos += 7;

                // Description (Word wrap)
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(0);
                const splitDesc = doc.splitTextToSize(day.description.en, 170);
                doc.text(splitDesc, 20, yPos);

                yPos += (splitDesc.length * 5) + 5;

                // Highlights
                if (day.highlights && day.highlights.en) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.setTextColor(50);
                    const highlights = `Highlights: ${day.highlights.en.join(", ")}`;
                    const splitHighlights = doc.splitTextToSize(highlights, 170);
                    doc.text(splitHighlights, 20, yPos);
                    yPos += (splitHighlights.length * 5) + 10;
                }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
            }

            // Try standard save method first (works best in most browsers)
            try {
                console.log("Attempting standard save...");
                doc.save("China_Hiking_Tour_Itinerary.pdf");
                console.log("Standard save completed");
            } catch (saveError) {
                console.warn("Standard save failed, trying blob method...", saveError);

                // Fallback: Create blob and manual download
                const pdfBlob = doc.output('blob');
                console.log("PDF blob created:", pdfBlob.size, "bytes");

                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'China_Hiking_Tour_Itinerary.pdf';
                link.target = '_blank';
                document.body.appendChild(link);

                console.log("Triggering download...");
                link.click();

                // Also open in new tab as fallback
                setTimeout(() => {
                    window.open(url, '_blank');
                    console.log("Opened PDF in new tab as fallback");
                }, 100);

                // Cleanup after delay
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 1000);
            }

            console.log("PDF generation process completed");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Failed to generate PDF: ${error.message}\n\nPlease check browser console for details.`);
        } finally {
            setLoading(false);
        }
    };

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
                border: '2px solid var(--primary-blue)',
                background: 'white',
                color: 'var(--primary-blue)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
                if (!loading) {
                    e.target.style.background = 'var(--primary-blue)';
                    e.target.style.color = 'white';
                }
            }}
            onMouseLeave={(e) => {
                if (!loading) {
                    e.target.style.background = 'white';
                    e.target.style.color = 'var(--primary-blue)';
                }
            }}
        >
            {loading ? <Loader className="animate-spin" size={20} /> : <Download size={20} />}
            {label}
        </button>
    );
};

export default PDFDownload;
