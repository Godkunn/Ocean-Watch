import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout, activeTab, setActiveTab }) => {
  return (
    <header className="header">
      <div className="logo">
        <h1>INCOIS Ocean Hazard Platform</h1>
      </div>
      
      <nav className="nav">
        {user && (
          <>
            <button 
              className={activeTab === 'map' ? 'active' : ''}
              onClick={() => setActiveTab('map')}
            >
              Map & Report
            </button>
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={activeTab === 'social' ? 'active' : ''}
              onClick={() => setActiveTab('social')}
            >
              Social Analytics
            </button>
            <Link to="/profile">Profile</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
          </>
        )}
      </nav>
      
      <div className="user-info">
        {user ? (
          <>
            <span>Welcome, {user.username} ({user.role})</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <span>Please login to continue</span>
        )}
      </div>
    </header>
  );
};

export default Header;