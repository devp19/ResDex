import React from 'react';
import Fenil from '../images/FenilPFP.png'
import Dev from '../images/dev.png'
const Team = () => {
    return (
        <div>
            <div className='center primary monarque' style={{ fontSize: "50px", marginTop: "30px" }}>ResDex – Team</div>
            <p className='center primary' style={{fontSize: '15px'}}>Meet the creators of ResDex!</p>
            <div className='row d-flex justify-content-center display'>
            <div className='col-md-3 d-flex flex-column align-items-center box right'>
    <div className="profile-pic">
        <img 
            src={Dev} 
            alt="Profile of Dev Patel" 
            className="profile-img"
        />
    </div>
    <p className="profile-name primary">Dev Patel</p>
    <p className="profile-position">Co-Founder &</p>
    <p className="profile-position minus">Full-Stack Developer</p>
    <button className="custom-view">LinkedIn</button>
        <button className="custom-view mt-2">GitHub</button>
                        
                       
              
                    </div>   



                    <div className='col-md-3 d-flex flex-column align-items-center box right'>
    <div className="profile-pic">
        <img 
            src={Fenil} 
            alt="Profile of Fenil Shah" 
            className="profile-img"
        />
    </div>
    <p className="profile-name primary">Fenil Shah</p>
    <p className="profile-position">Co-Founder &</p>
    <p className="profile-position minus">Project Manager</p>
    <button className="custom-view">LinkedIn</button>
        <button className="custom-view mt-2">GitHub</button>
                    </div>
                    <div className='col-md-3 d-flex flex-column align-items-center box'>
                        <div className="profile-pic"></div>
                        <p className="profile-name primary">Deep Patel</p>
                        <p className="profile-position">Medical Outsourcing</p><br></br>
                        <button className="custom-view">LinkedIn</button>
                        <button className="custom-view mt-2">Email</button>

                    </div>
                </div>  

             
                <div className='row justify-content-center align-items-center pt-4'>
                    <div className='col-md-3 box d-flex flex-column align-items-center right'>
                        <div className="profile-pic"></div>
                        <p className="profile-name primary">Bhavi Singh</p>
                        <p className="profile-position">Medical Outsourcing</p>
                        <button className="custom-view">LinkedIn</button>
                        <button className="custom-view mt-2">Email</button>

                    </div>
                    <div className='col-md-3 box d-flex flex-column align-items-center right'>
                        <div className="profile-pic"></div>
                        <p className="profile-name primary">Rishi Patel</p>
                        <p className="profile-position">Developer</p>
                        <button className="custom-view">LinkedIn</button>
        <button className="custom-view mt-2">GitHub</button>
                    </div>
                </div> 
            </div>

    );
}

export default Team;
            
            

