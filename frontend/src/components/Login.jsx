import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message || t('login.success'));
                setTimeout(() => {
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('userName', data.user.name);
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userMobile', data.user.mobile);
                    localStorage.setItem('userState', data.user.state);
                    localStorage.setItem('isLoggedIn', 'true');
                    setIsLoggedIn(true);
                    navigate('/');
                }, 1000);

            } else {
                setError({
                    message: data.message || t('login.errors.loginFailed'),
                    details: data.errors || null,
                });
            }
        } catch (err) {
            setError('An error occurred: ' + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">{t('login.title')}</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">{t('login.email')}</label>
                    <input
                        className="form-input"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {error && error.details && error.details.email && <p className="form-error">{error.details.email[0]}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">{t('login.password')}</label>
                    <input
                        className="form-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && error.details && error.details.password && <p className="form-error">{error.details.password[0]}</p>}
                </div>
                {error && error.message && <p className="form-error">{error.message}</p>}
                {success && <p className="form-success">{success}</p>}
                <button className="form-button" type="submit" disabled={loading}>
                    {loading ? t('login.loading') : t('login.submit')}
                </button>
            </form>
            <p className="form-link">{t('login.noAccount')} <a href="/register">{t('login.registerLink')}</a></p>
        </div>
    );
};

export default Login;
