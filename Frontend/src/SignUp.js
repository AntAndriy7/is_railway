import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import styles from './styles/Auth.module.css';
import logoImage from './resources/railway-black-icon.png';
import openEyeIcon from './resources/open-eye-icon.png';
import closedEyeIcon from './resources/closed-eye-icon.png';
import {jwtDecode} from "jwt-decode";

function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);
    const handleNameChange = (event) => setName(event.target.value);
    const handleSurnameChange = (event) => setSurname(event.target.value);
    const handlePhoneChange = (event) => setPhone(event.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (name === '' || surname === '' || email === '' || phone === '' || password === '') {
            alert('Please fill in all fields.');
            return;
        }

        const userResponse = await fetch(`http://localhost:8080/api/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await userResponse.json();

        if (users) {
            for (const user of users) {
                if (user.email === email) {
                    alert('Account with this email is already exist.');
                    return;
                }
            }
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        const fullName = `${name} ${surname}`.toUpperCase();

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        if (!passwordPattern.test(password)) {
            alert('Password must be at least 6 characters long, containing at least one uppercase and one lowercase letter.');
            return;
        }

        const phonePattern = /^\+?[0-9]{10,15}$/;
        if (!phonePattern.test(phone)) {
            alert('Please enter a valid phone number (e.g., +1234567890).');
            return;
        }

        const userData = {email, password, name: fullName, phone_number: phone, role: 'CLIENT'};

        fetch('http://localhost:8080/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (response.ok) {
                    const userLoginData = {email: userData.email, password: userData.password};

                    fetch('http://localhost:8080/api/user/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(userLoginData)
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

                    return response.json();
                }
                throw new Error('Something went wrong');
            })
            .then(data => console.log('Success:', data))
            .catch(error => console.error('Error:', error));
    };

    const navigateBasedOnRole = (token) => {
        const decodedToken = jwtDecode(token);
        const { role } = decodedToken;

        switch (role) {
            case 'CLIENT':
                navigate('/main');
                break;
            default:
                navigate('/login');
                break;
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
                <h2 className={styles.title}>Sign Up</h2>
                <div className={styles.inputGroup}>
                    <label>Name</label>
                    <input
                        type="name"
                        value={name}
                        onChange={handleNameChange}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Surname</label>
                    <input
                        type="surname"
                        value={surname}
                        onChange={handleSurnameChange}
                        required
                    />
                </div>
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
                    <label>Phone number</label>
                    <input
                        type="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Password</label>
                    <div style={{position: 'relative'}}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        <img
                            src={showPassword ? openEyeIcon : closedEyeIcon}
                            alt={showPassword ? "Hide password" : "Show password"}
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                width: '24px',
                                height: '24px'
                            }}
                        />
                    </div>
                </div>
                <button type="submit" className={styles.button} onClick={handleSubmit}>Sign Up</button>
                <p className={styles.signUpPrompt}>
                    Sign up as <Link to="/signuprailway">Railway-company</Link>
                </p>
                <p className={styles.signUpPrompt}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default SignUp;
