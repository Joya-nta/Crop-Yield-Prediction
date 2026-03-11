import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Register = ({ setIsLoggedIn }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name, email, mobile, password, state }),
            });
            const data = await response.json();
            // console.log(data);
            // console.log(response);
            if (response.ok) {
                setSuccess(data.message || t('register.success'));
                setTimeout(() => {
                    navigate('/login');
                }, 1000);

            } else {
                setError({
                    message: data.message || t('register.errors.registrationFailed'),
                    details: data.errors || null,

                });
                // console.log(error);
            }
        } catch (err) {
            setError('An error occurred: ' + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">{t('register.title')}</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">{t('register.name')}</label>
                    <input
                        className="form-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    {error && error.details && error.details.name && <p className="form-error">{error.details.name[0]}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">{t('register.email')}</label>
                    <input
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {error && error.details && error.details.email && <p className="form-error">{error.details.email[0]}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">{t('register.mobile')}</label>
                    <input
                        className="form-input"
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        maxLength={10}
                        required
                    />
                    {error && error.details && error.details.mobile && <p className="form-error">{error.details.mobile[0]}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">{t('register.password')}</label>
                    <input
                        className="form-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && error.details && error.details.password && <p className="form-error">{error.details.password[0]}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">{t('register.state')}</label>
                    <select
                        className="form-input"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                    >
                        <option value="">{t('register.selectState')}</option>
                        {states.map((st) => (
                            <option key={st} value={st}>{st}</option>
                        ))}
                    </select>
                    {error && error.details && error.details.state && <p className="form-error">{error.details.state[0]}</p>}
                </div>

                {error && <p className="form-error">{error.message}</p>}
                {success && <p className="form-success">{success}</p>}
                <button className="form-button" type="submit" disabled={loading}>{loading ? t('register.loading') : t('register.submit')}</button>
            </form>
            <p className="form-link">{t('register.hasAccount')} <a href="/login">{t('register.loginLink')}</a></p>
        </div>
    );
};

export default Register;
