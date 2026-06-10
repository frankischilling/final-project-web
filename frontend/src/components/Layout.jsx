import React, { useContext } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div style={{ margin: '15px auto', maxWidth: '1000px', backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC' }}>
      <div style={{ background: 'linear-gradient(to bottom, #3B5998, #2A4073)', padding: '15px', color: '#FFFFFF' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>CourseTrack</h1>
      </div>
      
      <table width="100%" cellPadding="20" border="0" style={{ borderCollapse: 'collapse', border: 'none' }}>
        <tbody>
          <tr>
            <td width="180" valign="top" style={{ backgroundColor: '#F5F7FA', borderRight: '1px solid #CCCCCC', borderBottom: 'none', borderTop: 'none', borderLeft: 'none' }}>
              <h3 style={{ borderBottom: '1px solid #CCCCCC', paddingBottom: '5px', marginTop: 0, color: '#3B5998' }}>Menu</h3>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/courses">Courses</Link></li>
                <li><Link to="/assignments">Assignments</Link></li>
                <li><Link to="/studytasks">Study Tasks</Link></li>
                {user.isAdmin && (
                  <li><Link to="/admin">Admin Panel</Link></li>
                )}
              </ul>
              <br /><br />
              <div style={{ borderTop: '1px solid #CCCCCC', paddingTop: '10px', fontSize: '11px' }}>
                Signed in as:<br/><b>{user.name}</b><br/><br/>
                <button onClick={logout}>Sign Out</button>
              </div>
            </td>
            <td valign="top" style={{ backgroundColor: '#FFFFFF', border: 'none' }}>
              <Outlet />
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ borderTop: '1px solid #CCCCCC', padding: '10px', textAlign: 'center', backgroundColor: '#F5F7FA', fontSize: '11px', color: '#666' }}>
        &copy; 2004 CourseTrack Inc. All rights reserved.
      </div>
    </div>
  );
};

export default Layout;
