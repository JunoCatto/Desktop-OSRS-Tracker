import { useState } from 'react' // removed unused useEffect
import { HiscoreData } from './types'
import ProfilePage from './components/ProfilePage'

function App(): React.JSX.Element {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '')
  const [submittedUsername, setSubmittedUsername] = useState<string | null>(null)
  const [hiscoreData, setHiscoreData] = useState<HiscoreData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!username.trim() || loading) return

    setLoading(true)
    setError(null)
    try {
      const data = await window.api.fetchHiscores(username)
      setHiscoreData(data)
      setSubmittedUsername(username)
      localStorage.setItem('username', username)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Player not found.')
    } finally {
      setLoading(false)
    }
  }

  if (submittedUsername && hiscoreData) {
    return (
      <ProfilePage
        username={submittedUsername}
        hiscoreData={hiscoreData}
        onBack={() => setSubmittedUsername(null)}
      />
    )
  }

  return (
    <div className="landing">
      <h1>OSRS Tracker</h1>
      <input
        spellCheck={false}
        type="text"
        placeholder="Enter username"
        value={username}
        autoFocus
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Loading...' : 'View Stats'}
      </button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default App
