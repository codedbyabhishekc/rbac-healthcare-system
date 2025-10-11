import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Notification from './Notification';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedTab, setSelectedTab] = useState('appointments');
  const [showCreateRecord, setShowCreateRecord] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [newRecord, setNewRecord] = useState({
    patient_id: '',
    diagnosis: '',
    prescription: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAppointments();
    fetchMedicalRecords();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      setError('');
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error fetching appointments');
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      setError('');
      const response = await axios.get('/api/medical-records');
      setMedicalRecords(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error fetching medical records');
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/users/role/Patient');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!newRecord.patient_id) {
      newErrors.patient_id = 'Please select a patient';
    }
    if (!newRecord.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    } else if (newRecord.diagnosis.trim().length < 5) {
      newErrors.diagnosis = 'Diagnosis must be at least 5 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setError('');
      setFormErrors({});
      await axios.post('/api/medical-records', newRecord);
      setShowCreateRecord(false);
      setNewRecord({ patient_id: '', diagnosis: '', prescription: '', notes: '' });
      fetchMedicalRecords();
      setModal({
        isOpen: true,
        title: 'Success!',
        message: 'Medical record created successfully',
        type: 'success'
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating medical record');
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      setError('');
      await axios.put(`/api/appointments/${id}`, { status });
      fetchAppointments();
      setModal({
        isOpen: true,
        title: 'Success!',
        message: `Appointment ${status} successfully`,
        type: 'success'
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating appointment');
    }
  };

  return (
    <div className="role-dashboard">
      <h2>Doctor Dashboard</h2>

      {error && (
        <Notification 
          message={error} 
          type="error" 
          onClose={() => setError('')}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Appointments</h3>
          <p className="stat-number">{appointments.length}</p>
        </div>
        <div className="stat-card">
          <h3>Medical Records</h3>
          <p className="stat-number">{medicalRecords.length}</p>
        </div>
        <div className="stat-card">
          <h3>Patients</h3>
          <p className="stat-number">{patients.length}</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={selectedTab === 'appointments' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={selectedTab === 'records' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('records')}
        >
          Medical Records
        </button>
      </div>

      {selectedTab === 'appointments' && (
        <div className="table-container">
          <h3>My Appointments</h3>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>{apt.patient_name}</td>
                  <td>{new Date(apt.appointment_date).toLocaleString()}</td>
                  <td>{apt.reason}</td>
                  <td><span className={`status-badge status-${apt.status}`}>{apt.status}</span></td>
                  <td>
                    {apt.status === 'scheduled' && (
                      <>
                        <button 
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                          className="btn-success btn-sm"
                        >
                          Complete
                        </button>
                        <button 
                          onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                          className="btn-danger btn-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTab === 'records' && (
        <div className="table-container">
          <div className="section-header">
            <h3>Medical Records</h3>
            <button 
              onClick={() => setShowCreateRecord(!showCreateRecord)}
              className="btn-primary"
            >
              {showCreateRecord ? 'Cancel' : 'Create New Record'}
            </button>
          </div>

          {showCreateRecord && (
            <form onSubmit={handleCreateRecord} className="form-card">
              <div className="form-group">
                <label>Patient *</label>
                <select 
                  value={newRecord.patient_id}
                  onChange={(e) => {
                    setNewRecord({...newRecord, patient_id: e.target.value});
                    if (formErrors.patient_id) {
                      setFormErrors({...formErrors, patient_id: ''});
                    }
                  }}
                  className={formErrors.patient_id ? 'input-error' : ''}
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                  ))}
                </select>
                {formErrors.patient_id && (
                  <span className="inline-error">{formErrors.patient_id}</span>
                )}
              </div>
              <div className="form-group">
                <label>Diagnosis *</label>
                <textarea
                  value={newRecord.diagnosis}
                  onChange={(e) => {
                    setNewRecord({...newRecord, diagnosis: e.target.value});
                    if (formErrors.diagnosis) {
                      setFormErrors({...formErrors, diagnosis: ''});
                    }
                  }}
                  className={formErrors.diagnosis ? 'input-error' : ''}
                  placeholder="Enter diagnosis"
                />
                {formErrors.diagnosis && (
                  <span className="inline-error">{formErrors.diagnosis}</span>
                )}
              </div>
              <div className="form-group">
                <label>Prescription</label>
                <textarea
                  value={newRecord.prescription}
                  onChange={(e) => setNewRecord({...newRecord, prescription: e.target.value})}
                  placeholder="Enter prescription (optional)"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  placeholder="Additional notes (optional)"
                />
              </div>
              <button type="submit" className="btn-primary">Create Record</button>
            </form>
          )}

          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Prescription</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.patient_name}</td>
                  <td>{new Date(record.visit_date).toLocaleDateString()}</td>
                  <td>{record.diagnosis}</td>
                  <td>{record.prescription || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default DoctorDashboard;