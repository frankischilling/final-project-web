import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studyTasks, setStudyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, assignmentRes, studyTaskRes] = await Promise.all([
          api.get('/courses'),
          api.get('/assignments'),
          api.get('/studytasks')
        ]);
        setCourses(courseRes.data);
        setAssignments(assignmentRes.data);
        setStudyTasks(studyTaskRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard... Please wait.</div>;

  const completedAssignments = assignments.filter(a => a.status === 'Completed').length;
  const pendingAssignments = assignments.length - completedAssignments;

  const completedStudyTasks = studyTasks.filter(t => t.isCompleted).length;
  const pendingStudyTasks = studyTasks.length - completedStudyTasks;

  const totalCompleted = completedAssignments + completedStudyTasks;
  const totalPending = pendingAssignments + pendingStudyTasks;
  const totalItems = totalCompleted + totalPending;

  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [totalCompleted, totalPending],
        backgroundColor: ['#6699CC', '#FF9900'],
        borderWidth: 1,
        borderColor: '#FFFFFF'
      },
    ],
  };

  const formattedAssignments = assignments
    .filter(a => a.status !== 'Completed')
    .map(a => ({
      _id: a._id,
      title: a.title,
      course: a.course,
      date: a.dueDate,
      type: 'Assignment',
      priority: a.priority
    }));

  const formattedStudyTasks = studyTasks
    .filter(t => !t.isCompleted)
    .map(t => ({
      _id: t._id,
      title: t.title,
      course: t.course,
      date: t.date,
      type: 'Study Task'
    }));

  const upcomingItems = [...formattedAssignments, ...formattedStudyTasks]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div>
      <h2 style={{ color: '#3B5998', marginTop: 0 }}>Dashboard Overview</h2>
      
      <table width="100%" cellPadding="8">
        <tbody>
          <tr>
            <th>Total Courses</th>
            <th>Pending Tasks</th>
            <th>Completed</th>
          </tr>
          <tr align="center" style={{ backgroundColor: '#F9F9F9' }}>
            <td style={{ fontSize: '16px' }}><b>{courses.length}</b></td>
            <td style={{ fontSize: '16px' }}><b><span style={{ color: '#CC0000' }}>{totalPending}</span></b></td>
            <td style={{ fontSize: '16px' }}><b><span style={{ color: '#008800' }}>{totalCompleted}</span></b></td>
          </tr>
        </tbody>
      </table>

      <br />

      <table width="100%" border="0" style={{ border: 'none' }}>
        <tbody>
          <tr>
            <td width="35%" valign="top" style={{ border: 'none', paddingRight: '15px' }}>
              <table width="100%" cellPadding="8">
                <tbody>
                  <tr>
                    <th>Overall Progress</th>
                  </tr>
                  <tr>
                    <td align="center" style={{ backgroundColor: '#F9F9F9' }}>
                      {totalItems > 0 ? (
                        <div style={{ width: '180px', margin: '0 auto' }}>
                          <div style={{ height: '200px' }}>
                            <Doughnut data={chartData} options={{ maintainAspectRatio: false, cutout: '50%', plugins: { legend: { position: 'bottom', labels: { font: { family: 'Verdana', size: 11 } } } } }} />
                          </div>
                          <div style={{ marginTop: '5px' }}>
                            <b>Done: {Math.round((totalCompleted / totalItems) * 100)}%</b>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '30px 0', color: '#666' }}>No items to track.</div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td width="65%" valign="top" style={{ border: 'none' }}>
              <table width="100%" cellPadding="8">
                <tbody>
                  <tr>
                    <th colSpan="4">Upcoming Deadlines</th>
                  </tr>
                  <tr style={{ backgroundColor: '#F0F0F0', fontSize: '11px', color: '#666' }}>
                    <td><b>TYPE</b></td>
                    <td><b>TITLE</b></td>
                    <td><b>DATE</b></td>
                    <td><b>PRIORITY</b></td>
                  </tr>
                  {upcomingItems.length > 0 ? (
                    upcomingItems.map((item, index) => {
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      const dueDateObj = new Date(item.date);
                      dueDateObj.setHours(0, 0, 0, 0);
                      const diffDays = Math.ceil((dueDateObj - now) / (1000 * 60 * 60 * 24));
                      
                      let warningText = "";
                      let textColor = "#333333";
                      if (diffDays < 0) {
                        warningText = " (Overdue)";
                        textColor = "#CC0000";
                      } else if (diffDays <= 3) {
                        warningText = " (Due soon)";
                        textColor = "#FF6600";
                      }

                      return (
                        <tr key={item._id + item.type} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9F9F9' }}>
                          <td style={{ fontSize: '11px', color: '#666' }}>{item.type}</td>
                          <td><b>{item.title}</b> <span style={{ fontSize: '11px', color: '#888' }}>({item.course?.code || 'None'})</span></td>
                          <td style={{ color: textColor }}>{new Date(item.date).toLocaleDateString()} <b>{warningText}</b></td>
                          <td style={{ fontSize: '11px' }}>{item.priority || '-'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" align="center" style={{ padding: '20px', color: '#666' }}>You're all caught up!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
