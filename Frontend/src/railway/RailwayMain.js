import '../styles/Main.css';
import { jwtDecode } from "jwt-decode";
import logoImage from "../resources/railway-black-icon.png";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import RailwayHome from "./RailwayHome";
import Train from "./Train";

function RailwayMain() {
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');
    const decodedToken = jwtDecode(token);
    const { role, name } = decodedToken;
    const user = { name };

    const [activePage, setActivePage] = useState('home');
    const [selectedTrain, setSelectedTrain] = useState(null);

    const renderTemporaryContent = () => (
        <div className="temporary-message">
            <h2>Your account is not verified. Please contact the administration to get full access.</h2>
        </div>
    );

    const renderContent = () => {
        switch (activePage) {
            case 'home':
                return <RailwayHome onViewClick={handleViewClick} />;
            case 'train':
                return <Train train={selectedTrain}/>;
            default:
                return <RailwayHome onViewClick={handleViewClick} />;
        }
    };

    const handleViewClick = (train) => {
        setSelectedTrain(train);
        setActivePage('train');
    };

    return (
        <div className="user-page">
            <header className="header">
                <div className="header-left" onClick={() => {
                    navigate('/railway/main');
                    window.location.reload();
                }}>
                    <div className="logo">
                        <span>Ukrainian</span>
                        <span>Low-cost</span>
                        <span>Railway</span>
                    </div>
                    <img src={logoImage} alt="logo" className="logoImage"/>
                </div>
                <div className="header-right">
                    <button className="login-button" onClick={() => navigate('/railway/cabinet')}>{user.name}</button>
                </div>
            </header>

            <div className="main-content">
                {role === 'RAILWAY' ? renderContent() : renderTemporaryContent()}
            </div>
        </div>
    );
}

export default RailwayMain;
