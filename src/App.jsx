import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SpotifyDashboard from './pages/SpotifyDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('spotify');

  return (
    <div>
      <Header activeTab={activeTab} />

      <div className="d-flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-grow-1 p-4">
          {activeTab === 'spotify' && <SpotifyDashboard />}
          {activeTab === 'discogs' && <div>Discogs dashboard coming soon</div>}
          {activeTab === 'beatport' && <div>Beatport dashboard coming soon</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
