import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Notification from './Notification';
import './PatientRecord.css';

const PatientRecord = ({ patientId, onClose }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchPatientRecord();
    }
  }, [patientId]);

  const fetchPatientRecord = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await axios.get(`/api/patients/${patientId}/records`);
      setPatientData(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error fetching patient records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="patient-record-modal">
        <div className="patient-record-content">
          <div className="loading-state">Loading patient records...</div>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return null;
  }

  const { patient, appointments, medicalRecords, summary } = patientData;

  return (
    <div className="patient-record-modal" onClick={onClose}>
      <div className="patient-record-content" onClick={(e) => e.stopPropagation()}>
        <div className="patient-record-header">
          <h2>Patient Medical Record</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && (
          <Notification 
            message={error} 
            type="error" 
            onClose={() => setError('')}
          />
        )}

        <div className="patient-record-body">
          {/* Patient Information */}
          <div className="record-section">
            <h3>Patient Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name:</label>
                <span>{patient.full_name}</span>
              </div>
              <div className="info-item">
                <label>Username:</label>
                <span>{patient.username}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{patient.email}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{patient.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Patient Since:</label>
                <span>{new Date(patient.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="record-section">
            <h3>Summary</h3>
            <div className="summary-stats">
              <div className="summary-card">
                <div className="summary-number">{summary.totalAppointments}</div>
                <div className="summary-label">Total Appointments</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{summary.scheduledAppointments}</div>
                <div className="summary-label">Scheduled</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{summary.completedAppointments}</div>
                <div className="summary-label">Completed</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{summary.totalMedicalRecords}</div>
                <div className="summary-label">Medical Records</div>
              </div>
            </div>
          </div>

          {/* Medical Records */}
          <div className="record-section">
            <h3>Medical Records ({medicalRecords.length})</h3>
            {medicalRecords.length === 0 ? (
              <p className="no-data">No medical records found</p>
            ) : (
              <div className="records-list">
                {medicalRecords.map(record => (
                  <div key={record.id} className="record-card">
                    <div className="record-header-info">
                      <span className="record-date">
                        {new Date(record.visit_date).toLocaleDateString()}
                      </span>
                      <span className="record-doctor">Dr. {record.doctor_name}</span>
                    </div>
                    <div className="record-details">
                      <div className="detail-item">
                        <strong>Diagnosis:</strong> {record.diagnosis}
                      </div>
                      {record.prescription && (
                        <div className="detail-item">
                          <strong>Prescription:</strong> {record.prescription}
                        </div>
                      )}
                      {record.notes && (
                        <div className="detail-item">
                          <strong>Notes:</strong> {record.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointments */}
          <div className="record-section">
            <h3>Appointments History ({appointments.length})</h3>
            {appointments.length === 0 ? (
              <p className="no-data">No appointments found</p>
            ) : (
              <div className="appointments-list">
                {appointments.map(apt => (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-header-info">
                      <span className="appointment-date">
                        {new Date(apt.appointment_date).toLocaleString()}
                      </span>
                      <span className={`status-badge status-${apt.status}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <div className="detail-item">
                        <strong>Doctor:</strong> {apt.doctor_name}
                      </div>
                      <div className="detail-item">
                        <strong>Reason:</strong> {apt.reason}
                      </div>
                      {apt.notes && (
                        <div className="detail-item">
                          <strong>Notes:</strong> {apt.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="patient-record-footer">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PatientRecord;