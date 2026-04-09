import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/login.css'; 
import logo from '../img/Capture.PNG';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/admin" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const res = await login(username, password);
        if (res.success) {
            navigate('/admin');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <img src={logo} alt="KIMS Logo" className="login-logo" />
                    <h1 className="login-title">Admin Console</h1>
                    <p className="login-subtitle">Sign in to access the admin panel</p>
                </div>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={e=>setUsername(e.target.value)} 
                            placeholder="Enter username"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e=>setPassword(e.target.value)} 
                            placeholder="Enter password"
                            required 
                        />
                    </div>
                    <button type="submit" className="login-submit-btn hover-lift">Sign In</button>
                    <button type="button" className="login-back-btn" onClick={() => navigate('/')}>Back to Portal</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
