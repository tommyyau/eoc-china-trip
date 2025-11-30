import { useState } from 'react';
import { MapPin, Clock, Mountain, Route, ChevronDown, ChevronUp, Utensils, Coffee } from 'lucide-react';
import SegmentImageGallery from './SegmentImageGallery';

const typeConfig = {
  activity: { icon: MapPin, color: '#1976d2', bg: '#e3f2fd', label: 'Activity' },
  meal: { icon: Utensils, color: '#e65100', bg: '#fff3e0', label: 'Meal' },
  'check-in': { icon: Coffee, color: '#7b1fa2', bg: '#f3e5f5', label: 'Check-in' },
  'free-time': { icon: Coffee, color: '#00695c', bg: '#e0f2f1', label: 'Free Time' },
};

export default function ActivitySegment({ segment, poiContent, showTime = true }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { type, title, description, duration, time, walkDetails, highlights, images } = segment;

  const config = typeConfig[type] || typeConfig.activity;
  const IconComponent = config.icon;

  const hasExpandableContent = poiContent || (description && description.length > 100);

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '0.75rem',
        borderLeft: `4px solid ${config.color}`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <IconComponent size={20} color={config.color} />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#333' }}>{title}</h4>
        </div>
        {showTime && time && (
          <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '500', flexShrink: 0 }}>{time}</span>
        )}
      </div>

      {/* Duration and Walk Details */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {duration && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: '#f5f5f5',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: '#555',
            }}
          >
            <Clock size={14} />
            {duration}
          </span>
        )}
        {walkDetails && (
          <>
            {walkDetails.distance && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#e8f5e9',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: '#2e7d32',
                  fontWeight: '600',
                }}
              >
                <Route size={14} />
                {walkDetails.distance}
              </span>
            )}
            {walkDetails.elevation && walkDetails.elevation !== 'minimal' && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#fff3e0',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: '#e65100',
                }}
              >
                <Mountain size={14} />
                {walkDetails.elevation}
              </span>
            )}
            {walkDetails.difficulty && (
              <span
                style={{
                  background: walkDetails.difficulty === 'easy' ? '#c8e6c9' :
                             walkDetails.difficulty === 'moderate' ? '#fff9c4' : '#ffccbc',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#333',
                  fontWeight: '500',
                  textTransform: 'capitalize',
                }}
              >
                {walkDetails.difficulty}
              </span>
            )}
          </>
        )}
      </div>

      {/* Images */}
      {images && images.length > 0 && (
        <SegmentImageGallery images={images} />
      )}

      {/* Description - brief */}
      {description && !isExpanded && (
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#555', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
          {description.length > 150 ? description.substring(0, 150) + '...' : description}
        </p>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #eee' }}>
          {description && (
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#555', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {description}
            </p>
          )}
          {poiContent && (
            <>
              {poiContent.summary && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1976d2' }}>About</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: '1.6' }}>
                    {poiContent.summary}
                  </p>
                </div>
              )}
              {poiContent.tips && (
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#2e7d32' }}>Tips</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: '1.6' }}>
                    {poiContent.tips}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Read more button */}
      {hasExpandableContent && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'none',
            border: 'none',
            color: config.color,
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '0.5rem 0 0 0',
            marginTop: '0.25rem',
          }}
        >
          {isExpanded ? (
            <>Show less <ChevronUp size={16} /></>
          ) : (
            <>Read more <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </div>
  );
}
