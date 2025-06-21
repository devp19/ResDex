import React from "react";
import Empty from "../images/empty-pic.webp";
import "./Team.css";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { Logo } from "../components/common";
import dev from "../images/devceo.png";
import tirth from "../images/tirthceo.png";
import kush from "../images/kushceo.png";
import fenil from "../images/fenilceo.png";
import jay from "../images/jayceo.png";
import darsh from "../images/darshceo.png";
import bhavi from "../images/bhaviceo.png";
import deep from "../images/deepceo.png";

const Team = () => {
  // Use the custom animation hook
  useAnimationEffect();

  // Team member data
  const teamMembers = [
    {
      category: "FOUNDERS",
      members: [
        {
          name: "Dev Patel",
          position: ["Co-Founder &", "Founding Engineer"],
          bio: "Dev is a passionate full-stack developer with expertise in JavaScript, React, and Node.js. He's been building web applications for over 5 years and leads our technical vision.",
          linkedin: "https://www.linkedin.com/in/devp19/",
          github: "https://github.com/devp19",
          image: dev,
        },
        {
          name: "Fenil Shah",
          position: ["Co-Founder &", "Project Manager"],
          bio: "Fenil brings exceptional organizational skills and a talent for bringing teams together. With a background in business and technology, he ensures our projects stay on track.",
          linkedin: "https://www.linkedin.com/in/fenilshah05/",
          github: "https://github.com/Fshah05",
          image: fenil,
        },
      ],
    },
    {
      category: "MEDICAL OUTSOURCING",
      members: [
        {
          name: "Deep Patel",
          position: ["Outreach"],
          bio: "Deep specializes in medical outsourcing with extensive knowledge in healthcare systems and patient care coordination.",
          linkedin: "https://www.linkedin.com/in/deepptll/",
          email: "dpptl16@gmail.com",
          image: deep,
        },
        {
          name: "Bhavi Singh",
          position: ["Outreach"],
          bio: "Bhavi has a strong background in medical administration and patient service coordination.",
          linkedin: "https://www.linkedin.com/in/bhavendra-singh-75bbb129b/",
          email: "bhavendrasingh08.com",
          image: bhavi,
        },
      ],
    },
    {
      category: "MARKETING",
      members: [
        {
          name: "Tirth Patel",
          position: ["Marketing & UI Designer"],
          bio: "Tirth combines creative design skills with strategic marketing to enhance our brand presence and user experience.",
          linkedin: "https://www.linkedin.com/in/tirthpatel2673/",
          email: "tirthpatel2673@gmail.com",
          image: tirth,
        },
      ],
    },
    {
      category: "DEVELOPMENT",
      members: [
        {
          name: "Kush Patel",
          position: ["Full-Stack Developer"],
          bio: "Kush is a skilled developer with expertise in both frontend and backend technologies, ensuring robust application architecture.",
          linkedin: "https://www.linkedin.com/in/kushp4444/",
          email: "kushp4444@gmail.com",
          image: kush,
        },
        {
          name: "Jay Patel",
          position: ["Full-Stack Developer"],
          bio: "Jay brings innovative solutions to complex development challenges with a focus on performance and scalability.",
          linkedin: "https://www.linkedin.com/in/jay-patel-wlu/",
          email: "jaypt2105@gmail.com",
          image: jay,
        },
        {
          name: "Darsh Kansara",
          position: ["Full-Stack Developer"],
          bio: "Darsh is a passionate full-stack developer with expertise in modern web technologies. He specializes in creating seamless user experiences and scalable backend solutions, contributing to ResDex's technical excellence.",
          linkedin: "https://www.linkedin.com/in/darshk22/",
          email: "darshk0822@gmail.com",
          image: darsh,
        },
      ],
    },
  ];

  return (
    <div className="team-page">
      <div className="row justify-content-center d-flex display fade-in mt-4">
        <Logo />
      </div>
      <div className="row text-center fade-in">
        <p className="primary">⏐</p>
      </div>
      <div
        className="center primary monarque fade-in"
        style={{ fontSize: "50px" }}
      >
        Team ResDex
      </div>
      <p
        className="center primary fade-in"
        style={{ fontSize: "15px", marginTop: "-50px" }}
      >
        Meet the minds behind ResDex!
      </p>

      {teamMembers.map((team, index) => (
        <React.Fragment key={index}>
          <div
            className="center primary kugile fade-in"
            style={{
              fontSize: "30px",
              marginTop: index === 0 ? "40px" : "80px",
              marginBottom: "0px",
            }}
          >
            {team.category}
          </div>

          <div className="row d-flex justify-content-center display">
            {team.members.map((member, memberIndex) => (
              <div
                key={memberIndex}
                className="col-md-3 d-flex flex-column align-items-center justify-content-center team-card fade-in"
                style={{ marginBottom: "20px", margin: "20px" }}
              >
                <div className="profile-pic">
                  <img
                    src={member.image}
                    alt={`Profile of ${member.name}`}
                    className="profile-img"
                  />
                </div>
                <p className="profile-name #2a2a2a text-center">
                  {member.name}
                </p>
                {member.position.map((pos, posIndex) => (
                  <p
                    key={posIndex}
                    className={`profile-position ${
                      posIndex > 1 ? "minus" : ""
                    } text-center`}
                  >
                    {pos}
                  </p>
                ))}

                <div
                  className="member-bio"
                  style={{ position: "relative", textAlign: "center" }}
                >
                  <p className="member-bio">{member.bio}</p>
                </div>

                <p className="social-links">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        style={{ margin: "20px" }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="primary"
                        className="bi bi-linkedin"
                        viewBox="0 0 16 16"
                      >
                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
                      </svg>
                    </a>
                  )}

                  {member.github ? (
                    <a
                      href={member.github}
                      style={{ marginBottom: "20px" }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        style={{ margin: "20px" }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="primary"
                        className="bi bi-github"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                      </svg>
                    </a>
                  ) : member.email ? (
                    <a href={`mailto:${member.email}`}>
                      <svg
                        style={{ margin: "20px" }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="primary"
                        className="bi bi-envelope-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z" />
                      </svg>
                    </a>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Team;
