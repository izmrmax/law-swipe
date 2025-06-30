import React, { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import TinderCard from 'react-tinder-card'
import Onboarding from './Onboarding'
import Profile from './Profile'
import Chat from './Chat'
import Settings from './Settings'

export const AppContext = createContext()

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || ''

function App() {
  const [user, setUser] = useState(null)
  const [caseDetails, setCaseDetails] = useState(null)
  const [attorneys, setAttorneys] = useState([])
  const [swipeIndex, setSwipeIndex] = useState(0)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lawSwipeState'))
    if (saved) {
      setUser(saved.user)
      setCaseDetails(saved.caseDetails)
      setMatches(saved.matches || [])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'lawSwipeState',
      JSON.stringify({ user, caseDetails, matches })
    )
  }, [user, caseDetails, matches])

  useEffect(() => {
    if (user && caseDetails) fetchAttorneys()
  }, [user, caseDetails])

  const fetchAttorneys = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/rank', { details: caseDetails })
      setAttorneys(res.data.attorneys || [])
      setSwipeIndex(0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction, attorney) => {
    if (direction === 'right') {
      setMatches((prev) => [...prev, attorney])
      try {
        await axios.post('/connect', { userId: user.id, attorneyId: attorney.id })
      } catch {}
    }
    setSwipeIndex((i) => i + 1)
  }

  const contextValue = {
    user,
    setUser,
    caseDetails,
    setCaseDetails,
    matches,
    setMatches
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/*" element={<Onboarding />} />
        </Routes>
      </Router>
    )
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/swipe" replace />} />
          <Route
            path="/swipe"
            element={
              <SwipeView
                attorneys={attorneys}
                index={swipeIndex}
                onSwipe={handleSwipe}
                loading={loading}
              />
            }
          />
          <Route path="/matches" element={<MatchesView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  )
}

function SwipeView({ attorneys, index, onSwipe, loading }) {
  if (loading) return <div className="loader">Loading attorneys...</div>
  if (!attorneys.length) return <div className="empty">No attorneys available.</div>
  const attorney = attorneys[index % attorneys.length]
  return (
    <div className="swipe-container">
      <TinderCard
        key={attorney.id}
        onSwipe={(dir) => onSwipe(dir, attorney)}
        preventSwipe={['up', 'down']}
      >
        <div className="card">
          <h3>{attorney.name}</h3>
          <p>{attorney.bio}</p>
        </div>
      </TinderCard>
    </div>
  )
}

function MatchesView() {
  const { matches } = useContext(AppContext)
  if (!matches.length) return <div className="empty">No matches yet.</div>
  return (
    <div className="matches-list">
      {matches.map((m) => (
        <div key={m.id} className="match-item">
          <h4>{m.name}</h4>
          <p>{m.title}</p>
        </div>
      ))}
    </div>
  )
}

export default App