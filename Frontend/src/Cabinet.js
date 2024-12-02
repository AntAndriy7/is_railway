import './styles/Main.css';
import logoImage from './resources/railway-black-icon.png';
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import PersonalInformation from "./PersonalInformation";
import PersonalOrders from "./PersonalOrders";

function Cabinet() {
    const navigate = useNavigate();

    const [activePage, setActivePage] = useState('personalInformation');

    const renderContent = () => {
        switch (activePage) {
            case 'personalOrders':
                return <PersonalOrders />;
            case 'personalInformation':
                return <PersonalInformation />;
            default:
                return <PersonalOrders />;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/main');
    }

    const buttonStyle = (page) => ({
        width: '150px',
        height: '50px',
        fontSize: '16px',
        backgroundColor: '#4d4d50',
        color: activePage === page ? '#EBD3F8' : '#ffffff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    });

    return (
        <div className="user-page">
            <header className="header">
                <div className="header-left" onClick={() => navigate('/main')}>
                    <div className="logo">
                        <span>Ukrainian</span>
                        <span>Low-cost</span>
                        <span>Railway</span>
                    </div>
                    <img src={logoImage} alt="logo" className="logoImage"/>
                </div>
                <div className="header-right">
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <div className="main-content">
                <div className="nav-container">
                    <div className="button-container">
                        <button style={buttonStyle('personalOrders')} onClick={() => setActivePage('personalOrders')}> My Orders </button>
                        <button style={buttonStyle('personalInformation')} onClick={() => setActivePage('personalInformation')}>Profile</button>
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
}

export default Cabinet;
