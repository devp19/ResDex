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
                    
                    <a className='link' href="/about">
                    About
                    </a>
                </div>
                <div className='col-md-2 left'>
                    <a className='link' href="/news">
                    News
                    </a>
                </div>
                <div className='col-md-2 left'>
                    <a className='link' href="/team">
                    Team
                    </a>
                </div>
                <div className='col-md-2 left'>
                    <a className='link' href="/contact">
                    Contact
                    </a>
                </div>
            </div>
            </div>
        </div>
    )
}

export default Footer;