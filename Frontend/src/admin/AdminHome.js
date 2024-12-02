import React, { useEffect, useState } from 'react';
import '../styles/Home.css';

function AdminHome({ onViewClick }) {
    const [trains, setTrains] = useState([]);
    const [companys, setCompanys] = useState({});
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        dateFrom: '',
        dateTo: '',
        minPrice: '',
        maxPrice: ''
    });

    const fetchTrains = () => {
        const token = localStorage.getItem('jwtToken');

        fetch(`http://localhost:8080/api/train`, {
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

    const fetchCompanyById = (railwayId) => {
        const token = localStorage.getItem('jwtToken');

        if (companys[railwayId]) {
            return Promise.resolve(companys[railwayId]);
        }

        return fetch(`http://localhost:8080/api/user/${railwayId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                setCompanys(prevCompanys => ({
                    ...prevCompanys,
                    [railwayId]: data.name
                }));
                return data.name;
            })
            .catch(error => {
                setError(`Failed to fetch company with ID ${railwayId}`);
                return 'Unknown Company';
            });
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

    useEffect(() => {
        fetchTrains();
    }, []);

    useEffect(() => {
        trains.forEach((train) => {
            if (!companys[train.railway_id]) {
                fetchCompanyById(train.railway_id);
            }
        });
    }, [trains]);

    return (
        <div>
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
                                    <span className="value">{companys[train.railway_id] || 'Loading...'}</span>
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
                                    <span className="label-price">Status</span>
                                    <span className="value-price">{train.status ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="info-section">
                                    <span className="label-price">Price</span>
                                    <span className="value-price">{train.ticket_price} UAH</span>
                                </div>
                            </div>
                        </div>
                        <button className="order-button" onClick={() => onViewClick(train, companys[train.railway_id])}>View
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminHome;