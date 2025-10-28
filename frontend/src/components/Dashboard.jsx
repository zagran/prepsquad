import { useState, useEffect } from 'react'
import CreateGroup from './CreateGroup'
import GroupList from './GroupList'

function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('browse')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleGroupCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab('browse')
  }

  return (
    <div className="dashboard">
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Groups
        </button>
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Group
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'browse' ? (
          <GroupList user={user} refreshTrigger={refreshTrigger} />
        ) : (
          <CreateGroup user={user} onGroupCreated={handleGroupCreated} />
        )}
      </div>
    </div>
  )
}

export default Dashboard
