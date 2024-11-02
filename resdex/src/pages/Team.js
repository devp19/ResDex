import React from 'react';
import Fenil from '../images/FenilPFP.png'
import Dev from '../images/dev.png'
const Team = () => {
    return (
        <div>
            <div className='center' style={{ fontSize: "50px", marginTop: "30px" }}>ResDex | Team</div>
            <p className='center' style={{fontSize: '23px', marginTop: '20px'}}>Meet the creators of ResDex!</p>
            <div className='row'>
            <div className='col-md-4 d-flex flex-column align-items-center'>
    <div className="profile-pic">
        <img 
            src={Dev} 
            alt="Profile of Dev Patel" 
            className="profile-img"
        />
    </div>
    <p className="profile-name">Dev Patel</p>
    <p className="profile-position">Co-Founder &</p>
    <p className="profile-position minus">Full-Stack Developer</p>
                        
                       
              
                    </div>   



                    <div className='col-md-4 d-flex flex-column align-items-center'>
    <div className="profile-pic">
        <img 
            src={Fenil} 
            alt="Profile of Fenil Shah" 
            className="profile-img"
        />
    </div>
    <p className="profile-name">Fenil Shah</p>
    <p className="profile-position">Co-Founder &</p>
    <p className="profile-position minus">Project Manager</p>
              
                    </div>
                    <div className='col-md-4 d-flex flex-column align-items-center'>
                        <div className="profile-pic"></div>
                        <p className="profile-name">Deep Patel</p>
                        <p className="profile-position">Medical Outsourcing</p>
                    </div>
                </div>  

             
                <div className='row justify-content-center align-items-center' style={{ marginTop: '50px' }}>
                    <div className='col-md-4 d-flex flex-column align-items-center'>
                        <div className="profile-pic"></div>
                        <p className="profile-name">Bhavi Singh</p>
                        <p className="profile-position">Medical Outsourcing</p>
                    </div>
                    <div className='col-md-4 d-flex flex-column align-items-center '>
                        <div className="profile-pic"></div>
                        <p className="profile-name">Rishi Patel</p>
                        <p className="profile-position">Developer</p>
                    </div>
                </div> 

                <div className="horizontal-line"></div> 
<div className='container'>
                <div className="row d-flex justify-content-center pt-4">

    <div className="col-md-4 d-flex flex-column align-items-center profile-card">
        <h3>Dev Patel</h3>
        <p style={{color: 'black'}}>I'm a 2nd-year CS student at Toronto Metropolitan University, passionate about AI in healthcare and tech innovation.</p>
        <button className="social-button">LinkedIn</button>
        <button className="social-button">GitHub</button>
    </div>

    <div className="col-md-4 d-flex flex-column align-items-center profile-card">
        <h3>Fenil Shah</h3>
        <p style={{color: 'black'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>        <button className="social-button">LinkedIn</button>
        <button className="social-button">GitHub</button>
    </div>

    <div className="col-md-4 d-flex flex-column align-items-center profile-card">
        <h3>Deep Patel</h3>
        <p style={{color: 'black'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>        <button className="social-button">LinkedIn</button>
        <button className="social-button">GitHub</button>
    </div>
    
</div>



<div className="row d-flex justify-content-center pt-4">
    
<div className="col-md-4 d-flex flex-column align-items-center profile-card" >
        <h3>Bhavi Singh</h3>
        <p style={{color: 'black'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <button className="social-button">LinkedIn</button>
        <button className="social-button">GitHub</button>
    </div>

    <div className="col-md-4 d-flex flex-column align-items-center profile-card" >
        <h3>Rishi Patel</h3>
        <p style={{color: 'black'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>        <button className="social-button">LinkedIn</button>
        <button className="social-button">GitHub</button>
    </div>
    
</div>
            </div>  
            </div>
    );
}

export default Team;
            
            

