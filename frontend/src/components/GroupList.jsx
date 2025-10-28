import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000/api'

const PREP_TYPE_LABELS = {
  'FAANG': 'FAANG Interview Prep',
  'AWS_CERT': 'AWS Certification',
  'GCP_CERT': 'GCP Certification',
  'AZURE_CERT': 'Azure Certification',
  'SYSTEM_DESIGN': 'System Design',
  'OTHER': 'Other'
}

function GroupList({ user, refreshTrigger }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [joiningGroup, setJoiningGroup] = useState(null)

  useEffect(() => {
    fetchGroups()
  }, [refreshTrigger, filter])

  const fetchGroups = async () => {
    setLoading(true)
    setError('')

    try {
      const url = filter === 'all'
        ? `${API_URL}/groups`
        : `${API_URL}/groups?prep_type=${filter}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setGroups(data.groups)
      } else {
        setError('Failed to load groups')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (groupId) => {
    setJoiningGroup(groupId)

    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id })
      })

      const data = await response.json()

      if (response.ok) {
        fetchGroups()
      } else {
        alert(data.error || 'Failed to join group')
      }
    } catch (err) {
      alert('Failed to connect to server')
    } finally {
      setJoiningGroup(null)
    }
  }

  const isUserInGroup = (group) => {
    return group.members.includes(user.id)
  }

  return (
    <div className="group-list">
      <div className="group-list-header">
        <h2>Study Groups</h2>

        <div className="filter-group">
          <label htmlFor="filter">Filter by type:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="FAANG">FAANG</option>
            <option value="AWS_CERT">AWS Certification</option>
            <option value="GCP_CERT">GCP Certification</option>
            <option value="AZURE_CERT">Azure Certification</option>
            <option value="SYSTEM_DESIGN">System Design</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading groups...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <p>No groups found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="group-card-header">
                <h3>{group.name}</h3>
                <span className="group-badge">{PREP_TYPE_LABELS[group.prep_type]}</span>
              </div>

              {group.description && (
                <p className="group-description">{group.description}</p>
              )}

              <div className="group-card-footer">
                <span className="group-members">
                  {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                </span>

                {isUserInGroup(group) ? (
                  <span className="joined-badge">Joined</span>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="btn-join"
                    disabled={joiningGroup === group.id}
                  >
                    {joiningGroup === group.id ? 'Joining...' : 'Join Group'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GroupList
