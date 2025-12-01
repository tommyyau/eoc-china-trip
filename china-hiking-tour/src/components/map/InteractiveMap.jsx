import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Custom marker icon creator - small dots that don't obscure the map
const createCustomIcon = (color, isActive = false) => {
    const size = isActive ? 16 : 12;
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                ${isActive ? 'animation: pulse 2s infinite;' : ''}
            "></div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -10]
    });
};

// Component to handle map bounds
const MapBounds = ({ bounds }) => {
    const map = useMap();

    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, bounds]);

    return null;
};

// Animated route line component
const AnimatedRoute = ({ positions, animate = true }) => {
    const [visiblePoints, setVisiblePoints] = useState([]);

    useEffect(() => {
        // Validate and filter positions to ensure all coordinates are valid
        const validPositions = positions.filter(pos => {
            return Array.isArray(pos) &&
                   pos.length === 2 &&
                   typeof pos[0] === 'number' &&
                   typeof pos[1] === 'number' &&
                   !isNaN(pos[0]) &&
                   !isNaN(pos[1]);
        });

        if (validPositions.length === 0) {
            setVisiblePoints([]);
            return;
        }

        if (!animate) {
            setVisiblePoints(validPositions);
            return;
        }

        setVisiblePoints([]);
        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex < validPositions.length) {
                setVisiblePoints(prev => [...prev, validPositions[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, [positions, animate]);

    // Only render if we have at least 2 valid points
    if (!visiblePoints || visiblePoints.length < 2) return null;

    return (
        <Polyline
            key={`route-${visiblePoints.length}`}
            positions={visiblePoints}
            pathOptions={{
                color: '#D84315',
                weight: 4,
                opacity: 0.8,
                dashArray: null
            }}
        />
    );
};

const InteractiveMap = ({
    destinations = [],
    routeCoordinates = [],
    activeDestination = null,
    onDestinationClick = () => {},
    height = '500px',
    animateRoute = true,
    showRoute = true
}) => {
    const { language } = useLanguage();
    const [mapReady, setMapReady] = useState(false);

    // Ensure routeCoordinates is always an array
    const safeRouteCoordinates = Array.isArray(routeCoordinates) ? routeCoordinates : [];

    // Calculate bounds from destinations
    const bounds = destinations.length > 0
        ? destinations.map(d => d.coordinates).filter(coord => coord && Array.isArray(coord))
        : [[25, 100], [42, 125]]; // Default China bounds

    // Center of China for initial view
    const center = [34, 108];

    const destinationColors = {
        xian: '#D84315',
        beijing: '#1976D2',
        lushan: '#388E3C',
        taishan: '#7B1FA2',
        qingdao: '#00796B'
    };

    // Smart label positioning to avoid overlaps
    const labelPositions = {
        xian: { direction: 'left', offset: [-8, 0] },
        beijing: { direction: 'right', offset: [8, 0] },
        lushan: { direction: 'left', offset: [-8, 0] },
        taishan: { direction: 'top', offset: [0, -8] },
        qingdao: { direction: 'right', offset: [8, 0] }
    };

    return (
        <div style={{ height, width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(216, 67, 21, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(216, 67, 21, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(216, 67, 21, 0); }
                }
                .leaflet-container {
                    font-family: var(--font-body);
                }
                .leaflet-popup-content-wrapper {
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                }
                .leaflet-popup-content {
                    margin: 12px 16px;
                }
                .destination-tooltip {
                    background: white !important;
                    border: none !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
                    padding: 4px 8px !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                    border-radius: 4px !important;
                }
                .destination-tooltip::before {
                    display: none !important;
                }
            `}</style>

            <MapContainer
                center={center}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                whenReady={() => setMapReady(true)}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapBounds bounds={bounds} />

                {/* Route Line */}
                {showRoute && safeRouteCoordinates.length > 1 && mapReady && (
                    <AnimatedRoute
                        positions={safeRouteCoordinates}
                        animate={animateRoute}
                    />
                )}

                {/* Destination Markers */}
                {destinations.map((destination, index) => {
                    const isActive = activeDestination === destination.id;
                    const color = destinationColors[destination.id] || '#D84315';

                    return (
                        <Marker
                            key={destination.id}
                            position={destination.coordinates}
                            icon={createCustomIcon(color, isActive)}
                            eventHandlers={{
                                click: () => onDestinationClick(destination)
                            }}
                        >
                            <Tooltip
                                permanent
                                direction={labelPositions[destination.id]?.direction || 'right'}
                                offset={labelPositions[destination.id]?.offset || [8, 0]}
                                className="destination-tooltip"
                            >
                                {destination.name?.[language] || destination.name}
                            </Tooltip>
                            <Popup>
                                <div style={{ minWidth: '150px' }}>
                                    <h4 style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: 'var(--text-dark)'
                                    }}>
                                        {destination.name?.[language] || destination.name}
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.85rem',
                                        color: 'var(--text-medium)'
                                    }}>
                                        {language === 'en'
                                            ? `Days ${destination.days?.join(', ')}`
                                            : `第${destination.days?.join('、')}天`
                                        }
                                    </p>
                                    {destination.description && (
                                        <p style={{
                                            margin: '8px 0 0 0',
                                            fontSize: '0.8rem',
                                            color: 'var(--text-light)'
                                        }}>
                                            {destination.description?.[language] || destination.description}
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default InteractiveMap;
