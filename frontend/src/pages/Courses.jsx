import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', instructor: '', term: '' });

  const fetchCourses = async () => {
    const { data } = await api.get('/courses');
    setCourses(data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', formData);
      setShowModal(false);
      setFormData({ name: '', code: '', instructor: '', term: '' });
      fetchCourses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await api.delete(`/courses/${id}`);
      fetchCourses();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
          <Plus className="h-5 w-5 mr-2" /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course._id} className="bg-white p-6 rounded-xl shadow-sm border-t-4 border border-gray-100" style={{ borderTopColor: course.color || '#3b82f6' }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{course.name}</h3>
                <span className="text-sm font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded mt-1 inline-block">{course.code}</span>
              </div>
              <button onClick={() => handleDelete(course._id)} className="text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Instructor:</span> {course.instructor || 'N/A'}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Term:</span> {course.term || 'N/A'}</p>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No courses added yet. Click "Add Course" to get started!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Course</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input required type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Web Development" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input required type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. COMP4650" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <input type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <input type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.term} onChange={e => setFormData({...formData, term: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
