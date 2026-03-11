import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import BestCrop from "./components/BestCrop";
import Home from "./components/Home";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import Register from "./components/Register";
import YieldPredictor from "./components/YieldPredictor";

// The Security Guard Component (Same as before)


export default function App() {
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') == 'true');

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('userToken'); // Assuming you stored the token here

    try {
      const response = await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      if (response.ok) {
        console.log(response.data); // "You Logged Out Successfully"
        // Clear token from storage after success
        localStorage.removeItem('token');
        const keysToRemove = ["userToken", "userId", "userName", "userEmail", "isLoggedIn", "userDistrict", "userSoilType", "userArea"];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        setIsLoggedIn(false);
      } else {
        console.error("Logout failed:", data.message || 'Logout failed');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const ProtectedRoute = ({ isLoggedIn, children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };
  const PublicRoute = ({ isLoggedIn, children }) => {
    if (isLoggedIn) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app-container">
        <h1 className="app-header">{t('app.title')}</h1>

        <nav className="app-nav">

          {/* LOGIC: IF LOGGED IN -> Show Menu + Profile. IF NOT -> Show Login/Register */}
          {isLoggedIn ? (
            <>
              {/* 1. These links are now HIDDEN from guests */}
              <Link to="/">{t('nav.home')}</Link> |{" "}
              <Link to="/best-crop">{t('nav.bestCrop')}</Link> |{" "}
              <Link to="/yield-predictor">{t('nav.yieldPredictor')}</Link> |{" "}

              {/* 2. User Profile & Logout */}
              <span className="user-menu">
                <Link to="/profile" className="profile-link">
                  <div className="profile-icon">👤</div>
                </Link>
                <button onClick={handleLogout} style={{ marginLeft: '10px' }}>{t('nav.logout')}</button>
              </span>
            </>
          ) : (
            // 3. Guest View
            <>
              <Link to="/login">{t('nav.login')}</Link> |{" "}
              <Link to="/register">{t('nav.register')}</Link>
            </>
          )}

          {/* Language Switcher */}
          <span style={{ marginLeft: '20px' }}>
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              style={{ padding: '5px', borderRadius: '4px' }}
            >
              <option value="en">{t('language.en')}</option>
              <option value="hi">{t('language.hi')}</option>
              <option value="bn">{t('language.bn')}</option>
            </select>
          </span>

        </nav>

        <Routes>
          {/* Routes remain protected as before */}
          <Route path="/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Home /></ProtectedRoute>} />
          <Route path="/best-crop" element={<ProtectedRoute isLoggedIn={isLoggedIn}><BestCrop /></ProtectedRoute>} />
          <Route path="/yield-predictor" element={<ProtectedRoute isLoggedIn={isLoggedIn}><YieldPredictor /></ProtectedRoute>} />

          <Route path="/login" element={<PublicRoute isLoggedIn={isLoggedIn}><Login setIsLoggedIn={setIsLoggedIn} /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute isLoggedIn={isLoggedIn}><Register /></PublicRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}