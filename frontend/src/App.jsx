import React, { useState } from 'react'
import ProcurementDashboard from './components/ProcurementDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import VendorDashboard from './components/VendorDashboard'

function App() {
  const [role, setRole] = useState('officer'); // 'officer', 'manager', or 'vendor'

  const cycleRole = () => {
    setRole(prev => {
      if (prev === 'officer') return 'manager';
      if (prev === 'manager') return 'vendor';
      return 'officer';
    });
  };

  if (role === 'officer') {
    return <ProcurementDashboard onToggleRole={cycleRole} />;
  } else if (role === 'manager') {
    return <ManagerDashboard onToggleRole={cycleRole} />;
  } else {
    return <VendorDashboard onToggleRole={cycleRole} />;
  }
}

export default App
