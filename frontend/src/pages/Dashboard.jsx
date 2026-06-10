import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BookOpen, CalendarDays, CheckCircle } from 'lucide-react';

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

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;

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
        backgroundColor: ['#10B981', '#F59E0B'],
        hoverBackgroundColor: ['#059669', '#D97706'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: "'Inter', sans-serif",
            size: 13
          }
        }
      }
    }
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Courses</p>
            <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg mr-4">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Tasks</p>
            <p className="text-2xl font-bold text-gray-800">{totalPending}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{totalCompleted}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-800 w-full mb-4">Overall Progress</h3>
          {totalItems > 0 ? (
            <div className="w-full h-64 relative">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-10">
                <span className="text-3xl font-bold text-gray-800">
                  {Math.round((totalCompleted / totalItems) * 100)}%
                </span>
                <span className="text-xs text-gray-500 font-medium">Done</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-10 w-full">No items to track.</p>
          )}
        </div>

        {/* Upcoming List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
          {upcomingItems.length > 0 ? (
            <div className="space-y-4">
              {upcomingItems.map((item) => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const dueDateObj = new Date(item.date);
                dueDateObj.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((dueDateObj - now) / (1000 * 60 * 60 * 24));
                
                let dateStyle = "text-gray-500";
                let warningText = "";
                if (diffDays < 0) {
                  dateStyle = "text-red-600 font-bold";
                  warningText = " (Overdue)";
                } else if (diffDays <= 3) {
                  dateStyle = "text-orange-500 font-bold";
                  warningText = " (Due soon)";
                }

                return (
                  <div key={item._id + item.type} className={`flex justify-between items-center p-4 rounded-lg ${diffDays < 0 ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                    <div>
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        {item.title} 
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide ml-3 py-0.5 px-2 bg-gray-200 rounded-full">
                          {item.type}
                        </span>
                      </h4>
                      <p className={`text-sm mt-1 ${dateStyle}`}>
                        {item.course?.code || 'No Course'} • {new Date(item.date).toLocaleDateString()}{warningText}
                      </p>
                    </div>
                    {item.type === 'Assignment' ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0
                        ${item.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {item.priority} Priority
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 shrink-0">
                        Study Session
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">You're all caught up!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
