import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const variants = {
    fadeUp: {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0 }
    },
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    },
    slideLeft: {
        hidden: { opacity: 0, x: -60 },
        visible: { opacity: 1, x: 0 }
    },
    slideRight: {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0 }
    },
    scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
    },
    fadeDown: {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0 }
    }
};

const ScrollReveal = ({
    children,
    variant = 'fadeUp',
    delay = 0,
    duration = 0.6,
    threshold = 0.1,
    triggerOnce = true,
    className = '',
    style = {}
}) => {
    const [ref, inView] = useInView({
        threshold,
        triggerOnce
    });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={variants[variant]}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

// Staggered children wrapper for lists
export const ScrollRevealList = ({
    children,
    staggerDelay = 0.1,
    variant = 'fadeUp',
    threshold = 0.1,
    className = '',
    style = {}
}) => {
    const [ref, inView] = useInView({
        threshold,
        triggerOnce: true
    });

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: staggerDelay
            }
        }
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className={className}
            style={style}
        >
            {React.Children.map(children, (child, index) => (
                <motion.div key={index} variants={variants[variant]}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ScrollReveal;
