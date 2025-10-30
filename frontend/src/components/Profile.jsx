import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Grid,
  IconButton,
  Stack,
} from '@mui/material'
import {
  Save,
  Edit,
  LinkedIn,
  GitHub,
  Cancel,
} from '@mui/icons-material'
import { getAuthHeaders } from '../utils/auth'

const API_URL = 'http://localhost:8000/api'

function Profile({ user }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    bio: '',
    avatar_url: '',
    skills: [],
    prep_goals: [],
    linkedin_url: '',
    github_url: '',
  })
  const [newSkill, setNewSkill] = useState('')
  const [newGoal, setNewGoal] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/profile`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setFormData({
          bio: data.profile.bio || '',
          avatar_url: data.profile.avatar_url || '',
          skills: data.profile.skills || [],
          prep_goals: data.profile.prep_goals || [],
          linkedin_url: data.profile.linkedin_url || '',
          github_url: data.profile.github_url || '',
        })
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setIsEditing(false)
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update profile')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      skills: profile.skills || [],
      prep_goals: profile.prep_goals || [],
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
    })
    setIsEditing(false)
    setError('')
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const handleAddGoal = () => {
    if (newGoal.trim() && !formData.prep_goals.includes(newGoal.trim())) {
      setFormData({
        ...formData,
        prep_goals: [...formData.prep_goals, newGoal.trim()],
      })
      setNewGoal('')
    }
  }

  const handleRemoveGoal = (goalToRemove) => {
    setFormData({
      ...formData,
      prep_goals: formData.prep_goals.filter((goal) => goal !== goalToRemove),
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Header with Avatar and Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={isEditing ? formData.avatar_url : profile?.avatar_url}
              alt={profile?.name}
              sx={{ width: 100, height: 100, mr: 3 }}
            >
              {profile?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {profile?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Member since {new Date(profile?.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            {!isEditing && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Bio Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              About Me
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                variant="outlined"
              />
            ) : (
              <Typography variant="body1" color="text.secondary">
                {profile?.bio || 'No bio added yet.'}
              </Typography>
            )}
          </Box>

          {/* Avatar URL Section (Only in Edit Mode) */}
          {isEditing && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Avatar URL
              </Typography>
              <TextField
                fullWidth
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                variant="outlined"
              />
            </Box>
          )}

          {/* Skills Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>
            {isEditing ? (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add a skill (e.g., Python, React, System Design)"
                    variant="outlined"
                  />
                  <Button variant="outlined" onClick={handleAddSkill}>
                    Add
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {formData.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {profile?.skills?.length > 0 ? (
                  profile.skills.map((skill) => (
                    <Chip key={skill} label={skill} color="primary" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No skills added yet.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>

          {/* Preparation Goals Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Preparation Goals
            </Typography>
            {isEditing ? (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                    placeholder="Add a goal (e.g., FAANG Interview, AWS SAA Certification)"
                    variant="outlined"
                  />
                  <Button variant="outlined" onClick={handleAddGoal}>
                    Add
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {formData.prep_goals.map((goal) => (
                    <Chip
                      key={goal}
                      label={goal}
                      onDelete={() => handleRemoveGoal(goal)}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {profile?.prep_goals?.length > 0 ? (
                  profile.prep_goals.map((goal) => (
                    <Chip key={goal} label={goal} color="secondary" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No preparation goals added yet.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>

          {/* Social Links Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Social Links
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="LinkedIn URL"
                    variant="outlined"
                    InputProps={{
                      startAdornment: <LinkedIn sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                ) : profile?.linkedin_url ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LinkedIn />}
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn Profile
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No LinkedIn profile added
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="GitHub URL"
                    variant="outlined"
                    InputProps={{
                      startAdornment: <GitHub sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                ) : profile?.github_url ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GitHub />}
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Profile
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No GitHub profile added
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Profile
