import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../images/dark-transparent.png';
import TMU from '../images/tmu.png';
import MAC from '../images/mac.png';
import OTTAWA from '../images/ottawa.png';
import UFT from '../images/uft.png';
import LOO from '../images/loo.png';
import Dev from '../images/dev.png';
import Empty from '../images/empty.webp';
import Alert from 'react-bootstrap/Alert';


const Home = () => {

  useEffect(() => {
    const scrollers = document.querySelectorAll(".scroller");

    function addAnimation() {
      scrollers.forEach((scroller) => {
        if (scroller.getAttribute("data-animated")) return;

        scroller.setAttribute("data-animated", true);

        const scrollerInner = scroller.querySelector(".scroller__inner");
        const scrollerContent = Array.from(scrollerInner.children);

        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          duplicatedItem.setAttribute("aria-hidden", true);
          scrollerInner.appendChild(duplicatedItem);
        });
      });

      // Trigger fade-in effect
      document.querySelectorAll('.fade-in').forEach(element => {
        element.classList.add('visible');
      });
    }

    addAnimation();
  }, []); // Empty dependency array ensures this only runs once on mount

  return (
    <div>
       <Alert key='secondary' variant='secondary' dismissible>
         Note: ResDex is still under-development! Currently, ResDex is optimized for larger-screens! Thanks for visiting early!
        </Alert>

      <div className='center-container fade-in'>

        <div>
          <div className='row justify-content-center d-flex display fade-in'>
            <img src={Logo} style={{ maxWidth: '70px', fill: 'black' }} alt='resdex-logo'></img>
          </div>
          <div className='row text-center fade-in'>
            <p className='primary'>⏐</p>
          </div>
          <div className='row text-center fade-in'>
            <p className='akros primary title'>Research</p>
            <p className='akros title primary' style={{ marginTop: '-40px' }}><span className='primary title monarque'>–made </span>easy</p>
          </div>

          <div className='center pt-4 fade-in'>
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
              <path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z"/>
            </svg>
          </div>
          <div className='center fade-in'>
            <p className='monarque primary secondary'>"For students, by students"</p>
          </div>

          <div className='row d-flex justify-content-center minus'>
        <div className='col-md-6 box'>
        <p className='primary small text-center'>Share research, gain insightful feedback and connect with industry professionals all in one place.</p>
        </div>
        </div>
        </div>
      </div>


      <div className='container fade-in'>
        <div className='horizontal-line'></div>
        <div className='row justify-content-center top'>
        <div className='col-md-4 box mx-3 mb-3'>
              <div className='column-content'>
                <h3 className='monarque primary'> CREDENTIALS </h3>
                <p className='primary mt-4'>Build your research credentials with a dynamic portfolio and industry-ready courses to enhance your skills.</p>
              </div>
            </div>
            <div className='col-md-4 box mx-3 mb-3'>
              <div className='column-content primary'>
              <h3 className='monarque primary'> CONNECT </h3>
                <p className='primary mt-4'>ResDex connects students with PhD professionals, enhancing visibility and promoting equitable opportunities for underrepresented groups.</p>
              </div>
            </div>
            <div className='col-md-4 box mx-3 mb-3'>
              <div className='column-content primary'>
              <h3 className='monarque primary'> PEER REVIEW </h3>
                <p className='primary mt-4'>ResDex enables constructive peer review, helping students refine their research and enhance their academic skills.</p>
              </div>
            </div>        </div>
      </div>

      <div className='container fade-in top'>
        {/* <p className='primary center top monarque' style={{ fontSize: '25px', marginBottom: '30px' }}>A student led initiative from</p> */}
        <div className='row d-flex justify-content-center fade-in'>
        <div class="scroller box" data-direction="right" data-speed="slow">
            <div class="scroller__inner">
              <img style={{height: '60px', marginRight: '30px'}} src={TMU} alt="" />
              <img style={{height: '60px',  marginRight: '30px', marginLeft: '30px'}} src={MAC} alt="" />
              <img style={{height: '60px'}} src={OTTAWA} alt="" />
              <img style={{height: '60px'}} src={UFT} alt="" />
              <img style={{height: '60px'}} src={LOO} alt="" />
            </div>
      </div>        
      </div>
      </div>

<div className='horizontal-line' style={{marginTop: '90px'}}></div>
    <div className='container'>
      <p className='primary center top monarque' style={{ fontSize: '30px', marginBottom: '30px' }}>" Testimonials "</p>

       <div className='row d-flex justify-content-center'>
     
      <div className='col-md-4 box mb-3 testimonial' style={{margin: '20px'}}>
      <p className='primary' style={{padding: '20px'}}><i className='primary'>"ResDex has streamlined the entire research process for students like me. From publication to networking, everything is in one place, making collaboration with other students and experienced researchers so much easier. It’s exactly what the academic community has been missing."</i></p>
      <div className='row' style={{paddingLeft: '20px'}}>

      <div className='col-md-4'>
      <div className="profile-pic-2">
        <img 
            src={Empty} 
            alt="Profile of Dev Patel" 
            className="profile-img-2"
        />
    </div>
      </div>

      <p className='col-md-12 primary'>Joseph J.<br></br> Health Sciences, McMaster</p>
    </div>
      </div>

      <div className='col-md-4 box mb-3 testimonial' style={{margin: '20px'}}>
      <p className='primary' style={{padding: '20px'}}><i className='primary'>"ResDex has been a game-changer for me as a PhD student. It’s incredibly intuitive to navigate, and the platform has made networking with other researchers effortless. Having everything from publication to peer review streamlined in one place is a massive time-saver. Highly recommended for students and researchers alike!"</i></p>
      <div className='row' style={{paddingLeft: '20px'}}>

      <div className='col-md-4'>
      <div className="profile-pic-2">
        <img 
             src={Empty}  
            alt="Profile of Dev Patel" 
            className="profile-img-2"
        />
    </div>
      </div>

      <p className='col-md-12 primary'>Lamar B. <br></br> Nursing, University of Toronto</p>
    </div>
      </div>
      
      <div className='col-md-4 box mb-3 testimonial' style={{margin: '20px'}}>
      <p style={{padding: '20px'}}><i className='primary'>"ResDex has transformed the way I approach research publications. The ease of managing and reviewing work, coupled with a student-friendly interface, has boosted my productivity. It’s wonderful to see a platform so dedicated to supporting students and emerging researchers!"</i></p>
      <div className='row' style={{paddingLeft: '20px'}}>

      <div className='col-md-4'>
      <div className="profile-pic-2">
        <img 
             src={Empty}  
            alt="Profile of Dev Patel" 
            className="profile-img-2"
        />
    </div>
      </div>

      <p className='col-md-12 primary'>Darnold J. <br></br> High School Student</p>
    </div>
      </div>
      <div className='col-md-4 box mb-3 testimonial' style={{margin: '20px'}}>
      <p className='primary' style={{padding: '20px'}}><i className='primary'>"The innovative features on ResDex are exactly what the research community needed. As a professor, I can see the tremendous potential this platform holds for connecting students with experts and encouraging collaborative work. ResDex is fostering a new era of research accessibility and community."</i></p>
      <div className='row' style={{paddingLeft: '20px'}}>

      <div className='col-md-4'>
      <div className="profile-pic-2">
        <img 
             src={Empty}  
            alt="Profile of Dev Patel" 
            className="profile-img-2"
        />
    </div>
      </div>

      <p className='col-md-12 primary'>Catherine M.<br></br> Professor, McMaster</p>
    </div>
      </div>
    </div>
    </div>


      <div className='center-sample fade-in pt-4'>
        <div className='row'>
          <div className='col-md-8 mx-auto title-2 primary fade-in'>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="primary" className="bi bi-arrow-down" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
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
