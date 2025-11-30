import { useState } from 'react';
import { Plane, Train, Bus, Car, CableCar, Clock, MapPin, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const modeIcons = {
  Plane: Plane,
  Train: Train,
  Bus: Bus,
  Car: Car,
  CableCar: CableCar,
};

const modeColors = {
  flight: { bg: '#e3f2fd', border: '#1976d2', icon: '#1565c0' },
  train: { bg: '#e8f5e9', border: '#388e3c', icon: '#2e7d32' },
  coach: { bg: '#fff3e0', border: '#f57c00', icon: '#e65100' },
  'high-speed rail': { bg: '#e8f5e9', border: '#388e3c', icon: '#2e7d32' },
  'cable car': { bg: '#f3e5f5', border: '#7b1fa2', icon: '#6a1b9a' },
  default: { bg: '#f5f5f5', border: '#757575', icon: '#616161' },
};

export default function TransitSegment({ segment, showTime = true }) {
  const { mode, modeIcon, from, to, duration, description, time } = segment;
  const [expanded, setExpanded] = useState(false);

  const IconComponent = modeIcons[modeIcon] || Car;
  const colors = modeColors[mode?.toLowerCase()] || modeColors.default;

  const modeLabel = {
    flight: 'Flight',
    train: 'Train',
    coach: 'Coach',
    'high-speed rail': 'High-Speed Rail',
    'cable car': 'Cable Car',
  }[mode?.toLowerCase()] || 'Transfer';

  return (
    <div
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '0.75rem',
      }}
    >
      {/* Header with mode and time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              background: colors.border,
              color: 'white',
              borderRadius: '8px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconComponent size={24} />
          </div>
          <span
            style={{
              fontWeight: '600',
              fontSize: '0.875rem',
              color: colors.icon,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {modeLabel}
          </span>
        </div>
        {showTime && time && (
          <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '500' }}>{time}</span>
        )}
      </div>

      {/* Route: From -> To */}
      {(from || to) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={16} color={colors.icon} />
            <span style={{ fontWeight: '600', fontSize: '1rem', color: '#333' }}>{from || 'Departure'}</span>
          </div>
          <ArrowRight size={20} color={colors.border} />
          <span style={{ fontWeight: '600', fontSize: '1rem', color: '#333' }}>{to || 'Arrival'}</span>
        </div>
      )}

      {/* Duration - prominently displayed */}
      {duration && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.7)',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            marginBottom: description ? '0.75rem' : 0,
          }}
        >
          <Clock size={18} color={colors.icon} />
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#333' }}>{duration}</span>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>travel time</span>
        </div>
      )}

      {/* Description with Read More toggle */}
      {description && (() => {
        const lines = description.split('\n');
        const hasMore = lines.length > 1 || lines[0].length > 150;
        const displayText = expanded ? description : lines[0];

        return (
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#555', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {displayText}
            </p>
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.icon,
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.5rem 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {expanded ? (
                  <>Show less <ChevronUp size={14} /></>
                ) : (
                  <>Read more <ChevronDown size={14} /></>
                )}
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}
