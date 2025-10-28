import { useState } from 'react'
import './App.css'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PrepSquad</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!user ? (
          <Auth setUser={setUser} />
        ) : (
          <Dashboard user={user} />
        )}
      </main>
    </div>
  )
}

export default App
