import React, { useState } from 'react';
import '../styles/Order.css';

function AdminTrain({ train: initialTrain, companyName}) {
    const [train, setTrain] = useState(initialTrain);
    const [updatedDepartureDate, setUpdatedDepartureDate] = useState('');
    const [updatedDepartureTime, setUpdatedDepartureTime] = useState('');
    const [updatedArrivalDate, setUpdatedArrivalDate] = useState('');
    const [updatedArrivalTime, setUpdatedArrivalTime] = useState('');
    const [updatedTrain, setUpdatedTrain] = useState('');
    const [updatedSeats, setUpdatedSeats] = useState('');
    const [updatedPrice, setUpdatedPrice] = useState('');

    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = () => {
        setUpdatedPrice(train.ticket_price);
        setUpdatedSeats(train.seats);
        setUpdatedTrain(train.train_number);
        setUpdatedDepartureDate(train.departure_date);
        setUpdatedDepartureTime(train.departure_time);
        setUpdatedArrivalDate(train.arrival_date);
        setUpdatedArrivalTime(train.arrival_time);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!updatedDepartureDate || !updatedDepartureTime || !updatedArrivalDate || !updatedArrivalTime || !updatedPrice || !updatedSeats || !updatedTrain) {
            alert('All fields must be filled');
            handleEdit();
            return;
        }

        const trainDepartureDateTime = new Date(`${train.departure_date}T${train.departure_time}`);

        const departureDateTime = new Date(`${updatedDepartureDate}T${updatedDepartureTime}`);
        const arrivalDateTime = new Date(`${updatedArrivalDate}T${updatedArrivalTime}`);

        if (departureDateTime < trainDepartureDateTime) {
            handleEdit();
            alert('Updated departure date and time must be later than the current departure date and time');
            return;
        }

        if (departureDateTime >= arrivalDateTime) {
            handleEdit();
            alert('Departure date and time must be earlier than arrival date and time');
            return;
        }

        if (updatedSeats < train.occupied_seats) {
            handleEdit();
            alert('Seats must be higher than the occupied seats');
            return;
        }

        const token = localStorage.getItem('jwtToken');
        fetch(`http://localhost:8080/api/train/${train.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ departure_date: updatedDepartureDate, departure_time: updatedDepartureTime, arrival_date: updatedArrivalDate, arrival_time: updatedArrivalTime, train_number: updatedTrain, seats: updatedSeats, ticket_price: updatedPrice }),
        })
            .then(response => {
                if (response.ok) {
                    setTrain(prev => ({ ...prev, departure_date: updatedDepartureDate, departure_time: updatedDepartureTime, arrival_date: updatedArrivalDate, arrival_time: updatedArrivalTime, train_number: updatedTrain, seats: updatedSeats, ticket_price: updatedPrice }));
                }
                else {
                    throw new Error('Failed to update train');
                }

            })
            .catch(error => {
                console.error('Error updating train:', error);
            });

        setIsEditing(false);
    };

    const handleCancel = () => {
        const confirmed = window.confirm("Are you sure you want to cancel this train?");
        if (confirmed) {
            const token = localStorage.getItem('jwtToken');
            fetch(`http://localhost:8080/api/train/status/${train.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }})
                .then(response => {
                    if (!response.ok) throw new Error('Failed to cancel train');
                    setTrain(prev => ({ ...prev, status: false }));
                })
                .catch(error => {
                    console.error('Error canceling train:', error);
                });
        }
    };

    return (
        <div>
            {train && (
                <div className="train-order-card">
                    <div className="train-info">
                        {!isEditing && (
                            <div className="train-info-list">
                                <div className="info-section">
                                    <span className="value">{companyName}</span>
                                </div>
                            </div>
                        )}
                        <div className="train-info-list">
                            {!isEditing && (
                                <>
                                    <div className="info-section">
                                        <span className="label">№</span>
                                        <span className="value">{train.id}</span>
                                    </div>
                                    <div className="info-section">
                                        <span className="label">From</span>
                                        <span className="value">{train.departure}</span>
                                    </div>
                                    <div className="info-section">
                                        <span className="label">To</span>
                                        <span className="value">{train.destination}</span>
                                    </div>
                                </>
                            )}
                            <div className="info-section">
                                {isEditing ? (
                                    <>
                                        <span className="label">Price</span>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={updatedPrice}
                                            onChange={(e) => setUpdatedPrice(e.target.value)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <span className="label">Departure</span>
                                        <span
                                            className="value">{new Date(train.departure_date).toLocaleDateString()} {train.departure_time.slice(0, -3)}</span>
                                    </>
                                )}
                            </div>
                            {!isEditing && (
                                <div className="info-section">
                                    <span className="label">Arrival</span>
                                    <span
                                        className="value">{new Date(train.arrival_date).toLocaleDateString()} {train.arrival_time.slice(0, -3)}</span>
                                </div>
                            )}
                            <div className="info-section">
                                <span className="label">Train</span>
                                {isEditing ? (
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={updatedTrain}
                                        onChange={(e) => setUpdatedTrain(e.target.value)}
                                    />
                                ) : (
                                    <span className="value">{train.train_number}</span>
                                )}
                            </div>
                            <div className="info-section">
                                <span className="label">Seats</span>
                                {isEditing ? (
                                    <input
                                        className="form-input"
                                        type="number"
                                        value={updatedSeats}
                                        onChange={(e) => setUpdatedSeats(e.target.value)}
                                    />
                                ) : (
                                    <span className="value">{train.seats}</span>
                                )}
                            </div>
                            {!isEditing && (
                                <div className="info-section">
                                    <span className="label">Free seats</span>
                                    <span className="value">{train.seats - train.occupied_seats}</span>
                                </div>
                            )}
                        </div>
                        <div className="train-info-list">
                            {isEditing ? (
                                <>
                                    <div className="info-section">
                                        <span className="label">Departure</span>
                                        <div>
                                            <input
                                                className="form-input"
                                                type="date"
                                                value={updatedDepartureDate}
                                                onChange={(e) => setUpdatedDepartureDate(e.target.value)}
                                            />
                                            <input
                                                className="form-input"
                                                type="time"
                                                value={updatedDepartureTime}
                                                onChange={(e) => setUpdatedDepartureTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="info-section">
                                        <span className="label">Arrival</span>
                                        <div>
                                            <input
                                                className="form-input"
                                                type="date"
                                                value={updatedArrivalDate}
                                                onChange={(e) => setUpdatedArrivalDate(e.target.value)}
                                            />
                                            <input
                                                className="form-input"
                                                type="time"
                                                value={updatedArrivalTime}
                                                onChange={(e) => setUpdatedArrivalTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="info-section">
                                        <span className="label-price">Status</span>
                                        <span className="value-price">{train.status ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <div className="info-section">
                                        <span className="label-price">Price</span>
                                        <span className="value-price">{train.ticket_price} UAH
                                            </span>
                                    </div>
                                </>
                            )}
                            <div className="button-row">
                                {isEditing ? (
                                    <>
                                        <button className="view-button" onClick={() => setIsEditing(false)}>X</button>
                                        <button className="view-button" onClick={handleSave}>Save</button>
                                    </>
                                ) : (
                                    <button className="view-button" onClick={handleEdit}>Edit</button>
                                )}
                                {train.status && (
                                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminTrain;