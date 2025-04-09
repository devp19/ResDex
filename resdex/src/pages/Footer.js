import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FooterIcon from '../images/logo-icon.png';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Footer = () => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setUsername(userData.username);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUsername('');
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <div className='last-container'>
                <img className="img-fluid" id="navbar-logo" src={FooterIcon} alt='ResDex Logo' />
                <p className='primary medium monarque' style={{marginLeft: '15px', marginTop: '12px'}}> ResDex</p>
            </div>
            
            <div>
                <div className='row d-flex justify-content-center' style={{lineHeight: '40px'}}>
                    <div className='col-md-2 text-center'>
                        <Link className='link' to="/about"><span className='primary'>About</span></Link>
                    </div>
                    <div className='col-md-2 text-center'>
                        <Link className='link' to="/team"><span className='primary'>Team</span></Link>
                    </div>
                    <div className='col-md-2 text-center'>
                        <Link className='link' to="/contact"><span className='primary'>Contact</span></Link>
                    </div>
                    <div className='col-md-2 text-center'>
                        <Link className='link' to="/releasedocs"><span className='primary'>Releases</span></Link>
                    </div>
                </div>
            </div>
            <div className="center primary">
                <br></br>
                <br></br>
                ©2025, ResDex. All Rights Reserved.
            </div>
            <div className="center text-center reduce primary">
                By using this website, you accept our Terms of Use and Privacy Policy.
            </div>
        </div>
    );
};

export default Footer;