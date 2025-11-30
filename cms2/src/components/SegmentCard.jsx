import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, MoveUp, MoveDown } from 'lucide-react'
import ImageManager from './ImageManager'

const SEGMENT_TYPES = [
  { value: 'activity', label: 'Activity' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'meal', label: 'Meal' },
  { value: 'check-in', label: 'Check-in' },
  { value: 'check-out', label: 'Check-out' },
  { value: 'free-time', label: 'Free Time' }
]

const TIME_OPTIONS = [
  'Morning',
  'Midday',
  'Afternoon',
  'Evening',
  'Night',
  'Full Day'
]

const TRANSPORT_MODES = [
  { value: '', label: 'Select...' },
  { value: 'flight', label: 'Flight' },
  { value: 'train', label: 'Train' },
  { value: 'high-speed rail', label: 'High-Speed Rail' },
  { value: 'coach', label: 'Coach/Bus' },
  { value: 'walk', label: 'Walk' },
  { value: 'cable car', label: 'Cable Car' },
  { value: 'boat', label: 'Boat' }
]

function SegmentCard({ segment, index, totalSegments, onUpdate, onDelete, onMove }) {
  const [expanded, setExpanded] = useState(false)

  const updateField = (field, value) => {
    onUpdate({ ...segment, [field]: value })
  }

  const updateWalkDetails = (field, value) => {
    onUpdate({
      ...segment,
      walkDetails: { ...segment.walkDetails, [field]: value }
    })
  }

  const isTransfer = segment.type === 'transfer'
  const isActivity = segment.type === 'activity'

  return (
    <div className="segment-card">
      <div className="segment-header" onClick={() => setExpanded(!expanded)}>
        <div className="segment-reorder">
          <button
            onClick={(e) => { e.stopPropagation(); onMove(-1) }}
            disabled={index === 0}
            title="Move up"
          >
            <MoveUp size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMove(1) }}
            disabled={index === totalSegments - 1}
            title="Move down"
          >
            <MoveDown size={12} />
          </button>
        </div>

        <span className={`segment-type-badge ${segment.type}`}>
          {segment.type}
        </span>
        <span className="segment-title">{segment.title || 'Untitled'}</span>
        <span className="segment-time">{segment.time}</span>
        {segment.images?.length > 0 && (
          <span style={{ fontSize: 11, color: '#888' }}>
            {segment.images.length} image{segment.images.length > 1 ? 's' : ''}
          </span>
        )}

        <div className="segment-actions">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="btn btn-small btn-danger"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="segment-body">
          <div className="field-row">
            <div className="field">
              <label>Type</label>
              <select
                value={segment.type || 'activity'}
                onChange={(e) => updateField('type', e.target.value)}
              >
                {SEGMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Time of Day</label>
              <select
                value={segment.time || 'Morning'}
                onChange={(e) => updateField('time', e.target.value)}
              >
                {TIME_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Duration</label>
              <input
                type="text"
                value={segment.duration || ''}
                onChange={(e) => updateField('duration', e.target.value)}
                placeholder="e.g., 2 hours"
              />
            </div>
          </div>

          <div className="field">
            <label>Title</label>
            <input
              type="text"
              value={segment.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Segment title..."
            />
          </div>

          {/* Transfer-specific fields */}
          {isTransfer && (
            <>
              <div className="field-row">
                <div className="field">
                  <label>From</label>
                  <input
                    type="text"
                    value={segment.from || ''}
                    onChange={(e) => updateField('from', e.target.value)}
                    placeholder="Departure..."
                  />
                </div>
                <div className="field">
                  <label>To</label>
                  <input
                    type="text"
                    value={segment.to || ''}
                    onChange={(e) => updateField('to', e.target.value)}
                    placeholder="Arrival..."
                  />
                </div>
                <div className="field">
                  <label>Mode</label>
                  <select
                    value={segment.mode || ''}
                    onChange={(e) => updateField('mode', e.target.value)}
                  >
                    {TRANSPORT_MODES.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Activity-specific fields */}
          {isActivity && (
            <>
              <div className="field">
                <label>Location</label>
                <input
                  type="text"
                  value={segment.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Activity location..."
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Walk Distance</label>
                  <input
                    type="text"
                    value={segment.walkDetails?.distance || ''}
                    onChange={(e) => updateWalkDetails('distance', e.target.value)}
                    placeholder="e.g., 12km"
                  />
                </div>
                <div className="field">
                  <label>Elevation</label>
                  <input
                    type="text"
                    value={segment.walkDetails?.elevation || ''}
                    onChange={(e) => updateWalkDetails('elevation', e.target.value)}
                    placeholder="e.g., 500m gain"
                  />
                </div>
                <div className="field">
                  <label>Difficulty</label>
                  <select
                    value={segment.walkDetails?.difficulty || ''}
                    onChange={(e) => updateWalkDetails('difficulty', e.target.value)}
                  >
                    <option value="">N/A</option>
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="field">
            <label>Description</label>
            <textarea
              value={segment.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Segment description..."
            />
          </div>

          {/* Images */}
          <ImageManager
            images={segment.images || []}
            onUpdate={(images) => updateField('images', images)}
            segmentTitle={segment.title}
          />
        </div>
      )}
    </div>
  )
}

export default SegmentCard
