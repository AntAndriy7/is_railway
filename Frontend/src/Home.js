import React, { useEffect, useState } from 'react';
import './styles/Home.css';

function Home({ onOrderClick }) {

    /*const [trains, setTrains] = useState([
        {
            id: 1,
            departure: 'Kyiv',
            destination: 'Lviv',
            departure_date: '2024-11-08',
            departure_time: '08:30:00',
            arrival_date: '2024-11-08',
            arrival_time: '14:30:00',
            train_number: '123',
            seats: 100,
            occupied_seats: 16,
            ticket_price: 250,
            railway_id: 1
        },
        {
            id: 2,
            departure: 'Kyiv',
            destination: 'Odessa',
            departure_date: '2024-11-09',
            departure_time: '10:00:00',
            arrival_date: '2024-11-09',
            arrival_time: '18:00:00',
            train_number: '456',
            seats: 80,
            occupied_seats: 20,
            ticket_price: 300,
            railway_id: 2
        },
        {
            id: 3,
            departure: 'Lviv',
            destination: 'Kharkiv',
            departure_date: '2024-11-10',
            departure_time: '09:45:00',
            arrival_date: '2024-11-10',
            arrival_time: '20:15:00',
            train_number: '789',
            seats: 120,
            occupied_seats: 70,
            ticket_price: 500,
            railway_id: 1
        }
    ]);*/

    const [trains, setTrains] = useState([]);
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        dateFrom: '',
        dateTo: '',
        minPrice: '',
        maxPrice: ''
    });

    const [error, setError] = useState(null);
    const [railways, setRailways] = useState({});

    const fetchTrains = () => {
        fetch(`http://localhost:8080/api/train/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const sortedData = data.sort((a, b) => {
                        const A = new Date(a.departure_date + 'T' + a.departure_time);
                        const B = new Date(b.departure_date + 'T' + b.departure_time);
                        return A - B;
                    });
                    setTrains(sortedData);
                } else {
                    setError('Unexpected response format');
                }
            })
            .catch(error => {
                setError('Failed to fetch trains');
            });
    };

    const fetchRailwayById = (railwayId) => {
        if (railways[railwayId]) {
            return Promise.resolve(railways[railwayId]);
        }

        return fetch(`http://localhost:8080/api/user/${railwayId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                setRailways(prevRailways => ({
                    ...prevRailways,
                    [railwayId]: data.name
                }));
                return data.name;
            })
            .catch(error => {
                setError(`Failed to fetch railway with ID ${railwayId}`);
                return 'Unknown Railway';
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

    // Логіка фільтрації потягів
    const filteredTrains = trains.filter(train => {
        const matchesFrom = !filters.from || train.departure.toLowerCase().includes(filters.from.toLowerCase());
        const matchesTo = !filters.to || train.destination.toLowerCase().includes(filters.to.toLowerCase());
        const matchesDateFrom = !filters.dateFrom || new Date(train.departure_date) >= new Date(filters.dateFrom);
        const matchesDateTo = !filters.dateTo || new Date(train.departure_date) <= new Date(filters.dateTo);
        const matchesMinPrice = !filters.minPrice || train.ticket_price >= filters.minPrice;
        const matchesMaxPrice = !filters.maxPrice || train.ticket_price <= filters.maxPrice;
        return matchesFrom && matchesTo && matchesDateFrom && matchesDateTo && matchesMinPrice && matchesMaxPrice;
    });

    const calculateDynamicPrice = (basePrice, occupiedSeats, totalSeats) => {
        const occupancyRate = occupiedSeats / totalSeats; // Співвідношення зайнятих місць
        const priceIncreaseFactor = 1 + occupancyRate * 0.5; // Наприклад, ціна збільшується на 50% при повній зайнятості
        return Math.round(basePrice * priceIncreaseFactor);
    };

    const enhancedTrains = filteredTrains.map(train => ({
        ...train,
        dynamicPrice: calculateDynamicPrice(train.ticket_price, train.occupied_seats, train.seats),
    }));

    useEffect(() => {
        fetchTrains();
    }, []);

    useEffect(() => {
        trains.forEach((train) => {
            if (!railways[train.railway_id]) {
                fetchRailwayById(train.railway_id);
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
                {enhancedTrains.map((train) => (
                    <div className="train-card" key={train.id}>
                        <div className="train-info">
                            <div className="train-info-list">
                                <div className="info-section">
                                    <span className="value-company">{railways[train.railway_id] || 'Loading...'}</span>
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
                                    <span className="label-price">Starting</span>
                                    <span className="value-price">{train.ticket_price} UAH</span>
                                </div>
                                <div className="info-section">
                                    <span className="label-price">Current Price</span>
                                    <span className="value-price">{train.dynamicPrice} UAH</span>
                                </div>
                            </div>
                        </div>
                        <button className="order-button" onClick={() => onOrderClick(train)}>Order</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
