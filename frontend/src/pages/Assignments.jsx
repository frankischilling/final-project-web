import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
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
    <div>
      <h2 style={{ color: '#3B5998', marginTop: 0 }}>Assignments</h2>

      <table width="100%" cellPadding="8">
        <tbody>
          <tr>
            <th>Add New Assignment</th>
          </tr>
          <tr style={{ backgroundColor: '#F9F9F9' }}>
            <td>
              {courses.length === 0 ? (
                <p style={{ color: '#CC0000' }}>Please add a course first before creating an assignment.</p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <table border="0" style={{ border: 'none' }} cellPadding="4">
                    <tbody>
                      <tr>
                        <td align="right" style={{ border: 'none' }}><b>Title:</b></td>
                        <td style={{ border: 'none' }}><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '250px' }} /></td>
                      </tr>
                      <tr>
                        <td align="right" style={{ border: 'none' }}><b>Course:</b></td>
                        <td style={{ border: 'none' }}>
                          <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} style={{ width: '258px' }}>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td align="right" style={{ border: 'none' }}><b>Due Date:</b></td>
                        <td style={{ border: 'none' }}><input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} style={{ width: '250px' }} /></td>
                      </tr>
                      <tr>
                        <td align="right" style={{ border: 'none' }}><b>Priority:</b></td>
                        <td style={{ border: 'none' }}>
                          <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ width: '258px' }}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: 'none' }}></td>
                        <td style={{ border: 'none', paddingTop: '10px' }}><input type="submit" value="Save Assignment" /></td>
                      </tr>
                    </tbody>
                  </table>
                </form>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <br />

      <table width="100%" cellPadding="8">
        <thead>
          <tr style={{ fontSize: '11px', color: '#666' }}>
            <th>STATUS</th>
            <th>TITLE</th>
            <th>COURSE</th>
            <th>DUE DATE</th>
            <th>PRIORITY</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length > 0 ? (
            assignments.map((assignment, index) => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const dueDateObj = new Date(assignment.dueDate);
              dueDateObj.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((dueDateObj - now) / (1000 * 60 * 60 * 24));
              
              let warningText = "";
              let textColor = "#333333";
              if (assignment.status !== 'Completed') {
                if (diffDays < 0) {
                  warningText = " (Overdue)";
                  textColor = "#CC0000";
                } else if (diffDays <= 3) {
                  warningText = " (Due soon)";
                  textColor = "#FF6600";
                }
              }

              const rowColor = assignment.status === 'Completed' ? '#F0F0F0' : (index % 2 === 0 ? '#FFFFFF' : '#F9F9F9');

              return (
                <tr key={assignment._id} style={{ backgroundColor: rowColor }} align="center">
                  <td>
                    {assignment.status === 'Completed' ? (
                      <span style={{ color: '#008800', fontWeight: 'bold' }}>Done</span>
                    ) : (
                      <button onClick={() => handleStatusUpdate(assignment._id, assignment.status)}>Complete</button>
                    )}
                  </td>
                  <td align="left">
                    {assignment.status === 'Completed' ? <span style={{ color: '#999', textDecoration: 'line-through' }}>{assignment.title}</span> : <b>{assignment.title}</b>}
                  </td>
                  <td style={{ fontSize: '11px' }}>{assignment.course?.code || 'N/A'}</td>
                  <td style={{ color: textColor }}>
                    {new Date(assignment.dueDate).toLocaleDateString()} <b>{warningText}</b>
                  </td>
                  <td style={{ fontSize: '11px' }}>{assignment.priority}</td>
                  <td>
                    <button onClick={() => handleDelete(assignment._id)}>Delete</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" align="center" style={{ padding: '20px', color: '#666' }}>No assignments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Assignments;
