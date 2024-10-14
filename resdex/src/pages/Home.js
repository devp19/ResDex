// src/pages/Home.js
import React from 'react';
import Headline from '../images/headline.png';


const Home = () => {
  return (
    <div className='background'>
        <div className="center-container title">
           <div className='row length'>
                <div className='col-md-5 offset-md-1 col-center'>
            
                    <div className='row'>
                    Research Made Easy.
                    <br></br>
                    <span className='regular-text'>
                       ↓
                       <br></br>

                       For students, by students.
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
                <h3>Credentials</h3>
                <p>Build your research credentials with a dynamic portfolio and industry-ready courses to enhance your skills.</p>
              </div>
            </div>
            <div className='col-md-3 mx-3'>
              <div className='column-content'>
                <h3>Connect</h3>
                <p>ResDex connects students with PhD professionals, enhancing visibility and promoting equitable opportunities for underrepresented groups.</p>
              </div>
            </div>
            <div className='col-md-3 mx-3'>
              <div className='column-content'>
                <h3>Peer Review</h3>
                <p>ResDex enables constructive peer review, helping students refine their research and enhance their academic skills.</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Home;
