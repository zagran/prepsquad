import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { GroupAdd } from '@mui/icons-material'
import { fetchWithAuth } from '../utils/auth'

const API_URL = 'http://localhost:8000/api'

const PREP_TYPES = [
  { value: 'FAANG', label: 'FAANG Interview Prep' },
  { value: 'AWS_CERT', label: 'AWS Certification' },
  { value: 'GCP_CERT', label: 'GCP Certification' },
  { value: 'AZURE_CERT', label: 'Azure Certification' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'OTHER', label: 'Other' }
]

const TIMEZONES = [
  { value: 'UTC-12:00', label: 'UTC-12:00 (Baker Island)' },
  { value: 'UTC-11:00', label: 'UTC-11:00 (American Samoa)' },
  { value: 'UTC-10:00', label: 'UTC-10:00 (Hawaii)' },
  { value: 'UTC-09:00', label: 'UTC-09:00 (Alaska)' },
  { value: 'UTC-08:00', label: 'UTC-08:00 (Pacific Time)' },
  { value: 'UTC-07:00', label: 'UTC-07:00 (Mountain Time)' },
  { value: 'UTC-06:00', label: 'UTC-06:00 (Central Time)' },
  { value: 'UTC-05:00', label: 'UTC-05:00 (Eastern Time)' },
  { value: 'UTC-04:00', label: 'UTC-04:00 (Atlantic Time)' },
  { value: 'UTC-03:00', label: 'UTC-03:00 (Argentina, Brazil)' },
  { value: 'UTC-02:00', label: 'UTC-02:00 (Mid-Atlantic)' },
  { value: 'UTC-01:00', label: 'UTC-01:00 (Azores)' },
  { value: 'UTC+00:00', label: 'UTC+00:00 (GMT, London)' },
  { value: 'UTC+01:00', label: 'UTC+01:00 (CET, Paris, Berlin)' },
  { value: 'UTC+02:00', label: 'UTC+02:00 (EET, Cairo)' },
  { value: 'UTC+03:00', label: 'UTC+03:00 (Moscow)' },
  { value: 'UTC+04:00', label: 'UTC+04:00 (Dubai)' },
  { value: 'UTC+05:00', label: 'UTC+05:00 (Pakistan)' },
  { value: 'UTC+05:30', label: 'UTC+05:30 (India)' },
  { value: 'UTC+06:00', label: 'UTC+06:00 (Bangladesh)' },
  { value: 'UTC+07:00', label: 'UTC+07:00 (Bangkok, Jakarta)' },
  { value: 'UTC+08:00', label: 'UTC+08:00 (China, Singapore)' },
  { value: 'UTC+09:00', label: 'UTC+09:00 (Japan, Korea)' },
  { value: 'UTC+10:00', label: 'UTC+10:00 (Australia East)' },
  { value: 'UTC+11:00', label: 'UTC+11:00 (Solomon Islands)' },
  { value: 'UTC+12:00', label: 'UTC+12:00 (New Zealand)' },
]

function CreateGroup({ user, onGroupCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prep_type: 'FAANG',
    goal: '',
    start_date: '',
    end_date: '',
    requirements: '',
    timezone: '',
    weekly_calls: 1,
    call_start_time: '',
    call_end_time: '',
    max_members: 10
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
      // Create timeline from dates
      const timeline = formData.start_date && formData.end_date
        ? `${formData.start_date} to ${formData.end_date}`
        : ''

      // Create call_time from start and end times
      const call_time = formData.call_start_time && formData.call_end_time
        ? `${formData.call_start_time} - ${formData.call_end_time}`
        : ''

      const submitData = {
        ...formData,
        timeline,
        call_time
      }

      const response = await fetchWithAuth(`${API_URL}/groups`, {
        method: 'POST',
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({
          name: '',
          description: '',
          prep_type: 'FAANG',
          goal: '',
          start_date: '',
          end_date: '',
          requirements: '',
          timezone: '',
          weekly_calls: 1,
          call_start_time: '',
          call_end_time: '',
          max_members: 10
        })
        onGroupCreated()
      } else {
        setError(data.error || data.detail || 'Failed to create group')
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            Create a New Study Group
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Group Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Morning FAANG Prep Squad"
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              select
              label="Preparation Type"
              name="prep_type"
              value={formData.prep_type}
              onChange={handleChange}
              required
              variant="outlined"
            >
              {PREP_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell others about your study group..."
              multiline
              rows={3}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Group Goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="e.g., Pass AWS Solutions Architect exam by March"
              multiline
              rows={2}
              variant="outlined"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              fullWidth
              label="Requirements for Candidates"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="e.g., 2+ years experience, completed Leetcode basics, etc."
              multiline
              rows={3}
              variant="outlined"
            />

            <TextField
              fullWidth
              select
              label="Primary Time Zone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              variant="outlined"
            >
              <MenuItem value="">Select timezone</MenuItem>
              {TIMEZONES.map((tz) => (
                <MenuItem key={tz.value} value={tz.value}>
                  {tz.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Weekly Calls"
              name="weekly_calls"
              value={formData.weekly_calls}
              onChange={handleChange}
              inputProps={{ min: 0, max: 7 }}
              variant="outlined"
              helperText="Number of calls per week"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="time"
                label="Call Start Time"
                name="call_start_time"
                value={formData.call_start_time}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                type="time"
                label="Call End Time"
                name="call_end_time"
                value={formData.call_end_time}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Maximum Members"
              name="max_members"
              value={formData.max_members}
              onChange={handleChange}
              inputProps={{ min: 2, max: 50 }}
              variant="outlined"
              helperText="Set the maximum number of members for this group"
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <GroupAdd />}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CreateGroup
