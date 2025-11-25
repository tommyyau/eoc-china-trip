import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';

const Layout = ({ children }) => {
    const { language, toggleLanguage } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
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

    const footerText = language === 'en'
        ? 'Ealing Outdoor Club - China Hiking Adventure 2026'
        : '伊灵户外俱乐部 - 2026中国徒步探险之旅';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    background: scrolled ? 'white' : 'var(--surface-white)',
                    boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    transition: 'all 0.3s ease',
                    borderBottom: `1px solid ${scrolled ? 'transparent' : 'var(--border-color)'}`
                }}
            >
                <nav className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem var(--spacing-md)',
                    maxWidth: '1400px'
                }}>
                    {/* Logo/Brand */}
                    <Link
                        to="/"
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: 'var(--primary-red)',
                            fontFamily: 'var(--font-heading)',
                            textDecoration: 'none',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        {language === 'en' ? 'China 2026' : '中国 2026'}
                    </Link>

                    {/* Desktop Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                        <div style={{ display: 'none', gap: '2rem' }} className="desktop-nav">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    style={{
                                        fontSize: '1.0625rem',
                                        fontWeight: 600,
                                        color: location.pathname === link.to ? 'var(--primary-red)' : 'var(--text-dark)',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s ease',
                                        padding: '0.5rem 0',
                                        borderBottom: location.pathname === link.to ? '2px solid var(--primary-red)' : '2px solid transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (location.pathname !== link.to) {
                                            e.target.style.color = 'var(--primary-blue)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (location.pathname !== link.to) {
                                            e.target.style.color = 'var(--text-dark)';
                                        }
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="btn-outline"
                            style={{
                                padding: '0.625rem 1.25rem',
                                fontSize: '0.9375rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'var(--surface-white)'
                            }}
                            aria-label="Toggle language"
                        >
                            <Globe size={18} />
                            <span style={{ fontWeight: 600 }}>{language === 'en' ? 'CN' : 'EN'}</span>
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
                                color: 'var(--text-dark)'
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
                    <div style={{
                        background: 'var(--surface-white)',
                        borderTop: '1px solid var(--border-color)',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-lg)'
                    }} className="mobile-nav">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    display: 'block',
                                    padding: '1rem',
                                    fontSize: '1.125rem',
                                    fontWeight: 600,
                                    color: location.pathname === link.to ? 'var(--primary-red)' : 'var(--text-dark)',
                                    textDecoration: 'none',
                                    borderLeft: location.pathname === link.to ? '4px solid var(--primary-red)' : '4px solid transparent',
                                    paddingLeft: '1rem',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            <style>{`
        /* Show desktop nav on larger screens */
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }

        /* Show mobile menu button on smaller screens */
        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>

            {/* Main Content */}
            <main style={{ flex: 1 }}>
                {children}
            </main>

            {/* Footer */}
            <footer style={{
                background: 'var(--text-dark)',
                color: 'white',
                padding: '3rem 0',
                marginTop: 'auto'
            }}>
                <div className="container" style={{
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            color: 'white',
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                            fontWeight: 700
                        }}>
                            {language === 'en' ? 'Ealing Outdoor Club' : '伊灵户外俱乐部'}
                        </h3>
                        <p style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '1rem',
                            marginBottom: 0
                        }}>
                            {language === 'en' ? 'China Hiking Adventure 2026' : '2026中国徒步探险之旅'}
                        </p>
                    </div>

                    <div style={{
                        paddingTop: '2rem',
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.9375rem'
                    }}>
                        <p style={{ marginBottom: 0 }}>
                            © 2025 Ealing Outdoor Club. {language === 'en' ? 'All rights reserved.' : '版权所有。'}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
