import './styles/Main.css';
import { jwtDecode } from "jwt-decode";
import logoImage from "./resources/railway-black-icon.png";
import {useNavigate} from "react-router-dom";
import Home from "./Home";
import cabinetImage from "./resources/cabinet.png";
import {useState} from "react";
import Order from "./Order";

function Main() {
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');
    let user = null;

    try {
        if (token) {
            const decodedToken = jwtDecode(token);
            const { name } = decodedToken;
            user = { name };
        }
    } catch (error) {
        console.error("Invalid token", error);
    }

    const [activePage, setActivePage] = useState('home');
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [selectedRailway, setSelectedRailway] = useState(null);

    const renderContent = () => {
        switch (activePage) {
            case 'home':
                return <Home onOrderClick={handleOrderClick} />;
            case 'order':
                return <Order train={selectedTrain} railwayName={selectedRailway}/>;
            default:
                return <Home onOrerClick={handleOrderClick} />;
        }
    };

    const handleOrderClick = (train, railwayName) => {
        setSelectedTrain(train);
        setSelectedRailway(railwayName);
        setActivePage('order');
    };

    return (
        <div className="user-page">
            <header className="header">
                <div className="header-left" onClick={() => {
                    navigate('/main');
                    window.location.reload();}}>
                    <div className="logo">
                        <span>Ukrainian</span>
                        <span>Low-cost</span>
                        <span>Railway</span>
                    </div>
                    <img src={logoImage} alt="logo" className="logoImage"/>
                </div>
                <div>
                    {user ? (
                        <button className="login-button" onClick={() => navigate('/cabinet')}>{user.name}
                            <img src={cabinetImage} alt="logo" className="cabinetImage"/>
                        </button>
                    ) : (
                        <button className="login-button" onClick={() => navigate('/login')}>Login</button>
                    )}
                </div>
            </header>

            <div className="main-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default Main;
