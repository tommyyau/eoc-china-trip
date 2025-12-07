import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, Globe, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    const { language, toggleLanguage } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const location = useLocation();

    // Pages with full-height hero sections that need transparent header
    const hasHero = ['/', '/itinerary', '/info'].includes(location.pathname);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setScrolled(scrollY > 80);

            // Calculate scroll progress
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            setScrollProgress(progress);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Call once on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const navLinks = language === 'en'
        ? [
            { to: '/', label: 'Home' },
            { to: '/itinerary', label: 'Itinerary' },
            { to: '/info', label: 'Information' }
        ]
        : [
            { to: '/', label: '首页' },
            { to: '/itinerary', label: '行程' },
            { to: '/info', label: '信息' }
        ];

    const isTransparent = hasHero && !scrolled;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Scroll Progress Bar */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    zIndex: 1001,
                    backgroundColor: 'transparent'
                }}
            >
                <motion.div
                    style={{
                        height: '100%',
                        backgroundColor: 'var(--primary-red)',
                        transformOrigin: 'left'
                    }}
                    animate={{ scaleX: scrollProgress / 100 }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Header */}
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: isTransparent ? 'transparent' : 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: isTransparent ? 'none' : 'blur(10px)',
                    boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
                    transition: 'all 0.3s ease'
                }}
            >
                <nav className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: scrolled ? '0.75rem var(--spacing-md)' : '1.25rem var(--spacing-md)',
                    maxWidth: '1400px',
                    transition: 'padding 0.3s ease'
                }}>
                    {/* Logo/Brand */}
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: isTransparent ? 'white' : 'var(--primary-red)',
                            fontFamily: 'var(--font-heading)',
                            textDecoration: 'none',
                            letterSpacing: '-0.02em',
                            textShadow: isTransparent ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                            transition: 'color 0.3s ease'
                        }}
                    >
                        <Mountain size={28} strokeWidth={2.5} />
                        {language === 'en' ? 'China 2026' : '中国 2026'}
                    </Link>

                    {/* Desktop Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ display: 'none', gap: '1.5rem' }} className="desktop-nav">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: isTransparent
                                            ? 'white'
                                            : location.pathname === link.to
                                                ? 'var(--primary-red)'
                                                : 'var(--text-dark)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: location.pathname === link.to
                                            ? isTransparent
                                                ? 'rgba(255,255,255,0.2)'
                                                : 'rgba(216, 67, 21, 0.1)'
                                            : 'transparent',
                                        textShadow: isTransparent ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: isTransparent ? 'rgba(255,255,255,0.2)' : 'var(--surface-white)',
                                border: isTransparent ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: isTransparent ? 'white' : 'var(--text-dark)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s ease'
                            }}
                            aria-label="Toggle language"
                        >
                            <Globe size={16} />
                            <span>{language === 'en' ? '中文' : 'EN'}</span>
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                display: 'none',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                color: isTransparent ? 'white' : 'var(--text-dark)'
                            }}
                            className="mobile-menu-btn"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            background: 'var(--surface-white)',
                            borderTop: '1px solid var(--border-color)',
                            padding: '1rem',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                        className="mobile-nav"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    display: 'block',
                                    padding: '1rem 1.25rem',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: location.pathname === link.to ? 'var(--primary-red)' : 'var(--text-dark)',
                                    textDecoration: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: location.pathname === link.to ? 'rgba(216, 67, 21, 0.1)' : 'transparent',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </header>

            <style>{`
                @media (min-width: 768px) {
                    .desktop-nav {
                        display: flex !important;
                    }
                    .mobile-menu-btn {
                        display: none !important;
                    }
                }

                @media (max-width: 767px) {
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
            `}</style>

            {/* Main Content - add padding for fixed header */}
            <main style={{ flex: 1, paddingTop: '80px' }}>
                {children}
            </main>

            {/* Footer */}
            <footer style={{
                background: 'linear-gradient(180deg, var(--primary-dark) 0%, #1a1a2e 100%)',
                color: 'white',
                padding: '4rem 0 2rem',
                marginTop: 'auto'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <Mountain size={32} color="var(--primary-red)" />
                            <h3 style={{
                                color: 'white',
                                fontSize: '1.75rem',
                                margin: 0,
                                fontWeight: 800
                            }}>
                                {language === 'en' ? 'China Hiking Tour' : '中国徒步之旅'}
                            </h3>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        marginBottom: '2rem',
                        flexWrap: 'wrap'
                    }}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div style={{
                        paddingTop: '2rem',
                        borderTop: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.875rem'
                    }}>
                        <p style={{ marginBottom: 0 }}>
                            © 2025 China Hiking Tour. {language === 'en' ? 'All rights reserved.' : '版权所有。'}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
