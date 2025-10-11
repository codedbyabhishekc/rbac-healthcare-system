import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedTab, setSelectedTab] = useState('appointments');

  useEffect(() => {
    fetchAppointments();
    fetchMedicalRecords();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const response = await axios.get('/api/medical-records');
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'scheduled' && new Date(apt.appointment_date) > new Date()
  );

  const pastAppointments = appointments.filter(
    apt => apt.status === 'completed' || new Date(apt.appointment_date) <= new Date()
  );

  return (
    <div className="role-dashboard">
      <h2>Patient Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Upcoming Appointments</h3>
          <p className="stat-number">{upcomingAppointments.length}</p>
        </div>
        <div className="stat-card">
          <h3>Past Appointments</h3>
          <p className="stat-number">{pastAppointments.length}</p>
        </div>
        <div className="stat-card">
          <h3>Medical Records</h3>
          <p className="stat-number">{medicalRecords.length}</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={selectedTab === 'appointments' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('appointments')}
        >
          My Appointments
        </button>
        <button 
          className={selectedTab === 'records' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('records')}
        >
          Medical Records
        </button>
      </div>

      {selectedTab === 'appointments' && (
        <div>
          <div className="table-container">
            <h3>Upcoming Appointments</h3>
            {upcomingAppointments.length === 0 ? (
              <p className="no-data">No upcoming appointments</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.doctor_name}</td>
                      <td>{new Date(apt.appointment_date).toLocaleString()}</td>
                      <td>{apt.reason}</td>
                      <td><span className={`status-badge status-${apt.status}`}>{apt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="table-container">
            <h3>Past Appointments</h3>
            {pastAppointments.length === 0 ? (
              <p className="no-data">No past appointments</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAppointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.doctor_name}</td>
                      <td>{new Date(apt.appointment_date).toLocaleString()}</td>
                      <td>{apt.reason}</td>
                      <td><span className={`status-badge status-${apt.status}`}>{apt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'records' && (
        <div className="table-container">
          <h3>My Medical Records</h3>
          {medicalRecords.length === 0 ? (
            <p className="no-data">No medical records found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Prescription</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {medicalRecords.map(record => (
                  <tr key={record.id}>
                    <td>{new Date(record.visit_date).toLocaleDateString()}</td>
                    <td>{record.doctor_name}</td>
                    <td>{record.diagnosis}</td>
                    <td>{record.prescription || 'N/A'}</td>
                    <td>{record.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;