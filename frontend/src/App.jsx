import { useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import { TraceProvider } from './lib/trace.jsx'
import { electionGet } from './lib/api.js'
import Sidebar from './components/Sidebar.jsx'

import Home from './pages/Home.jsx'
import Rsa from './pages/Rsa.jsx'
import ElGamal from './pages/ElGamal.jsx'
import Setup from './pages/vote/Setup.jsx'
import Booth from './pages/vote/Booth.jsx'
import Board from './pages/vote/Board.jsx'
import Tally from './pages/vote/Tally.jsx'

// Shell: 2-pane layout (Sidebar + worksheet main).
// Polls electionGet() while on a /vote/* route (~every 2s) so the Sidebar
// step marks stay live. Election state shape: { active, ballot_count, tallied }.
function Shell() {
  const { pathname } = useLocation()
  const [election, setElection] = useState({
    active: false,
    ballot_count: 0,
    tallied: false,
  })

  const onVote = pathname.startsWith('/vote')
  const timer = useRef(null)

  useEffect(() => {
    if (!onVote) return
    let cancelled = false

    const poll = async () => {
      try {
        const data = await electionGet()
        if (!cancelled && data) setElection(data)
      } catch {
        // Ignore transient poll errors; the Sidebar keeps its last state.
      }
    }

    poll()
    timer.current = setInterval(poll, 2000)
    return () => {
      cancelled = true
      if (timer.current) clearInterval(timer.current)
    }
  }, [onVote])

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      <Sidebar election={election} />
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rsa" element={<Rsa />} />
          <Route path="/elgamal" element={<ElGamal />} />
          <Route path="/vote/setup" element={<Setup />} />
          <Route path="/vote/booth" element={<Booth />} />
          <Route path="/vote/board" element={<Board />} />
          <Route path="/vote/tally" element={<Tally />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TraceProvider>
        <Shell />
      </TraceProvider>
    </BrowserRouter>
  )
}
