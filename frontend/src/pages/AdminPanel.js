import React, { useState, useEffect } from 'react';

const AdminPanel = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (user.role === 'admin') {
      fetchUsers();
      fetchReports();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  if (user.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      
      <div className="admin-section">
        <h3>User Management</h3>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.joinedAt).toLocaleDateString()}</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="admin-section">
        <h3>Report Management</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report._id}>
                <td>{report.hazardType}</td>
                <td>{report.description.substring(0, 50)}...</td>
                <td>{report.severity}</td>
                <td>{report.status}</td>
                <td>{report.userId?.username || 'Unknown'}</td>
                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                <td>
                  <button>Verify</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;