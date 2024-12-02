import '../styles/Main.css';
import React, {useEffect, useState} from "react";

function OutdatedAccounts() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    const fetchUsers = () => {
        const token = localStorage.getItem('jwtToken');

        fetch('http://localhost:8080/api/user/out', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                return response.json();
            })
            .then(data => {
                const filteredUsers = data.filter(user => user.role !== 'ADMIN');
                setUsers(filteredUsers);
            })
            .catch(err => {
                console.error('Error fetching users:', err);
                setError('Failed to fetch users');
            });
    };

    const handleDelete = async (userId) => {
        const confirmed = window.confirm("Are you sure you want to delete this account?");
        if (confirmed) {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    alert("Account successfully deleted");
                    setUsers(users.filter(user => user.id !== userId));
                } else {
                    alert("Failed to delete account");
                }
            } catch (err) {
                console.error('Error deleting user:', err);
                alert("There was an error deleting the account.");
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <>
            {error && <p className="error-message">{error}</p>}
            {users.map(user => (
                <div key={user.id} className="train-card">
                    <div className="train-info-personal">
                        <div className="info-section">
                            <span className="label">Name</span>
                            <span className="value">{user.name}</span>
                        </div>
                        <div className="info-section">
                            <span className="label">Email</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="info-section">
                            <span className="label">Phone number</span>
                            <span className="value">{user.phone_number}</span>
                        </div>
                        <div className="info-section">
                            <span className="label">Last activity</span>
                            <span className="value">{user.recent_activity}</span>
                        </div>
                    </div>
                    <div className="account-actions">
                        <button
                            className="cancel-button"
                            onClick={() => handleDelete(user.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </>
    );
}

export default OutdatedAccounts;
