import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material'
import { Logout } from '@mui/icons-material'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#9198f0',
      dark: '#5568d3',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
})

function App() {
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h1" component="h1" sx={{ flexGrow: 1, fontSize: '2rem' }}>
              PrepSquad
            </Typography>
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">
                  Welcome, {user.name}
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  startIcon={<Logout />}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
          {!user ? (
            <Auth setUser={setUser} />
          ) : (
            <Dashboard user={user} />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
