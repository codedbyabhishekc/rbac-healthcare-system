import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Notification from './Notification';
import PatientRecord from './PatientRecord';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('users');
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    // Only fetch if authenticated and auth loading is complete
    if (isAuthenticated && !authLoading) {
      fetchUsers();
    }
  }, [isAuthenticated, authLoading]);

  const fetchUsers = async () => {
    try {
      setError('');
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      // Only show error if it's not a 401 (handled by interceptor)
      if (error.response?.status !== 401) {
        setError(error.response?.data?.error || 'Error fetching users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError('');
        await axios.delete(`/api/users/${userId}`);
        fetchUsers();
        setModal({
          isOpen: true,
          title: 'Success!',
          message: 'User deleted successfully',
          type: 'success'
        });
      } catch (error) {
        setError(error.response?.data?.error || 'Error deleting user');
      }
    }
  };

  const getRoleStats = () => {
    const stats = {
      Administrator: 0,
      Doctor: 0,
      Nurse: 0,
      Patient: 0,
    };
    users.forEach(user => {
      stats[user.role]++;
    });
    return stats;
  };

  const stats = getRoleStats();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="role-dashboard">
      <h2>Administrator Dashboard</h2>
      
      {error && (
        <Notification 
          message={error} 
          type="error" 
          onClose={() => setError('')}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Doctors</h3>
          <p className="stat-number">{stats.Doctor}</p>
        </div>
        <div className="stat-card">
          <h3>Nurses</h3>
          <p className="stat-number">{stats.Nurse}</p>
        </div>
        <div className="stat-card">
          <h3>Patients</h3>
          <p className="stat-number">{stats.Patient}</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={selectedTab === 'users' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('users')}
        >
          User Management
        </button>
      </div>

      <div className="table-container">
        <h3>All Users</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td><span className="role-badge">{user.role}</span></td>
                <td>{user.phone || 'N/A'}</td>
                <td>
                  {user.role === 'Patient' && (
                    <button
                      onClick={() => setSelectedPatientId(user.id)}
                      className="btn-primary btn-sm"
                      style={{ marginRight: '5px' }}
                    >
                      View Records
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn-danger btn-sm"
                  >
                    Delete
                  </button>
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

      {selectedPatientId && (
        <PatientRecord
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;