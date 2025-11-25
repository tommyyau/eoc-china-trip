import { MapPin, Calendar, Utensils, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ItineraryCard = ({ day }) => {
    const { language } = useLanguage();

    return (
        <div
            className="card"
            style={{
                marginBottom: '2rem',
                overflow: 'hidden',
                background: 'var(--surface-white)'
            }}
        >
            {/* Image Section */}
            {day.image && (
                <div style={{
                    width: '100%',
                    height: '250px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <img
                        src={day.image}
                        alt={day.location[language]}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        loading="lazy"
                    />
                    {/* Day Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '1.25rem',
                        left: '1.25rem',
                        background: 'var(--primary-red)',
                        color: 'white',
                        padding: '0.625rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        {language === 'en' ? `Day ${day.day}` : `第${day.day}天`}
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div style={{ padding: '2rem' }}>
                {/* Date */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--primary-blue)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                }}>
                    <Calendar size={16} strokeWidth={2.5} />
                    <span>{day.date}</span>
                </div>

                {/* Location Title */}
                <h3 style={{
                    fontSize: '1.75rem',
                    color: 'var(--text-dark)',
                    marginBottom: '1rem',
                    fontWeight: 700
                }}>
                    {day.location[language]}
                </h3>

                {/* Description */}
                <p style={{
                    color: 'var(--text-medium)',
                    lineHeight: '1.8',
                    marginBottom: '1.5rem',
                    fontSize: '1.0625rem'
                }}>
                    {day.description[language]}
                </p>

                {/* Highlights */}
                {day.highlights && day.highlights[language] && day.highlights[language].length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{
                            fontSize: '1.125rem',
                            color: 'var(--text-dark)',
                            marginBottom: '1rem',
                            fontWeight: 600
                        }}>
                            {language === 'en' ? 'Highlights' : '亮点'}
                        </h4>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'grid',
                            gap: '0.75rem'
                        }}>
                            {day.highlights[language].map((highlight, idx) => (
                                <li
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem',
                                        color: 'var(--text-medium)',
                                        fontSize: '1rem',
                                        lineHeight: '1.7'
                                    }}
                                >
                                    <span style={{
                                        color: 'var(--primary-red)',
                                        fontWeight: 700,
                                        flexShrink: 0,
                                        marginTop: '0.125rem'
                                    }}>
                                        •
                                    </span>
                                    <span>{highlight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Bottom Info - Meals & Accommodation */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: day.accommodation[language] ? '1fr 1fr' : '1fr',
                    gap: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    {/* Meals */}
                    {day.meals && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <Utensils size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '0.125rem' }} />
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: 'var(--text-dark)',
                                    marginBottom: '0.25rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {language === 'en' ? 'Meals' : '餐食'}
                                </div>
                                <div style={{ fontSize: '0.9375rem', color: 'var(--text-medium)' }}>
                                    {day.meals[language]}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Accommodation */}
                    {day.accommodation && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <Home size={20} style={{ color: 'var(--success-green)', flexShrink: 0, marginTop: '0.125rem' }} />
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: 'var(--text-dark)',
                                    marginBottom: '0.25rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {language === 'en' ? 'Accommodation' : '住宿'}
                                </div>
                                <div style={{ fontSize: '0.9375rem', color: 'var(--text-medium)' }}>
                                    {day.accommodation[language]}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItineraryCard;
