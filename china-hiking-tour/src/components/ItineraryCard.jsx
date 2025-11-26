import React from 'react';
import { MapPin, Calendar, Utensils, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ImageCarousel from './media/ImageCarousel';
import ScrollReveal from './effects/ScrollReveal';

const ItineraryCard = ({ day, index = 0 }) => {
    const { language } = useLanguage();

    // Support both old single image and new images array format
    const images = day.images || (day.image ? [{ src: day.image, alt: day.location }] : []);

    return (
        <ScrollReveal delay={index * 0.05} variant="fadeUp">
            <div
                data-day={day.day}
                className="card"
                style={{
                    marginBottom: '2rem',
                    overflow: 'hidden',
                    background: 'var(--surface-white)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
            >
                {/* Image Carousel Section */}
                {images.length > 0 && (
                    <div style={{ position: 'relative' }}>
                        <ImageCarousel
                            images={images}
                            autoplay={true}
                            autoplayDelay={6000}
                            showDots={images.length > 1}
                            showArrows={images.length > 1}
                            aspectRatio="16/10"
                            borderRadius="0"
                            showCaptions={true}
                        />
                        {/* Day Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '1.25rem',
                            left: '1.25rem',
                            background: 'var(--primary-red)',
                            color: 'white',
                            padding: '0.75rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 700,
                            fontSize: '1rem',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 10
                        }}>
                            {language === 'en' ? `Day ${day.day}` : `第${day.day}天`}
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div style={{ padding: '2rem' }}>
                    {/* Date & Title Row */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--primary-blue)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem'
                        }}>
                            <Calendar size={16} strokeWidth={2.5} />
                            <span>{day.date}</span>
                            {day.location && (
                                <>
                                    <span style={{ color: 'var(--border-color)' }}>•</span>
                                    <MapPin size={16} strokeWidth={2.5} />
                                    <span>{day.location[language]}</span>
                                </>
                            )}
                        </div>

                        <h3 style={{
                            fontSize: '1.5rem',
                            color: 'var(--text-dark)',
                            marginBottom: 0,
                            fontWeight: 700,
                            lineHeight: 1.3
                        }}>
                            {day.title[language]}
                        </h3>
                    </div>

                    {/* Description */}
                    <p style={{
                        color: 'var(--text-medium)',
                        lineHeight: '1.8',
                        marginBottom: '1.5rem',
                        fontSize: '1rem'
                    }}>
                        {day.description[language]}
                    </p>

                    {/* Highlights */}
                    {day.highlights && day.highlights[language] && day.highlights[language].length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                {day.highlights[language].map((highlight, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.375rem 0.875rem',
                                            backgroundColor: 'var(--off-white)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: 'var(--text-dark)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        {highlight}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Info - Meals & Accommodation */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--border-color)'
                    }}>
                        {/* Meals */}
                        {day.meals && day.meals[language] && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <Utensils size={18} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                                <div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'var(--primary-blue)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {language === 'en' ? 'Meals' : '餐食'}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                                        {day.meals[language]}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Accommodation */}
                        {day.accommodation && day.accommodation[language] && day.accommodation[language] !== 'N/A' && day.accommodation[language] !== '无' && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'rgba(56, 142, 60, 0.08)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <Home size={18} style={{ color: 'var(--success-green)', flexShrink: 0 }} />
                                <div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'var(--success-green)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {language === 'en' ? 'Stay' : '住宿'}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                                        {day.accommodation[language]}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ScrollReveal>
    );
};

export default ItineraryCard;
