import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './pages/Navbar'; // Updated import path to 'components'
import News from './pages/News';
import Login from './pages/Login';
import Footer from './pages/Footer';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  const checkMobileDevice = () => {
    const mobileWidth = 768; // Set threshold for mobile devices
    setIsMobile(window.innerWidth < mobileWidth);
  };

  useEffect(() => {
    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    
    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', checkMobileDevice);
  }, []);

  return (
    <Router>
      <div className="App">
        {isMobile ? (
          <div className="center-container">
            ResDex → Mobile Soon!
            <br></br>
            <br></br>
          </div>
        ) : (
          <>
          
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/news" element={<News />} />
              <Route path="/login" element={<Login />} />
            </Routes>
            <Footer />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
