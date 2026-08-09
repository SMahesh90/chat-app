import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { colors, fonts } from '../styles/theme';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data || 'Login failed');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
            fontFamily: fonts.family,
        }}>
            <div style={{
                width: '360px',
                backgroundColor: colors.surface,
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: colors.text }}>
                    Welcome back
                </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    {error && (
                        <p style={{ color: colors.danger, fontSize: '13px', marginBottom: '12px' }}>
                            {JSON.stringify(error)}
                        </p>
                    )}
                    <button type="submit" style={buttonStyle}>Login</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: colors.textMuted }}>
                    Don't have an account? <Link to="/register" style={{ color: colors.primary }}>Register</Link>
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    boxSizing: 'border-box',
};

const buttonStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
};

export default Login;