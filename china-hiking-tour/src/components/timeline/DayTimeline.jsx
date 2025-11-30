import TransitSegment from './TransitSegment';
import ActivitySegment from './ActivitySegment';

// Group segments by time of day
function groupByTime(segments) {
  const timeOrder = ['Morning', 'Midday', 'Full Day', 'Afternoon', 'Evening', 'Night'];
  const groups = {};

  for (const segment of segments) {
    const time = segment.time || 'Other';
    if (!groups[time]) groups[time] = [];
    groups[time].push(segment);
  }

  // Sort by time order
  const sortedGroups = [];
  for (const time of timeOrder) {
    if (groups[time]) {
      sortedGroups.push({ time, segments: groups[time] });
      delete groups[time];
    }
  }
  // Add any remaining times
  for (const [time, segments] of Object.entries(groups)) {
    sortedGroups.push({ time, segments });
  }

  return sortedGroups;
}

// Find matching POI content for a segment
function findPOIContent(segment, pointsOfInterest) {
  if (!pointsOfInterest || pointsOfInterest.length === 0) return null;

  // Try to match by title
  const segmentTitle = segment.title?.toLowerCase() || '';

  for (const poi of pointsOfInterest) {
    const poiName = poi.name?.toLowerCase() || '';
    // Check if POI name is contained in segment title or vice versa
    if (segmentTitle.includes(poiName.split(' ')[0]) || poiName.includes(segmentTitle.split(' ')[0])) {
      return poi;
    }
  }
  return null;
}

export default function DayTimeline({ segments, pointsOfInterest }) {
  if (!segments || segments.length === 0) {
    return <p style={{ color: '#666', fontStyle: 'italic' }}>No activities scheduled</p>;
  }

  const groupedSegments = groupByTime(segments);

  return (
    <div style={{ marginTop: '1rem' }}>
      {groupedSegments.map(({ time, segments: timeSegments }) => (
        <div key={time} style={{ marginBottom: '1.5rem' }}>
          {/* Time of day header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                fontWeight: '600',
                fontSize: '0.85rem',
                color: '#555',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {time}
            </span>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to right, #ddd, transparent)',
              }}
            />
          </div>

          {/* Segments */}
          {timeSegments.map((segment) => {
            // Render based on segment type
            if (segment.type === 'transfer' && segment.mode) {
              return (
                <TransitSegment
                  key={segment.id}
                  segment={segment}
                  showTime={false}
                />
              );
            }

            // For activities, meals, check-in, etc.
            const poiContent = findPOIContent(segment, pointsOfInterest);

            return (
              <ActivitySegment
                key={segment.id}
                segment={segment}
                poiContent={poiContent}
                showTime={false}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
