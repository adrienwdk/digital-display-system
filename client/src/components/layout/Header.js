import React, { useState } from 'react';

const Header = ({ onTabChange, onSearch }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  
  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'rh', label: 'RH' },
    { id: 'commerce', label: 'Commerce' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'informatique', label: 'Informatique' },
    { id: 'achat', label: 'Achat' },
    { id: 'comptabilité', label: 'Compta' },
    { id: 'logistique', label: 'Logistique' }
  ];
  
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) onSearch('');
  };
  
  return (
    <div className="header-container">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Recherche..." 
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="search-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        {searchTerm && (
          <button 
            className="clear-search" 
            onClick={clearSearch}
            aria-label="Effacer la recherche"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      <div className="tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;