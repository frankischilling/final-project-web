import React, { useContext } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LayoutDashboard, CalendarDays, Clock, LogOut, Shield } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col hidden md:flex">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center">
            <BookOpen className="mr-2" /> CourseTrack
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
            <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
          </Link>
          <Link to="/courses" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
            <BookOpen className="mr-3 h-5 w-5" /> Courses
          </Link>
          <Link to="/assignments" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
            <CalendarDays className="mr-3 h-5 w-5" /> Assignments
          </Link>
          <Link to="/studytasks" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
            <Clock className="mr-3 h-5 w-5" /> Study Tasks
          </Link>
          {user.isAdmin && (
            <Link to="/admin" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
              <Shield className="mr-3 h-5 w-5" /> Admin Panel
            </Link>
          )}
        </nav>
        <div className="p-4 border-t">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Logged in as:</p>
            <p className="font-medium text-gray-800 truncate">{user.name}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">CourseTrack</h1>
          <button onClick={logout} className="text-red-600"><LogOut className="h-6 w-6" /></button>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
