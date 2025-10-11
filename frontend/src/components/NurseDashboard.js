import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Notification from './Notification';
import { useAuth } from '../context/AuthContext';

const NurseDashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showCreateAppointment, setShowCreateAppointment] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    reason: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Only fetch if authenticated and auth loading is complete
    if (isAuthenticated && !authLoading) {
      fetchAppointments();
      fetchPatients();
      fetchDoctors();
    }
  }, [isAuthenticated, authLoading]);

  const fetchAppointments = async () => {
    try {
      setError('');
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        setError(error.response?.data?.error || 'Error fetching appointments');
      }
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/users/role/Patient');
      setPatients(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching patients:', error);
      }
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/users/role/Doctor');
      setDoctors(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching doctors:', error);
      }
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!newAppointment.patient_id) {
      newErrors.patient_id = 'Please select a patient';
    }
    if (!newAppointment.doctor_id) {
      newErrors.doctor_id = 'Please select a doctor';
    }
    if (!newAppointment.appointment_date) {
      newErrors.appointment_date = 'Please select date and time';
    } else {
      const selectedDate = new Date(newAppointment.appointment_date);
      if (selectedDate < new Date()) {
        newErrors.appointment_date = 'Appointment date cannot be in the past';
      }
    }
    if (!newAppointment.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (newAppointment.reason.trim().length < 5) {
      newErrors.reason = 'Reason must be at least 5 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setError('');
      setFormErrors({});
      await axios.post('/api/appointments', newAppointment);
      setShowCreateAppointment(false);
      setNewAppointment({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        reason: '',
        notes: '',
      });
      fetchAppointments();
      setModal({
        isOpen: true,
        title: 'Success!',
        message: 'Appointment scheduled successfully',
        type: 'success'
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating appointment');
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
      console.error('Error updating appointment:', error);
    }
  };

  return (
    <div className="role-dashboard">
      <h2>Nurse Dashboard</h2>

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
          <h3>Scheduled</h3>
          <p className="stat-number">
            {appointments.filter(a => a.status === 'scheduled').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">
            {appointments.filter(a => a.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="table-container">
        <div className="section-header">
          <h3>Appointments Management</h3>
          <button 
            onClick={() => setShowCreateAppointment(!showCreateAppointment)}
            className="btn-primary"
          >
            {showCreateAppointment ? 'Cancel' : 'Schedule Appointment'}
          </button>
        </div>

        {showCreateAppointment && (
          <form onSubmit={handleCreateAppointment} className="form-card">
            <div className="form-group">
              <label>Patient *</label>
              <select 
                value={newAppointment.patient_id}
                onChange={(e) => {
                  setNewAppointment({...newAppointment, patient_id: e.target.value});
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
              <label>Doctor *</label>
              <select 
                value={newAppointment.doctor_id}
                onChange={(e) => {
                  setNewAppointment({...newAppointment, doctor_id: e.target.value});
                  if (formErrors.doctor_id) {
                    setFormErrors({...formErrors, doctor_id: ''});
                  }
                }}
                className={formErrors.doctor_id ? 'input-error' : ''}
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.full_name}</option>
                ))}
              </select>
              {formErrors.doctor_id && (
                <span className="inline-error">{formErrors.doctor_id}</span>
              )}
            </div>
            <div className="form-group">
              <label>Appointment Date & Time *</label>
              <input
                type="datetime-local"
                value={newAppointment.appointment_date}
                onChange={(e) => {
                  setNewAppointment({...newAppointment, appointment_date: e.target.value});
                  if (formErrors.appointment_date) {
                    setFormErrors({...formErrors, appointment_date: ''});
                  }
                }}
                className={formErrors.appointment_date ? 'input-error' : ''}
              />
              {formErrors.appointment_date && (
                <span className="inline-error">{formErrors.appointment_date}</span>
              )}
            </div>
            <div className="form-group">
              <label>Reason *</label>
              <textarea
                value={newAppointment.reason}
                onChange={(e) => {
                  setNewAppointment({...newAppointment, reason: e.target.value});
                  if (formErrors.reason) {
                    setFormErrors({...formErrors, reason: ''});
                  }
                }}
                className={formErrors.reason ? 'input-error' : ''}
                placeholder="Enter reason for appointment"
              />
              {formErrors.reason && (
                <span className="inline-error">{formErrors.reason}</span>
              )}
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                placeholder="Additional notes (optional)"
              />
            </div>
            <button type="submit" className="btn-primary">Schedule Appointment</button>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
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
                <td>{apt.doctor_name}</td>
                <td>{new Date(apt.appointment_date).toLocaleString()}</td>
                <td>{apt.reason}</td>
                <td><span className={`status-badge status-${apt.status}`}>{apt.status}</span></td>
                <td>
                  {apt.status === 'scheduled' && (
                    <button 
                      onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                      className="btn-danger btn-sm"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default NurseDashboard;