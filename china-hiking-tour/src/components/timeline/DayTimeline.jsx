import { useLanguage } from '../../context/LanguageContext';
import TransitSegment from './TransitSegment';
import ActivitySegment from './ActivitySegment';

// Helper to get text from string or bilingual object
function getText(value, lang = 'en') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value[lang]) return value[lang];
  if (typeof value === 'object' && value.en) return value.en;
  return '';
}

// Group segments by time of day
function groupByTime(segments, language) {
  const timeOrder = ['Morning', 'Midday', 'Full Day', 'Afternoon', 'Evening', 'Night'];
  const timeOrderCn = ['上午', '中午', '全天', '下午', '傍晚', '夜间'];
  const groups = {};

  for (const segment of segments) {
    // Get the English time for grouping (consistent key)
    const timeEn = getText(segment.time, 'en') || 'Other';
    if (!groups[timeEn]) groups[timeEn] = [];
    groups[timeEn].push(segment);
  }

  // Sort by time order
  const sortedGroups = [];
  for (let i = 0; i < timeOrder.length; i++) {
    const timeEn = timeOrder[i];
    if (groups[timeEn]) {
      sortedGroups.push({
        time: language === 'cn' ? timeOrderCn[i] : timeEn,
        segments: groups[timeEn]
      });
      delete groups[timeEn];
    }
  }
  // Add any remaining times
  for (const [timeEn, segs] of Object.entries(groups)) {
    sortedGroups.push({
      time: language === 'cn' ? '其他' : timeEn,
      segments: segs
    });
  }

  return sortedGroups;
}

// Find matching POI content for a segment
function findPOIContent(segment, pointsOfInterest, language) {
  if (!pointsOfInterest || pointsOfInterest.length === 0) return null;

  // Try to match by title
  const segmentTitle = getText(segment.title, language).toLowerCase();

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
  const { language } = useLanguage();

  if (!segments || segments.length === 0) {
    return (
      <p style={{ color: '#666', fontStyle: 'italic' }}>
        {language === 'en' ? 'No activities scheduled' : '暂无活动安排'}
      </p>
    );
  }

  const groupedSegments = groupByTime(segments, language);

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
            const poiContent = findPOIContent(segment, pointsOfInterest, language);

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
