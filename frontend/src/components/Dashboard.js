import React, { useState } from 'react';

const Dashboard = ({ reports, userRole }) => {
  const [filters, setFilters] = useState({
    hazardType: '',
    severity: '',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredReports = reports.filter(report => {
    if (filters.hazardType && report.hazardType !== filters.hazardType) return false;
    if (filters.severity && report.severity !== filters.severity) return false;
    if (filters.startDate && new Date(report.createdAt) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(report.createdAt) > new Date(filters.endDate)) return false;
    return true;
  });

  const hazardCounts = reports.reduce((acc, report) => {
    acc[report.hazardType] = (acc[report.hazardType] || 0) + 1;
    return acc;
  }, {});

  const severityCounts = reports.reduce((acc, report) => {
    acc[report.severity] = (acc[report.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dashboard">
      <h2>Reports Dashboard</h2>
      
      <div className="stats">
        <div className="stat-card">
          <h3>Total Reports</h3>
          <p>{reports.length}</p>
        </div>
        
        {Object.entries(hazardCounts).map(([hazard, count]) => (
          <div key={hazard} className="stat-card">
            <h3>{hazard.replace('_', ' ').toUpperCase()}</h3>
            <p>{count}</p>
          </div>
        ))}
      </div>
      
      <div className="filters">
        <h3>Filter Reports</h3>
        <div className="filter-controls">
          <select name="hazardType" value={filters.hazardType} onChange={handleFilterChange}>
            <option value="">All Hazard Types</option>
            <option value="tsunami">Tsunami</option>
            <option value="storm_surge">Storm Surge</option>
            <option value="high_waves">High Waves</option>
            <option value="swell_surge">Swell Surge</option>
            <option value="coastal_current">Coastal Current</option>
            <option value="abnormal_sea">Abnormal Sea Behavior</option>
            <option value="other">Other</option>
          </select>
          
          <select name="severity" value={filters.severity} onChange={handleFilterChange}>
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleFilterChange} 
            placeholder="Start Date" 
          />
          
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleFilterChange} 
            placeholder="End Date" 
          />
        </div>
      </div>
      
      <div className="reports-list">
        <h3>Reports ({filteredReports.length})</h3>
        {filteredReports.length === 0 ? (
          <p>No reports found with the current filters.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Reported By</th>
                <th>Date</th>
                {userRole === 'official' || userRole === 'analyst' ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report._id}>
                  <td>{report.hazardType.replace('_', ' ').toUpperCase()}</td>
                  <td>{report.description}</td>
                  <td className={`severity-${report.severity}`}>{report.severity.toUpperCase()}</td>
                  <td>
                    {report.location && report.location.coordinates
                      ? `${report.location.coordinates[1].toFixed(4)}, ${report.location.coordinates[0].toFixed(4)}`
                      : 'N/A'}
                  </td>
                  <td>{report.userId?.username || 'Unknown'}</td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  {userRole === 'official' || userRole === 'analyst' ? (
                    <td>
                      <button onClick={() => alert(`Would verify report ${report._id}`)}>Verify</button>
                      <button onClick={() => alert(`Would take action on report ${report._id}`)}>Take Action</button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;