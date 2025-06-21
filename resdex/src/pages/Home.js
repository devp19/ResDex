import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TMU from "../images/tmu.png";
import MAC from "../images/mac.png";
import OTTAWA from "../images/ottawa.png";
import UFT from "../images/uft.png";
import LOO from "../images/loo.png";
import WLU from "../images/wlu.png";
import CAPTION from "../images/captionblack.png";
import Alert from "react-bootstrap/Alert";
import Empty from "../images/empty-pic.webp";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { Logo } from "../components/common";

// import { db } from '../firebaseConfig';
// import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const Home = () => {
  // Use the custom animation hook
  useAnimationEffect();

  const testimonials = [
    {
      id: 1,
      quote:
        "ResDex has streamlined the entire research process for students like me. From publication to networking, everything is in one place, making collaboration with other students and experienced researchers so much easier. It's exactly what the academic community has been missing.",
      author: "Joseph J.",
      position: "Health Sciences, McMaster",
      image: Empty,
    },
    {
      id: 2,
      quote:
        "ResDex has been a game-changer for me as a PhD student. It's incredibly intuitive to navigate, and the platform has made networking with other researchers effortless. Having everything from publication to peer review streamlined in one place is a massive time-saver.",
      author: "Lamar B.",
      position: "Nursing, University of Toronto",
      image: Empty,
    },
    {
      id: 3,
      quote:
        "ResDex has transformed the way I approach research publications. The ease of managing and reviewing work, coupled with a student-friendly interface, has boosted my productivity.",
      author: "Darnold J.",
      position: "High School Student",
      image: Empty,
    },
    {
      id: 4,
      quote:
        "The innovative features on ResDex are exactly what the research community needed. As a professor, I can see the tremendous potential this platform holds for connecting students with experts.",
      author: "Catherine M.",
      position: "Professor, McMaster",
      image: Empty,
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        goToNext();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const handleNavigation = (nextIndex) => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentTestimonial(nextIndex);
      setIsFading(false);
    }, 500); // This should match the CSS transition time
  };

  const goToTestimonial = (index) => {
    handleNavigation(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    const nextIndex = (currentTestimonial + 1) % testimonials.length;
    handleNavigation(nextIndex);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    const prevIndex = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    handleNavigation(prevIndex);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <>
      {/* <Alert key='secondary' variant='secondary' dismissible>
         Note: ResDex is still under-development! Currently, ResDex is optimized for larger-screens! Thanks for visiting early!
        </Alert> */}

      <div className="center-container fade-in">
        <div>
          <div className="row justify-content-center d-flex display fade-in">
            <Logo />
          </div>
          <div className="row text-center fade-in">
            <p className="primary">⏐</p>
          </div>
          <div className="row text-center fade-in">
            <p className="akros primary title">Research</p>
            <p className="akros title primary" style={{ marginTop: "-40px" }}>
              <span className="primary title monarque">–made </span>easy
            </p>
          </div>

          {/* <div className='center fade-in'>
            <p className='monarque primary secondary'>Learn More</p>
          </div> */}

          <div className="row d-flex justify-content-center mt-4">
            <div className="col-md-4 box">
              <p className="primary small text-center">
                Share research, gain insightful feedback and connect with
                industry professionals all in one place.
              </p>
            </div>
            <div className="center pt-4 fade-in" style={{ marginTop: "20px" }}>
              <svg
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule="evenodd"
              >
                <path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="horizontal-line"></div>

      <div className="fade-in">
        <div>
          <div
            className="row justify-content-center d-flex display fade-in"
            style={{ marginTop: "75px" }}
          >
            <Logo />
          </div>
          <div className="row text-center fade-in">
            <p className="primary">⏐</p>
          </div>
          <div className="row text-center fade-in">
            <p className="monarque primary" style={{ fontSize: "55px" }}>
              ResDex
            </p>
            <div className="col-md-7 justify-content-center mx-auto">
              <p
                className="primary"
                style={{ fontSize: "20px", marginBottom: "25px" }}
              >
                As students, we understand the difficulty and often timely
                process of cold-emailing hundreds of professors for research
                positions. While all is said and done, research itself is a hard
                industry to really gain experience in. As a research-sharing
                platform, designed for students by students, we tailored the
                platform to fit those exact needs. Everything a student needs
                all on one site to help the user really build a portfolio around
                their contributions to the world of research.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container fade-in" style={{ marginTop: "70px" }}>
        <p className='primary center top monarque' style={{ fontSize: '25px', marginBottom: '30px' }}>Proud Partners</p>
        <div className="row d-flex justify-content-center fade-in">
          <div
            className="scroller box "
            data-direction="right"
            data-speed="slow"
          >
            <div className="scroller__inner mb-4">
              <img
                style={{ height: "50px", marginRight: "30px" }}
                src={TMU}
                alt=""
              />
              <img
                style={{
                  height: "50px",
                  marginRight: "30px",
                  marginLeft: "30px",
                }}
                src={MAC}
                alt=""
              />
              <img style={{ height: "50px" }} src={OTTAWA} alt="" />
              <img style={{ height: "50px" }} src={UFT} alt="" />
              <img style={{ height: "50px" }} src={LOO} alt="" />
              <img style={{ height: "50px", marginRight: "30px" }} src={WLU} alt="" />
            </div>
          </div>
        </div>
      </div>

      <div className="center pt-4 fade-in" style={{ marginTop: "50px" }}>
        <svg
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          fillRule="evenodd"
          clipRule="evenodd"
        >
          <path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z" />
        </svg>
      </div>

      <div className="container" style={{ marginTop: "100px" }}>
        <div className="row justify-content-center">
          <div
            className="col-md-3 mb-3 fade-in"
            style={{ borderRight: "1px solid #2a2a2a" }}
          >
            <div className="column-content">
              <h3 className="kugile primary" style={{ fontSize: "24px" }}>
                {" "}
                CREDENTIALS{" "}
              </h3>
              <p className="primary mt-4">
                Build your research credentials with a dynamic portfolio and
                industry-ready courses to enhance your skills.
              </p>
            </div>
          </div>
          <div className="col-md-3 mb-3 fade-in">
            <div className="column-content primary">
              <h3 className="kugile primary" style={{ fontSize: "24px" }}>
                {" "}
                CONNECT{" "}
              </h3>
              <p className="primary mt-4">
                Connect students with professionals, enhancing visibility and
                promoting equitable opportunities for underrepresented groups.
              </p>
            </div>
          </div>
          <div
            className="col-md-3 mb-3 fade-in"
            style={{ borderLeft: "1px solid #2a2a2a" }}
          >
            <div className="column-content primary">
              <h3 className="kugile primary" style={{ fontSize: "24px" }}>
                {" "}
                PEER REVIEW{" "}
              </h3>
              <p className="primary mt-4">
                {" "}
                Constructive peer review capabilities, helping students refine
                their research and enhance their academic skills.
              </p>
            </div>
          </div>
        </div>
        <div
          className="horizontal-line d-flex"
          style={{
            marginTop: "-17px",
            maxWidth: "80%",
            alignSelf: "center",
            justifySelf: "center",
          }}
        ></div>
        <div className="row justify-content-center">
          <div className="col-md-3 mb-3 fade-in">
            <div className="column-content">
              <h3
                className="kugile primary"
                style={{ paddingTop: "15px", fontSize: "24px" }}
              >
                {" "}
                ENGAGE{" "}
              </h3>
              <p className="primary mt-4">
                Prioritizes student success through tailored support, inclusive
                programming, and accessible resources designed to meet diverse
                academic and career goals.
              </p>
            </div>
          </div>
          <div
            className="col-md-1  mb-3"
            style={{ borderLeft: "1px solid #2a2a2a", marginRight: "-110px" }}
          ></div>
          <div className="col-md-3 mb-3 fade-in">
            <div className="column-content primary">
              <h3
                className="kugile primary"
                style={{ paddingTop: "15px", fontSize: "24px" }}
              >
                {" "}
                SHOWCASE{" "}
              </h3>
              <p className="primary mt-4">
                Empowers students to present their work through curated events,
                digital portfolios, and publication opportunities that highlight
                talent and innovation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="horizontal-line" style={{ marginTop: "90px" }}></div>
      <div className="testimonials-section">
        <div className="container">
          <div
            className="row justify-content-center d-flex display fade-in"
            style={{ marginBottom: "-180px" }}
          >
            <img
              src={CAPTION}
              style={{ maxWidth: "250px" }}
              alt="captionblack"
            ></img>
          </div>
          <p
            className="primary center top baskerville fade-in"
            style={{ fontSize: "30px", marginBottom: "-10px" }}
          >
            Their Voice, Your Call
          </p>

          <div className="testimonial-carousel">
            <div className="testimonial-box">
              <button
                className="carousel-button left-button"
                onClick={goToPrev}
                aria-label="Previous testimonial"
              >
                <p className="primary kugile mt-3">&lt;</p>
              </button>

              <div className={`testimonial-content ${isFading ? 'fading' : ''}`}>
                <h3 className="testimonial-number">
                  {testimonials[currentTestimonial].number}
                </h3>
                <blockquote className="testimonial-quote">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <div className="testimonial-author">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].author}
                    className="author-image"
                  />
                  <div>
                    <p className="author-name">
                      {testimonials[currentTestimonial].author}
                    </p>
                    <p className="author-position">
                      {testimonials[currentTestimonial].position}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="carousel-button right-button"
                onClick={goToNext}
                aria-label="Next testimonial"
              >
                <p className="primary kugile mt-3">&gt;</p>
              </button>
            </div>

            <div className="carousel-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${
                    index === currentTestimonial ? "active" : ""
                  }`}
                  onClick={() => goToTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="center-sample fade-in pt-4">
        <div className="row">
          <div className="col-md-8 mx-auto title-2 primary fade-in">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              fill="primary"
              className="bi bi-arrow-down"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"
              />
            </svg>
            <br></br>
            Kickstart <span className="monarque primary">–your</span>{" "}
            <span className="monarque primary">research</span> career now!
            <br></br>
            <div className="smaller-text button-custom pt-4">
              <Link className="custom" to="/signup">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
