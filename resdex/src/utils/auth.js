import {
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  unlink,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

/**
 * Shared Google sign-in flow for both login and signup.
 *
 * @param {Object} params - All required params for the flow.
 * @param {object} params.auth - Firebase auth instance
 * @param {object} params.db - Firestore db instance
 * @param {function} params.navigate - React Router navigate function
 * @param {function} params.setGoogleUser - Setter for Google user state
 * @param {function} params.setInitialFullName - Setter for initial full name
 * @param {function} params.setInitialDisplayName - Setter for initial display name
 * @param {function} params.setModalError - Setter for modal error
 * @param {function} params.setShowGoogleModal - Setter for showing Google modal
 * @param {function} params.setError - Setter for error message
 * @param {function} [params.onUserExists] - Optional callback if user exists (receives userData)
 */
export async function handleGoogleSignInFlow({
  auth,
  db,
  navigate,
  setGoogleUser,
  setInitialFullName,
  setInitialDisplayName,
  setModalError,
  setShowGoogleModal,
  setError,
  onUserExists,
}) {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      if (onUserExists) {
        onUserExists(userDocSnap.data());
      } else {
        // Default: navigate to profile
        const username = userDocSnap.data().username;
        if (username) {
          navigate(`/profile/${username}`);
          setTimeout(() => window.location.reload(), 100);
        }
      }
    } else {
      setGoogleUser(user);
      const fullName = user.displayName || "";
      const displayName = user.displayName
        ? user.displayName.toLowerCase().replace(/\s+/g, "")
        : user.email.split("@")[0];
      setInitialFullName(fullName);
      setInitialDisplayName(displayName);
      setModalError("");
      setShowGoogleModal(true);
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    if (error.code === "auth/popup-closed-by-user") {
      setError("Sign-in was cancelled. Please try again.");
    } else {
      setError("Failed to sign in with Google. Please try again.");
    }
  }
}

/**
 * Shared Google sign-up completion logic for both login and signup.
 *
 * @param {Object} params - All required params for the flow.
 * @param {object} params.db - Firestore db instance
 * @param {object} params.googleUser - Google user object
 * @param {object} params.userData - { fullName, displayName }
 * @param {function} params.setModalError - Setter for modal error
 * @param {function} params.setShowGoogleModal - Setter for showing Google modal
 * @param {function} [params.setSuccess] - Setter for success message (optional)
 * @param {function} [params.navigate] - React Router navigate function (optional)
 */
export async function handleGoogleSignupCompleteFlow({
  db,
  googleUser,
  userData,
  setModalError,
  setShowGoogleModal,
  setSuccess,
  navigate,
}) {
  if (!googleUser) return;
  try {
    // Check if username exists
    const usernameQuery = query(
      collection(db, "usernames"),
      where("username", "==", userData.displayName)
    );
    const usernameQuerySnapshot = await getDocs(usernameQuery);
    if (!usernameQuerySnapshot.empty) {
      setModalError("Username already exists. Please choose a different one.");
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
    if (setSuccess) {
      setSuccess("Successfully signed up with Google!");
    }
    if (navigate) {
      navigate(`/profile/${userData.displayName}`);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  } catch (error) {
    console.error("Error completing Google signup:", error);
    setModalError("Failed to complete signup. Please try again.");
  }
}

/**
 * Link a Google account to the currently signed-in user.
 *
 * @param {Object} params
 * @param {object} params.auth - Firebase auth instance
 * @param {object} params.db - Firestore db instance
 * @param {function} params.setLinkGoogleError - Setter for error message
 * @param {function} params.setLinkGoogleSuccess - Setter for success message
 * @param {function} [params.setLinkingGoogle] - Setter for loading state (optional)
 * @param {function} [params.onLinked] - Callback on successful link (optional)
 * @param {string} [params.profilePicture] - Current profile picture (optional)
 */
export async function handleLinkGoogleAccount({
  auth,
  db,
  setLinkGoogleError,
  setLinkGoogleSuccess,
  setLinkingGoogle,
  onLinked,
  profilePicture,
}) {
  setLinkGoogleError && setLinkGoogleError("");
  setLinkGoogleSuccess && setLinkGoogleSuccess("");
  setLinkingGoogle && setLinkingGoogle(true);
  try {
    const provider = new GoogleAuthProvider();
    const result = await linkWithPopup(auth.currentUser, provider);
    const googleUser = result.user;
    // Update Firestore user profile
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, {
      googleAccount: true,
      googleEmail: googleUser.email,
      profilePicture: googleUser.photoURL || profilePicture,
    });
    setLinkGoogleSuccess &&
      setLinkGoogleSuccess("Google account linked successfully!");
    if (onLinked) onLinked(googleUser);
  } catch (error) {
    if (setLinkGoogleError) {
      if (error.code === "auth/credential-already-in-use") {
        setLinkGoogleError(
          "This Google account is already linked to another user."
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        setLinkGoogleError("Popup closed. Please try again.");
      } else {
        setLinkGoogleError("Failed to link Google account. Please try again.");
      }
    }
    console.error("Google link error:", error);
  } finally {
    setLinkingGoogle && setLinkingGoogle(false);
  }
}

/**
 * Unlink the Google account from the currently signed-in user.
 *
 * @param {Object} params
 * @param {object} params.auth - Firebase auth instance
 * @param {object} params.db - Firestore db instance
 * @param {function} params.onSuccess - Callback on successful unlink
 * @param {function} params.onError - Callback on error
 */
export async function handleUnlinkGoogleAccount({
  auth,
  db,
  onSuccess,
  onError,
}) {
  try {
    await unlink(auth.currentUser, "google.com");
    // Update Firestore user profile
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, {
      googleAccount: false,
      googleEmail: null,
    });
    if (onSuccess) onSuccess();
  } catch (error) {
    if (onError) onError(error);
    console.error("Google unlink error:", error);
  }
}
