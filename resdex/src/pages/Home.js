import React from 'react';
import Headline from '../images/headline.png';
import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <div className='background'>
         
         <div class="alert alert-light alert-dismissible fade show" role="alert">
    ResDex is still under development! → Thanks for visiting!
   
    </div>


        <div className="center-container title">
           <div className='row length'>
                <div className='col-md-5 offset-md-1 col-center'>
            
                    <div className='row'>
                    Research Made Easy.
                    <br></br>
                    <span className='regular-text'>
                        <br></br>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
</svg>
                       <br></br>
                       <br></br>

                       "For students, by students."
                       <br></br>
                       <br></br>
                       <span className='smaller-text'>
                        Share research, gain insightful feedback and connect with industry professionals in over 100+ topics.
                       </span>
                    </span>
                    
                    </div>
                   
                </div>
                
                <div className='col-md-5 col-center'>
                <img id="headline-img" className="img-fluid" src={Headline} alt="ResDex Logo" />

                </div>
           </div>
        </div>

        <div className='bottom-container'>
          <div className='row mt-4 justify-content-center'>
            <div className='col-md-3 mx-3'>
              <div className='column-content'>
                <h3>Credentials <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder-fill" viewBox="0 0 16 16">
  <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
</svg></h3>
                <p>Build your research credentials with a dynamic portfolio and industry-ready courses to enhance your skills.</p>
              </div>
            </div>
            <div className='col-md-3 mx-3'>
              <div className='column-content'>
                <h3>Connect <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
</svg></h3>
                <p>ResDex connects students with PhD professionals, enhancing visibility and promoting equitable opportunities for underrepresented groups.</p>
              </div>
            </div>
            <div className='col-md-3 mx-3'>
              <div className='column-content'>
                <h3>Peer Review <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-check-fill" viewBox="0 0 16 16">
  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m1.354 4.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
</svg></h3>
                <p>ResDex enables constructive peer review, helping students refine their research and enhance their academic skills.</p>
              </div>
            </div>
          </div>
        </div>

        <div className='center-sample'>
            
           
            <div className='row'>
                
                <div className='col-md-8 mx-auto title-2'>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
</svg>
                <br></br>
                    Kickstart your research career now!
                    <br></br>

                    <div className='smaller-text button-custom pt-4'> 
                        <Link className='custom' to='/signup'>Sign Up</Link>
                     </div>
                </div>
            </div>
        </div>

      
    </div>
  );
};

export default Home;
