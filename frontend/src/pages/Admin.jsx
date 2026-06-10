import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ userCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !user.isAdmin) return;
    fetchAdminData();
  }, [user]);

  const handleDeleteUser = async (id, isAdmin) => {
    if (isAdmin) {
      alert("Cannot delete other admin users.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }

  if (loading) return <div>Loading admin panel...</div>;

  return (
    <div>
      <h2 style={{ color: '#3B5998', marginTop: 0 }}>Admin Dashboard</h2>

      {error && <div style={{ border: '1px solid #CC0000', backgroundColor: '#FFCCCC', padding: '10px', marginBottom: '15px' }}><b>Error:</b> {error}</div>}

      <table width="100%" cellPadding="8">
        <tbody>
          <tr>
            <th>Total Registered Users</th>
            <th>System Status</th>
          </tr>
          <tr align="center" style={{ backgroundColor: '#F9F9F9' }}>
            <td style={{ fontSize: '16px' }}><b>{stats.userCount}</b></td>
            <td style={{ fontSize: '16px' }}><b><span style={{ color: '#008800' }}>All Systems Operational</span></b></td>
          </tr>
        </tbody>
      </table>

      <br />

      <table width="100%" cellPadding="8">
        <thead>
          <tr>
            <th colSpan="5">User Management</th>
          </tr>
          <tr style={{ fontSize: '11px', color: '#666', backgroundColor: '#F0F0F0' }}>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>ROLE</th>
            <th>JOINED DATE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={u._id} align="center" style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9F9F9' }}>
              <td align="left"><b>{u.name}</b></td>
              <td align="left">{u.email}</td>
              <td style={{ fontSize: '11px', color: u.isAdmin ? '#3B5998' : '#666', fontWeight: u.isAdmin ? 'bold' : 'normal' }}>
                {u.isAdmin ? 'Admin' : 'Student'}
              </td>
              <td style={{ fontSize: '11px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                {!u.isAdmin ? (
                  <button onClick={() => handleDeleteUser(u._id, u.isAdmin)}>Delete User</button>
                ) : (
                  <span style={{ color: '#999', fontSize: '11px' }}>N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
