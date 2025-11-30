import { Hotel, Star, MapPin } from 'lucide-react';

export default function AccommodationBanner({ accommodation }) {
  if (!accommodation || !accommodation.name || !accommodation.isNewStay) {
    return null;
  }

  const { name, rating, location } = accommodation;

  // Parse star rating
  const starCount = rating ? parseInt(rating) || 4 : 4;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        border: '2px solid #4caf50',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Icon and badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            background: '#4caf50',
            color: 'white',
            borderRadius: '8px',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Hotel size={24} />
        </div>
        <span
          style={{
            background: '#2e7d32',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          New Stay
        </span>
      </div>

      {/* Hotel info */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ fontWeight: '600', fontSize: '1rem', color: '#1b5e20', marginBottom: '0.25rem' }}>
          {name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Star rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            {[...Array(starCount)].map((_, i) => (
              <Star key={i} size={14} fill="#ffc107" color="#ffc107" />
            ))}
          </div>
          {/* Location */}
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#555', fontSize: '0.85rem' }}>
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
