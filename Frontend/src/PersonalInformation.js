import React, { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import './styles/Home.css';

function PersonalInformation() {
    const [user, setUser] = useState({ name: '', surname: '', email: '', phone_num: ''});
    const [isEditing, setIsEditing] = useState(false);
    const [updatedName, setUpdatedName] = useState('');
    const [updatedSurname, setUpdatedSurname] = useState('');
    const [updatedPhone, setUpdatedPhone] = useState('');
    const [updatedEmail, setUpdatedEmail] = useState('');
    const [error, setError] = useState(null);
    const [personalMessage, setPersonalMessage] = useState('');
    const navigate = useNavigate();

    const fetchUser = () => {
        const token = localStorage.getItem('jwtToken');
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        fetch(`http://localhost:8080/api/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                const [name, surname] = data.name.split(' ');

                setUser({ name, surname, email: data.email, phone_num: data.phone_number });

                setUpdatedName(name);
                setUpdatedSurname(surname);
                setUpdatedEmail(data.email);
                setUpdatedPhone(data.phone_number);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                setError('Failed to fetch user data');
            });
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!updatedName || !updatedSurname || !updatedEmail || !updatedPhone) {
            setPersonalMessage('All fields must be filled');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(updatedEmail)) {
            setPersonalMessage('Please enter a valid email address.');
            return;
        }

        const phonePattern = /^\+?[0-9]{10,15}$/;
        if (!phonePattern.test(updatedPhone)) {
            setPersonalMessage('Please enter a valid phone number (e.g., +1234567890).');
            return;
        }

        const token = localStorage.getItem('jwtToken');
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const fullName = `${updatedName} ${updatedSurname}`.toUpperCase();

        fetch(`http://localhost:8080/api/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: fullName, email: updatedEmail, phone_number: updatedPhone }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update user');
                }
                return fetch(`http://localhost:8080/api/user/${userId}/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
            })
            .then(response => response.text())
            .then(data => {
                if (data) {
                    localStorage.setItem('jwtToken', data);
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Error updating user:', error);
                setError('Failed to update user');
            });
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want delete your account?");
        if (confirmed) {
            try {
                const token = localStorage.getItem('jwtToken');
                const decoded = jwtDecode(token);
                const userId = decoded.id;
                const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                if (response.ok) {
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                } else {
                    alert("Failed to delete account.");
                }
            } catch (error) {
                alert("There was an error deletion your account.");
            }
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div>
            <div className="train-card">
                {error && <p className="error-message">{error}</p>}
                <div className="train-info-personal">
                    <div className="info-section">

                        <span className="label">Name</span>
                        {isEditing ? (
                            <input
                                className="form-input"
                                type="text"
                                value={updatedName}
                                onChange={(e) => setUpdatedName(e.target.value)}
                            />
                        ) : (
                            <span className="value">{user.name}</span>
                        )}
                    </div>
                    <div className="info-section">

                        <span className="label">Surname</span>
                        {isEditing ? (
                            <input
                                className="form-input"
                                type="text"
                                value={updatedSurname}
                                onChange={(e) => setUpdatedSurname(e.target.value)}
                            />
                        ) : (
                            <span className="value">{user.surname}</span>
                        )}
                    </div>
                    <div className="info-section">
                        <span className="label">Email</span>
                        {isEditing ? (
                            <input
                                className="form-input"
                                type="text"
                                value={updatedEmail}
                                onChange={(e) => setUpdatedEmail(e.target.value)}
                            />
                        ) : (
                            <span className="value">{user.email}</span>
                        )}
                    </div>
                    <div className="info-section">
                        <span className="label">Phone number</span>
                        {isEditing ? (
                            <input
                                className="form-input"
                                type="text"
                                value={updatedPhone}
                                onChange={(e) => setUpdatedPhone(e.target.value)}
                            />
                        ) : (
                            <span className="value">{user.phone_num}</span>
                        )}
                    </div>
                </div>
                <div className="account-actions">
                    {isEditing ? (
                        <button className="order-button" onClick={handleSave}>Save</button>
                    ) : (
                        <button className="order-button" onClick={handleEdit}>Edit</button>
                    )}
                </div>
                {personalMessage && <p color={'#f9f9f9'}>{personalMessage}</p>}
            </div>
            <div className="delete-button-container">
                <button className="delete-button" onClick={handleDelete}>Delete Account</button>
            </div>
        </div>
    );
}

export default PersonalInformation;
