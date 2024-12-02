import React from "react";
import {Route, Routes, Navigate} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./Login";
import SignUp from "./SignUp";
import SignUpRailway from "./SignUpRailway";
import Main from "./Main";
import Cabinet from "./Cabinet";
import RailwayMain from "./railway/RailwayMain";
import RailwayCabinet from "./railway/RailwayCabinet";
import AdminMain from "./admin/AdminMain";

function App() {

    const useAuth = (requiredRole) => {
        const token = localStorage.getItem('jwtToken');
        if (!token) return false;
        const decodedToken = jwtDecode(token);
        return decodedToken.role === requiredRole;
    };

    const ProtectedRoute = ({ children, role }) => {
        const hasPermission = useAuth(role);
        if (!hasPermission) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <Routes>
            <Route path="/" element={<ProtectedRoute role="private"></ProtectedRoute>} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signuprailway" element={<SignUpRailway />} />
            <Route path="/login" element={<Login />} />
            <Route path="/main" element={<Main />} />
            <Route path="/cabinet" element={<ProtectedRoute role="CLIENT"><Cabinet /></ProtectedRoute>} />
            <Route path="/railway/main" element={<ProtectedRoute role="RAILWAY"><RailwayMain /></ProtectedRoute>} />
            <Route path="/railway/cabinet" element={<ProtectedRoute role="RAILWAY"><RailwayCabinet /></ProtectedRoute>} />
            <Route path="/admin/main" element={<ProtectedRoute role="ADMIN"><AdminMain /></ProtectedRoute>} />
        </Routes>
    );
}

export default App;
