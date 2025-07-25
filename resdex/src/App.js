import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './pages/Navbar';
import Login from './pages/Login';
import Footer from './pages/Footer';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Search from './pages/Search';
import Signup from './pages/signup';
import Profile from './pages/Profile';
import Create from './pages/Create';
import Recovery from './pages/recovery';
import Success from './pages/Success';
import ReleaseDocs from './pages/ReleaseDocs';
import ReleaseInfo from './pages/ReleaseInfo';
import V101 from './Releases/V101';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import PrivateRoute from './pages/privateroute';
import { Logo } from './components/common';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function MobileMessage() {
  return (
    <div>
      <div className="center-container">
        <div className="text-center">
          <Logo />
          <h1 className="primary monarque">ResDex</h1>
          <p className="primary mt-3">Check out ResDex on a larger screen!</p>
          <p className="primary text-muted">Thanks for visiting early!</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet/mobile breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Show mobile message if screen is too small
  if (isMobile) {
    return <MobileMessage />;
  }

  // const [accessCode, setAccessCode] = useState('');
  // const [hasAccess, setHasAccess] = useState(false);

  // const handleAccessCodeSubmit = (e) => {
  //   e.preventDefault();
  //   if (accessCode === process.env.REACT_APP_ACCESS_CODE) {
  //     setHasAccess(true);
  //   } else {
  //     alert('Incorrect access code');
  //   }
  // };

  // if (!hasAccess) {
//     return (
//       <div style={{ textAlign: 'center', marginTop: '20%' }}>
//         <h1 className='primary monarque'>You're Early!</h1>
//         <p className='primary'>ResDex is currently in development mode. <br></br>Please check out our LinkedIn for more updates!</p>

//         <form onSubmit={handleAccessCodeSubmit}>
//           <input
//           className='primary'
//           style={{borderRadius: '5px', padding: '5px', marginTop: '20px', border: '1px solid black'}}
//             type="password"
//             value={accessCode}
//             onChange={(e) => setAccessCode(e.target.value)}
//             placeholder="Early Access Code"
//           />
//           <br></br>
// <button type='submit' className="custom" style={{marginBottom: '20px' }}>
//                 Enter
//               </button>        </form>
//       </div>
//     );
//   }

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
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
            <Route path="/messages" 
              element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              } 
            />
            <Route path="/search" element={<Search />} />
            <Route path="/success" element={<Success />} />
            <Route path="/create" element={<Create />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/releasedocs" element={<ReleaseDocs />} />
            <Route path="/releasedocs/:versionId" element={<ReleaseInfo />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Routes>
          <Footer />
        </>
      </div>
    </Router>
  );
}
export default App;
