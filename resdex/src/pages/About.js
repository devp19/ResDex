import React, {useEffect} from 'react';
import About1 from '../images/index.png'
import About2 from '../images/indexinv.png'

const About = () => {

  useEffect(() => {
      const scrollers = document.querySelectorAll(".scroller");
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
    
      const fadeIns = document.querySelectorAll('.fade-in');
    
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target); 
            }
          });
        },
        {
          threshold: 0.05,
        }
      );
    
      fadeIns.forEach((el) => observer.observe(el));
    
      return () => {
        fadeIns.forEach((el) => observer.unobserve(el));
      };
    }, []);
  
  return (
    <div style={{marginRight: '10px', marginLeft: '10px'}}>
   
      <div className='row d-flex justify-content-center top'>
        
        <div className='col-md-6 box fade-in' style={{padding: '20px'}}>
          <div className='row'>

            <div className='col-md'>
            <h3 className='primary monarque'>About – ResDex</h3>
        <br></br>
        <p className='primary'>ResDex is a student-led organization aimed towards bridging the gap between academia and industry-level research publications, making it easier for students to find research-assistant positions and go beyond the traditional academic scope to create impactful research papers.</p>
        <br></br>
        <p className='primary'>Giving students the opportunity to stand out among millions, review and edit papers, and connect with PHD level researchers, ResDex is designed to foster a collaborative academic community, allowing users to showcase their research, achievements, and certifications in a dynamic online portfolio.</p>
        <br></br>
        <p className='primary'>By engaging in peer and expert reviews, students can refine their work, gain valuable feedback, and build meaningful connections with academics and professionals in their field.</p>
            </div>



          <div className='col-md-2'>
          <img id='headline-2' src={About1} alt='publications-image'></img>
        </div>
          </div>
       
        </div>
      
        
      </div>

      <div className='row d-flex justify-content-center pt-4'>

      <div className='col-md-6 box fade-in' style={{padding: '20px', textAlign: 'right'}}>
      <div className='row'>

<div className='col-md'>

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

      </div>

  
      </div>
      <br></br>
      <br></br>
    
    </div>

  );
};

export default About;
