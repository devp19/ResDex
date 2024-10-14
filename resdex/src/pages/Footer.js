import React from 'react';
import FooterIcon from '../images/logo.png'

const Footer = () => {
    return (
        <div>
            <div className='last-container'>
            <img className="img-fluid" id="navbar-logo" src={FooterIcon} alt='ResDex Logo'></img>
            </div>
            
            <div className='center'>
            <div className='row'>
                <div className='col-md-2 left'>
                    About
                </div>
                <div className='col-md-2 left'>
                    News
                </div>
                <div className='col-md-2 left'>
                    Team
                </div>
                <div className='col-md-2 left'>
                    Contact
                </div>
            </div>
            </div>
        </div>
    )
}

export default Footer;