import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, Activity, Trash2 } from 'lucide-react';
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
    if (window.confirm('Are you sure you want to delete this user? All their data might be orphaned or you may need to implement cascade deletion.')) {
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-lg mr-4">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Registered Users</p>
            <p className="text-3xl font-bold text-gray-800">{stats.userCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">System Status</p>
            <p className="text-xl font-bold text-green-600">All Systems Operational</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-lg font-bold p-6 border-b border-gray-100">User Management</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Joined Date</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{u.name}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${u.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {u.isAdmin ? 'Admin' : 'Student'}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  {!u.isAdmin && (
                    <button 
                      onClick={() => handleDeleteUser(u._id, u.isAdmin)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="h-5 w-5 inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
