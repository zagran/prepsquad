import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from '@mui/material'
import { People, Check, GroupAdd, Schedule, Public, CalendarMonth, HourglassEmpty } from '@mui/icons-material'
import { fetchWithAuth } from '../utils/auth'

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

      const response = await fetchWithAuth(url)
      const data = await response.json()

      if (response.ok) {
        setGroups(data.groups)
      } else {
        setError('Failed to load groups')
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (groupId) => {
    setJoiningGroup(groupId)

    try {
      const response = await fetchWithAuth(`${API_URL}/groups/${groupId}/join`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        fetchGroups()
      } else {
        alert(data.error || data.detail || 'Failed to join group')
      }
    } catch (err) {
      alert(err.message || 'Failed to connect to server')
    } finally {
      setJoiningGroup(null)
    }
  }

  const isUserInGroup = (group) => {
    return group.final_members?.includes(user.id) || group.members?.includes(user.id)
  }

  const isUserPending = (group) => {
    return group.pending_members?.includes(user.id)
  }

  const getStatusChip = (group) => {
    const status = group.registration_status || 'open'
    const colors = {
      'open': 'success',
      'closed': 'default',
      'full': 'error'
    }
    return (
      <Chip
        label={status.toUpperCase()}
        color={colors[status]}
        size="small"
        sx={{ fontSize: '0.65rem' }}
      />
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h2">
          Study Groups
        </Typography>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filter}
            label="Filter by Type"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="FAANG">FAANG</MenuItem>
            <MenuItem value="AWS_CERT">AWS Certification</MenuItem>
            <MenuItem value="GCP_CERT">GCP Certification</MenuItem>
            <MenuItem value="AZURE_CERT">Azure Certification</MenuItem>
            <MenuItem value="SYSTEM_DESIGN">System Design</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : groups.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No groups found. Be the first to create one!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
                      {group.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Chip
                        label={PREP_TYPE_LABELS[group.prep_type]}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.65rem' }}
                      />
                      {getStatusChip(group)}
                    </Stack>
                  </Box>

                  {group.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {group.description}
                    </Typography>
                  )}

                  {group.goal && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Goal:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.goal}
                      </Typography>
                    </Box>
                  )}

                  {(group.timeline || group.timezone || group.weekly_calls > 0) && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack spacing={0.5}>
                        {group.timeline && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarMonth fontSize="small" sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {group.timeline}
                            </Typography>
                          </Box>
                        )}
                        {group.timezone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Public fontSize="small" sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {group.timezone}
                            </Typography>
                          </Box>
                        )}
                        {group.weekly_calls > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Schedule fontSize="small" sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {group.weekly_calls} call{group.weekly_calls > 1 ? 's' : ''}/week
                              {group.call_time && ` - ${group.call_time}`}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {group.final_members?.length || group.members?.length || 0}/{group.max_members || 10}
                      </Typography>
                    </Box>
                    {group.pending_members && group.pending_members.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HourglassEmpty fontSize="small" color="action" sx={{ fontSize: '1rem' }} />
                        <Typography variant="caption" color="text.secondary">
                          {group.pending_members.length} pending
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {isUserInGroup(group) ? (
                    <Chip
                      label="Joined"
                      color="success"
                      size="small"
                      icon={<Check />}
                    />
                  ) : isUserPending(group) ? (
                    <Chip
                      label="Pending Approval"
                      color="warning"
                      size="small"
                      icon={<HourglassEmpty />}
                    />
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={joiningGroup === group.id || group.registration_status === 'full' || group.registration_status === 'closed'}
                      startIcon={joiningGroup === group.id ? <CircularProgress size={16} /> : <GroupAdd />}
                    >
                      {joiningGroup === group.id ? 'Requesting...' : 'Request to Join'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default GroupList
