import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import {jwtDecode} from "jwt-decode";

function RailwayHome({ onViewClick }) {

    const [trains, setTrains] = useState([]);
    const [error, setError] = useState(null);
    const [isAddVisible, setIsAddVisible] = useState(false);
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        dateFrom: '',
        dateTo: '',
        minPrice: '',
        maxPrice: ''
    });
    const [formValues, setFormValues] = useState({
        departure: '',
        destination: '',
        train_number: '',
        departure_date: '',
        departure_time: '',
        arrival_date: '',
        arrival_time: '',
        ticket_price: '',
        seats: '',
    });

    const fetchTrains = () => {
        const token = localStorage.getItem('jwtToken');
        const decoded = jwtDecode(token);
        const railwayId = decoded.id;

        fetch(`http://localhost:8080/api/train/railway/${railwayId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const sortedTrains = data.sort((a, b) => {
                        if (a.status !== b.status) {
                            return b.status - a.status;
                        }

                        const dateA = new Date(a.departure_date + 'T' + a.departure_time);
                        const dateB = new Date(b.departure_date + 'T' + b.departure_time);

                        if (a.status) {
                            return dateA - dateB;
                        }

                        return dateB - dateA;
                    });
                    setTrains(sortedTrains);
                } else {
                    setError('Unexpected response format');
                }
            })
            .catch(error => {
                setError('Failed to fetch trains');
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            from: '',
            to: '',
            dateFrom: '',
            dateTo: '',
            minPrice: '',
            maxPrice: ''
        });
    };

    const filteredTrains = trains.filter(train => {
        const matchesFrom = !filters.from || train.departure.toLowerCase().includes(filters.from.toLowerCase());
        const matchesTo = !filters.to || train.destination.toLowerCase().includes(filters.to.toLowerCase());
        const matchesDateFrom = !filters.dateFrom || new Date(train.departure_date) >= new Date(filters.dateFrom);
        const matchesDateTo = !filters.dateTo || new Date(train.departure_date) <= new Date(filters.dateTo);
        const matchesMinPrice = !filters.minPrice || train.ticket_price >= filters.minPrice;
        const matchesMaxPrice = !filters.maxPrice || train.ticket_price <= filters.maxPrice;
        return matchesFrom && matchesTo && matchesDateFrom && matchesDateTo && matchesMinPrice && matchesMaxPrice;
    });

    const handleConfirmAdd = async () => {
        //console.log(formValues);
        const { departure, destination, train_number, departure_date, departure_time,
            arrival_date, arrival_time, ticket_price, seats } = formValues;

        if (!departure || !destination || !train_number || !departure_date || !departure_time || !arrival_date || !arrival_time || !ticket_price || !seats) {
            console.log(formValues);
            alert('Please fill in all fields.');
            return;
        }

        const formattedDepartureTime = departure_time.includes(':') && departure_time.split(':').length === 2
            ? `${departure_time}:00`
            : departure_time;
        const formattedArrivalTime = arrival_time.includes(':') && arrival_time.split(':').length === 2
            ? `${arrival_time}:00`
            : arrival_time;

        const departureDateTime = new Date(`${departure_date}T${departure_time}`);
        const arrivalDateTime = new Date(`${arrival_date}T${arrival_time}`);

        if (departureDateTime >= arrivalDateTime) {
            alert('Departure date and time must be earlier than arrival date and time.');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const decoded = jwtDecode(token);
            const railwayId = decoded.id;
            const responseOrder = await fetch(`http://localhost:8080/api/train`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    departure,
                    destination,
                    train_number,
                    departure_date,
                    departure_time: formattedDepartureTime,
                    arrival_date,
                    arrival_time: formattedArrivalTime,
                    ticket_price,
                    seats,
                    railway_id: railwayId
                }),
            });
            if (responseOrder.ok) {
                window.location.reload();
                alert('New train added successfully!');
            } else {
                alert("Failed to add train. Please try again.");
            }
        }
        catch (error) {
            alert("There was an error adding train.");
        }
    };

    useEffect(() => {
        fetchTrains();
    }, []);

    return (
        <div>
            <button
                className={`add-new-button ${isAddVisible ? 'active' : ''}`}
                onClick={() => setIsAddVisible(!isAddVisible)}>
                Add new train
            </button>
            {isAddVisible && (
                <div className="train-card">
                    <div className="train-info">
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="value-add">Add new train</span>
                            </div>
                        </div>
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="label">Departure</span>
                                <input
                                    type="text"
                                    name="departure"
                                    value={formValues.departure}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="info-section">
                                <span className="label">Destination</span>
                                <input
                                    type="text"
                                    name="destination"
                                    value={formValues.destination}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="info-section">
                                <span className="label">Train</span>
                                <input
                                    type="text"
                                    name="train_number"
                                    value={formValues.train_number}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="value-price">Departure</span>
                            </div>
                        </div>
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="label">Date</span>
                                <input
                                    type="date"
                                    name="departure_date"
                                    value={formValues.departure_date}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="info-section">
                                <span className="label">Time</span>
                                <input
                                    type="time"
                                    name="departure_time"
                                    value={formValues.departure_time}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="value-price">Arrival</span>
                            </div>
                        </div>
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="label">Date</span>
                                <input
                                    type="date"
                                    name="arrival_date"
                                    value={formValues.arrival_date}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="info-section">
                                <span className="label">Time</span>
                                <input
                                    type="time"
                                    name="arrival_time"
                                    value={formValues.arrival_time}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="value-price">Other</span>
                            </div>
                        </div>
                        <div className="train-info-list">
                            <div className="info-section">
                                <span className="label">Ticket price</span>
                                <input
                                    type="number"
                                    name="ticket_price"
                                    value={formValues.ticket_price}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="info-section">
                                <span className="label">Total seats</span>
                                <input
                                    type="number"
                                    name="seats"
                                    value={formValues.seats}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        className="confirm-button"
                        onClick={handleConfirmAdd}
                    >
                        Confirm
                    </button>
                </div>
            )}

            {error && <p className="error-message">{error}</p>}
            <div className="filter-section">
                <input
                    type="text"
                    name="from"
                    placeholder="From"
                    value={filters.from}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="to"
                    placeholder="To"
                    value={filters.to}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                />
                <button onClick={clearFilters}>Clear</button>
            </div>

            <div className="train-list">
                {filteredTrains.map((train) => (
                    <div className="train-card">
                        <div className="train-info">
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
                                    <span className="label-price">Status</span>
                                    <span className="value-price">{train.status ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="info-section">
                                    <span className="label-price">Price</span>
                                    <span className="value-price">{train.ticket_price} UAH</span>
                                </div>
                            </div>
                        </div>
                        <button className="order-button" onClick={() => onViewClick(train)}>View</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RailwayHome;