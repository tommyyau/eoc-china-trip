import { Plus, Trash2 } from 'lucide-react'

function DayList({ days, selectedDay, onSelectDay, onUpdateDays }) {
  const handleAddDay = () => {
    const newDay = {
      day: days.length,
      date: '',
      title: 'New Day',
      location: '',
      region: '',
      segments: [],
      meals: '',
      accommodation: { name: '', rating: '' }
    }
    onUpdateDays([...days, newDay])
    onSelectDay(days.length)
  }

  const handleDeleteDay = (index, e) => {
    e.stopPropagation()
    if (!confirm(`Delete Day ${days[index].day}?`)) return

    const newDays = days.filter((_, i) => i !== index)
    // Re-number days
    newDays.forEach((d, i) => d.day = i)
    onUpdateDays(newDays)

    if (selectedDay >= newDays.length) {
      onSelectDay(Math.max(0, newDays.length - 1))
    }
  }

  return (
    <div className="day-list">
      <div className="day-list-header">
        <h2>Days</h2>
        <button onClick={handleAddDay} className="btn btn-small btn-primary">
          <Plus size={14} />
        </button>
      </div>

      {days.map((day, index) => (
        <div
          key={index}
          className={`day-item ${selectedDay === index ? 'selected' : ''}`}
          onClick={() => onSelectDay(index)}
        >
          <div className="day-number">{day.day}</div>
          <div className="day-info">
            <div className="day-title">{day.title?.en || day.title || 'Untitled'}</div>
            <div className="day-location">{day.location?.en || day.location || day.date || ''}</div>
          </div>
          <div className="day-actions">
            <button
              onClick={(e) => handleDeleteDay(index, e)}
              className="btn btn-small btn-danger"
              title="Delete day"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DayList
