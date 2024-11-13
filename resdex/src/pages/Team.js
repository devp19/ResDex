import React from 'react';
import Fenil from '../images/FenilPFP.png'
import Dev from '../images/dev.png'
import Deep from '../images/DeepPfP.jpg'
import Empty from '../images/empty.webp'
const Team = () => {
    return (
        <div>
            <div className='center primary monarque pt-4 fade-in' style={{ fontSize: "50px", marginTop: "30px" }}>ResDex – Team</div>
            <p className='center primary fade-in' style={{fontSize: '15px'}}>Meet the creators of ResDex!</p>
            <div className='row d-flex justify-content-center display'>
                        <div className='col-md-3 d-flex flex-column align-items-center justify-content-center box fade-in' style={{marginBottom: '20px', margin: '20px'}}>
                <div className="profile-pic">
                    <img 
                        src={Dev} 
                        alt="Profile of Dev Patel" 
                        className="profile-img"
                    />
                </div>
                <p className="profile-name primary text-center">Dev Patel</p>
                <p className="profile-position text-center">Co-Founder &</p>
                <p className="profile-position minus text-center">Full-Stack Developer</p>
                <p>
                <a href="https://www.linkedin.com/in/devp19/" target="_blank" rel="noopener noreferrer"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-linkedin" viewBox="0 0 16 16">
  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
</svg></a>

                <a href="https://github.com/devp19" style={{marginBottom: '20px'}} target="_blank" rel="noopener noreferrer"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-github" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
</svg></a>
                                    
                </p>  
                        
                                </div>   



                    <div className='col-md-3 d-flex flex-column align-items-center justify-content-center box fade-in' style={{marginBottom: '20px', margin: '20px'}}>
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
    <p>
    <a href="https://www.linkedin.com/in/fenilshah05/" target="_blank" rel="noopener noreferrer"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-linkedin" viewBox="0 0 16 16">
  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
</svg></a>
    <a href="https://github.com/Fshah05"  style={{marginBottom: '20px'}} target="_blank" rel="noopener noreferrer"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-github" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
</svg></a>
    </p></div>
     <div className='col-md-3 d-flex flex-column align-items-center justify-content-center box fade-in' style={{marginBottom: '20px', margin: '20px'}}>
    <div className="profile-pic">
        <img 
            src={Deep}
            alt="Profile of Deep Patel" 
            className="profile-img"
        />
        
    </div>
                        <p className="profile-name primary">Deep Patel</p>
                        <p className="profile-position text-center">Medical Outsourcing</p>
                        <p><a href="https://www.linkedin.com/in/deepptll/" target="_blank" rel="noopener noreferrer"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-linkedin" viewBox="0 0 16 16">
  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
</svg></a>
                        <a href="mailto:dpptl16@gmail.com"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-envelope-fill" viewBox="0 0 16 16">
  <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
</svg></a></p>



                    </div>
                    <div className='col-md-3 box d-flex flex-column align-items-center justify-content-center fade-in' style={{marginBottom: '20px', margin: '20px'}}>
                        <div className="profile-pic">
                        <img 
            src={Empty} 
            alt="Profile of Bhavi Singh" 
            className="profile-img"
        />
                        </div>
                        <p className="profile-name primary">Bhavi Singh</p>
                        <p className="profile-position">Medical Outsourcing</p>
                        <p>
                        <a href="https://www.linkedin.com/in/bhavendra-singh-75bbb129b/" target="_blank" rel="noopener noreferrer"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-linkedin" viewBox="0 0 16 16">
  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
</svg></a>
                        <a href="mailto:bhavendrasingh08.com"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-envelope-fill" viewBox="0 0 16 16">
  <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
</svg></a></p>

                    </div>
                    <div className='col-md-3 box d-flex flex-column align-items-center justify-content-center fade-in' style={{marginBottom: '20px', margin: '20px'}}>
                        <div className="profile-pic">
                        <img 
            src={Empty} 
            alt="Profile of Rishi Patel" 
            className="profile-img"
        />
                        </div>
                        <p className="profile-name primary">Rishi Patel</p>
                        <p className="profile-position">Developer</p>
                    
<p><a href="https://www.linkedin.com/in/rishi-patel-a84010290/" target="_blank" rel="noopener noreferrer"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-linkedin" viewBox="0 0 16 16">
  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
</svg></a>
                        <a href="https://github.com/Rishi-245" target="_blank" rel="noopener noreferrer"><svg style={{margin: '20px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="primary" class="bi bi-github" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
</svg></a></p>
                    </div>
                </div>  

             
                {/* <div className='row justify-content-center align-items-center pt-4'> */}
    
                {/* </div>  */}
            </div>

    );
}

export default Team;
            
            

