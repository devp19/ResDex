import React from 'react';
import Headline from '../images/headline.png';
import { Link } from 'react-router-dom';
import Logo from '../images/dark-transparent.png'

const Home = () => {
  return (
    <div className='display'>
<div className='center-container top'>
  <div>
    <div className='row justify-content-center d-flex display'>
    <img src={Logo} style={{maxWidth: '70px', fill: 'black'}} alt='resdex-logo'></img>
    </div>
    <div className='row text-center'>
    {/* <p className='akros primary medium'>ResDex</p> */}
    <br></br>
    <br></br>
    <p className='primary'>⏐</p>
    </div>
    <div className='row text-center'>
      <p className='akros primary title'>Research</p>
      <br></br>
      <p className='akros title primary' style={{marginTop: '-40px'}}><span className='primary title monarque'>–made </span>easy</p>
      <br></br>
    </div>

    <div className='center pt-4'>
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z"/></svg>
    </div>
    <div className='center pt-2'>
    <p className='monarque primary' style={{fontSize: '25px'}}>"For students, by students."</p>
    </div>  
    <div className='center'>
      <div className='row d-flex justify-content-center'>
        <div className='col-md-7 box'>
        <p className='primary text-center'>Share research, gain insightful feedback and connect with industry professionals in over 100+ topics.</p>

        </div>
      </div>
    </div>  
  </div>
</div>

        {/* <div className="center-container title">
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
        </div> */}

        <div className='bottom-container'>
          <div className='row mt-4 justify-content-center'>
            <div className='col-md-3 box mx-3'>
              <div className='column-content'>
                <h3 className='monarque primary'> CREDENTIALS </h3>
                <p className='primary'>Build your research credentials with a dynamic portfolio and industry-ready courses to enhance your skills.</p>
              </div>
            </div>
            <div className='col-md-3 box mx-3'>
              <div className='column-content primary'>
              <h3 className='monarque primary'> CONNECT </h3>
                <p className='primary'>ResDex connects students with PhD professionals, enhancing visibility and promoting equitable opportunities for underrepresented groups.</p>
              </div>
            </div>
            <div className='col-md-3 box mx-3'>
              <div className='column-content primary'>
              <h3 className='monarque primary'> PEER REVIEW </h3>
                <p className='primary'>ResDex enables constructive peer review, helping students refine their research and enhance their academic skills.</p>
              </div>
            </div>
          </div>
        </div>

        <div className='center-sample'>
            
           
            <div className='row'>
                
                <div className='col-md-8 mx-auto title-2 primary'>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="primary" class="bi bi-arrow-down" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
</svg>
                <br></br>
                    Kickstart <span className='monarque primary'>–your</span> <span className='monarque primary'>research</span> career now!
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
