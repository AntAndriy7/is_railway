import React, { useEffect, useState } from 'react';
import './styles/Home.css';
import {jwtDecode} from "jwt-decode";

function PersonalOrders() {
    const [orders, setOrders] = useState([]);
    const [trains, setTrains] = useState({});
    const [tickets, setTickets] = useState({});
    const [companys, setCompanys] = useState({});
    const [error, setError] = useState(null);
    const [payOrderId, setPayOrderId] = useState(null);
    const [viewOrderId, setViewOrderId] = useState(null);
    const [formValues, setFormValues] = useState({
        cardNumber: '',
        cardholderName: '',
        expirationDate: '',
        cvv: '',
    });

    const token = localStorage.getItem('jwtToken');
    const decodedToken = jwtDecode(token);
    const { id } = decodedToken;

    useEffect(() => {
        fetchOrdersByClientId(id);
    }, [id]);

    const fetchOrdersByClientId = async (id) => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`http://localhost:8080/api/order/client/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const ordersData = await response.json();
            setOrders(ordersData);

            for (const order of ordersData) {
                fetchTrainById(order.train_id);
                fetchTicketsByOrderId(order.id);
            }
        } catch (error) {
            setError('Failed to fetch orders');
        }
    };

    const fetchTrainById = async (trainId) => {
        if (!trains[trainId]) {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await fetch(`http://localhost:8080/api/train/${trainId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const trainData = await response.json();
                setTrains((prevTrains) => ({ ...prevTrains, [trainId]: trainData }));

                if (!companys[trainData.railway_id]) {
                    fetchCompanyById(trainData.railway_id);
                }
            } catch (error) {
                setError('Failed to fetch train details');
            }
        }
    };

    const fetchTicketsByOrderId = async (orderId) => {
        if (!tickets[orderId]) {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await fetch(`http://localhost:8080/api/ticket/order/${orderId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const ticketsData = await response.json();
                setTickets((prevTickets) => ({ ...prevTickets, [orderId]: ticketsData }));
            } catch (error) {
                setError('Failed to fetch tickets');
            }
        }
    };

    const fetchCompanyById = async (railwayId) => {
        if (!companys[railwayId]) {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await fetch(`http://localhost:8080/api/user/${railwayId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const companyData = await response.json();
                setCompanys((prevCompanys) => ({
                    ...prevCompanys,
                    [railwayId]: companyData.name
                }));
            } catch (error) {
                setError(`Failed to fetch company with ID ${railwayId}`);
            }
        }
    };

    const handleCancel = async (orderId, trainId, ticketQuantity) => {
        const confirmed = window.confirm("Are you sure you want to cancel your order?");
        if (confirmed) {
            try {
                const token = localStorage.getItem('jwtToken');
                const responseOrder = await fetch(`http://localhost:8080/api/order/${orderId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ payment_status: 'canceled' }),
                });

                if (responseOrder.ok) {
                    const responseTrain = await fetch(`http://localhost:8080/api/train/${trainId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            occupied_seats: trains[trainId].occupied_seats - ticketQuantity,
                        }),
                    });

                    if (responseTrain.ok) {
                        setOrders((prevOrders) =>
                            prevOrders.map((order) =>
                                order.id === orderId ? { ...order, payment_status: 'canceled' } : order
                            )
                        );
                        setTrains((prevTrains) => ({
                            ...prevTrains,
                            [trainId]: {
                                ...prevTrains[trainId],
                                occupied_seats: prevTrains[trainId].occupied_seats - ticketQuantity,
                            },
                        }));
                        alert("Order successfully cancelled.");
                    } else {
                        alert("Failed to cancel your order. Please try again.");
                    }
                } else {
                    alert("Failed to cancel your order. Please try again.");
                }
            } catch (error) {
                alert("There was an error canceling your order.");
            }
        }
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const handlePayClick = (orderId) => {
        setPayOrderId(orderId === payOrderId ? null : orderId);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleConfirmPayment = async (orderId) => {
        const { cardNumber, cardholderName, expirationDate, cvv } = formValues;

        if (!cardNumber || !cardholderName || !expirationDate || !cvv) {
            alert('Please fill in all fields.');
            return;
        }
        if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
            alert('Card number must be 16 digits.');
            return;
        }
        if (cardholderName && !/^[a-zA-Z\s]+$/.test(cardholderName)) {
            alert('Cardholder name can only contain letters and spaces.');
            return;
        }
        if (expirationDate && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expirationDate)) {
            alert('Expiration date must be in MM/YY format.');
            return;
        }
        if (cvv && !/^\d{3}$/.test(cvv)) {
            alert('CVV2 must be 3 digits.');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const responseOrder = await fetch(`http://localhost:8080/api/order/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({payment_status: 'paid'}),
            });
            if (responseOrder.ok) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === orderId ? { ...order, payment_status: 'paid' } : order
                    )
                );
                alert('Payment confirmed!');
            } else {
                alert("Failed to pay your order. Please try again.");
            }
        }
        catch (error) {
            alert("There was an error paying your order.");
        }

        setPayOrderId(null);
    };

    const handleViewClick = (orderId) => {
        setViewOrderId(orderId === viewOrderId ? null : orderId);
    };

    return (
        <div className="train-list">
            {error && <p className="error-message">{error}</p>}
            {orders
                .sort((a, b) => {
                    const trainA = trains[a.train_id];
                    const trainB = trains[b.train_id];

                    return (trainB?.status === true ? 1 : 0) - (trainA?.status === true ? 1 : 0);
                })
                .map((order) => {
                    const train = trains[order.train_id];
                    const orderTickets = tickets[order.id] || [];

                    return (
                        <div>
                            <div key={order.id}
                                 className={`train-card ${(train?.status === false || order.payment_status === 'canceled') ? 'inactive' : ''}`}>
                                <div className="train-info">
                                    <div className="train-info-list">
                                        <div className="info-section">
                                            <span className="value">{companys[train?.railway_id] || 'Loading...'}</span>
                                        </div>
                                    </div>
                                    {train && (
                                        <div className="train-info-list">
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
                                                <span className="label">Total seats</span>
                                                <span className="value">{train.seats}</span>
                                            </div>
                                            <div className="info-section">
                                                <span className="label">Tickets</span>
                                                <span className="value">{order.ticket_quantity}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="train-info-list">
                                        <div className="info-section">
                                            <span className="label-price">Price</span>
                                            <span className="value-price">{order.total_price} UAH</span>
                                        </div>
                                        <div className="info-section">
                                            <span className="label-price">Status</span>
                                            <span
                                                className="value-price">{capitalizeFirstLetter(order.payment_status)}</span>
                                        </div>
                                    </div>
                                </div>
                                {train && (
                                    <div className="button-row">
                                        <button className="view-button" onClick={() => handleViewClick(order.id)}>
                                            View
                                        </button>
                                        {order.payment_status === 'booked' && train.status && (
                                            <button className="pay-button" onClick={() => handlePayClick(order.id)}>
                                                Pay
                                            </button>
                                        )}
                                        {(order.payment_status === 'booked' || order.payment_status === 'paid') && train.status && (
                                            <button className="cancel-button"
                                                    onClick={() => handleCancel(order.id, order.train_id, order.ticket_quantity)}>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {payOrderId === order.id && (
                                <div className="payment-form">
                                    <div className="train-info">
                                        <div className="train-info-list">
                                            <div className="info-section">
                                                <span
                                                    className="value">Payment Details</span>
                                            </div>
                                        </div>
                                        <div className="train-info-list">
                                            <div className="info-section">
                                                <span className="label">Card Number</span>
                                                <input
                                                    type="number"
                                                    name="cardNumber"
                                                    placeholder="****************"
                                                    value={formValues.cardNumber}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="info-section">
                                                <span className="label">Cardholder Name</span>
                                                <input
                                                    type="text"
                                                    placeholder="Name Surname"
                                                    name="cardholderName"
                                                    value={formValues.cardholderName}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="info-section">
                                                <span className="label">Expiration Date</span>
                                                <input
                                                    type="text"
                                                    name="expirationDate"
                                                    placeholder="(MM/YY)"
                                                    value={formValues.expirationDate}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="info-section">
                                                <span className="label">CVV2</span>
                                                <input
                                                    type="number"
                                                    name="cvv"
                                                    placeholder="***"
                                                    value={formValues.cvv}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="confirm-button"
                                        onClick={() => handleConfirmPayment(order.id)}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            )}
                            {viewOrderId === order.id && (
                                <div className="tickets-container">
                                    {orderTickets.map((ticket) => {
                                        const [firstName, lastName] = ticket.name.split(' ');
                                        return (
                                            <div key={ticket.id} className="ticket-card">
                                                <div className="train-info">
                                                    <div className="train-info-list">
                                                        <div className="info-section">
                                                            <span className="label-price">Name</span>
                                                            <span className="value-price">{firstName}</span>
                                                        </div>
                                                        <div className="info-section">
                                                            <span className="label-price">Surname</span>
                                                            <span className="value-price">{lastName}</span>
                                                        </div>
                                                    </div>
                                                    <div className="train-info-list">
                                                        <div className="info-section">
                                                            <span className="label-price">Seat</span>
                                                            <span className="value-price">{ticket.seat_number}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })
            }
        </div>
    );
}

export default PersonalOrders;
