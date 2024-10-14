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
       
    </div>
  );
};

export default Home;
