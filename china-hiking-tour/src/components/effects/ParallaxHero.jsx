import React from 'react';
import { Parallax } from 'react-scroll-parallax';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ParallaxHero = ({
    backgroundImage,
    overlayOpacity = 0.5,
    overlayGradient = null,
    height = '100vh',
    minHeight = '600px',
    children,
    showScrollIndicator = true,
    parallaxSpeed = -20,
    className = ''
}) => {
    const defaultGradient = `linear-gradient(
        to bottom,
        rgba(0, 0, 0, ${overlayOpacity * 0.6}) 0%,
        rgba(0, 0, 0, ${overlayOpacity}) 50%,
        rgba(0, 0, 0, ${overlayOpacity * 0.8}) 100%
    )`;

    return (
        <div
            className={`parallax-hero ${className}`}
            style={{
                position: 'relative',
                height,
                minHeight,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {/* Parallax Background */}
            <Parallax
                speed={parallaxSpeed}
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
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: 'scale(1.1)'
                    }}
                />
            </Parallax>

            {/* Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: overlayGradient || defaultGradient,
                    zIndex: 1
                }}
            />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                    position: 'relative',
                    zIndex: 2,
                    width: '100%',
                    maxWidth: '1200px',
                    padding: '0 1.5rem',
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                {children}
            </motion.div>

            {/* Scroll Indicator */}
            {showScrollIndicator && (
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
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
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
            )}
        </div>
    );
};

// Simpler hero without parallax for mobile or performance
export const SimpleHero = ({
    backgroundImage,
    overlayOpacity = 0.5,
    height = '70vh',
    children,
    className = ''
}) => {
    return (
        <div
            className={className}
            style={{
                position: 'relative',
                height,
                minHeight: '400px',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
                }}
            />
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    color: 'white',
                    textAlign: 'center',
                    padding: '0 1.5rem'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ParallaxHero;
