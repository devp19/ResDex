import React from 'react';
import Fenil from '../images/FenilPFP.png'
import Dev from '../images/dev.png'
import Deep from '../images/DeepPfP.jpg'
const Team = () => {
    return (
        <div>
            <div className='center primary monarque pt-4 fade-in' style={{ fontSize: "50px", marginTop: "30px" }}>ResDex – Team</div>
            <p className='center primary fade-in' style={{fontSize: '15px'}}>Meet the creators of ResDex!</p>
            <div className='row d-flex justify-content-center display'>
            <div className='col-md-3 d-flex flex-column align-items-center box right fade-in'>
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
    <a href="https://www.linkedin.com/in/devp19/" target="_blank" rel="noopener noreferrer" className="custom-view">LinkedIn</a>

    <a href="https://github.com/devp19" target="_blank" rel="noopener noreferrer" className="custom-view mt-2">GitHub</a>
                        
                       
              
                    </div>   



                    <div className='col-md-3 d-flex flex-column align-items-center box right fade-in'>
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
    <a href="https://www.linkedin.com/in/fenilshah05/" target="_blank" rel="noopener noreferrer" className="custom-view">LinkedIn</a>
    <a href="https://github.com/Fshah05" target="_blank" rel="noopener noreferrer" className="custom-view mt-2">GitHub</a>
                    </div>
                    <div className='col-md-3 d-flex flex-column align-items-center box fade-in'>
                    <div className="profile-pic">
        <img 
            src={Deep} 
            alt="Profile of Deep Patel" 
            className="profile-img"
        />
    </div>
                        <p className="profile-name primary">Deep Patel</p>
                        <p className="profile-position">Medical Outsourcing</p><br></br>
                        <a href="https://www.linkedin.com/in/deepptll/" target="_blank" rel="noopener noreferrer" className="custom-view">LinkedIn</a>
                        <a href="mailto:dpptl16@gmail.com" className="custom-view mt-2">Email</a>

                    </div>
                </div>  

             
                <div className='row justify-content-center align-items-center pt-4'>
                    <div className='col-md-3 box d-flex flex-column align-items-center right fade-in'>
                        <div className="profile-pic"></div>
                        <p className="profile-name primary">Bhavi Singh</p>
                        <p className="profile-position">Medical Outsourcing</p>
                        <a href="https://www.linkedin.com/in/bhavendra-singh-75bbb129b/" target="_blank" rel="noopener noreferrer" className="custom-view">LinkedIn</a>
                        <a href="mailto:bhavendrasingh08.com" className="custom-view mt-2">Email</a>

                    </div>
                    <div className='col-md-3 box d-flex flex-column align-items-center right fade-in'>
                        <div className="profile-pic"></div>
                        <p className="profile-name primary">Rishi Patel</p>
                        <p className="profile-position">Developer</p>
                        <a href="https://www.linkedin.com/in/rishi-patel-a84010290/" target="_blank" rel="noopener noreferrer" className="custom-view">LinkedIn</a>
                        <a href="https://github.com/Rishi-245" target="_blank" rel="noopener noreferrer" className="custom-view mt-2">GitHub</a>
                    </div>
                </div> 
            </div>

    );
}

export default Team;
            
            

