import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
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
import GoogleSignupModal from "../components/GoogleSignupModal";

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
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [initialFullName, setInitialFullName] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [modalError, setModalError] = useState("");

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in our database
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // User already exists, navigate to their profile
        const userData = userDocSnap.data();
        const username = userData.username;
        if (username) {
          navigate(`/profile/${username}`);
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          setError("User data incomplete. Please contact support.");
        }
        return;
      }

      // User doesn't exist, show modal to collect additional info
      setGoogleUser(user);
      const fullName = user.displayName || "";
      const displayName = user.displayName
        ? user.displayName.toLowerCase().replace(/\s+/g, "")
        : user.email.split("@")[0];
      setInitialFullName(fullName);
      setInitialDisplayName(displayName);
      setModalError("");
      setShowGoogleModal(true);
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled. Please try again.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    }
  };

  // Function to handle Google signup completion
  const handleGoogleSignupComplete = async (userData) => {
    if (!googleUser) return;

    try {
      // Check if username exists
      const usernameQuery = query(
        collection(db, "usernames"),
        where("username", "==", userData.displayName)
      );
      const usernameQuerySnapshot = await getDocs(usernameQuery);

      if (!usernameQuerySnapshot.empty) {
        // Username already exists, show error in modal
        setModalError(
          "Username already exists. Please choose a different one."
        );
        return;
      }

      // Store username in usernames collection
      await setDoc(doc(db, "usernames", userData.displayName), {
        username: userData.displayName,
        userId: googleUser.uid,
      });

      // Store user data in users collection
      await setDoc(doc(db, "users", googleUser.uid), {
        uid: googleUser.uid,
        fullName: userData.fullName,
        displayName: userData.displayName,
        email: googleUser.email,
        profilePicture: googleUser.photoURL,
        username: userData.displayName,
        contributions: 0,
        googleAccount: true,
      });

      // Add user to search index
      const searchIndexRef = doc(db, "searchIndex", "usersList");
      const searchIndexDoc = await getDoc(searchIndexRef);

      if (!searchIndexDoc.exists()) {
        await setDoc(searchIndexRef, {
          users: [
            {
              uid: googleUser.uid,
              username: userData.displayName,
              fullName: userData.fullName,
            },
          ],
        });
      } else {
        await updateDoc(searchIndexRef, {
          users: arrayUnion({
            userId: googleUser.uid,
            username: userData.displayName,
            fullName: userData.fullName,
          }),
        });
      }

      setShowGoogleModal(false);
      setModalError("");
      setSuccess("Successfully signed up with Google!");
      setTimeout(() => {
        navigate(`/profile/${userData.displayName}`);
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 1000);
    } catch (error) {
      console.error("Error completing Google signup:", error);
      setModalError("Failed to complete signup. Please try again.");
    }
  };

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
      if (authError.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Signup Error:", authError);
    }
  };

  const handlePassword2Change = (e) => {
    const value = e.target.value;
    setPassword2(value);
    setPasswordMatch(value === password);
  };

  return (
    <div>
      <div className="container fade-in">
        <div className="row d-flex justify-content-center">
          <div
            className="col-md-5 box"
            style={{ maxWidth: "420px", paddingBlock: "20px" }}
          >
            <div
              className="row d-flex justify-content-center"
              style={{ marginTop: "50px" }}
            >
              <h3
                className="center primary monarque"
                style={{ marginBottom: "0px" }}
              >
                ResDex | Sign Up
              </h3>
              <img
                src={Logo}
                alt="ResDex Logo"
                className="center"
                id="img-login"
                style={{ marginBlock: "30px", marginBottom: 0 }}
              ></img>
            </div>
            <form className="login-form" onSubmit={handleSignup}>
              <div className="text-center mt-3">
                <Button
                  className="custom"
                  onClick={handleGoogleSignIn}
                  type="button"
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
                  Sign Up with Google
                </Button>
                <p className="primary mt-3">- OR -</p>
              </div>
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

              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && <p style={{ color: "green" }}>{success}</p>}

              <div className="text-center">
                <Button
                  className="custom"
                  type="submit"
                  style={{ width: "100%", marginBlock: "10px" }}
                >
                  Sign Up
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="primary" style={{ marginTop: "-10px" }}>
                  Already have an account?{" "}
                  <Link className="primary" to="/login">
                    Sign In
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

export default Signup;
