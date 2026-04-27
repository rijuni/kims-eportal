import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/login.css';
import logo from '../img/Capture.PNG';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);
        
        // Brief delay to show progress
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const res = await login(username, password);
        if (res.success) {
            navigate('/', { state: { loginSuccess: true } });
        } else {
            setError(res.message);
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <img src={logo} alt="KIMS Logo" className="login-logo" />
                    <h1 className="login-title">KIMS EPORTAL</h1>
                    <p className="login-subtitle">Log in to access</p>
                </div>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="login-submit-btn hover-lift"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? "Logging In..." : "Log In"}
                    </button>
                    <button type="button" className="login-back-btn" onClick={() => navigate('/')}>Back to Portal</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
