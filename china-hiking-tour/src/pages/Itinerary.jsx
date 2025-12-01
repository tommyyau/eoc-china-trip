import React from 'react';
import { motion } from 'framer-motion';
import { Parallax } from 'react-scroll-parallax';
import { ChevronDown, Download } from 'lucide-react';
import { itineraryData } from '../data/cmsData';
import itineraryPageData from '../data/itinerary-page.json';
import ItineraryCard from '../components/ItineraryCard';
import { useLanguage } from '../context/LanguageContext';
import PDFDownload from '../components/PDFDownload';
// import InterestForm from '../components/InterestForm'; // TODO: Re-enable when form backend is connected
import ScrollReveal from '../components/effects/ScrollReveal';
import SectionDivider from '../components/ui/SectionDivider';

const Itinerary = () => {
    const { language } = useLanguage();

    // Helper to get bilingual text
    const t = (field) => field?.[language] || field?.en || '';

    // Get data from CMS
    const hero = itineraryPageData.hero || {};
    const destinationRegions = itineraryPageData.regions || [];

    // Group days by region
    const getDaysByRegion = (regionId) => {
        return itineraryData.filter(day => day.region === regionId);
    };

    return (
        <div style={{ marginTop: '-80px' }}>
            {/* ===== HERO SECTION ===== */}
            <section
                style={{
                    position: 'relative',
                    height: '70vh',
                    minHeight: '500px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Parallax
                    speed={-20}
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
                            backgroundImage: `url(${hero.backgroundImage || 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=2070&auto=format&fit=crop'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                </Parallax>

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)',
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
                        maxWidth: '800px'
                    }}
                >
                    <h1
                        style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            textShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            color: 'white'
                        }}
                    >
                        {t(hero.title)}
                    </h1>
                    <p
                        style={{
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                            opacity: 0.9,
                            marginBottom: '2rem',
                            maxWidth: '600px',
                            margin: '0 auto 2rem',
                            color: 'white'
                        }}
                    >
                        {t(hero.subtitle)}
                    </p>
                    <PDFDownload
                        label={t(hero.downloadButton)}
                        variant="light"
                    />
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

            {/* ===== ITINERARY BY REGION ===== */}
            {destinationRegions.map((region, regionIndex) => {
                const regionDays = getDaysByRegion(region.id);
                if (regionDays.length === 0) return null;

                return (
                    <React.Fragment key={region.id}>
                        {/* Region Header */}
                        <section
                            style={{
                                position: 'relative',
                                padding: 'var(--spacing-xl) 0',
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundImage: `url(${region.heroImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'brightness(0.4)'
                                }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: `linear-gradient(135deg, ${region.color}CC 0%, rgba(0,0,0,0.7) 100%)`
                                }}
                            />
                            <div
                                className="container"
                                style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    color: 'white',
                                    textAlign: 'center'
                                }}
                            >
                                <ScrollReveal>
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            padding: '0.5rem 1.25rem',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '1rem',
                                            fontSize: '0.9rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {language === 'en'
                                            ? `Days ${region.days[0]}${region.days.length > 1 ? `-${region.days[region.days.length - 1]}` : ''}`
                                            : `第${region.days[0]}${region.days.length > 1 ? `-${region.days[region.days.length - 1]}` : ''}天`
                                        }
                                    </div>
                                    <h2 style={{
                                        color: 'white',
                                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                                        marginBottom: '0.75rem'
                                    }}>
                                        {t(region.name)}
                                    </h2>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.9)',
                                        maxWidth: '600px',
                                        margin: '0 auto',
                                        fontSize: '1.1rem'
                                    }}>
                                        {t(region.description)}
                                    </p>
                                </ScrollReveal>
                            </div>
                        </section>

                        {/* Day Cards for this region */}
                        <section style={{
                            padding: 'var(--spacing-xl) 0',
                            backgroundColor: regionIndex % 2 === 0 ? 'var(--warm-white)' : 'var(--off-white)'
                        }}>
                            <div className="container" style={{ maxWidth: '900px' }}>
                                {regionDays.map((day, index) => (
                                    <ItineraryCard
                                        key={day.day}
                                        day={day}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </section>

                        {regionIndex < destinationRegions.length - 1 && (
                            <SectionDivider
                                type="mountain"
                                color={regionIndex % 2 === 0 ? 'var(--off-white)' : 'var(--warm-white)'}
                                backgroundColor={regionIndex % 2 === 0 ? 'var(--warm-white)' : 'var(--off-white)'}
                            />
                        )}
                    </React.Fragment>
                );
            })}

            {/* ===== INTEREST FORM SECTION (HIDDEN - TODO: Re-enable when form backend is connected) =====
            <section
                style={{
                    padding: 'var(--spacing-2xl) 0',
                    background: 'linear-gradient(135deg, var(--primary-dark) 0%, #1a1a2e 100%)',
                    color: 'white'
                }}
            >
                <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
                    <ScrollReveal>
                        <h2 style={{ color: 'white', marginBottom: '0.75rem' }}>
                            {content.interestTitle}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                            {content.interestSubtitle}
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <InterestForm />
                    </ScrollReveal>
                </div>
            </section>
            ===== */}
        </div>
    );
};

export default Itinerary;
