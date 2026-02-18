import React from 'react';
import './Sidebar.scss';
import { tabInfo } from '../constants/tabInfo';

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {Object.entries(tabInfo).map(([key, tab]) => (
          <div
            key={key}
            className={`sidebar-item ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab(key)}
          >
            <img src={tab.icon} alt={tab.label} />
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;