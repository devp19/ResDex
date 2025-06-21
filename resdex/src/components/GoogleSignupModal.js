import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Logo from "../images/dark-transparent.png";

const GoogleSignupModal = ({
  show,
  onHide,
  onComplete,
  googleUser,
  initialFullName = "",
  initialDisplayName = "",
  externalError = "",
}) => {
  const [fullName, setFullName] = useState(initialFullName);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState("");

  // Update local state when props change
  useEffect(() => {
    setFullName(initialFullName);
    setDisplayName(initialDisplayName);
  }, [initialFullName, initialDisplayName]);

  // Clear error when modal opens
  useEffect(() => {
    if (show) {
      setError("");
    }
  }, [show]);

  // Show external error if provided
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleComplete = () => {
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    const username = displayName.toLowerCase().replace(/\s+/g, "");
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (!usernameRegex.test(username)) {
      setError("Username can only contain letters and numbers, with no spaces or special characters.");
      return;
    }

    setError("");
    onComplete({
      fullName: fullName.trim(),
      displayName: username,
    });
  };

  const handleCancel = () => {
    setError("");
    setFullName(initialFullName);
    setDisplayName(initialDisplayName);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleCancel} className="box" centered>
      <Modal.Header
        style={{
          background: "#e5e3df",
          borderBottom: "1px solid white",
        }}
        closeButton
      >
        <Modal.Title className="primary">
          <div className="row justify-content-left">
            <img
              src={Logo}
              style={{ maxWidth: "70px", fill: "black" }}
              alt="resdex-logo"
            />
          </div>
          <div className="row"></div>
          Complete Your Profile
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          background: "#e5e3df",
          borderBottom: "1px solid white",
          padding: "30px",
        }}
      >
        <em className="primary mb-3 d-flex" style={{fontSize: "14px", lineHeight: "1.5"}}>
          Please provide your full name and choose a display name to complete your account setup.
        </em>
        <br></br>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="primary">Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="primary">Display Name (Username)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Choose a username"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              This will be your unique username on ResDex
            </Form.Text>
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer
        style={{
          background: "#e5e3df",
          borderBottom: "1px solid white",
        }}
      >
        <Button className="custom-view" onClick={handleCancel}>
          Cancel
        </Button>
        <Button className="custom-view" onClick={handleComplete}>
          Complete Signup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GoogleSignupModal; 