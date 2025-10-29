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
} from '@mui/material'
import { People, Check, GroupAdd } from '@mui/icons-material'
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
    return group.members.includes(user.id)
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
                      {group.name}
                    </Typography>
                    <Chip
                      label={PREP_TYPE_LABELS[group.prep_type]}
                      color="primary"
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>

                  {group.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {group.description}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                    </Typography>
                  </Box>

                  {isUserInGroup(group) ? (
                    <Chip
                      label="Joined"
                      color="success"
                      size="small"
                      icon={<Check />}
                    />
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={joiningGroup === group.id}
                      startIcon={joiningGroup === group.id ? <CircularProgress size={16} /> : <GroupAdd />}
                    >
                      {joiningGroup === group.id ? 'Joining...' : 'Join'}
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
