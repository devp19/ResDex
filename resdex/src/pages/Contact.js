import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';

const Contact = () => {

  useEffect(() => {
    // Animate scrolling marquee once
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
  
    // Fade-in on scroll using IntersectionObserver
    const fadeIns = document.querySelectorAll('.fade-in');
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Optional: fade-in only once
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
  
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  

  const sendTicket = (e) => {
    e.preventDefault();

    const templateParams = {
      full_name: fullName,
      email: email,
      subject: subject,
      message: body,
    };


    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_USER_ID
      )
      .then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          setSuccess('Ticket submitted successfully!');
          setError('');
          navigate('/success')
        },
        (err) => {
          console.error('FAILED...', err);
          setError('Failed to submit ticket. Please try again.');
          setSuccess('');
        }
      );
  };

  

  return (
    <div>
      <br />
      <h1 className="center primary monarque mt-3 fade-in">Question, Issue, Feature?</h1>
      <p className="center primary fade-in">Send a ticket down below!</p>

      <div>
        <div className="container fade-in" style={{ marginTop: '60px' }}>
          <div className="row center">
            <div className='col-md-7 box'>
            <Form className="contact-form" onSubmit={sendTicket}>
              <Form.Group className="mb-3" controlId="formBasicFullName">
                <Form.Label className='primary'>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className='primary'>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicSubject">
                <Form.Label className='primary'>Subject</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicBody">
                <Form.Label className='primary'>Body</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Enter Message (Max 1500 Characters)"
                  value={body}
                  rows="5"
                  maxLength="1500"
                  onChange={(e) => setBody(e.target.value)}
                  required
                  style={{ height: '200px' }}
                />
              </Form.Group>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {success && <p style={{ color: 'green' }}>{success}</p>}
              <Button className="custom" style={{marginBottom: '20px' }} type="submit">
                Submit Ticket
              </Button>
            </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;