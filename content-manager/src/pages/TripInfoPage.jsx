import { useState, useEffect } from 'react'
import { getTripInfo, saveTripInfo, createEmptyTripInfo } from '../utils/storage'

function TripInfoPage() {
  const [tripInfo, setTripInfo] = useState(createEmptyTripInfo())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const data = getTripInfo()
    setTripInfo(data)
  }, [])

  const handleSave = () => {
    saveTripInfo(tripInfo)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateField = (path, value) => {
    const keys = path.split('.')
    const updated = { ...tripInfo }
    let obj = updated
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] }
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    setTripInfo(updated)
  }

  const updateArrayField = (path, value) => {
    // Split by newlines for array fields
    const items = value.split('\n').filter(item => item.trim())
    updateField(path, items)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Trip Information</h1>
        <button className="primary" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Basic Info */}
      <div className="card">
        <h2>Basic Details</h2>
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Trip Name</label>
            <input
              type="text"
              value={tripInfo.tripName || ''}
              onChange={e => updateField('tripName', e.target.value)}
              placeholder="e.g., China Hiking Tour 2026"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Duration</label>
            <input
              type="text"
              value={tripInfo.duration || ''}
              onChange={e => updateField('duration', e.target.value)}
              placeholder="e.g., 14 days and 13 nights"
            />
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="card">
        <h2>Costs</h2>
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Price Per Person</label>
            <input
              type="text"
              value={tripInfo.costs?.perPerson || ''}
              onChange={e => updateField('costs.perPerson', e.target.value)}
              placeholder="e.g., £1,600"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Single Supplement</label>
            <input
              type="text"
              value={tripInfo.costs?.singleSupplement || ''}
              onChange={e => updateField('costs.singleSupplement', e.target.value)}
              placeholder="e.g., £455-£585"
            />
          </div>
        </div>
        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>What's Included (one per line)</label>
          <textarea
            value={tripInfo.costs?.included?.join('\n') || ''}
            onChange={e => updateArrayField('costs.included', e.target.value)}
            placeholder="Accommodation&#10;Meals&#10;Transport&#10;Guide services&#10;Entrance tickets"
            style={{ minHeight: '120px' }}
          />
        </div>
        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>What's NOT Included (one per line)</label>
          <textarea
            value={tripInfo.costs?.excluded?.join('\n') || ''}
            onChange={e => updateArrayField('costs.excluded', e.target.value)}
            placeholder="International flights&#10;Single room supplement&#10;Personal expenses&#10;Travel insurance"
            style={{ minHeight: '100px' }}
          />
        </div>
      </div>

      {/* Flights */}
      <div className="card">
        <h2>Flights</h2>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#666' }}>Outbound</h3>
        <div className="grid-2" style={{ marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>From</label>
            <input
              type="text"
              value={tripInfo.flights?.outbound?.from || ''}
              onChange={e => updateField('flights.outbound.from', e.target.value)}
              placeholder="e.g., London Heathrow"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>To</label>
            <input
              type="text"
              value={tripInfo.flights?.outbound?.to || ''}
              onChange={e => updateField('flights.outbound.to', e.target.value)}
              placeholder="e.g., Xi'an"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Date & Time</label>
            <input
              type="text"
              value={tripInfo.flights?.outbound?.date || ''}
              onChange={e => updateField('flights.outbound.date', e.target.value)}
              placeholder="e.g., May 7, 22:00"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Airline</label>
            <input
              type="text"
              value={tripInfo.flights?.outbound?.airline || ''}
              onChange={e => updateField('flights.outbound.airline', e.target.value)}
              placeholder="e.g., Tianjin Airlines"
            />
          </div>
        </div>

        <h3 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#666' }}>Return</h3>
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>From</label>
            <input
              type="text"
              value={tripInfo.flights?.return?.from || ''}
              onChange={e => updateField('flights.return.from', e.target.value)}
              placeholder="e.g., Qingdao"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>To</label>
            <input
              type="text"
              value={tripInfo.flights?.return?.to || ''}
              onChange={e => updateField('flights.return.to', e.target.value)}
              placeholder="e.g., London Heathrow"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Date & Time</label>
            <input
              type="text"
              value={tripInfo.flights?.return?.date || ''}
              onChange={e => updateField('flights.return.date', e.target.value)}
              placeholder="e.g., June 1, 15:00"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Airline</label>
            <input
              type="text"
              value={tripInfo.flights?.return?.airline || ''}
              onChange={e => updateField('flights.return.airline', e.target.value)}
              placeholder="e.g., Tianjin Airlines"
            />
          </div>
        </div>
      </div>

      {/* Visa & Insurance */}
      <div className="card">
        <h2>Visa & Insurance</h2>
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Visa Required</label>
            <select
              value={tripInfo.visa?.required ? 'yes' : 'no'}
              onChange={e => updateField('visa.required', e.target.value === 'yes')}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Visa Notes</label>
            <input
              type="text"
              value={tripInfo.visa?.notes || ''}
              onChange={e => updateField('visa.notes', e.target.value)}
              placeholder="e.g., Apply at least 4 weeks before"
            />
          </div>
        </div>
        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Insurance Notes</label>
          <textarea
            value={tripInfo.insurance?.notes || ''}
            onChange={e => updateField('insurance.notes', e.target.value)}
            placeholder="Details about travel insurance requirements..."
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>

      {/* Health & Safety */}
      <div className="card">
        <h2>Health & Safety</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Vaccinations</label>
          <textarea
            value={tripInfo.healthSafety?.vaccinations || ''}
            onChange={e => updateField('healthSafety.vaccinations', e.target.value)}
            placeholder="Recommended vaccinations..."
            style={{ minHeight: '80px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>General Health Notes</label>
          <textarea
            value={tripInfo.healthSafety?.notes || ''}
            onChange={e => updateField('healthSafety.notes', e.target.value)}
            placeholder="Altitude, fitness requirements, medications..."
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>

      {/* General Notes */}
      <div className="card">
        <h2>General Notes</h2>
        <textarea
          value={tripInfo.notes || ''}
          onChange={e => updateField('notes', e.target.value)}
          placeholder="Any other important trip information..."
          style={{ minHeight: '120px' }}
        />
      </div>
    </div>
  )
}

export default TripInfoPage
