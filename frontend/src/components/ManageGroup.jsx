import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Stack,
  Avatar,
} from '@mui/material'
import { CheckCircle, Cancel, People, HourglassEmpty } from '@mui/icons-material'
import { fetchWithAuth } from '../utils/auth'

const API_URL = 'http://localhost:8000/api'

function ManageGroup({ user }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchMyGroups()
  }, [user])

  const fetchMyGroups = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetchWithAuth(`${API_URL}/groups`)
      const data = await response.json()

      if (response.ok) {
        // Filter to only show groups where current user is the creator
        const myGroups = data.groups.filter(g => g.creator_id === user.id)
        setGroups(myGroups)
      } else {
        setError('Failed to load groups')
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (groupId, userId) => {
    setActionLoading(`approve-${groupId}-${userId}`)

    try {
      const response = await fetchWithAuth(`${API_URL}/groups/${groupId}/approve/${userId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh groups
        fetchMyGroups()
      } else {
        alert(data.error || data.detail || 'Failed to approve member')
      }
    } catch (err) {
      alert(err.message || 'Failed to connect to server')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (groupId, userId) => {
    setActionLoading(`reject-${groupId}-${userId}`)

    try {
      const response = await fetchWithAuth(`${API_URL}/groups/${groupId}/reject/${userId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh groups
        fetchMyGroups()
      } else {
        alert(data.error || data.detail || 'Failed to reject member')
      }
    } catch (err) {
      alert(err.message || 'Failed to connect to server')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )
  }

  if (groups.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          You haven't created any groups yet.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Manage Your Groups
      </Typography>

      <Stack spacing={3}>
        {groups.map((group) => (
          <Card key={group.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  {group.name}
                </Typography>
                <Chip
                  label={group.registration_status?.toUpperCase() || 'OPEN'}
                  color={group.registration_status === 'open' ? 'success' : group.registration_status === 'full' ? 'error' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <People fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {group.final_members?.length || 0}/{group.max_members || 10} members
                  </Typography>
                </Box>
                {group.pending_members && group.pending_members.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HourglassEmpty fontSize="small" color="warning" />
                    <Typography variant="body2" color="warning.main">
                      {group.pending_members.length} pending approval
                    </Typography>
                  </Box>
                )}
              </Box>

              {group.pending_members && group.pending_members.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Pending Members
                  </Typography>
                  <List dense>
                    {group.pending_members.map((memberId) => (
                      <ListItem
                        key={memberId}
                        sx={{
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.875rem' }}>
                          {memberId.charAt(0).toUpperCase()}
                        </Avatar>
                        <ListItemText
                          primary={`User ID: ${memberId.substring(0, 8)}...`}
                          secondary="Requested to join"
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="success"
                            onClick={() => handleApprove(group.id, memberId)}
                            disabled={actionLoading === `approve-${group.id}-${memberId}`}
                            sx={{ mr: 1 }}
                          >
                            {actionLoading === `approve-${group.id}-${memberId}` ? (
                              <CircularProgress size={20} />
                            ) : (
                              <CheckCircle />
                            )}
                          </IconButton>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleReject(group.id, memberId)}
                            disabled={actionLoading === `reject-${group.id}-${memberId}`}
                          >
                            {actionLoading === `reject-${group.id}-${memberId}` ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Cancel />
                            )}
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {group.final_members && group.final_members.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Final Members ({group.final_members.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {group.final_members.map((memberId) => (
                      <Chip
                        key={memberId}
                        label={memberId === user.id ? 'You (Creator)' : `${memberId.substring(0, 8)}...`}
                        color={memberId === user.id ? 'primary' : 'default'}
                        size="small"
                      />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}

export default ManageGroup
