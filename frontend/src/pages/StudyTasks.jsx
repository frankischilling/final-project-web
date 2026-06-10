import React, { useEffect, useState } from 'react';
import api from '../services/api';

const StudyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
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
    <div>
      <h2 style={{ color: '#3B5998', marginTop: 0 }}>Study Tasks</h2>

      <table width="100%" cellPadding="8">
        <tbody>
          <tr>
            <th>Plan Study Task</th>
          </tr>
          <tr style={{ backgroundColor: '#F9F9F9' }}>
            <td>
              <form onSubmit={handleSubmit}>
                <table border="0" style={{ border: 'none' }} cellPadding="4">
                  <tbody>
                    <tr>
                      <td align="right" style={{ border: 'none' }}><b>Topic/Title:</b></td>
                      <td style={{ border: 'none' }}><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '250px' }} /></td>
                    </tr>
                    <tr>
                      <td align="right" style={{ border: 'none' }}><b>Related Course:</b></td>
                      <td style={{ border: 'none' }}>
                        <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} style={{ width: '258px' }}>
                          <option value="">None</option>
                          {courses.map(c => <option key={c._id} value={c._id}>{c.code}</option>)}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td align="right" style={{ border: 'none' }}><b>Date:</b></td>
                      <td style={{ border: 'none' }}><input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '250px' }} /></td>
                    </tr>
                    <tr>
                      <td align="right" style={{ border: 'none' }}><b>Duration (mins):</b></td>
                      <td style={{ border: 'none' }}><input required type="number" min="5" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} style={{ width: '250px' }} /></td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none' }}></td>
                      <td style={{ border: 'none', paddingTop: '10px' }}><input type="submit" value="Save Task" /></td>
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
            <th>STATUS</th>
            <th>TITLE</th>
            <th>COURSE</th>
            <th>DATE</th>
            <th>DURATION</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task, index) => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const taskDate = new Date(task.date);
              taskDate.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((taskDate - now) / (1000 * 60 * 60 * 24));
              
              let warningText = "";
              let textColor = "#333333";
              
              if (!task.isCompleted) {
                if (diffDays < 0) {
                  warningText = " (Overdue)";
                  textColor = "#CC0000";
                } else if (diffDays <= 3) {
                  warningText = " (Soon)";
                  textColor = "#FF6600";
                }
              }

              const rowColor = task.isCompleted ? '#F0F0F0' : (index % 2 === 0 ? '#FFFFFF' : '#F9F9F9');

              return (
                <tr key={task._id} style={{ backgroundColor: rowColor }} align="center">
                  <td>
                    {task.isCompleted ? (
                      <span style={{ color: '#008800', fontWeight: 'bold' }}>Done</span>
                    ) : (
                      <button onClick={() => toggleComplete(task._id, task.isCompleted)}>Complete</button>
                    )}
                  </td>
                  <td align="left">
                    {task.isCompleted ? <span style={{ color: '#999', textDecoration: 'line-through' }}>{task.title}</span> : <b>{task.title}</b>}
                  </td>
                  <td style={{ fontSize: '11px' }}>{task.course ? task.course.code : '-'}</td>
                  <td style={{ color: textColor }}>
                    {new Date(task.date).toLocaleDateString()} <b>{warningText}</b>
                  </td>
                  <td style={{ fontSize: '11px' }}>{task.durationMinutes} mins</td>
                  <td>
                    <button onClick={() => handleDelete(task._id)}>Delete</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" align="center" style={{ padding: '20px', color: '#666' }}>No study tasks planned.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudyTasks;
