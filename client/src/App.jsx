import React, { createContext, useEffect, useState } from 'react';
import Authentication from './pages/auth';

export const SessionData = createContext();

function App() {
  const [fetchData, setFetchData] = useState(
    JSON.parse(sessionStorage.getItem('expenses')) || []
  );
  useEffect(() => {
    sessionStorage.setItem('expenses', JSON.stringify(fetchData));
  }, [fetchData]);
  return (
    <SessionData.Provider value={{ fetchData, setFetchData }}>
      <Authentication />
    </SessionData.Provider>
  );
}
export default App;
