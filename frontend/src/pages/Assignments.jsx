import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ course: '', title: '', description: '', dueDate: '', priority: 'Medium', status: 'Pending' });

  const fetchData = async () => {
    const [assignRes, courseRes] = await Promise.all([
      api.get('/assignments'),
      api.get('/courses')
    ]);
    setAssignments(assignRes.data);
    setCourses(courseRes.data);
    if (courseRes.data.length > 0) {
      setFormData(prev => ({ ...prev, course: courseRes.data[0]._id }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', formData);
      setShowModal(false);
      setFormData({ course: courses[0]?._id || '', title: '', description: '', dueDate: '', priority: 'Medium', status: 'Pending' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    await api.put(`/assignments/${id}`, { status: newStatus });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this assignment?')) {
      await api.delete(`/assignments/${id}`);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
          <Plus className="h-5 w-5 mr-2" /> Add Assignment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {assignments.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Course</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const dueDateObj = new Date(assignment.dueDate);
                dueDateObj.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((dueDateObj - now) / (1000 * 60 * 60 * 24));
                
                let dateStyle = "text-gray-600";
                let warningText = "";
                if (assignment.status !== 'Completed') {
                  if (diffDays < 0) {
                    dateStyle = "text-red-600 font-bold";
                    warningText = " (Overdue)";
                  } else if (diffDays <= 3) {
                    dateStyle = "text-orange-500 font-bold";
                    warningText = " (Due soon)";
                  }
                }

                return (
                  <tr key={assignment._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <button 
                        onClick={() => handleStatusUpdate(assignment._id, assignment.status)}
                        className={`h-6 w-6 rounded-full flex items-center justify-center ${assignment.status === 'Completed' ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}
                      >
                        <CheckCircle className="h-6 w-6" />
                      </button>
                    </td>
                    <td className={`p-4 font-medium ${assignment.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {assignment.title}
                    </td>
                    <td className="p-4 text-gray-600">{assignment.course?.code || 'N/A'}</td>
                    <td className={`p-4 ${dateStyle}`}>
                      {new Date(assignment.dueDate).toLocaleDateString()}
                      <span className="text-xs ml-1 block sm:inline">{warningText}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${assignment.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          assignment.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {assignment.priority}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(assignment._id)} className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No assignments found.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Assignment</h3>
            {courses.length === 0 ? (
              <p className="text-red-500 mb-4">Please add a course first before creating an assignment.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input required type="text" className="w-full border p-2 rounded-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select required className="w-full border p-2 rounded-lg" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input required type="date" className="w-full border p-2 rounded-lg" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full border p-2 rounded-lg" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
