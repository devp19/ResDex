import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../images/dark-transparent.png';
import TMU from '../images/tmu.png';
import MAC from '../images/mac.png';
import OTTAWA from '../images/ottawa.png';
import UFT from '../images/uft.png';
import LOO from '../images/loo.png';

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
    <div className='display'>
      <div className='center-container top fade-in'>
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
          <div className='center pt-2 fade-in'>
            <p className='monarque primary' style={{ fontSize: '25px' }}>"For students, by students"</p>
          </div>
        </div>
      </div>

      <div className='bottom-container fade-in'>
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
            </div>        </div>
      </div>

      <div className='horizontal-line fade-in'></div>

      <div className='container fade-in'>
        <p className='primary center top monarque' style={{ fontSize: '25px', marginBottom: '30px' }}>A student led initiative from</p>
        <div className='row d-flex justify-content-center fade-in'>
        <div class="scroller box" data-direction="right" data-speed="slow">
            <div class="scroller__inner">
              <img style={{height: '60px', marginRight: '30px'}} src={TMU} alt="" />
              <img style={{height: '60px',  marginRight: '30px', marginLeft: '30px'}} src={MAC} alt="" />
              <img style={{height: '60px'}} src={OTTAWA} alt="" />
              <img style={{height: '60px'}} src={UFT} alt="" />
              <img style={{height: '60px'}} src={LOO} alt="" />
            </div>
      </div>        </div>
      </div>

      <div className='center-sample fade-in'>
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
