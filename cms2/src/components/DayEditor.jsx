import { Plus } from 'lucide-react'
import SegmentCard from './SegmentCard'
import { generateSegmentId } from '../utils/storage'

const REGIONS = [
  { value: '', label: 'Select region...' },
  { value: 'xian', label: "Xi'an" },
  { value: 'beijing', label: 'Beijing' },
  { value: 'lushan', label: 'Lushan' },
  { value: 'shangrao', label: 'Shangrao' },
  { value: 'taishan', label: 'Mount Tai' },
  { value: 'qingdao', label: 'Qingdao' }
]

function DayEditor({ day, dayIndex, onUpdate }) {
  const updateField = (field, value) => {
    onUpdate({ ...day, [field]: value })
  }

  const updateAccommodation = (field, value) => {
    onUpdate({
      ...day,
      accommodation: { ...day.accommodation, [field]: value }
    })
  }

  const handleAddSegment = () => {
    const newSegment = {
      id: generateSegmentId(dayIndex, day.segments?.length || 0),
      time: 'Morning',
      type: 'activity',
      title: 'New Activity',
      description: '',
      duration: '',
      images: []
    }
    onUpdate({
      ...day,
      segments: [...(day.segments || []), newSegment]
    })
  }

  const handleUpdateSegment = (index, updatedSegment) => {
    const newSegments = [...day.segments]
    newSegments[index] = updatedSegment
    onUpdate({ ...day, segments: newSegments })
  }

  const handleDeleteSegment = (index) => {
    if (!confirm('Delete this segment?')) return
    const newSegments = day.segments.filter((_, i) => i !== index)
    onUpdate({ ...day, segments: newSegments })
  }

  const handleMoveSegment = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= day.segments.length) return

    const newSegments = [...day.segments]
    const temp = newSegments[index]
    newSegments[index] = newSegments[newIndex]
    newSegments[newIndex] = temp
    onUpdate({ ...day, segments: newSegments })
  }

  return (
    <div className="day-editor">
      <div className="day-editor-header">
        <div className="day-editor-title">
          <h2>Day {day.day} - {day.title?.en || day.title || 'Untitled'}</h2>
          <div className="date">{day.date}</div>
        </div>
      </div>

      {/* Day Info Section */}
      <div className="section">
        <h3>Day Information</h3>
        <div className="field-row">
          <div className="field">
            <label>Title (English)</label>
            <input
              type="text"
              value={day.title?.en || (typeof day.title === 'string' ? day.title : '')}
              onChange={(e) => updateField('title', { ...day.title, en: e.target.value })}
              placeholder="Day title..."
            />
          </div>
          <div className="field">
            <label>Date</label>
            <input
              type="text"
              value={day.date || ''}
              onChange={(e) => updateField('date', e.target.value)}
              placeholder="e.g., May 9"
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Location (English)</label>
            <input
              type="text"
              value={day.location?.en || (typeof day.location === 'string' ? day.location : '')}
              onChange={(e) => updateField('location', { ...day.location, en: e.target.value })}
              placeholder="Primary location..."
            />
          </div>
          <div className="field">
            <label>Region</label>
            <select
              value={day.region || ''}
              onChange={(e) => updateField('region', e.target.value)}
            >
              {REGIONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Description (English)</label>
          <textarea
            value={day.description?.en || (typeof day.description === 'string' ? day.description : '')}
            onChange={(e) => updateField('description', { ...day.description, en: e.target.value })}
            placeholder="Day overview..."
          />
        </div>
      </div>

      {/* Segments Section */}
      <div className="section">
        <div className="section-header">
          <h3>Segments ({day.segments?.length || 0})</h3>
        </div>

        {day.segments?.map((segment, index) => (
          <SegmentCard
            key={segment.id || index}
            segment={segment}
            index={index}
            totalSegments={day.segments.length}
            dayNumber={day.day}
            onUpdate={(updated) => handleUpdateSegment(index, updated)}
            onDelete={() => handleDeleteSegment(index)}
            onMove={(dir) => handleMoveSegment(index, dir)}
          />
        ))}

        <button className="add-segment-btn" onClick={handleAddSegment}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Add Segment
        </button>
      </div>

      {/* Accommodation Section */}
      <div className="section">
        <h3>Accommodation</h3>
        <div className="field-row">
          <div className="field">
            <label>Hotel Name</label>
            <input
              type="text"
              value={day.accommodation?.name || ''}
              onChange={(e) => updateAccommodation('name', e.target.value)}
              placeholder="Hotel name..."
            />
          </div>
          <div className="field">
            <label>Rating</label>
            <input
              type="text"
              value={day.accommodation?.rating || ''}
              onChange={(e) => updateAccommodation('rating', e.target.value)}
              placeholder="e.g., 4-star"
            />
          </div>
        </div>
      </div>

      {/* Meals Section */}
      <div className="section">
        <h3>Meals</h3>
        <div className="field">
          <label>Included Meals</label>
          <input
            type="text"
            value={day.meals || ''}
            onChange={(e) => updateField('meals', e.target.value)}
            placeholder="e.g., Breakfast, Lunch, Dinner"
          />
        </div>
      </div>
    </div>
  )
}

export default DayEditor
