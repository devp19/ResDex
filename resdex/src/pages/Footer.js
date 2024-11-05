import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FooterIcon from '../images/logo.png';
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
            </div>
            
            <div className='center'>
                <div className='row d-flex justify-content-center' style={{lineHeight: '40px'}}>
                    <div className='col-md-2 left'>
                        <Link className='link' to="/about">About</Link>
                    </div>
                    <div className='col-md-2 left'>
                        <Link className='link' to="/team">Team</Link>
                    </div>
                    <div className='col-md-2 left'>
                        <Link className='link' to="/contact">Contact</Link>
                    </div>
                    <div className='col-md-2 left'>
                        <Link className='link' to="/releasedocs">Releases</Link>
                    </div>
                </div>
            </div>
            <div className="center">
                ©2024, ResDex. All Rights Reserved.
            </div>
            <div className="center reduce">
                By using this website, you accept our Terms of Use and Privacy Policy.
            </div>
        </div>
    )
}

export default Footer;