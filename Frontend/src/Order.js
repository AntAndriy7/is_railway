import React, { useEffect, useState } from 'react';
import './styles/Order.css';
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";

function Order({train, railwayName}) {
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');
    const [useMyData, setUseMyData] = useState(false);
    const [tickets, setTickets] = useState([{ name: '', surname: '' }]);
    const [orderMessage, setOrderMessage] = useState('');
    const [newCurrentPrice, setNewCurrentPrice] = useState(train.dynamicPrice || train.ticket_price);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const calculateDynamicPrice = (basePrice, totalSeats, occupiedSeats) => {
        const occupancyRate = occupiedSeats / totalSeats; // Співвідношення зайнятих місць
        const priceIncreaseFactor = 1 + occupancyRate * 0.5; // Наприклад, ціна збільшується на 50% при повній зайнятості
        return Math.round(basePrice * priceIncreaseFactor);
    };

    const getTotalPrice = () => {
        let totalPrice = 0;
        let currentOccupiedSeats = train.occupied_seats;

        for (let i = 0; i < tickets.length; i++) {
            const dynamicPrice = calculateDynamicPrice(train.ticket_price, train.seats, currentOccupiedSeats);
            totalPrice += dynamicPrice;
            currentOccupiedSeats++;
        }

        return totalPrice;
    };

    let myName = '';
    let mySurname = '';
    if (token) {
        const decodedToken = jwtDecode(token);
        const { name } = decodedToken;
        [myName, mySurname] = name.split(' ');
    }

    const handleUseMyDataChange = () => {
        setUseMyData(!useMyData);
        if (!useMyData) {
            setTickets((prevTickets) => {
                const updatedTickets = [...prevTickets];
                updatedTickets[0] = { name: myName, surname: mySurname };
                return updatedTickets;
            });
        } else {
            setTickets((prevTickets) => {
                const updatedTickets = [...prevTickets];
                updatedTickets[0] = { name: '', surname: '' };
                return updatedTickets;
            });
        }
    };

    const handleAddTicket = () => {
        if (tickets.length < 8) {
            setTickets([...tickets, { name: '', surname: '' }]);
        }
    };

    const handleMakeOrder = (event) => {
        event.preventDefault();

        const allFieldsFilled = tickets.every(ticket => ticket.name && ticket.surname);

        if (!allFieldsFilled) {
            setOrderMessage('Please fill in all fields for each ticket.');
            return;
        }

        const token = localStorage.getItem('jwtToken');
        if (token) {
            const decoded = jwtDecode(token);
            const { id } = decoded;
            fetch(`http://localhost:8080/api/order?tickets=${getFormattedNames().join(',')}`, { // Исправленный URL
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: id,
                    train_id: train.id,
                    ticket_quantity: tickets.length,
                    total_price: getTotalPrice(),
                    payment_status: 'booked'
                })
            })
                .then(response => response.json())
                .then(data => {
                    setOrderMessage('Order placed successfully!');
                })
                .catch(error => {
                    console.error('Failed to place order:', error);
                    setOrderMessage('Failed to place order');
                });
        }
    }

    const handleTicketChange = (index, field, value) => {
        const updatedTickets = tickets.map((ticket, i) =>
            i === index ? { ...ticket, [field]: value.toUpperCase() } : ticket
        );
        setTickets(updatedTickets);
    };

    const handleRemoveTicket = (index) => {
        setTickets(tickets.filter((_, i) => i !== index));
    };

    const getFormattedNames = () => {
        return tickets.map(ticket => `${ticket.name} ${ticket.surname}`.toUpperCase());
    };

    useEffect(() => {
        if (tickets.length > 0) {
            const currentOccupiedSeats = train.occupied_seats + tickets.length - 1; // Місця для останнього квитка
            const lastTicketPrice = calculateDynamicPrice(train.ticket_price, train.seats, currentOccupiedSeats);
            setNewCurrentPrice(lastTicketPrice);
        }
    }, [tickets, train]);

    return (

        <div>
            <h2 className="title">Order</h2>

            {train && (
                <div className="train-order-card">
                    <div className="train-info">
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="value">{railwayName}</span>
                            </div>
                        </div>
                        <div className="train-info-list">
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
                            <div className="info-section">
                                <span className="label">Departure</span>
                                <span
                                    className="value">{new Date(train.departure_date).toLocaleDateString()} {train.departure_time.slice(0, -3)}</span>
                            </div>
                            <div className="info-section">
                                <span className="label">Arrival</span>
                                <span
                                    className="value">{new Date(train.arrival_date).toLocaleDateString()} {train.arrival_time.slice(0, -3)}</span>
                            </div>
                            <div className="info-section">
                                <span className="label">Train</span>
                                <span className="value">{train.train_number}</span>
                            </div>
                            <div className="info-section">
                                <span className="label">Seats</span>
                                <span className="value">{train.seats}</span>
                            </div>
                            <div className="info-section">
                                <span className="label">Free seats</span>
                                <span className="value">{train.seats - train.occupied_seats}</span>
                            </div>
                        </div>
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="label-price">Price</span>
                                <span className="value-price">{train.ticket_price} UAH</span>
                            </div>
                            <div className="info-section">
                                <span className="label-price">Current Price</span>
                                <span className="value-price">{newCurrentPrice} UAH</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-wrapper">
                        <div className="form-container">
                            <label className="use-my-data">
                                <input
                                    type="checkbox"
                                    checked={useMyData}
                                    onChange={handleUseMyDataChange}
                                />
                                <span className="checkbox-box"></span>
                                <span>Use my data</span>
                            </label>

                            {tickets.map((ticket, index) => (
                                <div key={index} className="ticket">
                                    <h3>Ticket {index + 1}</h3>
                                    <div className="name-surname-container">
                                        <label>
                                            Name:
                                            <input
                                                type="text"
                                                className="ticket-input"
                                                value={ticket.name}
                                                onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                                                disabled={useMyData && index === 0}
                                            />
                                        </label>
                                        <label>
                                            Surname:
                                            <input
                                                type="text"
                                                className="ticket-input"
                                                value={ticket.surname}
                                                onChange={(e) => handleTicketChange(index, 'surname', e.target.value)}
                                                disabled={useMyData && index === 0}
                                            />
                                        </label>
                                    </div>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTicket(index)}
                                            className="remove-ticket-button"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}

                            {tickets.length < 8 && (
                                <button type="button" onClick={handleAddTicket} className="add-ticket-button">
                                    + Add new ticket
                                </button>
                            )}

                            <div className="total-price">
                                <strong>Total price: </strong> {getTotalPrice()} UAH
                            </div>

                            <button type="button" onClick={handleMakeOrder} className="order-button">
                                Order
                            </button>
                            {orderMessage && <p>{orderMessage}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Order;