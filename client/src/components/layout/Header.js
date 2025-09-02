import React, { memo } from 'react';
import { useStableInput } from '../../hooks/useStableInput';
import StableInput from '../ui/StableInput';

const Header = memo(({ onTabChange, onSearch }) => {
  const [activeTab, setActiveTab] = useState('general');
  const searchInput = useStableInput('');
  
  // Onglets avec icônes et descriptions
  const tabs = [
    { 
      id: 'general', 
      label: 'Général',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      description: 'Contenu général (algorithme intelligent)',
      isEmpty: true
    },
    // ... autres onglets
  ];
  
  const handleTabClick = (tabId) => {
    console.log(`Onglet sélectionné: ${tabId}`);
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    searchInput.setValue(value);
    if (onSearch) onSearch(value);
  };
  
  const clearSearch = () => {
    searchInput.setValue('');
    if (onSearch) onSearch('');
  };
  
  return (
    <div className="header-container">
      {/* Barre de recherche avec input stable */}
      <div className="search-container">
        <div className="search-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
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
        
        <StableInput
          type="text"
          placeholder="Rechercher des publications, auteurs..."
          className="search-input"
          value={searchInput.value}
          onChange={handleSearchChange}
        />
        
        {searchInput.value && (
          <button 
            className="clear-search" 
            onClick={clearSearch}
            aria-label="Effacer la recherche"
          >
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        
        {/* Indicateur de recherche active */}
        {searchInput.value && (
          <div className="search-indicator">
            <span className="search-count">
              Recherche active
            </span>
          </div>
        )}
      </div>
      
      {/* Onglets modernes avec icônes */}
      <div className="tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''} ${tab.isEmpty ? 'empty-tab' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            title={tab.description}
          >
            <span className="tab-icon">
              {tab.icon}
            </span>
            <span className="tab-label">{tab.label}</span>
            {tab.isEmpty && (
              <span className="tab-badge">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});

Header.displayName = 'Header';
export default Header;
