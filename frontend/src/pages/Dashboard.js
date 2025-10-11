import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AdminDashboard from '../components/AdminDashboard';
import DoctorDashboard from '../components/DoctorDashboard';
import NurseDashboard from '../components/NurseDashboard';
import PatientDashboard from '../components/PatientDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Administrator':
        return <AdminDashboard />;
      case 'Doctor':
        return <DoctorDashboard />;
      case 'Nurse':
        return <NurseDashboard />;
      case 'Patient':
        return <PatientDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>Healthcare RBAC System</h1>
          <div className="user-info">
            <span className="role-badge">{user?.role}</span>
            <span>{user?.full_name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </nav>
      <div className="dashboard-content">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;