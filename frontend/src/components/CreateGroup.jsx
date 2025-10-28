import { useState } from 'react'

const API_URL = 'http://localhost:8000/api'

const PREP_TYPES = [
  { value: 'FAANG', label: 'FAANG Interview Prep' },
  { value: 'AWS_CERT', label: 'AWS Certification' },
  { value: 'GCP_CERT', label: 'GCP Certification' },
  { value: 'AZURE_CERT', label: 'Azure Certification' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'OTHER', label: 'Other' }
]

function CreateGroup({ user, onGroupCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prep_type: 'FAANG'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          user_id: user.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ name: '', description: '', prep_type: 'FAANG' })
        onGroupCreated()
      } else {
        setError(data.error || 'Failed to create group')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-group">
      <h2>Create a New Study Group</h2>

      <form onSubmit={handleSubmit} className="group-form">
        <div className="form-group">
          <label htmlFor="name">Group Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Morning FAANG Prep Squad"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prep_type">Preparation Type *</label>
          <select
            id="prep_type"
            name="prep_type"
            value={formData.prep_type}
            onChange={handleChange}
            required
          >
            {PREP_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell others about your study group..."
            rows="4"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  )
}

export default CreateGroup
