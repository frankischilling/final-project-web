import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
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
    <div>
      <h2 style={{ color: '#3B5998', marginTop: 0 }}>My Courses</h2>

      <table width="100%" cellPadding="8">
        <tbody>
          <tr>
            <th>Add New Course</th>
          </tr>
          <tr style={{ backgroundColor: '#F9F9F9' }}>
            <td>
              <form onSubmit={handleSubmit}>
                <table border="0" style={{ border: 'none' }} cellPadding="4">
                  <tbody>
                    <tr>
                      <td align="right" style={{ border: 'none' }}><b>Course Name:</b></td>
                      <td style={{ border: 'none' }}><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '250px' }} /></td>
                    </tr>
                    <tr>
                      <td align="right" style={{ border: 'none' }}><b>Course Code:</b></td>
                      <td style={{ border: 'none' }}><input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={{ width: '250px' }} /></td>
                    </tr>
                    <tr>
                      <td align="right" style={{ border: 'none' }}><b>Instructor:</b></td>
                      <td style={{ border: 'none' }}><input type="text" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} style={{ width: '250px' }} /></td>
                    </tr>
                    <tr>
                      <td align="right" style={{ border: 'none' }}><b>Term:</b></td>
                      <td style={{ border: 'none' }}><input type="text" value={formData.term} onChange={e => setFormData({...formData, term: e.target.value})} style={{ width: '250px' }} /></td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none' }}></td>
                      <td style={{ border: 'none', paddingTop: '10px' }}><input type="submit" value="Save Course" /></td>
                    </tr>
                  </tbody>
                </table>
              </form>
            </td>
          </tr>
        </tbody>
      </table>

      <br />

      <table width="100%" cellPadding="8">
        <thead>
          <tr style={{ fontSize: '11px', color: '#666' }}>
            <th>CODE</th>
            <th>COURSE NAME</th>
            <th>INSTRUCTOR</th>
            <th>TERM</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <tr key={course._id} align="center" style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9F9F9' }}>
                <td><b>{course.code}</b></td>
                <td align="left">{course.name}</td>
                <td>{course.instructor || '-'}</td>
                <td>{course.term || '-'}</td>
                <td>
                  <button onClick={() => handleDelete(course._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" align="center" style={{ padding: '20px', color: '#666' }}>No courses added yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Courses;
