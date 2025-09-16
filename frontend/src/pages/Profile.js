import React from 'react';

const Profile = ({ user }) => {
  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      <div className="profile-info">
        <div className="profile-header">
          <img src={user.profile?.avatar || '/default-avatar.png'} alt="Avatar" className="avatar" />
          <div className="profile-details">
            <h3>{user.username}</h3>
            <p>{user.email}</p>
            <p>Role: {user.role}</p>
            <p>Reputation: {user.reputation}</p>
            <p>Member since: {new Date(user.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="badges-section">
          <h4>Badges</h4>
          {user.badges && user.badges.length > 0 ? (
            <div className="badges-list">
              {user.badges.map((badge, index) => (
                <div key={index} className="badge">
                  <span className="badge-icon">{badge.icon}</span>
                  <div className="badge-info">
                    <h5>{badge.name}</h5>
                    <p>{badge.description}</p>
                    <small>Earned: {new Date(badge.earnedAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No badges earned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;