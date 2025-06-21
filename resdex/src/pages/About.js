import React from "react";
import About1 from "../images/index.png";
import About2 from "../images/indexinv.png";
import useAnimationEffect from "../hooks/useAnimationEffect";

const About = () => {
  // Use the custom animation hook
  useAnimationEffect();

  return (
    <div>
      <div className="container fade-in">
        <div className="row d-flex justify-content-center">
          <div className="col-md-8 box">
            <div
              className="row d-flex justify-content-center"
              style={{ marginTop: "50px" }}
            >
              <h3 className="center primary monarque">ResDex | About</h3>
              <img
                src={About1}
                alt="ResDex Logo"
                className="center"
                id="img-login"
              ></img>
            </div>
            <div className="row d-flex justify-content-center">
              <p
                className="primary text-center"
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
    </div>
  );
};

export default About;
