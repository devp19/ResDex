import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { FormField, MessageDisplay } from "../components/common";

const Contact = () => {
  // Use the custom animation hook
  useAnimationEffect();

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          console.log("SUCCESS!", response.status, response.text);
          setSuccess("Ticket submitted successfully!");
          setError("");
          navigate("/success");
        },
        (err) => {
          console.error("FAILED...", err);
          setError("Failed to submit ticket. Please try again.");
          setSuccess("");
        }
      );
  };

  return (
    <div>
      <br />
      <h1 className="center primary monarque mt-3 fade-in">
        Question, Issue, Feature?
      </h1>
      <p className="center primary fade-in">Send a ticket down below!</p>

      <div>
        <div className="container fade-in" style={{ marginTop: "60px" }}>
          <div className="row center">
            <div className="col-md-7 box">
              <form className="contact-form" onSubmit={sendTicket}>
                <FormField
                  label="Full Name"
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  controlId="formBasicFullName"
                  required
                />

                <FormField
                  label="Email address"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  controlId="formBasicEmail"
                  required
                />

                <FormField
                  label="Subject"
                  type="text"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  controlId="formBasicSubject"
                />

                <FormField
                  label="Body"
                  type="textarea"
                  placeholder="Enter Message (Max 1500 Characters)"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  controlId="formBasicBody"
                  required
                  rows="5"
                  maxLength="1500"
                  style={{ height: "200px" }}
                />

                <MessageDisplay error={error} success={success} />

                <Button
                  className="custom"
                  style={{ marginBottom: "20px" }}
                  type="submit"
                >
                  Submit Ticket
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
