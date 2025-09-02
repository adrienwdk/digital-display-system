import React, { useState, memo } from 'react'; // AJOUT de useState
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
    { 
      id: 'rh', 
      label: 'RH',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Ressources Humaines'
    },
    { 
      id: 'commerce', 
      label: 'Commerce',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      description: 'Commercial et ventes'
    },
    { 
      id: 'marketing', 
      label: 'Marketing',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A6.957 6.957 0 017 16" />
        </svg>
      ),
      description: 'Marketing et communication'
    },
    { 
      id: 'informatique', 
      label: 'IT',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      description: 'Informatique'
    },
    { 
      id: 'achat', 
      label: 'Achats',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-2L7 13v0a1 1 0 001 1h10M7 13H5a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2H9" />
        </svg>
      ),
      description: 'Service achats'
    },
    { 
      id: 'comptabilité', 
      label: 'Compta',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Comptabilité'
    },
    { 
      id: 'logistique', 
      label: 'Logistique',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      description: 'Logistique et transport'
    }
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