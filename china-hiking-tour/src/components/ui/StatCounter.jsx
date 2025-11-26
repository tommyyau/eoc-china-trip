import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

const StatCounter = ({
    end,
    duration = 2000,
    prefix = '',
    suffix = '',
    label,
    icon: Icon,
    color = 'var(--primary-red)'
}) => {
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (inView && !hasAnimated.current) {
            hasAnimated.current = true;
            const startTime = Date.now();
            const startValue = 0;

            const animate = () => {
                const now = Date.now();
                const progress = Math.min((now - startTime) / duration, 1);

                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(startValue + (end - startValue) * easeOut);

                setCount(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [inView, end, duration]);

    return (
        <div
            ref={ref}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '1.5rem'
            }}
        >
            {Icon && (
                <Icon
                    size={36}
                    color={color}
                    style={{ marginBottom: '0.75rem' }}
                />
            )}
            <div
                style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: color,
                    lineHeight: 1
                }}
            >
                {prefix}{count}{suffix}
            </div>
            {label && (
                <div
                    style={{
                        marginTop: '0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: 'var(--text-medium)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}
                >
                    {label}
                </div>
            )}
        </div>
    );
};

export default StatCounter;
