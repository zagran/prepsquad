import { useState } from 'react'
import { Box, Tabs, Tab, Paper } from '@mui/material'
import { Search, Add } from '@mui/icons-material'
import CreateGroup from './CreateGroup'
import GroupList from './GroupList'

function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleGroupCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab(0)
  }

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<Search />} label="Browse Groups" iconPosition="start" />
          <Tab icon={<Add />} label="Create Group" iconPosition="start" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 ? (
          <GroupList user={user} refreshTrigger={refreshTrigger} />
        ) : (
          <CreateGroup user={user} onGroupCreated={handleGroupCreated} />
        )}
      </Box>
    </Box>
  )
}

export default Dashboard
