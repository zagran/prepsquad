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
        setError(data.error || data.detail || 'Failed to create group')
      }
    } catch (err) {
      setError('Failed to connect to server')
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
              rows={4}
              variant="outlined"
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
