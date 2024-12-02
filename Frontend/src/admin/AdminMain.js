import '../styles/Main.css';
import logoImage from "../resources/railway-black-icon.png";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import AdminHome from "./AdminHome";
import AdminTrain from "./AdminTrain";
import OutdatedAccounts from "./OutdatedAccounts";

function AdminMain() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('home');
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const renderContent = () => {
        switch (activePage) {
            case 'home':
                return <AdminHome onViewClick={handleViewClick} />;
            case 'accounts':
                return <OutdatedAccounts />;
            case 'train':
                return <AdminTrain train={selectedTrain} companyName={selectedCompany}/>;
            default:
                return <AdminHome onViewClick={handleViewClick} />;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login');
    }

    const handleViewClick = (train, companyName) => {
        setSelectedTrain(train);
        setSelectedCompany(companyName);
        setActivePage('train');
    };

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
                <div className="header-left" onClick={() => {
                    navigate('/admin/main');
                    window.location.reload();
                }}>
                    <div className="logo">
                        <span>Ukrainian</span>
                        <span>Low-cost</span>
                        <span>Railway</span>
                    </div>
                    <img src={logoImage} alt="logo" className="logoImage"/>
                </div>
                <div className="header-center">
                    <h2>ADMIN PAGE</h2>
                </div>
                <div className="header-right">
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <div className="main-content">
                <div className="nav-container">
                    <div className="button-container">
                        <button style={buttonStyle('home')}
                                onClick={() => setActivePage('home')}> Home
                        </button>
                        <button style={buttonStyle('accounts')}
                                onClick={() => setActivePage('accounts')}> Outdated Accounts
                        </button>
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
}

export default AdminMain;
