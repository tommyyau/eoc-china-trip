import React from 'react';
import { motion } from 'framer-motion';
import { Parallax } from 'react-scroll-parallax';
import { FileText, CreditCard, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ScrollReveal from '../components/effects/ScrollReveal';
import infoData from '../data/info-page.json';

const Info = () => {
    const { language } = useLanguage();

    // Helper to get localized text from bilingual object
    const getText = (obj) => obj?.[language] || obj?.en || '';

    // Build content from JSON data
    const content = {
        title: getText(infoData.hero?.title),
        subtitle: getText(infoData.hero?.subtitle),
        visaTitle: getText(infoData.visa?.title),
        visaItems: infoData.visa?.items?.map(item => getText(item)) || [],
        costTitle: getText(infoData.cost?.title),
        costPrice: getText(infoData.cost?.price),
        includesTitle: getText(infoData.cost?.includesTitle),
        excludesTitle: getText(infoData.cost?.excludesTitle),
        costIncludes: infoData.cost?.includes?.map(item => getText(item)) || [],
        costExcludes: infoData.cost?.excludes?.map(item => getText(item)) || []
    };

    return (
        <div style={{ marginTop: '-80px' }}>
            {/* Hero Section */}
            <section
                style={{
                    position: 'relative',
                    height: '60vh',
                    minHeight: '400px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Parallax
                    speed={-15}
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        left: 0,
                        right: 0,
                        bottom: '-10%',
                        zIndex: 0
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '120%',
                            backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                </Parallax>

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(216, 67, 21, 0.85) 0%, rgba(25, 118, 210, 0.85) 100%)',
                        zIndex: 1
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        textAlign: 'center',
                        color: 'white',
                        padding: '0 1.5rem',
                        maxWidth: '700px'
                    }}
                >
                    <h1
                        style={{
                            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                    >
                        {content.title}
                    </h1>
                    <p
                        style={{
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                            opacity: 0.95,
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}
                    >
                        {content.subtitle}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                        color: 'white'
                    }}
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <ChevronDown size={32} strokeWidth={1.5} />
                    </motion.div>
                </motion.div>
            </section>

            {/* Content Section */}
            <section style={{ padding: 'var(--spacing-2xl) 0', backgroundColor: 'var(--off-white)' }}>
                <div className="container">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '2rem'
                        }}
                    >
                        {/* Visa Section */}
                        <ScrollReveal>
                            <div
                                style={{
                                    background: 'var(--surface-white)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2.5rem',
                                    boxShadow: 'var(--shadow-lg)',
                                    height: '100%'
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '2rem'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: 'var(--radius-lg)',
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <FileText size={28} color="var(--primary-blue)" />
                                    </div>
                                    <h2 style={{ marginBottom: 0, fontSize: '1.5rem' }}>
                                        {content.visaTitle}
                                    </h2>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {content.visaItems.map((item, index) => (
                                        <li
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem',
                                                fontSize: '1rem',
                                                lineHeight: '1.7',
                                                color: 'var(--text-medium)'
                                            }}
                                        >
                                            <CheckCircle
                                                size={20}
                                                color="var(--success-green)"
                                                style={{ flexShrink: 0, marginTop: '2px' }}
                                            />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>

                        {/* Cost Section */}
                        <ScrollReveal delay={0.2}>
                            <div
                                style={{
                                    background: 'var(--surface-white)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2.5rem',
                                    boxShadow: 'var(--shadow-lg)',
                                    height: '100%'
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '2rem'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: 'var(--radius-lg)',
                                            backgroundColor: 'rgba(216, 67, 21, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <CreditCard size={28} color="var(--primary-red)" />
                                    </div>
                                    <h2 style={{ marginBottom: 0, fontSize: '1.5rem' }}>
                                        {content.costTitle}
                                    </h2>
                                </div>

                                {/* Price Badge */}
                                <div
                                    style={{
                                        background: 'linear-gradient(135deg, var(--primary-red) 0%, #ff5722 100%)',
                                        color: 'white',
                                        padding: '1.25rem 1.5rem',
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: '2rem'
                                    }}
                                >
                                    <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>
                                        {content.costPrice}
                                    </p>
                                </div>

                                {/* Includes */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--success-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {content.includesTitle}
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {content.costIncludes.map((item, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '0.75rem',
                                                    fontSize: '0.95rem',
                                                    color: 'var(--text-medium)',
                                                    lineHeight: '1.6'
                                                }}
                                            >
                                                <CheckCircle size={18} color="var(--success-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Excludes */}
                                <div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {content.excludesTitle}
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {content.costExcludes.map((item, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '0.75rem',
                                                    fontSize: '0.95rem',
                                                    color: 'var(--text-light)',
                                                    lineHeight: '1.6'
                                                }}
                                            >
                                                <XCircle size={18} color="var(--text-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Info;
