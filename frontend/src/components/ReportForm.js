import React, { useState } from 'react';

const ReportForm = ({ onReportSubmit, token }) => {
  const [formData, setFormData] = useState({
    hazardType: 'high_waves',
    description: '',
    latitude: '',
    longitude: '',
    severity: 'medium'
  });
  const [files, setFiles] = useState([]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('hazardType', formData.hazardType);
    data.append('description', formData.description);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);
    data.append('severity', formData.severity);
    
    files.forEach(file => {
      data.append('media', file);
    });
    
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      
      if (response.ok) {
        alert('Report submitted successfully!');
        setFormData({
          hazardType: 'high_waves',
          description: '',
          latitude: '',
          longitude: '',
          severity: 'medium'
        });
        setFiles([]);
        onReportSubmit();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your current location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="report-form">
      <h3>Report Ocean Hazard</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Hazard Type:</label>
          <select name="hazardType" value={formData.hazardType} onChange={handleInputChange} required>
            <option value="tsunami">Tsunami</option>
            <option value="storm_surge">Storm Surge</option>
            <option value="high_waves">High Waves</option>
            <option value="swell_surge">Swell Surge</option>
            <option value="coastal_current">Coastal Current</option>
            <option value="abnormal_sea">Abnormal Sea Behavior</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Description:</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            required 
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Location:</label>
          <div className="location-inputs">
            <input
              type="number"
              step="any"
              name="latitude"
              placeholder="Latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="Longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              required
            />
            <button type="button" onClick={getCurrentLocation}>Use Current Location</button>
          </div>
        </div>
        
        <div className="form-group">
          <label>Severity:</label>
          <select name="severity" value={formData.severity} onChange={handleInputChange} required>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Upload Media (optional):</label>
          <input type="file" multiple onChange={handleFileChange} />
        </div>
        
        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportForm;