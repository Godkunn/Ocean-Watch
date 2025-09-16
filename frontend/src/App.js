import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Map from './components/Map';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import SocialFeed from './components/SocialFeed';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('map');
  const [reports, setReports] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchReports();
      fetchSocialPosts();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setAuthError('');
      } else {
        console.error('Failed to fetch user data');
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchSocialPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/social/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSocialPosts(data);
    } catch (error) {
      console.error('Error fetching social posts:', error);
    }
  };

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    setAuthError('');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setAuthError('');
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setAuthError('');
  };

  return (
    <Router>
      <div className="App">
        {/* Ocean waves animation */}
        <div className="ocean-waves">
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        
        {/* Floating glow elements */}
        <div className="glow"></div>
        <div className="glow"></div>
        <div className="glow"></div>
        
        <Header user={user} onLogout={logout} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="main-content">
          {!user ? (
            <div className="auth-container">
              <div className="auth-toggle">
                <button 
                  className={authMode === 'login' ? 'active' : ''}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button 
                  className={authMode === 'register' ? 'active' : ''}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>
              
              {authError && <div className="auth-error">{authError}</div>}
              
              {authMode === 'login' ? (
                <LoginForm 
                  onLogin={login} 
                  onError={setAuthError}
                  onSwitchMode={switchAuthMode}
                />
              ) : (
                <RegisterForm 
                  onRegister={login} 
                  onError={setAuthError}
                  onSwitchMode={switchAuthMode}
                />
              )}
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                activeTab === 'map' ? (
                  <div className="map-container">
                    <Map reports={reports} socialPosts={socialPosts} />
                    <ReportForm onReportSubmit={fetchReports} token={token} />
                  </div>
                ) : activeTab === 'dashboard' ? (
                  <Dashboard reports={reports} userRole={user.role} />
                ) : activeTab === 'social' ? (
                  <SocialFeed posts={socialPosts} token={token} />
                ) : null
              } />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/admin" element={<AdminPanel user={user} />} />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;