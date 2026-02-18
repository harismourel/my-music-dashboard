import React from 'react';
import './Header.scss';
import { tabInfo } from '../constants/tabInfo';

const Header = ({ activeTab }) => {
  const tab = tabInfo[activeTab];

  return (
    <header className="text-white p-3 d-flex align-items-center header justify-content-between">
      <div className="title d-flex align-items-center">
        {tab?.icon && (
          <img src={tab.icon} alt={tab.title} width="38" height="38" className="me-3" />
        )}
        <h1 className="mb-0">{tab?.title || 'My App'}</h1>
      </div>

      <div className="header-filters font-12">
        <button>Last 7 Days</button>
        <button className="active">Last 30 Days</button>
        <button>All Time</button>
      </div>
    </header>
  );
};

export default Header;

