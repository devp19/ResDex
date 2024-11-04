import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './pages/Navbar';
import Login from './pages/Login';
import Footer from './pages/Footer';
import Team from './pages/Team';
import Contact from './pages/Contact';
// import PrivateRoute from './pages/privateroute';
import Search from './pages/Search';
import Signup from './pages/signup';
import Profile from './pages/Profile';
import Recovery from './pages/recovery';
import Success from './pages/Success';
import ReleaseDocs from './pages/ReleaseDocs'
import V101 from './Releases/V101'


function App() {
  const [isMobile, setIsMobile] = useState(false);

  const checkMobileDevice = () => {
    const mobileWidth = 768;
    setIsMobile(window.innerWidth < mobileWidth);
  };

  useEffect(() => {
    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    
    return () => window.removeEventListener('resize', checkMobileDevice);
  }, []);

  return (
    <Router>
      <div className="App">
        {isMobile ? (
          <div className="center-container">
            Check out Resdex on a larger screen!
            <br></br>
            <br></br>
          </div>
        ) : (
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/search" element={<Search />} />
              <Route path="/success" element={<Success />} />
              <Route path="/releasedocs" element={<ReleaseDocs />} />
              <Route path="/releasedocs/v101" element={<V101 />} />
              <Route path="/profile/:username" element={<Profile />} />

            </Routes>
            <Footer />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;