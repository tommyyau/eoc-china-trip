import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ImageCarousel = ({
    images = [],
    autoplay = true,
    autoplayDelay = 5000,
    showDots = true,
    showArrows = true,
    aspectRatio = '16/10',
    height = null,
    borderRadius = 'var(--radius-lg)',
    showCaptions = true
}) => {
    const { language } = useLanguage();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);

    const plugins = autoplay
        ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: true, stopOnMouseEnter: true })]
        : [];

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, skipSnaps: false },
        plugins
    );

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        onSelect();
        return () => emblaApi.off('select', onSelect);
    }, [emblaApi, onSelect]);

    if (!images || images.length === 0) return null;

    const currentImage = images[selectedIndex];
    const caption = currentImage?.caption?.[language] || currentImage?.caption;

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                borderRadius,
                overflow: 'hidden',
                backgroundColor: 'var(--primary-dark)'
            }}
        >
            {/* Carousel Viewport */}
            <div ref={emblaRef} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex' }}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            style={{
                                flex: '0 0 100%',
                                minWidth: 0,
                                position: 'relative',
                                aspectRatio: height ? 'auto' : aspectRatio,
                                height: height || 'auto'
                            }}
                        >
                            <img
                                src={image.src}
                                alt={image.alt?.[language] || image.alt || `Image ${index + 1}`}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.5s ease'
                                }}
                            />
                            {/* Image gradient overlay for better caption readability */}
                            {showCaptions && caption && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '40%',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                        pointerEvents: 'none'
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            {showArrows && images.length > 1 && (
                <>
                    <button
                        onClick={scrollPrev}
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            zIndex: 2
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={24} color="var(--primary-dark)" />
                    </button>
                    <button
                        onClick={scrollNext}
                        style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            zIndex: 2
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                        aria-label="Next image"
                    >
                        <ChevronRight size={24} color="var(--primary-dark)" />
                    </button>
                </>
            )}

            {/* Caption */}
            {showCaptions && caption && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: showDots ? '3rem' : '1rem',
                        left: '1rem',
                        right: '1rem',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        zIndex: 2
                    }}
                >
                    {caption}
                </div>
            )}

            {/* Dots Navigation */}
            {showDots && images.length > 1 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '0.5rem',
                        zIndex: 2
                    }}
                >
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            style={{
                                width: index === selectedIndex ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: index === selectedIndex
                                    ? 'white'
                                    : 'rgba(255, 255, 255, 0.5)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                padding: 0
                            }}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        zIndex: 2
                    }}
                >
                    {selectedIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
