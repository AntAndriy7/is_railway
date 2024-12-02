import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles/Auth.module.css';
import logoImage from './resources/railway-black-icon.png';
import { jwtDecode } from "jwt-decode";

function Login() {

    localStorage.clear();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (email === '' || password === '') {
            alert('Please fill in all fields.');
            return;
        }

        const userData = {
            email: email,
            password: password
        };

        fetch('http://localhost:8080/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('jwtToken', data.token);
                    navigateBasedOnRole(data.token);
                } else {
                    console.error('Login failed:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const navigateBasedOnRole = (token) => {
        const decodedToken = jwtDecode(token);
        const { role } = decodedToken;

        switch (role) {
            case 'CLIENT':
                navigate('/main');
                break;
            case 'RAILWAY':
                navigate('/railway/main');
                break;
            case 'ADMIN':
                navigate('/admin/main');
                break;
            default:
                navigate('/login');
                break;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <div className={styles.logoContainer} onClick={() => navigate('/main')}>
                    <div className={styles.logo}>
                        <span>Ukrainian</span>
                        <span>Low-cost</span>
                        <span>Railway</span>
                    </div>
                    <img src={logoImage} alt="logo" className={styles.logoImage}/>
                </div>
                <h2 className={styles.title}>Login</h2>
                <div className={styles.inputGroup}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                <button type="submit" className={styles.button} onClick={handleSubmit}>Login</button>
                <p className={styles.signUpPrompt}>
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
