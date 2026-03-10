import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PowerSyncContext } from '@powersync/react'
import { useEffect } from 'react'
import { db, connectPowerSync } from './lib/powersync'
import Dashboard from './pages/Dashboard'
import NewIncident from './pages/NewIncident'
import IncidentDetail from './pages/IncidentDetail'

export default function App() {
  useEffect(() => {
    connectPowerSync()
  }, [])

  return (
    <PowerSyncContext.Provider value={db}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents/new" element={<NewIncident />} />
          <Route path="/incidents/:id" element={<IncidentDetail />} />
        </Routes>
      </BrowserRouter>
    </PowerSyncContext.Provider>
  )
}
