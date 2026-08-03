import React, { useState } from 'react'
import ProcurementDashboard from './components/ProcurementDashboard'
import ManagerDashboard from './components/ManagerDashboard'

function App() {
  const [role, setRole] = useState('officer'); // 'officer' or 'manager'

  return role === 'officer' ? (
    <ProcurementDashboard onToggleRole={() => setRole('manager')} />
  ) : (
    <ManagerDashboard onToggleRole={() => setRole('officer')} />
  );
}

export default App
