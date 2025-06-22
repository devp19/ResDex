import React, { useState } from "react";
import { Button } from "react-bootstrap";
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { FormField, MessageDisplay } from "../components/common";
import GoogleSignupModal from "../components/GoogleSignupModal";
import Logo from "../images/index.png";
import {
  handleGoogleSignInFlow,
  handleGoogleSignupCompleteFlow,
} from "../utils/auth";

const Login = () => {
  // Use the custom animation hook
  useAnimationEffect();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [initialFullName, setInitialFullName] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [modalError, setModalError] = useState("");
  const navigate = useNavigate();

  // Function to handle Google sign-in
  const handleGoogleSignIn = () =>
    handleGoogleSignInFlow({
      auth,
      db,
      navigate,
      setGoogleUser,
      setInitialFullName,
      setInitialDisplayName,
      setModalError,
      setShowGoogleModal,
      setError,
    });

  // Function to handle Google signup completion
  const handleGoogleSignupComplete = (userData) =>
    handleGoogleSignupCompleteFlow({
      db,
      googleUser,
      userData,
      setModalError,
      setShowGoogleModal,
      navigate,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      if (user.emailVerified) {
        localStorage.setItem("authToken", token);
        console.log("Login successful");

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const username = userData.username;

          if (username) {
            navigate(`/profile/${username}`);
            setTimeout(() => {
              window.location.reload();
            }, 100);
          } else {
            setError("Username not found. Please contact support.");
          }
        } else {
          setError("User data not found. Please contact support.");
        }
      } else {
        setError(
          "Email has not been verified. Please verify before continuing!"
        );
        await signOut(auth);
      }
    } catch (err) {
      setError("Failed to log in. Check your credentials.");
      console.error(err);
    }
  };

  return (
    <div>
      <div className="container fade-in">
        <div className="row d-flex justify-content-center">
          <div
            className="col-md-5 box"
            style={{ maxWidth: "500px", paddingBlock: "20px" }}
          >
            <div
              className="row d-flex justify-content-center"
              style={{ marginTop: "50px" }}
            >
              <h3
                className="center primary monarque"
                style={{ marginBottom: "0px" }}
              >
                ResDex | Login
              </h3>
              <img
                src={Logo}
                alt="ResDex Logo"
                className="center"
                id="img-login"
                style={{ marginBlock: "30px", marginBottom: 0 }}
              ></img>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="text-center mt-3">
                <Button
                  className="custom"
                  onClick={handleGoogleSignIn}
                  style={{
                    width: "100%",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign In with Google
                </Button>
                <p className="primary mt-3">- OR -</p>
              </div>
              <FormField
                label="Email address"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                controlId="formBasicEmail"
              />

              <FormField
                label="Password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                controlId="formBasicPassword"
                className="mb-0"
              />

              <Link
                className="primary"
                to="/recovery"
                style={{
                  fontSize: "13px",
                  marginBlock: "10px",
                  display: "inline-block",
                }}
              >
                Forgot your password?
              </Link>
              <br></br>

              <MessageDisplay error={error} />

              <div className="text-center">
                <Button
                  className="custom"
                  type="submit"
                  style={{ width: "100%" }}
                >
                  Sign In
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="primary">
                  Don't have an account?{" "}
                  <Link className="primary" to="/signup">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Google Signup Modal */}
      <GoogleSignupModal
        show={showGoogleModal}
        onHide={() => setShowGoogleModal(false)}
        onComplete={handleGoogleSignupComplete}
        googleUser={googleUser}
        initialFullName={initialFullName}
        initialDisplayName={initialDisplayName}
        externalError={modalError}
      />
    </div>
  );
};

export default Login;
