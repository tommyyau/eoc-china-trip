import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Parallax } from 'react-scroll-parallax';
import {
    Calendar,
    MapPin,
    ArrowRight,
    ChevronDown,
    Compass,
    Footprints,
    TrendingUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ScrollReveal from '../components/effects/ScrollReveal';
import InteractiveMap from '../components/map/InteractiveMap';
import StatCounter from '../components/ui/StatCounter';
import SectionDivider from '../components/ui/SectionDivider';
import { routeCoordinates } from '../data/destinationRegions';
import homeData from '../data/home-page.json';

const Home = () => {
    const { language } = useLanguage();

    // Helper to get text from CMS data
    const t = (field) => field?.[language] || field?.en || '';

    // Get destinations for the map
    const destinations = homeData.destinations?.items || [];

    return (
        <div style={{ marginTop: '-80px' }}>
            {/* ===== HERO SECTION ===== */}
            <section
                style={{
                    position: 'relative',
                    height: '100vh',
                    minHeight: '700px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Parallax Background */}
                <Parallax
                    speed={-30}
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: 0,
                        right: 0,
                        bottom: '-20%',
                        zIndex: 0
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '140%',
                            backgroundImage: `url(${homeData.hero?.backgroundImage || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&auto=format&fit=crop'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                </Parallax>

                {/* Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%)',
                        zIndex: 1
                    }}
                />

                {/* Hero Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        textAlign: 'center',
                        color: 'white',
                        padding: '0 1.5rem',
                        maxWidth: '900px'
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'rgba(216, 67, 21, 0.9)',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    >
                        <Calendar size={16} />
                        {t(homeData.hero?.date)}
                    </motion.div>

                    <h1
                        style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            textShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            lineHeight: 1.1
                        }}
                    >
                        {t(homeData.hero?.title)}
                    </h1>

                    <p
                        style={{
                            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                            opacity: 0.9,
                            marginBottom: '2.5rem',
                            maxWidth: '700px',
                            margin: '0 auto 2.5rem',
                            lineHeight: 1.5
                        }}
                    >
                        {t(homeData.hero?.subtitle)}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            to="/itinerary"
                            className="btn btn-primary"
                            style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                        >
                            {t(homeData.hero?.ctaPrimary)}
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/info"
                            className="btn btn-outline-light"
                            style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                        >
                            {t(homeData.hero?.ctaSecondary)}
                        </Link>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
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
                        <ChevronDown size={36} strokeWidth={1.5} />
                    </motion.div>
                </motion.div>
            </section>

            {/* ===== INTRODUCTION SECTION ===== */}
            <section style={{ padding: 'var(--spacing-2xl) 0', backgroundColor: 'var(--warm-white)' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <ScrollReveal>
                        <h2 style={{ marginBottom: '1.5rem' }}>{t(homeData.intro?.title)}</h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p style={{ fontSize: '1.15rem', lineHeight: 1.8 }}>
                            {t(homeData.intro?.text)}
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* ===== STATS SECTION ===== */}
            <section style={{ backgroundColor: 'var(--primary-dark)', padding: 'var(--spacing-xl) 0' }}>
                <div className="container">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1rem'
                        }}
                    >
                        <StatCounter
                            end={homeData.stats?.days || 15}
                            suffix=""
                            label={t(homeData.stats?.labels?.days)}
                            icon={Calendar}
                            color="white"
                        />
                        <StatCounter
                            end={homeData.stats?.destinations || 5}
                            suffix=""
                            label={t(homeData.stats?.labels?.destinations)}
                            icon={MapPin}
                            color="white"
                        />
                        <StatCounter
                            end={homeData.stats?.hikingKm || 100}
                            suffix="+"
                            label={t(homeData.stats?.labels?.hikingKm)}
                            icon={Footprints}
                            color="white"
                        />
                        <StatCounter
                            end={homeData.stats?.elevation || 4500}
                            suffix="+"
                            label={t(homeData.stats?.labels?.elevation)}
                            icon={TrendingUp}
                            color="white"
                        />
                    </div>
                </div>
            </section>

            {/* ===== MAP SECTION ===== */}
            <section style={{ padding: 'var(--spacing-2xl) 0', backgroundColor: 'var(--off-white)' }}>
                <div className="container">
                    <ScrollReveal>
                        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            <h2>{t(homeData.map?.title)}</h2>
                            <p style={{ maxWidth: '600px', margin: '0 auto' }}>{t(homeData.map?.subtitle)}</p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <InteractiveMap
                            destinations={destinations}
                            routeCoordinates={routeCoordinates}
                            height="500px"
                            animateRoute={false}
                            showRoute={true}
                        />
                    </ScrollReveal>
                </div>
            </section>

            <SectionDivider type="wave" color="var(--warm-white)" backgroundColor="var(--off-white)" />

            {/* ===== DESTINATIONS SECTION ===== */}
            <section style={{ padding: 'var(--spacing-2xl) 0', backgroundColor: 'var(--warm-white)' }}>
                <div className="container">
                    <ScrollReveal>
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            {t(homeData.destinations?.title)}
                        </h2>
                    </ScrollReveal>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}
                    >
                        {destinations.map((destination, index) => (
                            <ScrollReveal key={destination.id} delay={index * 0.1}>
                                <Link to="/itinerary" style={{ textDecoration: 'none' }}>
                                    <div
                                        className="image-zoom"
                                        style={{
                                            position: 'relative',
                                            borderRadius: 'var(--radius-xl)',
                                            overflow: 'hidden',
                                            aspectRatio: '4/3',
                                            boxShadow: 'var(--shadow-lg)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <img
                                            src={destination.heroImage}
                                            alt={t(destination.name)}
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 70%, transparent 100%)'
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                padding: '1.5rem',
                                                color: 'white'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'inline-block',
                                                    backgroundColor: destination.color,
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                {language === 'en' ? `Days ${destination.days.join('-')}` : `第${destination.days[0]}-${destination.days[destination.days.length - 1]}天`}
                                            </div>
                                            <h3
                                                style={{
                                                    fontSize: '1.5rem',
                                                    marginBottom: '0.5rem',
                                                    color: 'white',
                                                    textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                                                }}
                                            >
                                                {t(destination.name)}
                                            </h3>
                                            <p
                                                style={{
                                                    fontSize: '0.9rem',
                                                    opacity: 1,
                                                    margin: 0,
                                                    lineHeight: 1.4,
                                                    color: 'white',
                                                    textShadow: '0 1px 4px rgba(0,0,0,0.8)'
                                                }}
                                            >
                                                {t(destination.description)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section
                style={{
                    position: 'relative',
                    padding: 'var(--spacing-2xl) 0',
                    overflow: 'hidden'
                }}
            >
                <Parallax
                    speed={-15}
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: 0,
                        right: 0,
                        bottom: '-20%',
                        zIndex: 0
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '140%',
                            backgroundImage: `url(${homeData.cta?.backgroundImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop'})`,
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
                <div
                    className="container"
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        textAlign: 'center',
                        color: 'white'
                    }}
                >
                    <ScrollReveal>
                        <Compass size={48} style={{ marginBottom: '1rem', opacity: 0.9 }} />
                        <h2 style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}>
                            {t(homeData.cta?.title)}
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p
                            style={{
                                fontSize: '1.15rem',
                                maxWidth: '600px',
                                margin: '0 auto 2rem',
                                opacity: 0.95,
                                color: 'white'
                            }}
                        >
                            {t(homeData.cta?.text)}
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={0.4}>
                        <Link
                            to="/itinerary"
                            className="btn btn-light"
                            style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
                        >
                            {t(homeData.cta?.button)}
                            <ArrowRight size={20} />
                        </Link>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
};

export default Home;
