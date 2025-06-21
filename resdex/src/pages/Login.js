import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { FormField, MessageDisplay } from "../components/common";
import Logo from "../images/index.png";

const Login = () => {
  // Use the custom animation hook
  useAnimationEffect();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
          <div className="col-md-5 box">
            <div
              className="row d-flex justify-content-center"
              style={{ marginTop: "50px" }}
            >
              <h3 className="center primary monarque">ResDex | Login</h3>
              <img
                src={Logo}
                alt="ResDex Logo"
                className="center"
                id="img-login"
              ></img>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
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
              />

              <Link className="primary" to="/recovery">
                Forgot your password?
              </Link>
              <br></br>

              <MessageDisplay error={error} />

              <Button className="custom" type="submit">
                Sign In
              </Button>
              <p className="primary">
                <br></br>
                <br></br>
                Don't have an account?{" "}
                <Link className="primary" to="/signup">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
