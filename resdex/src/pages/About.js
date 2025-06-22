import React from "react";
import About1 from "../images/index.png";
import About2 from "../images/indexinv.png";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { Logo } from "../components/common";

const About = () => {
  // Use the custom animation hook
  useAnimationEffect();

  return (
    <div>
      <div className="container fade-in">
        {/* Hero Section */}
        <div className="row d-flex justify-content-center">
          <div className="col-md-10 text-center" style={{ marginTop: "80px", marginBottom: "60px" }}>
            <div className="row justify-content-center d-flex display fade-in">
              <Logo />
            </div>
            <div className="row text-center fade-in">
              <p className="primary">⏐</p>
            </div>
            <h1 className="primary monarque text-center mb-3">ResDex</h1>
            <p className="primary" style={{ 
              fontSize: "1.2rem", 
              lineHeight: "1.8", 
              maxWidth: "800px", 
              margin: "0 auto",
              color: "#555"
            }}>
              As students, we understand the difficulty and often timely process of cold-emailing 
              hundreds of professors for research positions. While all is said and done, research 
              itself is a hard industry to really gain experience in. As a research-sharing platform, 
              designed for students by students, we tailored the platform to fit those exact needs.
            </p>
          </div>
        </div>

        <div className="horizontal-line" style={{marginBottom: "50px"}}> </div>


        {/* Mission Statement */}
        {/* <div className="row d-flex justify-content-center mb-5">
          <div className="col-12">
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "40px",
              borderRadius: "15px",
              border: "1px solid #333",
              color: "white"
            }}>
              <h3 className="mb-3 text-center" style={{ fontSize: "2rem", color: "white" }}>
                Our Mission
              </h3>
              <p className="text-center" style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#e0e0e0" }}>
                To help students and researchers wisely invest their most precious asset: their time 
                and expertise, by creating meaningful connections and opportunities in the academic world.
              </p>
            </div>
          </div>
        </div> */}

        {/* Our Story Section */}
        <div className="row d-flex justify-content-center mb-5">
          <div className="col-md-10">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h3 className="primary mb-4" style={{ fontSize: "2.2rem" }}>
                  Our Story
                </h3>
                <p className="primary" style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#555", marginBottom: "20px" }}>
                  Born from the frustration of countless cold emails and missed opportunities, 
                  ResDex emerged as a solution to the challenges that every aspiring researcher faces. 
                  We recognized that the traditional approach to finding research opportunities was 
                  inefficient and often discouraging.
                </p>
                <p className="primary" style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#555" }}>
                  Today, ResDex has evolved into a comprehensive platform that not only connects 
                  researchers but also provides the tools and community needed to thrive in academia. 
                  We've helped thousands of students build their research portfolios and establish 
                  meaningful connections in their fields.
                </p>
              </div>
              {/* <div className="col-md-6 text-center">
                <img
                  src={About2}
                  alt="ResDex Story"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "15px"
                  }}
                />
              </div> */}

<div className="col-md-4 offset-md-1">
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "40px",
              borderRadius: "15px",
              border: "1px solid #333",
              color: "white"
            }}>
              <h3 className="mb-3 text-center" style={{ fontSize: "2rem", color: "white" }}>
                Mission
              </h3>
              <p className="text-center" style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#e0e0e0" }}>
                To help students and researchers wisely invest their most precious asset: their time 
                and expertise, by creating meaningful connections and opportunities in the academic world.
              </p>
            </div>
          </div>

            </div>
          </div>
        </div>

        <div className="horizontal-line" style={{marginBottom: "50px"}}> </div>

        {/* Features Grid */}
        <div className="row d-flex justify-content-center mb-5">
          <div className="col-md-10">
            {/* <h3 className="primary text-center mb-5" style={{ fontSize: "2.2rem" }}>
              What We Offer
            </h3> */}
            <div className="row">
              <div className="col-md-4 mb-4">
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "30px",
                  borderRadius: "15px",
                  height: "100%",
                  border: "1px solid #e9ecef",
                  textAlign: "center"
                }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px"
                  }}>
                    <svg width="30" height="30" fill="white" viewBox="0 0 16 16">
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                    </svg>
                  </div>
                  <h4 className="primary mb-3">Research Communities</h4>
                  <p className="primary" style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#666" }}>
                    Connect with researchers across institutions and disciplines. Build meaningful 
                    relationships that go beyond traditional networking.
                  </p>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "30px",
                  borderRadius: "15px",
                  height: "100%",
                  border: "1px solid #e9ecef",
                  textAlign: "center"
                }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px"
                  }}>
                    <svg width="30" height="30" fill="white" viewBox="0 0 16 16">
                      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                      <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  </div>
                  <h4 className="primary mb-3">Portfolio Building</h4>
                  <p className="primary" style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#666" }}>
                    Showcase your research papers, certifications, and contributions in one 
                    centralized location that grows with your academic career.
                  </p>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "30px",
                  borderRadius: "15px",
                  height: "100%",
                  border: "1px solid #e9ecef",
                  textAlign: "center"
                }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px"
                  }}>
                    <svg width="30" height="30" fill="white" viewBox="0 0 16 16">
                      <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                    </svg>
                  </div>
                  <h4 className="primary mb-3">Real-Time Collaboration</h4>
                  <p className="primary" style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#666" }}>
                    Communicate seamlessly with fellow researchers through our integrated 
                    chat system for discussions and project coordination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="row d-flex justify-content-center mb-5">
          <div className="col-md-8 text-center">
            <div style={{
              backgroundColor: "#1a1a1a",
              color: "white",
              padding: "50px",
              borderRadius: "15px",
              marginBottom: "40px"
            }}>
              <h3 className=" mb-4" style={{ fontSize: "2.2rem", color: "white" }}>
                Join the ResDex Community
              </h3>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.5", marginBottom: "40px", color: "#e0e0e0" }}>
                Ready to transform your research experience? Join your community of students and 
                researchers who are already building their academic networks, showcasing 
                their work, and advancing their careers through ResDex.
              </p>
              <a className="custom-read p-3 mt-2" href="https://resdex.ca/signup" target="_blank">
                Start Your Journey Today
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
