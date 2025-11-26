import React from 'react';

const SectionDivider = ({
    type = 'wave',
    color = 'var(--off-white)',
    backgroundColor = 'var(--warm-white)',
    flip = false,
    height = '80px'
}) => {
    const waves = {
        wave: (
            <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    transform: flip ? 'rotate(180deg)' : 'none'
                }}
            >
                <path
                    d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                    fill={color}
                />
            </svg>
        ),
        mountain: (
            <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    transform: flip ? 'rotate(180deg)' : 'none'
                }}
            >
                <path
                    d="M0,0 L400,100 L600,40 L800,90 L1000,30 L1200,80 L1200,120 L0,120 Z"
                    fill={color}
                />
            </svg>
        ),
        curve: (
            <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    transform: flip ? 'rotate(180deg)' : 'none'
                }}
            >
                <path
                    d="M0,120 Q600,0 1200,120 L1200,120 L0,120 Z"
                    fill={color}
                />
            </svg>
        ),
        triangle: (
            <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    transform: flip ? 'rotate(180deg)' : 'none'
                }}
            >
                <polygon
                    points="0,120 600,0 1200,120"
                    fill={color}
                />
            </svg>
        )
    };

    return (
        <div
            style={{
                width: '100%',
                height,
                overflow: 'hidden',
                lineHeight: 0,
                backgroundColor,
                marginTop: flip ? '-1px' : 0,
                marginBottom: flip ? 0 : '-1px'
            }}
        >
            {waves[type] || waves.wave}
        </div>
    );
};

export default SectionDivider;
