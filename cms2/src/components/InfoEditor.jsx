import { Plus, Trash2 } from 'lucide-react'

function InfoEditor({ data, onUpdate }) {
  const updateField = (path, value) => {
    const newData = JSON.parse(JSON.stringify(data))
    const keys = path.split('.')
    let obj = newData
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {}
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    onUpdate(newData)
  }

  const addItemToList = (path) => {
    const newData = JSON.parse(JSON.stringify(data))
    const keys = path.split('.')
    let obj = newData
    for (const key of keys) {
      if (!obj[key]) obj[key] = []
      obj = obj[key]
    }
    obj.push({ icon: '', text: { en: '', cn: '' } })
    onUpdate(newData)
  }

  const removeItemFromList = (path, index) => {
    const newData = JSON.parse(JSON.stringify(data))
    const keys = path.split('.')
    let obj = newData
    for (const key of keys) {
      obj = obj[key]
    }
    obj.splice(index, 1)
    onUpdate(newData)
  }

  const updateListItem = (path, index, field, value) => {
    const newData = JSON.parse(JSON.stringify(data))
    const keys = path.split('.')
    let obj = newData
    for (const key of keys) {
      obj = obj[key]
    }
    if (field.includes('.')) {
      const [f1, f2] = field.split('.')
      if (!obj[index][f1]) obj[index][f1] = {}
      obj[index][f1][f2] = value
    } else {
      obj[index][field] = value
    }
    onUpdate(newData)
  }

  // Helper for highlight items (simpler structure: {en, cn})
  const addHighlightItem = (section) => {
    const newData = JSON.parse(JSON.stringify(data))
    if (!newData.highlights[section].items) newData.highlights[section].items = []
    newData.highlights[section].items.push({ en: '', cn: '' })
    onUpdate(newData)
  }

  const removeHighlightItem = (section, index) => {
    const newData = JSON.parse(JSON.stringify(data))
    newData.highlights[section].items.splice(index, 1)
    onUpdate(newData)
  }

  const updateHighlightItem = (section, index, lang, value) => {
    const newData = JSON.parse(JSON.stringify(data))
    newData.highlights[section].items[index][lang] = value
    onUpdate(newData)
  }

  return (
    <div className="info-editor">
      <h2>Info Page Editor</h2>

      {/* Hero Section */}
      <section className="editor-section">
        <h3>Hero Section</h3>
        <div className="field">
          <label>Title (English)</label>
          <input
            type="text"
            value={data.hero?.title?.en || ''}
            onChange={(e) => updateField('hero.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Title (Chinese)</label>
          <input
            type="text"
            value={data.hero?.title?.cn || ''}
            onChange={(e) => updateField('hero.title.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Subtitle (English)</label>
          <textarea
            value={data.hero?.subtitle?.en || ''}
            onChange={(e) => updateField('hero.subtitle.en', e.target.value)}
            rows={2}
          />
        </div>
        <div className="field">
          <label>Subtitle (Chinese)</label>
          <textarea
            value={data.hero?.subtitle?.cn || ''}
            onChange={(e) => updateField('hero.subtitle.cn', e.target.value)}
            rows={2}
          />
        </div>
        <div className="field">
          <label>Visa Included Note (English)</label>
          <input
            type="text"
            value={data.hero?.visaIncluded?.en || ''}
            onChange={(e) => updateField('hero.visaIncluded.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Visa Included Note (Chinese)</label>
          <input
            type="text"
            value={data.hero?.visaIncluded?.cn || ''}
            onChange={(e) => updateField('hero.visaIncluded.cn', e.target.value)}
          />
        </div>
      </section>

      {/* Price Section */}
      <section className="editor-section">
        <h3>Price Information</h3>
        <div className="field">
          <label>Amount (e.g., £2,400)</label>
          <input
            type="text"
            value={data.price?.amount || ''}
            onChange={(e) => updateField('price.amount', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Per Person Label (English)</label>
          <input
            type="text"
            value={data.price?.perPerson?.en || ''}
            onChange={(e) => updateField('price.perPerson.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Per Person Label (Chinese)</label>
          <input
            type="text"
            value={data.price?.perPerson?.cn || ''}
            onChange={(e) => updateField('price.perPerson.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Dates (English)</label>
          <input
            type="text"
            value={data.price?.dates?.en || ''}
            onChange={(e) => updateField('price.dates.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Dates (Chinese)</label>
          <input
            type="text"
            value={data.price?.dates?.cn || ''}
            onChange={(e) => updateField('price.dates.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Basis (English)</label>
          <input
            type="text"
            value={data.price?.basis?.en || ''}
            onChange={(e) => updateField('price.basis.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Basis (Chinese)</label>
          <input
            type="text"
            value={data.price?.basis?.cn || ''}
            onChange={(e) => updateField('price.basis.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Single Supplement (English)</label>
          <input
            type="text"
            value={data.price?.singleSupplement?.en || ''}
            onChange={(e) => updateField('price.singleSupplement.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Single Supplement (Chinese)</label>
          <input
            type="text"
            value={data.price?.singleSupplement?.cn || ''}
            onChange={(e) => updateField('price.singleSupplement.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Visa Note (English)</label>
          <input
            type="text"
            value={data.price?.visaNote?.en || ''}
            onChange={(e) => updateField('price.visaNote.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Visa Note (Chinese)</label>
          <input
            type="text"
            value={data.price?.visaNote?.cn || ''}
            onChange={(e) => updateField('price.visaNote.cn', e.target.value)}
          />
        </div>
      </section>

      {/* Included Items */}
      <section className="editor-section">
        <h3>What's Included</h3>
        <div className="field">
          <label>Section Title (English)</label>
          <input
            type="text"
            value={data.included?.title?.en || ''}
            onChange={(e) => updateField('included.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section Title (Chinese)</label>
          <input
            type="text"
            value={data.included?.title?.cn || ''}
            onChange={(e) => updateField('included.title.cn', e.target.value)}
          />
        </div>
        <h4>Items</h4>
        {data.included?.items?.map((item, index) => (
          <div key={index} className="list-item-editor" style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Item {index + 1}</span>
              <button className="btn btn-small btn-danger" onClick={() => removeItemFromList('included.items', index)}>
                <Trash2 size={14} />
              </button>
            </div>
            <div className="field" style={{ marginBottom: '0.5rem' }}>
              <label>Icon (e.g., plane, building, utensils)</label>
              <input
                type="text"
                value={item.icon || ''}
                onChange={(e) => updateListItem('included.items', index, 'icon', e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: '0.5rem' }}>
              <label>Text (English)</label>
              <input
                type="text"
                value={item.text?.en || ''}
                onChange={(e) => updateListItem('included.items', index, 'text.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Text (Chinese)</label>
              <input
                type="text"
                value={item.text?.cn || ''}
                onChange={(e) => updateListItem('included.items', index, 'text.cn', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItemToList('included.items')}>
          <Plus size={16} /> Add Item
        </button>
      </section>

      {/* Not Included Items */}
      <section className="editor-section">
        <h3>What's NOT Included</h3>
        <div className="field">
          <label>Section Title (English)</label>
          <input
            type="text"
            value={data.notIncluded?.title?.en || ''}
            onChange={(e) => updateField('notIncluded.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section Title (Chinese)</label>
          <input
            type="text"
            value={data.notIncluded?.title?.cn || ''}
            onChange={(e) => updateField('notIncluded.title.cn', e.target.value)}
          />
        </div>
        <h4>Items</h4>
        {data.notIncluded?.items?.map((item, index) => (
          <div key={index} className="list-item-editor" style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Item {index + 1}</span>
              <button className="btn btn-small btn-danger" onClick={() => removeItemFromList('notIncluded.items', index)}>
                <Trash2 size={14} />
              </button>
            </div>
            <div className="field" style={{ marginBottom: '0.5rem' }}>
              <label>Icon (e.g., shield, wine, coins)</label>
              <input
                type="text"
                value={item.icon || ''}
                onChange={(e) => updateListItem('notIncluded.items', index, 'icon', e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: '0.5rem' }}>
              <label>Text (English)</label>
              <input
                type="text"
                value={item.text?.en || ''}
                onChange={(e) => updateListItem('notIncluded.items', index, 'text.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Text (Chinese)</label>
              <input
                type="text"
                value={item.text?.cn || ''}
                onChange={(e) => updateListItem('notIncluded.items', index, 'text.cn', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItemToList('notIncluded.items')}>
          <Plus size={16} /> Add Item
        </button>
      </section>

      {/* Highlights Section */}
      <section className="editor-section">
        <h3>Trip Highlights</h3>
        <div className="field">
          <label>Section Title (English)</label>
          <input
            type="text"
            value={data.highlights?.title?.en || ''}
            onChange={(e) => updateField('highlights.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section Title (Chinese)</label>
          <input
            type="text"
            value={data.highlights?.title?.cn || ''}
            onChange={(e) => updateField('highlights.title.cn', e.target.value)}
          />
        </div>

        {/* Landmarks */}
        <div style={{ background: '#e8f4e8', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h4>World-Famous Landmarks</h4>
          <div className="field">
            <label>Title (English)</label>
            <input
              type="text"
              value={data.highlights?.landmarks?.title?.en || ''}
              onChange={(e) => updateField('highlights.landmarks.title.en', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Title (Chinese)</label>
            <input
              type="text"
              value={data.highlights?.landmarks?.title?.cn || ''}
              onChange={(e) => updateField('highlights.landmarks.title.cn', e.target.value)}
            />
          </div>
          {data.highlights?.landmarks?.items?.map((item, index) => (
            <div key={index} className="list-item-editor">
              <div className="list-item-fields">
                <input
                  type="text"
                  value={item.en || ''}
                  onChange={(e) => updateHighlightItem('landmarks', index, 'en', e.target.value)}
                  placeholder="English..."
                />
                <input
                  type="text"
                  value={item.cn || ''}
                  onChange={(e) => updateHighlightItem('landmarks', index, 'cn', e.target.value)}
                  placeholder="Chinese..."
                />
              </div>
              <button className="btn btn-small btn-danger" onClick={() => removeHighlightItem('landmarks', index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={() => addHighlightItem('landmarks')}>
            <Plus size={16} /> Add Landmark
          </button>
        </div>

        {/* Historic Sites */}
        <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h4>Historic Sites</h4>
          <div className="field">
            <label>Title (English)</label>
            <input
              type="text"
              value={data.highlights?.historic?.title?.en || ''}
              onChange={(e) => updateField('highlights.historic.title.en', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Title (Chinese)</label>
            <input
              type="text"
              value={data.highlights?.historic?.title?.cn || ''}
              onChange={(e) => updateField('highlights.historic.title.cn', e.target.value)}
            />
          </div>
          {data.highlights?.historic?.items?.map((item, index) => (
            <div key={index} className="list-item-editor">
              <div className="list-item-fields">
                <input
                  type="text"
                  value={item.en || ''}
                  onChange={(e) => updateHighlightItem('historic', index, 'en', e.target.value)}
                  placeholder="English..."
                />
                <input
                  type="text"
                  value={item.cn || ''}
                  onChange={(e) => updateHighlightItem('historic', index, 'cn', e.target.value)}
                  placeholder="Chinese..."
                />
              </div>
              <button className="btn btn-small btn-danger" onClick={() => removeHighlightItem('historic', index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={() => addHighlightItem('historic')}>
            <Plus size={16} /> Add Historic Site
          </button>
        </div>

        {/* Nature */}
        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h4>Mountains & Nature</h4>
          <div className="field">
            <label>Title (English)</label>
            <input
              type="text"
              value={data.highlights?.nature?.title?.en || ''}
              onChange={(e) => updateField('highlights.nature.title.en', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Title (Chinese)</label>
            <input
              type="text"
              value={data.highlights?.nature?.title?.cn || ''}
              onChange={(e) => updateField('highlights.nature.title.cn', e.target.value)}
            />
          </div>
          {data.highlights?.nature?.items?.map((item, index) => (
            <div key={index} className="list-item-editor">
              <div className="list-item-fields">
                <input
                  type="text"
                  value={item.en || ''}
                  onChange={(e) => updateHighlightItem('nature', index, 'en', e.target.value)}
                  placeholder="English..."
                />
                <input
                  type="text"
                  value={item.cn || ''}
                  onChange={(e) => updateHighlightItem('nature', index, 'cn', e.target.value)}
                  placeholder="Chinese..."
                />
              </div>
              <button className="btn btn-small btn-danger" onClick={() => removeHighlightItem('nature', index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={() => addHighlightItem('nature')}>
            <Plus size={16} /> Add Nature Item
          </button>
        </div>
      </section>

      {/* Travel Details */}
      <section className="editor-section">
        <h3>Travel Details</h3>
        <div className="field">
          <label>Section Title (English)</label>
          <input
            type="text"
            value={data.travel?.title?.en || ''}
            onChange={(e) => updateField('travel.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section Title (Chinese)</label>
          <input
            type="text"
            value={data.travel?.title?.cn || ''}
            onChange={(e) => updateField('travel.title.cn', e.target.value)}
          />
        </div>
        <h4>Outbound Flight</h4>
        <div className="field">
          <label>Label (English)</label>
          <input
            type="text"
            value={data.travel?.outbound?.label?.en || ''}
            onChange={(e) => updateField('travel.outbound.label.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Label (Chinese)</label>
          <input
            type="text"
            value={data.travel?.outbound?.label?.cn || ''}
            onChange={(e) => updateField('travel.outbound.label.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Details (English)</label>
          <input
            type="text"
            value={data.travel?.outbound?.text?.en || ''}
            onChange={(e) => updateField('travel.outbound.text.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Details (Chinese)</label>
          <input
            type="text"
            value={data.travel?.outbound?.text?.cn || ''}
            onChange={(e) => updateField('travel.outbound.text.cn', e.target.value)}
          />
        </div>
        <h4>Return Flight</h4>
        <div className="field">
          <label>Label (English)</label>
          <input
            type="text"
            value={data.travel?.return?.label?.en || ''}
            onChange={(e) => updateField('travel.return.label.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Label (Chinese)</label>
          <input
            type="text"
            value={data.travel?.return?.label?.cn || ''}
            onChange={(e) => updateField('travel.return.label.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Details (English)</label>
          <input
            type="text"
            value={data.travel?.return?.text?.en || ''}
            onChange={(e) => updateField('travel.return.text.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Details (Chinese)</label>
          <input
            type="text"
            value={data.travel?.return?.text?.cn || ''}
            onChange={(e) => updateField('travel.return.text.cn', e.target.value)}
          />
        </div>
      </section>

      {/* Requirements */}
      <section className="editor-section">
        <h3>Requirements</h3>
        <div className="field">
          <label>Section Title (English)</label>
          <input
            type="text"
            value={data.requirements?.title?.en || ''}
            onChange={(e) => updateField('requirements.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section Title (Chinese)</label>
          <input
            type="text"
            value={data.requirements?.title?.cn || ''}
            onChange={(e) => updateField('requirements.title.cn', e.target.value)}
          />
        </div>
        <h4>Items</h4>
        {data.requirements?.items?.map((item, index) => (
          <div key={index} className="list-item-editor" style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Item {index + 1}</span>
              <button className="btn btn-small btn-danger" onClick={() => removeItemFromList('requirements.items', index)}>
                <Trash2 size={14} />
              </button>
            </div>
            <div className="field" style={{ marginBottom: '0.5rem' }}>
              <label>Icon (e.g., passport, heart)</label>
              <input
                type="text"
                value={item.icon || ''}
                onChange={(e) => updateListItem('requirements.items', index, 'icon', e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: '0.5rem' }}>
              <label>Text (English)</label>
              <textarea
                value={item.text?.en || ''}
                onChange={(e) => updateListItem('requirements.items', index, 'text.en', e.target.value)}
                rows={2}
              />
            </div>
            <div className="field">
              <label>Text (Chinese)</label>
              <textarea
                value={item.text?.cn || ''}
                onChange={(e) => updateListItem('requirements.items', index, 'text.cn', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItemToList('requirements.items')}>
          <Plus size={16} /> Add Requirement
        </button>
      </section>

      {/* Payments Section */}
      <section className="editor-section">
        <h3>Deposit & Payments</h3>
        <div className="field">
          <label>Section Title (English)</label>
          <input
            type="text"
            value={data.payments?.title?.en || ''}
            onChange={(e) => updateField('payments.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section Title (Chinese)</label>
          <input
            type="text"
            value={data.payments?.title?.cn || ''}
            onChange={(e) => updateField('payments.title.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Note (English)</label>
          <textarea
            value={data.payments?.note?.en || ''}
            onChange={(e) => updateField('payments.note.en', e.target.value)}
            rows={2}
          />
        </div>
        <div className="field">
          <label>Note (Chinese)</label>
          <textarea
            value={data.payments?.note?.cn || ''}
            onChange={(e) => updateField('payments.note.cn', e.target.value)}
            rows={2}
          />
        </div>

        <h4>Payment Schedule</h4>
        {data.payments?.items?.map((item, index) => (
          <div key={index} className="payment-item" style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong>Payment {index + 1}</strong>
              <button
                className="btn btn-small btn-danger"
                onClick={() => {
                  const newData = JSON.parse(JSON.stringify(data))
                  newData.payments.items.splice(index, 1)
                  onUpdate(newData)
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="field">
              <label>Label (English)</label>
              <input
                type="text"
                value={item.label?.en || ''}
                onChange={(e) => {
                  const newData = JSON.parse(JSON.stringify(data))
                  if (!newData.payments.items[index].label) newData.payments.items[index].label = {}
                  newData.payments.items[index].label.en = e.target.value
                  onUpdate(newData)
                }}
              />
            </div>
            <div className="field">
              <label>Label (Chinese)</label>
              <input
                type="text"
                value={item.label?.cn || ''}
                onChange={(e) => {
                  const newData = JSON.parse(JSON.stringify(data))
                  if (!newData.payments.items[index].label) newData.payments.items[index].label = {}
                  newData.payments.items[index].label.cn = e.target.value
                  onUpdate(newData)
                }}
              />
            </div>
            <div className="field">
              <label>Amount</label>
              <input
                type="text"
                value={item.amount || ''}
                onChange={(e) => {
                  const newData = JSON.parse(JSON.stringify(data))
                  newData.payments.items[index].amount = e.target.value
                  onUpdate(newData)
                }}
                placeholder="e.g., 20% (£480)"
              />
            </div>
            <div className="field">
              <label>Due Date (English)</label>
              <input
                type="text"
                value={item.date?.en || ''}
                onChange={(e) => {
                  const newData = JSON.parse(JSON.stringify(data))
                  if (!newData.payments.items[index].date) newData.payments.items[index].date = {}
                  newData.payments.items[index].date.en = e.target.value
                  onUpdate(newData)
                }}
              />
            </div>
            <div className="field">
              <label>Due Date (Chinese)</label>
              <input
                type="text"
                value={item.date?.cn || ''}
                onChange={(e) => {
                  const newData = JSON.parse(JSON.stringify(data))
                  if (!newData.payments.items[index].date) newData.payments.items[index].date = {}
                  newData.payments.items[index].date.cn = e.target.value
                  onUpdate(newData)
                }}
              />
            </div>
          </div>
        ))}
        <button
          className="btn btn-secondary"
          onClick={() => {
            const newData = JSON.parse(JSON.stringify(data))
            if (!newData.payments) {
              newData.payments = { title: { en: '', cn: '' }, note: { en: '', cn: '' }, items: [] }
            }
            if (!newData.payments.items) {
              newData.payments.items = []
            }
            newData.payments.items.push({
              icon: `deposit${newData.payments.items.length + 1}`,
              label: { en: '', cn: '' },
              amount: '',
              date: { en: '', cn: '' }
            })
            onUpdate(newData)
          }}
        >
          <Plus size={16} /> Add Payment
        </button>
      </section>
    </div>
  )
}

export default InfoEditor
