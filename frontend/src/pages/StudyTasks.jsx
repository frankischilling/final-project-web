import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

const StudyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', course: '', description: '', date: '', durationMinutes: 60, isCompleted: false });

  const fetchData = async () => {
    const [taskRes, courseRes] = await Promise.all([
      api.get('/studytasks'),
      api.get('/courses')
    ]);
    setTasks(taskRes.data);
    setCourses(courseRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.course) delete payload.course;
      await api.post('/studytasks', payload);
      setShowModal(false);
      setFormData({ title: '', course: '', description: '', date: '', durationMinutes: 60, isCompleted: false });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    await api.put(`/studytasks/${id}`, { isCompleted: !currentStatus });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this study task?')) {
      await api.delete(`/studytasks/${id}`);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Study Tasks</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
          <Plus className="h-5 w-5 mr-2" /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((taskDate - now) / (1000 * 60 * 60 * 24));
          
          let dateStyle = "text-gray-600";
          let warningText = "";
          let cardStyle = "bg-white border-gray-100";
          
          if (!task.isCompleted) {
            if (diffDays < 0) {
              dateStyle = "text-red-600 font-bold";
              warningText = " (Overdue)";
              cardStyle = "bg-red-50 border-red-200";
            } else if (diffDays <= 3) {
              dateStyle = "text-orange-500 font-bold";
              warningText = " (Soon)";
            }
          }

          return (
            <div key={task._id} className={`p-6 rounded-xl shadow-sm border ${cardStyle} ${task.isCompleted ? 'opacity-70 bg-gray-50' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-lg font-bold ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => toggleComplete(task._id, task.isCompleted)} className={`${task.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-green-500'}`}>
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(task._id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {task.course && <p className="text-sm text-blue-600 font-medium mb-2">{task.course.code}</p>}
              <p className={`text-sm mb-1 ${dateStyle}`}><span className="font-medium text-gray-600">Date:</span> {new Date(task.date).toLocaleDateString()}{warningText}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Duration:</span> {task.durationMinutes} mins</p>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No study tasks planned.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Plan Study Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic/Title</label>
                <input required type="text" className="w-full border p-2 rounded-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Course (Optional)</label>
                <select className="w-full border p-2 rounded-lg" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
                  <option value="">None</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.code}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input required type="date" className="w-full border p-2 rounded-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input required type="number" min="5" className="w-full border p-2 rounded-lg" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTasks;
