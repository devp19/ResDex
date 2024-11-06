import React from 'react';
import About1 from '../images/index.png'
import About2 from '../images/indexinv.png'

const About = () => {
  return (
    <div className='disable'>
   
      <div className='row d-flex justify-content-center display center-container'>
        
        <div className='col-md-6 box'>
        <h3 className='primary monarque'>About – ResDex</h3>
        <br></br>
        <p className='primary'>ResDex is a student-led organization aimed towards bridging the gap between academia and industry-level research publications, making it easier for students to find research-assistant positions and go beyond the traditional academic scope to create impactful research papers.</p>
        <br></br>
        <p className='primary'>Giving students the opportunity to stand out among millions, review and edit papers, and connect with PHD level researchers, ResDex is designed to foster a collaborative academic community, allowing users to showcase their research, achievements, and certifications in a dynamic online portfolio.</p>
        <br></br>
        <p className='primary'>By engaging in peer and expert reviews, students can refine their work, gain valuable feedback, and build meaningful connections with academics and professionals in their field.</p>
        </div>
      
        <div className='col-md-2 offset-md-1'>
          <img id='headline-2' src={About1} alt='publications-image'></img>
        </div>
      </div>

      <div className='row pt-4'>
        <div className='col-md-2 offset-md-1'>
        <img id='headline-2' src={About2} alt='publications-image'></img>
       
        </div>
        
      <div className='col-md-6 box offset-md-1'>
      <h3 className='primary monarque'>Mission Statement – ResDex</h3>
    <br></br>
      <p className='primary'>As students, we understand the difficulty and often timely process of cold-emailing hundreds of professors for research positions. While all is said and done, research itself is a hard industry to really gain experience in.</p>
      <br></br>
      <i className='monarque primary'>–“That’s where ResDex comes into play.”</i>
      <br></br>
      <br></br>
      <p className='primary'>As a research-sharing platform, designed for students by students, we tailored the platform to fit those exact needs. Everything a student needs all on one site to help the user really build a portfolio around their contributions to the world of research.</p>

      </div>

  
      </div>
      <br></br>
      <br></br>
    
    </div>

  );
};

export default About;
