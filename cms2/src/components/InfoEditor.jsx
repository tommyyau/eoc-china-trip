import { Plus, Trash2 } from 'lucide-react'

function InfoEditor({ data, onUpdate }) {
  const updateField = (path, value) => {
    const newData = JSON.parse(JSON.stringify(data))
    const keys = path.split('.')
    let obj = newData
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    onUpdate(newData)
  }

  const addItem = (section) => {
    const newData = JSON.parse(JSON.stringify(data))
    if (section === 'visa') {
      newData.visa.items.push({ en: '', cn: '' })
    } else if (section === 'includes') {
      newData.cost.includes.push({ en: '', cn: '' })
    } else if (section === 'excludes') {
      newData.cost.excludes.push({ en: '', cn: '' })
    }
    onUpdate(newData)
  }

  const removeItem = (section, index) => {
    const newData = JSON.parse(JSON.stringify(data))
    if (section === 'visa') {
      newData.visa.items.splice(index, 1)
    } else if (section === 'includes') {
      newData.cost.includes.splice(index, 1)
    } else if (section === 'excludes') {
      newData.cost.excludes.splice(index, 1)
    }
    onUpdate(newData)
  }

  const updateListItem = (section, index, lang, value) => {
    const newData = JSON.parse(JSON.stringify(data))
    if (section === 'visa') {
      newData.visa.items[index][lang] = value
    } else if (section === 'includes') {
      newData.cost.includes[index][lang] = value
    } else if (section === 'excludes') {
      newData.cost.excludes[index][lang] = value
    }
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
          <input
            type="text"
            value={data.hero?.subtitle?.en || ''}
            onChange={(e) => updateField('hero.subtitle.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Subtitle (Chinese)</label>
          <input
            type="text"
            value={data.hero?.subtitle?.cn || ''}
            onChange={(e) => updateField('hero.subtitle.cn', e.target.value)}
          />
        </div>
      </section>

      {/* Visa Section */}
      <section className="editor-section">
        <h3>Visa Information</h3>
        <div className="field">
          <label>Section Title (English)</label>
          <input
            type="text"
            value={data.visa?.title?.en || ''}
            onChange={(e) => updateField('visa.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section Title (Chinese)</label>
          <input
            type="text"
            value={data.visa?.title?.cn || ''}
            onChange={(e) => updateField('visa.title.cn', e.target.value)}
          />
        </div>

        <h4>Visa Items</h4>
        {data.visa?.items?.map((item, index) => (
          <div key={index} className="list-item-editor">
            <div className="list-item-fields">
              <input
                type="text"
                value={item.en || ''}
                onChange={(e) => updateListItem('visa', index, 'en', e.target.value)}
                placeholder="English..."
              />
              <input
                type="text"
                value={item.cn || ''}
                onChange={(e) => updateListItem('visa', index, 'cn', e.target.value)}
                placeholder="Chinese..."
              />
            </div>
            <button
              className="btn btn-small btn-danger"
              onClick={() => removeItem('visa', index)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItem('visa')}>
          <Plus size={16} /> Add Visa Item
        </button>
      </section>

      {/* Cost Section */}
      <section className="editor-section">
        <h3>Cost & Inclusions</h3>
        <div className="field">
          <label>Section Title (English)</label>
          <input
            type="text"
            value={data.cost?.title?.en || ''}
            onChange={(e) => updateField('cost.title.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section Title (Chinese)</label>
          <input
            type="text"
            value={data.cost?.title?.cn || ''}
            onChange={(e) => updateField('cost.title.cn', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Price Statement (English)</label>
          <input
            type="text"
            value={data.cost?.price?.en || ''}
            onChange={(e) => updateField('cost.price.en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Price Statement (Chinese)</label>
          <input
            type="text"
            value={data.cost?.price?.cn || ''}
            onChange={(e) => updateField('cost.price.cn', e.target.value)}
          />
        </div>

        {/* Includes */}
        <h4>Included Items</h4>
        {data.cost?.includes?.map((item, index) => (
          <div key={index} className="list-item-editor">
            <div className="list-item-fields">
              <input
                type="text"
                value={item.en || ''}
                onChange={(e) => updateListItem('includes', index, 'en', e.target.value)}
                placeholder="English..."
              />
              <input
                type="text"
                value={item.cn || ''}
                onChange={(e) => updateListItem('includes', index, 'cn', e.target.value)}
                placeholder="Chinese..."
              />
            </div>
            <button
              className="btn btn-small btn-danger"
              onClick={() => removeItem('includes', index)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItem('includes')}>
          <Plus size={16} /> Add Include
        </button>

        {/* Excludes */}
        <h4>Excluded Items</h4>
        {data.cost?.excludes?.map((item, index) => (
          <div key={index} className="list-item-editor">
            <div className="list-item-fields">
              <input
                type="text"
                value={item.en || ''}
                onChange={(e) => updateListItem('excludes', index, 'en', e.target.value)}
                placeholder="English..."
              />
              <input
                type="text"
                value={item.cn || ''}
                onChange={(e) => updateListItem('excludes', index, 'cn', e.target.value)}
                placeholder="Chinese..."
              />
            </div>
            <button
              className="btn btn-small btn-danger"
              onClick={() => removeItem('excludes', index)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItem('excludes')}>
          <Plus size={16} /> Add Exclude
        </button>
      </section>
    </div>
  )
}

export default InfoEditor
