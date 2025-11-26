import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const FloatingNav = ({ days = [], currentDay = 1 }) => {
    const { language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [activeDay, setActiveDay] = useState(currentDay);

    useEffect(() => {
        const handleScroll = () => {
            // Show nav after scrolling past hero (about 80vh)
            setIsVisible(window.scrollY > window.innerHeight * 0.8);

            // Update active day based on scroll position
            const dayElements = document.querySelectorAll('[data-day]');
            dayElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
                    setActiveDay(parseInt(el.dataset.day));
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToDay = (day) => {
        const element = document.querySelector(`[data-day="${day}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed',
                right: '1.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '1rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'blur(8px)',
                pointerEvents: isVisible ? 'auto' : 'none'
            }}
        >
            {days.map((day) => (
                <button
                    key={day}
                    onClick={() => scrollToDay(day)}
                    title={language === 'en' ? `Day ${day}` : `第${day}天`}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: activeDay === day
                            ? 'var(--primary-red)'
                            : 'var(--off-white)',
                        color: activeDay === day ? 'white' : 'var(--text-medium)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        if (activeDay !== day) {
                            e.currentTarget.style.backgroundColor = 'var(--border-color)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeDay !== day) {
                            e.currentTarget.style.backgroundColor = 'var(--off-white)';
                        }
                    }}
                >
                    {day}
                </button>
            ))}
        </motion.div>
    );
};

export default FloatingNav;
