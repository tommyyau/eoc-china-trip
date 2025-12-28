import React from 'react';
import { motion } from 'framer-motion';
import { Parallax } from 'react-scroll-parallax';
import {
    ChevronDown,
    Plane,
    Building,
    Utensils,
    Train,
    Users,
    Ticket,
    XCircle,
    Landmark,
    Castle,
    Mountain,
    PlaneTakeoff,
    PlaneLanding,
    BookOpen,
    Heart,
    Shield,
    Wine,
    Coins,
    Wallet,
    CircleDollarSign,
    BadgePoundSterling,
    CalendarCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ScrollReveal from '../components/effects/ScrollReveal';
import SectionDivider from '../components/ui/SectionDivider';
import infoData from '../data/info-page.json';

// Icon mapping for items
const iconMap = {
    'plane': Plane,
    'building': Building,
    'utensils': Utensils,
    'train': Train,
    'users': Users,
    'ticket': Ticket,
    'passport': BookOpen,
    'heart': Heart,
    'shield': Shield,
    'wine': Wine,
    'coins': Coins
};

const Info = () => {
    const { language } = useLanguage();

    // Helper to get localized text from bilingual object
    const getText = (obj) => obj?.[language] || obj?.en || '';

    return (
        <div style={{ marginTop: '-80px' }}>
            {/* Hero Section with Price */}
            <section
                style={{
                    position: 'relative',
                    minHeight: '100vh',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '100px',
                    paddingBottom: '60px'
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
                        maxWidth: '800px'
                    }}
                >
                    <h1
                        style={{
                            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            color: 'white'
                        }}
                    >
                        {getText(infoData.hero?.title)}
                    </h1>
                    <p
                        style={{
                            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                            opacity: 0.9,
                            maxWidth: '650px',
                            margin: '0 auto 1rem',
                            color: 'white',
                            fontStyle: 'italic',
                            lineHeight: 1.6
                        }}
                    >
                        {getText(infoData.hero?.subtitle)}
                    </p>
                    <p
                        style={{
                            fontSize: '1rem',
                            opacity: 0.85,
                            margin: '0 auto 2.5rem',
                            color: 'white',
                            fontWeight: 500
                        }}
                    >
                        {getText(infoData.hero?.visaIncluded)}
                    </p>

                    {/* Price Info */}
                    <div
                        style={{
                            fontSize: 'clamp(3rem, 8vw, 4rem)',
                            fontWeight: 800,
                            marginBottom: '0.25rem',
                            color: 'white',
                            textShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        {infoData.price?.amount}
                    </div>
                    <div style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '1.5rem', color: 'white' }}>
                        {getText(infoData.price?.perPerson)}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '0.4rem', color: 'white' }}>
                        {getText(infoData.price?.basis)}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: '0.4rem', color: 'white' }}>
                        {getText(infoData.price?.singleSupplement)}
                    </div>
                    <div
                        style={{
                            fontSize: '0.8rem',
                            opacity: 0.65,
                            fontStyle: 'italic',
                            color: 'white'
                        }}
                    >
                        *{getText(infoData.price?.visaNote)}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    style={{
                        position: 'absolute',
                        bottom: '1.5rem',
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

            {/* What's Included Section */}
            <section style={{ padding: 'var(--spacing-xl) 0', backgroundColor: 'var(--warm-white)' }}>
                <div className="container">
                    <ScrollReveal>
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem', color: 'var(--text-dark)' }}>
                            {getText(infoData.included?.title)}
                        </h2>
                    </ScrollReveal>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.25rem',
                            maxWidth: '1000px',
                            margin: '0 auto'
                        }}
                    >
                        {infoData.included?.items?.map((item, index) => {
                            const IconComponent = iconMap[item.icon] || CheckCircle;
                            return (
                                <ScrollReveal key={index} delay={index * 0.05}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            padding: '1.25rem',
                                            background: 'var(--surface-white)',
                                            borderRadius: 'var(--radius-lg)',
                                            boxShadow: 'var(--shadow-md)'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <IconComponent size={22} color="var(--success-green)" />
                                        </div>
                                        <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-medium)', minHeight: '4.3em', display: 'flex', alignItems: 'center' }}>
                                            {getText(item.text)}
                                        </span>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* What's NOT Included Section */}
            <section style={{ padding: '0 0 var(--spacing-xl)', backgroundColor: 'var(--warm-white)' }}>
                <div className="container">
                    <ScrollReveal>
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem', color: 'var(--text-dark)' }}>
                            {getText(infoData.notIncluded?.title)}
                        </h2>
                    </ScrollReveal>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.25rem',
                            maxWidth: '1000px',
                            margin: '0 auto'
                        }}
                    >
                        {infoData.notIncluded?.items?.map((item, index) => {
                            const IconComponent = iconMap[item.icon] || XCircle;
                            return (
                                <ScrollReveal key={index} delay={index * 0.05}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            padding: '1.25rem',
                                            background: 'var(--surface-white)',
                                            borderRadius: 'var(--radius-lg)',
                                            boxShadow: 'var(--shadow-md)'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: 'rgba(158, 158, 158, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <IconComponent size={22} color="var(--text-light)" />
                                        </div>
                                        <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-medium)', minHeight: '2.85em', display: 'flex', alignItems: 'center' }}>
                                            {getText(item.text)}
                                        </span>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <section style={{ padding: 'var(--spacing-xl) 0', backgroundColor: 'var(--off-white)' }}>
                <div className="container">
                    <ScrollReveal>
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>
                            {getText(infoData.highlights?.title)}
                        </h2>
                    </ScrollReveal>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem',
                            maxWidth: '1100px',
                            margin: '0 auto'
                        }}
                    >
                        {/* Landmarks Column */}
                        <ScrollReveal>
                            <div
                                style={{
                                    background: 'var(--surface-white)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2rem',
                                    boxShadow: 'var(--shadow-lg)',
                                    height: '100%'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: 'var(--radius-lg)',
                                            backgroundColor: 'rgba(216, 67, 21, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Landmark size={24} color="var(--primary-red)" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                        {getText(infoData.highlights?.landmarks?.title)}
                                    </h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {infoData.highlights?.landmarks?.items?.map((item, i) => (
                                        <li key={i} style={{ fontSize: '0.95rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
                                            {getText(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>

                        {/* Historic Sites Column */}
                        <ScrollReveal delay={0.1}>
                            <div
                                style={{
                                    background: 'var(--surface-white)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2rem',
                                    boxShadow: 'var(--shadow-lg)',
                                    height: '100%'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: 'var(--radius-lg)',
                                            backgroundColor: 'rgba(121, 85, 72, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Castle size={24} color="#795548" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                        {getText(infoData.highlights?.historic?.title)}
                                    </h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {infoData.highlights?.historic?.items?.map((item, i) => (
                                        <li key={i} style={{ fontSize: '0.95rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
                                            {getText(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>

                        {/* Nature Column */}
                        <ScrollReveal delay={0.2}>
                            <div
                                style={{
                                    background: 'var(--surface-white)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2rem',
                                    boxShadow: 'var(--shadow-lg)',
                                    height: '100%'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: 'var(--radius-lg)',
                                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Mountain size={24} color="var(--success-green)" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                        {getText(infoData.highlights?.nature?.title)}
                                    </h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {infoData.highlights?.nature?.items?.map((item, i) => (
                                        <li key={i} style={{ fontSize: '0.95rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
                                            {getText(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Travel Details & Requirements Section */}
            <section style={{ padding: 'var(--spacing-xl) 0', backgroundColor: 'var(--warm-white)' }}>
                <div className="container">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '2rem',
                            maxWidth: '900px',
                            margin: '0 auto'
                        }}
                    >
                        {/* Travel Details */}
                        <ScrollReveal>
                            <div
                                style={{
                                    background: 'var(--surface-white)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2rem',
                                    boxShadow: 'var(--shadow-lg)',
                                    height: '100%'
                                }}
                            >
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                    {getText(infoData.travel?.title)}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <PlaneTakeoff size={20} color="var(--primary-blue)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                                                {getText(infoData.travel?.outbound?.label)}
                                            </div>
                                            <div style={{ fontSize: '0.95rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
                                                {getText(infoData.travel?.outbound?.text)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: 'rgba(216, 67, 21, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <PlaneLanding size={20} color="var(--primary-red)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                                                {getText(infoData.travel?.return?.label)}
                                            </div>
                                            <div style={{ fontSize: '0.95rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
                                                {getText(infoData.travel?.return?.text)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Requirements */}
                        <ScrollReveal delay={0.1}>
                            <div
                                style={{
                                    background: 'var(--surface-white)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2rem',
                                    boxShadow: 'var(--shadow-lg)',
                                    height: '100%'
                                }}
                            >
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                    {getText(infoData.requirements?.title)}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {infoData.requirements?.items?.map((item, index) => {
                                        const IconComponent = iconMap[item.icon] || CheckCircle;
                                        return (
                                            <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: 'var(--radius-md)',
                                                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <IconComponent size={20} color="#9c27b0" />
                                                </div>
                                                <div style={{ fontSize: '0.95rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
                                                    {getText(item.text)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Deposit & Payments - Full width below */}
                    <div style={{ maxWidth: '900px', margin: '2rem auto 0' }}>
                        <ScrollReveal delay={0.2}>
                            <div
                                style={{
                                    background: 'var(--surface-white)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '2rem',
                                    boxShadow: 'var(--shadow-lg)'
                                }}
                            >
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                    {getText(infoData.payments?.title)}
                                </h3>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1.5rem',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    {infoData.payments?.items?.map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: 'var(--off-white)',
                                                borderRadius: 'var(--radius-lg)'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: 'var(--radius-md)',
                                                    backgroundColor: index === 0 ? 'rgba(76, 175, 80, 0.1)' : index === 1 ? 'rgba(255, 152, 0, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <CalendarCheck size={20} color={index === 0 ? '#4caf50' : index === 1 ? '#ff9800' : '#2196f3'} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                                                    {getText(item.label)}
                                                </div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                                                    {item.amount}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-medium)' }}>
                                                    {getText(item.date)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--text-medium)',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        padding: '1rem',
                                        background: 'rgba(255, 152, 0, 0.08)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '3px solid #ff9800'
                                    }}
                                >
                                    {getText(infoData.payments?.note)}
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
