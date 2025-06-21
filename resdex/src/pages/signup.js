import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import Logo from "../images/index.png";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { FormField, MessageDisplay } from "../components/common";

const Signup = () => {
  // Use the custom animation hook
  useAnimationEffect();

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const username = displayName.toLowerCase().replace(/\s+/g, "");
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (!usernameRegex.test(username)) {
      setError(
        "Username can only contain letters and numbers, with no spaces or special characters."
      );
      return;
    }

    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      console.log("Checking if username exists...");
      const usernameQuery = query(
        collection(db, "usernames"),
        where("username", "==", username)
      );
      const usernameQuerySnapshot = await getDocs(usernameQuery);

      if (!usernameQuerySnapshot.empty) {
        setError("Username already exists. Please choose a different one.");
        return;
      }

      console.log("Creating user with email and password...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User created:", user.uid);

      console.log("Sending email verification...");
      await sendEmailVerification(user);

      console.log("Updating user profile...");
      await updateProfile(auth.currentUser, { displayName: fullName });

      console.log("Adding username to 'usernames' collection...");
      await setDoc(doc(db, "usernames", username), {
        username: username,
        userId: user.uid,
      });

      console.log("Adding user details to 'users' collection...");
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        displayName: username,
        email: email,
        profilePicture: null,
        username: username,
        contributions: 0,
      });

      console.log("Adding user to 'searchIndex' collection array...");
      const searchIndexRef = doc(db, "searchIndex", "usersList");

      const searchIndexDoc = await getDoc(searchIndexRef);
      if (!searchIndexDoc.exists()) {
        await setDoc(searchIndexRef, {
          users: [
            {
              uid: user.uid,
              username: username,
              fullName: fullName,
            },
          ],
        });
      } else {
        await updateDoc(searchIndexRef, {
          users: arrayUnion({
            userId: user.uid,
            username: username,
            fullName: fullName,
          }),
        });
      }

      console.log("Firestore write operations completed successfully");

      setSuccess(
        "Verification email sent! Please check your inbox to verify your email address."
      );
      await signOut(auth);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (authError) {
      console.error("Error during authentication:", authError);
      setError(authError.message);
    }
  };

  const handlePassword2Change = (e) => {
    const value = e.target.value;
    setPassword2(value);
    setPasswordMatch(value === password);
  };

  return (
    <div>
      <div className="container fade-in top">
        <div className="row d-flex justify-content-center">
          <div className="col-md-5 box">
            <div
              className="row d-flex justify-content-center"
              style={{ marginTop: "50px" }}
            >
              <h3 className="center primary monarque">ResDex | Sign Up</h3>
              <img
                src={Logo}
                alt="ResDex Logo"
                className="center"
                id="img-login"
              ></img>
            </div>
            <div className="row d-flex justify-content-center">
              <form className="login-form" onSubmit={handleSignup}>
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
                  label="Display Name (Username)"
                  type="text"
                  placeholder="Enter display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  controlId="formBasicDisplayName"
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
                  label="Password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  controlId="formBasicPassword"
                  required
                />

                <FormField
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  value={password2}
                  onChange={handlePassword2Change}
                  controlId="formBasicPassword2"
                  required
                />

                {!passwordMatch && password2 && (
                  <p style={{ color: "red" }}>Passwords do not match</p>
                )}

                <MessageDisplay error={error} success={success} />

                <Button className="custom" type="submit">
                  Sign Up
                </Button>
                <p className="primary">
                  <br></br>
                  <br></br>
                  Already have an account?{" "}
                  <Link className="primary" to="/login">
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
