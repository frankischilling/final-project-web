import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ margin: '50px auto', width: '400px', backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC' }}>
      <div style={{ background: 'linear-gradient(to bottom, #3B5998, #2A4073)', padding: '15px', color: '#FFFFFF', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>CourseTrack 2004</h1>
      </div>
      
      <div style={{ padding: '20px', backgroundColor: '#F5F7FA' }}>
        <h3 style={{ marginTop: 0, color: '#3B5998', borderBottom: '1px solid #CCCCCC', paddingBottom: '10px' }}>Member Sign In</h3>
        
        {error && <div style={{ border: '1px solid #CC0000', backgroundColor: '#FFCCCC', padding: '10px', marginBottom: '15px', fontSize: '12px' }}><b>Error:</b> {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <table border="0" cellPadding="6" width="100%" style={{ border: 'none' }}>
            <tbody>
              <tr>
                <td align="right" width="30%" style={{ border: 'none' }}><b>Email:</b></td>
                <td style={{ border: 'none' }}><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '200px' }} /></td>
              </tr>
              <tr>
                <td align="right" style={{ border: 'none' }}><b>Password:</b></td>
                <td style={{ border: 'none' }}><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '200px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}></td>
                <td style={{ border: 'none', paddingTop: '15px' }}><input type="submit" value="Sign in securely" /></td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>

      <div style={{ borderTop: '1px solid #CCCCCC', padding: '15px', textAlign: 'center', backgroundColor: '#EFEFEF', fontSize: '11px' }}>
        Don't have an account yet? <Link to="/register"><b>Register Now!</b></Link>
      </div>
    </div>
  );
};

export default Login;
