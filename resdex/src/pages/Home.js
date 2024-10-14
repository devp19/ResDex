// src/pages/Home.js
import React from 'react';
import Headline from '../images/headline.png';

const Home = () => {
  return (
    <div className='background'>
        <div className="center-container title">
           <div className='row length'>
                <div className='col-md-5 col-center border-view'>
                    Research Made Easy.
                </div>
                <div className='col-md-7 col-center border-view'>
                <img id="headline-img" className="img-fluid" src={Headline} alt="ResDex Logo" />

                </div>
           </div>
        </div>
       
    </div>
  );
};

export default Home;
