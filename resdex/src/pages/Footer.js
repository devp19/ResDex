import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FooterIcon from '../images/logo-icon.png';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Footer = () => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');


    return (
        <div>
            <div className='last-container'>
                <img className="img-fluid" id="navbar-logo" src={FooterIcon} alt='ResDex Logo' />
                <p className='primary medium monarque' style={{marginLeft: '15px', marginTop: '12px'}}> ResDex</p>
            </div>
            
            <div>
                <div className='row d-flex justify-content-center' style={{lineHeight: '70px'}}>
                        <Link className='link col-md-2 text-center m-2' to="/about"><span className='primary footeranimate'>About</span></Link>
                        <Link className='link col-md-2 text-center m-2' to="/team"><span className='primary footeranimate'>Team</span></Link>
                        <Link className='link col-md-2 text-center m-2' to="/contact"><span className='primary footeranimate'>Contact</span></Link>
                        <Link className='link col-md-2 text-center m-2' to="/releasedocs"><span className='primary footeranimate'>Releases</span></Link>
                    
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