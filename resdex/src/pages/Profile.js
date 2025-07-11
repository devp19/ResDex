import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { Tooltip } from "react-tooltip";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
} from "firebase/firestore";
import ProfilePictureUpload from "./ProfilePictureUpload";
import PDFUpload from "./PDFUpload";
import CertificationUpload from "./CertificationUpload";
// import { s3 } from '../awsConfig';
import { s3 } from "../cloudflareConfig";
import Select from "react-select";
import Carousel from "react-bootstrap/Carousel";
import blank from "../images/empty-pic.webp";
import { canadianUniversities } from "../Orgs/canadianUniversities";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import Logo from "../images/dark-transparent.png";
import ResDexIcon from "../images/logo-icon.png";
import GoogleSignupModal from "../components/GoogleSignupModal";
import {
  handleLinkGoogleAccount,
  handleUnlinkGoogleAccount,
} from "../utils/auth";
import ChatBox from "./ChatBox";

const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// ResDex Team Member Configuration
const RESDEX_TEAM_MEMBERS = [
  "dev", "fenil", "deep", "bhavi", "tirth", "kush", "jay", "darsh"
];

// ResDex Badge Component
const ResDexBadge = () => (
  <>
    <img
      src={ResDexIcon}
      alt="ResDex Member"
      data-tooltip-id="resdex-badge-tooltip"
      data-tooltip-content="Team Member"
      style={{
        marginLeft: "10px",
        marginTop: "-5px",
        cursor: "pointer",
        transition: "transform 0.2s ease",
        width: "25px",
        height: "25px",
      }}
      onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
    />
    <Tooltip 
      id="resdex-badge-tooltip" 
      place="top" 
      effect="solid" 
      className="z-index-tooltip"
      style={{fontSize: '12px'}}
    />
  </>
);

const saveProfileToLocalStorage = (username, profileData) => {
  const dataToStore = {
    profile: profileData,
    timestamp: Date.now(),
  };
  localStorage.setItem(`profile_${username}`, JSON.stringify(dataToStore));
};

const getProfileFromLocalStorage = (username) => {
  const storedData = localStorage.getItem(`profile_${username}`);
  if (storedData) {
    const { profile, timestamp } = JSON.parse(storedData);
    if (Date.now() - timestamp < CACHE_EXPIRATION) {
      return profile;
    }
  }
  return null;
};

const Profile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [about, setAbout] = useState("");
  const [organization, setOrganization] = useState("");
  const [interests, setInterests] = useState("");
  const [newOrganization, setNewOrganization] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAbout, setNewAbout] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfs, setPdfs] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [contributionsCount, setContributionsCount] = useState(
    profileUser ? profileUser.contributions : 0
  );
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [currentCertificationIndex, setCurrentCertificationIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [pdfToRemove, setPdfToRemove] = useState(null);
  const [certificationToRemove, setCertificationToRemove] = useState(null);

  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const [editedTags, setEditedTags] = useState([]);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);

  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [initialFullName, setInitialFullName] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [modalError, setModalError] = useState("");

  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [linkGoogleError, setLinkGoogleError] = useState("");
  const [linkGoogleSuccess, setLinkGoogleSuccess] = useState("");

  const [showGoogleLinkedToast, setShowGoogleLinkedToast] = useState(false);
  const [googleToastMessage, setGoogleToastMessage] = useState("");
  const [googleToastType, setGoogleToastType] = useState("success"); // 'success' or 'error'

  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [showChatConfirmModal, setShowChatConfirmModal] = useState(false);

  const navigate = useNavigate(); // (add this inside your component, e.g., near `useEffect`)

  const handleShareModalOpen = () => {
    setShowShareModal(true);
  };

  const handleOrganizationClick = (org) => {
    navigate(`/search?q=${encodeURIComponent(org)}&type=universities`);
  };

  const handleTagClick = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}&type=papers`);
  };

  const handleChatClick = async () => {
    if (!currentUser || !profileUser) return;

    try {
      // Create or find the chat between current user and profile user
      const chatId = await createOrFindChat(currentUser, profileUser);

      // Wait for Firestore to confirm the chat exists in the user's chat list
      await waitForChatToAppear(chatId, currentUser.uid);

      // Navigate to messages page with the chat ID
      navigate(`/messages?chatId=${chatId}`);
    } catch (error) {
      console.error('Error creating/finding chat:', error);
      alert('Unable to start chat. Please try again.');
    }
  };

  // Wait for the chat to appear in the user's chat list
  const waitForChatToAppear = (chatId, userId, timeout = 3000) => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const interval = setInterval(async () => {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', userId));
        const querySnapshot = await getDocs(q);
        const exists = querySnapshot.docs.some(doc => doc.id === chatId);
        if (exists) {
          clearInterval(interval);
          resolve();
        } else if (Date.now() - start > timeout) {
          clearInterval(interval);
          reject(new Error('Chat did not appear in time'));
        }
      }, 200);
    });
  };

  const createOrFindChat = async (currentUser, profileUser) => {
    // Check if a chat already exists between these users
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participants', 'array-contains', currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const existingChat = querySnapshot.docs.find(doc => {
      const chatData = doc.data();
      return chatData.participants.includes(profileUser.uid);
    });

    if (existingChat) {
      return existingChat.id;
    }

    // Create a new chat if it doesn't exist
    const newChatData = {
      participants: [currentUser.uid, profileUser.uid],
      createdAt: new Date().toISOString(),
      lastMessage: null
    };

    const chatDocRef = await addDoc(chatsRef, newChatData);
    return chatDocRef.id;
  };

  const startChat = () => {
    setShowChatConfirmModal(false);
    // setShowChat(true);
  };

  const interestOptions = [
    { value: "Technology", label: "Technology" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Finance", label: "Finance" },
    { value: "Construction", label: "Construction" },
    { value: "Education", label: "Education" },
    { value: "Hospitality", label: "Hospitality" },
    { value: "Law", label: "Law" },
    { value: "Arts", label: "Arts" },
  ];

  useEffect(() => {
    if (profileUser) {
      setContributionsCount(profileUser.contributions || 0);
    }
  }, [profileUser]);

  const increaseContributions = async () => {
    try {
      const updatedCount = contributionsCount + 1;
      setContributionsCount(updatedCount);

      if (profileUser) {
        const userDocRef = doc(db, "users", profileUser.uid);
        await updateDoc(userDocRef, { contributions: updatedCount });
        console.log("Contributions updated in Firestore.");
      }
    } catch (error) {
      console.error("Error updating contributions:", error);
    }
  };

  const fetchFollowersList = async () => {
    if (
      !profileUser ||
      !profileUser.followers ||
      profileUser.followers.length === 0
    ) {
      setFollowersList([]);
      return;
    }
    setFollowersLoading(true);
    try {
      const followerDocs = await Promise.all(
        profileUser.followers.map((uid) => getDoc(doc(db, "users", uid)))
      );
      const followers = followerDocs
        .filter((docSnap) => docSnap.exists())
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            uid: docSnap.id,
            fullName:
              data.fullName || data.displayName || data.username || "Unknown",
            username: data.username || "unknown",
            profilePicture: data.profilePicture,
            organization: data.organization || "",
          };
        });
      setFollowersList(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowersList([]);
    }
    setFollowersLoading(false);
  };

  const handleShowFollowersModal = () => {
    setShowFollowersModal(true);
    fetchFollowersList();
  };

  const checkFollowStatus = useCallback(async () => {
    if (!currentUser || !profileUser) return;

    const profileUserRef = doc(db, "users", profileUser.uid);
    const currentUserRef = doc(db, "users", currentUser.uid);

    try {
      const [profileUserDoc, currentUserDoc] = await Promise.all([
        getDoc(profileUserRef),
        getDoc(currentUserRef),
      ]);

      if (profileUserDoc.exists() && currentUserDoc.exists()) {
        const profileUserData = profileUserDoc.data();
        const currentUserData = currentUserDoc.data();

        const profileUserFollowers = profileUserData.followers || [];
        const profileUserFollowing = profileUserData.following || [];

        const currentUserFollowing = currentUserData.following || [];
        const currentUserPendingRequests =
          currentUserData.pendingFollowRequests || [];

        setIsFollowing(currentUserFollowing.includes(profileUser.uid));

        setRequestSent(currentUserPendingRequests.includes(profileUser.uid));

        setFollowerCount(profileUserFollowers.length);
        setFollowingCount(profileUserFollowing.length);
      } else {
        setIsFollowing(false);
        setFollowerCount(0);
        setFollowingCount(0);
        setHasPendingRequest(false);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }, [currentUser, profileUser]);

  const updateProfile = useCallback(
    async (updates) => {
      if (!profileUser) return;

      try {
        const userDocRef = doc(db, "users", profileUser.uid);
        await updateDoc(userDocRef, updates);
        console.log("Profile updated:", updates);

        const updatedUser = { ...profileUser, ...updates };
        setProfileUser(updatedUser);
        saveProfileToLocalStorage(username, updatedUser);

        if (updates.about !== undefined) setAbout(updates.about);
        if (updates.organization !== undefined)
          setOrganization(updates.organization);
        if (updates.interests !== undefined) {
          setInterests(updates.interests);
          setSelectedInterests(
            updates.interests.split(", ").map((i) => ({ value: i, label: i }))
          );
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    },
    [profileUser, username]
  );

  useEffect(() => {
    if (currentUser && profileUser) {
      checkFollowStatus();
    }
  }, [currentUser, profileUser, checkFollowStatus]);

  const toggleFollow = async () => {
    if (!currentUser || !profileUser || isRequestInProgress) return;

    setIsRequestInProgress(true);

    const currentUserRef = doc(db, "users", currentUser.uid);
    const profileUserRef = doc(db, "users", profileUser.uid);

    try {
      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(profileUser.uid),
        });
        await updateDoc(profileUserRef, {
          followers: arrayRemove(currentUser.uid),
        });
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
      } else if (!requestSent) {
        const userDocSnap = await getDoc(currentUserRef);
        const firestoreUsername = userDocSnap.exists()
          ? userDocSnap.data().username
          : null;
        const followRequest = {
          requesterId: currentUser.uid,
          fullName: currentUser.displayName,
          requesterName: firestoreUsername,
          timestamp: new Date().toISOString(),
          status: "pending",
        };

        await updateDoc(currentUserRef, {
          pendingFollowRequests: arrayUnion(profileUser.uid),
        });
        await updateDoc(profileUserRef, {
          notifications: arrayUnion(followRequest),
          followRequests: arrayUnion(followRequest),
        });

        setRequestSent(true);
        console.log(
          `${currentUser.displayName} sent a follow request to ${profileUser.fullName}`
        );
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    } finally {
      setIsRequestInProgress(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedToast(true);
      setFadeOut(false);
      
      // Start fade out after 2 seconds
      setTimeout(() => {
        setFadeOut(true);
      }, 2000);
      
      // Hide completely after fade out animation (2s + 1.5s = 3.5s total)
      setTimeout(() => {
        setShowCopiedToast(false);
        setFadeOut(false);
      }, 3500);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleEdit = (pdf) => {
    if (!currentUser || !profileUser || currentUser.uid !== profileUser.uid) {
      return;
    }
    setPdfToRemove(pdf);
    setEditedTitle(pdf.title);
    setEditedDescription(pdf.description);
    setEditedTags(
      pdf.topics
        ? pdf.topics.map((topic) => ({ value: topic, label: topic }))
        : []
    );
    setShowRemoveModal(true);
  };

  const saveChanges = async () => {
    if (!pdfToRemove) return;
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const updatedPdfs = pdfs.map((pdf) =>
        pdf.url === pdfToRemove.url
          ? {
              ...pdf,
              title: editedTitle,
              description: editedDescription,
              topics: editedTags.map((tag) => tag.value),
            }
          : pdf
      );
      await updateDoc(userDocRef, { pdfs: updatedPdfs });
      setPdfs(updatedPdfs);
      console.log("Successfully updated PDF in Firestore");
    } catch (error) {
      console.error("Error updating PDF:", error);
      alert("Failed to update PDF. Please try again.");
    } finally {
      setShowRemoveModal(false);
      setPdfToRemove(null);
    }
  };

  const confirmRemove = async () => {
    if (!pdfToRemove) return;

    try {
      const response = await fetch("https://resdex.onrender.com/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          objectKey: pdfToRemove.objectKey,
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.message);

      const updatedPdfs = pdfs.filter(
        (pdf) => pdf.objectKey !== pdfToRemove.objectKey
      );
      await updateDoc(doc(db, "users", currentUser.uid), { pdfs: updatedPdfs });

      const searchIndexDocRef = doc(db, "searchIndex", "papersList");
      const searchIndexDoc = await getDoc(searchIndexDocRef);

      if (searchIndexDoc.exists()) {
        const papersList = searchIndexDoc.data().papers || [];
        const updatedPapersList = papersList.filter(
          (paper) => paper.objectKey !== pdfToRemove.objectKey
        );

        await updateDoc(searchIndexDocRef, { papers: updatedPapersList });
      }

      setPdfs(updatedPdfs);
      if (currentPdfIndex >= updatedPdfs.length) {
        setCurrentPdfIndex(Math.max(0, updatedPdfs.length - 1));
      }

      console.log("Successfully removed PDF from both R2 and Firestore");
    } catch (error) {
      console.error("Error removing PDF:", error);
      alert("Failed to remove PDF. Please try again.");
    } finally {
      setShowRemoveModal(false);
      setPdfToRemove(null);
    }
  };

  const handleEditCertification = (certification) => {
    if (!currentUser || !profileUser || currentUser.uid !== profileUser.uid) {
      return;
    }
    setCertificationToRemove(certification);
    setShowRemoveModal(true);
  };

  const confirmRemoveCertification = async () => {
    if (!certificationToRemove) return;

    try {
      const response = await fetch("https://resdex.onrender.com/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          objectKey: certificationToRemove.objectKey,
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.message);

      const updatedCertifications = certifications.filter(
        (cert) => cert.objectKey !== certificationToRemove.objectKey
      );
      await updateDoc(doc(db, "users", currentUser.uid), { certifications: updatedCertifications });

      const searchIndexDocRef = doc(db, "searchIndex", "certificationsList");
      const searchIndexDoc = await getDoc(searchIndexDocRef);

      if (searchIndexDoc.exists()) {
        const certificationsList = searchIndexDoc.data().certifications || [];
        const updatedCertificationsList = certificationsList.filter(
          (cert) => cert.objectKey !== certificationToRemove.objectKey
        );

        await updateDoc(searchIndexDocRef, { certifications: updatedCertificationsList });
      }

      setCertifications(updatedCertifications);
      console.log("Successfully removed certification from both R2 and Firestore");
    } catch (error) {
      console.error("Error removing certification:", error);
      alert("Failed to remove certification. Please try again.");
    } finally {
      setShowRemoveModal(false);
      setCertificationToRemove(null);
    }
  };

  const fetchPDFs = useCallback(async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData && userData.pdfs && userData.pdfs.length > 0) {
        setPdfs(userData.pdfs);
      } else {
        setPdfs([]);
      }
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      setPdfs([]);
    }
  }, []);

  const fetchCertifications = useCallback(async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData && userData.certifications && userData.certifications.length > 0) {
        setCertifications(userData.certifications);
      } else {
        setCertifications([]);
      }
    } catch (error) {
      console.error("Error fetching certifications:", error);
      setCertifications([]);
    }
  }, []);

  const fetchProfileData = useCallback(async () => {
    try {
      const cachedProfile = getProfileFromLocalStorage(username);
      if (cachedProfile) {
        console.log("Profile found in local storage");
        setProfileUser(cachedProfile);
        setAbout(cachedProfile.about || "");
        setOrganization(cachedProfile.organization || "");
        setInterests(cachedProfile.interests || "");
        setProfilePicture(cachedProfile.profilePicture || null);
        setLoading(false);
        return;
      }
      if (cachedProfile && cachedProfile.uid) {
        await fetchPDFs(cachedProfile.uid);
        await fetchCertifications(cachedProfile.uid);
      }

      const usernamesRef = collection(db, "usernames");
      const q = query(
        usernamesRef,
        where("username", "==", username.toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("Username not found");
        setProfileUser(null);
        setLoading(false);
        return;
      }

      const userId = querySnapshot.docs[0].data().userId;
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        console.log("User document does not exist");
        setProfileUser(null);
        setAbout("");
        setOrganization("");
        setInterests("");
      } else {
        const userData = userDocSnapshot.data();
        console.log("Full user data:", userData);
        setProfileUser(userData);
        setProfilePicture(userData.profilePicture || null);
        setAbout(userData.about || "");
        setOrganization(userData.organization || "");
        setInterests(userData.interests || "");
        const interestsArray = userData.interests
          ? userData.interests.split(", ")
          : [];
        setSelectedInterests(
          interestsArray.map((interest) => ({
            value: interest,
            label: interest,
          }))
        );
        saveProfileToLocalStorage(username, userData);
        await fetchPDFs(userData.uid);
        await fetchCertifications(userData.uid);
      }
    } catch (error) {
      console.error("Error fetching profile data: ", error);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  }, [username, fetchPDFs, fetchCertifications]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    if (profileUser && profileUser.uid) {
      fetchPDFs(profileUser.uid);
    }
  }, [profileUser, fetchPDFs]);

  useEffect(() => {
    if (profileUser && profileUser.uid) {
      fetchCertifications(profileUser.uid);
    }
  }, [profileUser, fetchCertifications]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const updateProfilePicture = useCallback(
    (newPictureUrl) => {
      setProfilePicture(newPictureUrl);
      setProfileUser((prev) => {
        if (prev) {
          const updatedUser = { ...prev, profilePicture: newPictureUrl };
          saveProfileToLocalStorage(username, updatedUser);
          return updatedUser;
        }
        return null;
      });
    },
    [username]
  );

  const updateAbout = useCallback(
    async (newAboutSection) => {
      if (!profileUser) return; // make sure profile exists otherwise it screws up idk y even tho it exists

      setAbout(newAboutSection);
      const updatedUser = { ...profileUser, about: newAboutSection };
      saveProfileToLocalStorage(username, updatedUser);
      setProfileUser(updatedUser);

      try {
        const userDocRef = doc(db, "users", profileUser.uid);
        await updateDoc(userDocRef, { about: newAboutSection });
        console.log("About section updated in Firestore.");
      } catch (error) {
        console.error("Error updating about section in Firestore: ", error);
      }
    },
    [username, profileUser]
  );

  const updateOrganization = useCallback(
    async (newOrganizationSection) => {
      if (!profileUser) return;

      setOrganization(newOrganizationSection);
      const updatedUser = {
        ...profileUser,
        organization: newOrganizationSection,
      };
      saveProfileToLocalStorage(username, updatedUser);
      setProfileUser(updatedUser);

      try {
        const userDocRef = doc(db, "users", profileUser.uid);
        await updateDoc(userDocRef, { organization: newOrganizationSection });
        console.log("Organization section updated in Firestore.");
      } catch (error) {
        console.error(
          "Error updating organization section in Firestore: ",
          error
        );
      }
    },
    [username, profileUser]
  );

  const updateInterests = useCallback(
    async (newInterests) => {
      if (!profileUser) return;
      const interestValues = newInterests.map((interest) => interest.value);
      setSelectedInterests(newInterests);
      const updatedUser = {
        ...profileUser,
        interests: interestValues.join(", "),
      };
      saveProfileToLocalStorage(username, updatedUser);
      setProfileUser(updatedUser);
      try {
        const userDocRef = doc(db, "users", profileUser.uid);
        await updateDoc(userDocRef, { interests: interestValues.join(", ") });
        console.log("Interests updated in Firestore.");
        window.location.reload();
      } catch (error) {
        console.error("Error updating interests in Firestore: ", error);
      }
    },
    [username, profileUser]
  );

  const handleProfilePictureClick = () => {
    document.getElementById("profilePictureInput").click();
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const handleModalOpen = () => {
    setNewAbout(about);
    setNewOrganization(organization);
    const currentInterests = interests
      ? interests
          .split(", ")
          .map((interest) => ({ value: interest, label: interest }))
      : [];
    setSelectedInterests(currentInterests);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAboutSubmit = async () => {
    const updates = {};
    if (newAbout !== about) updates.about = newAbout;
    if (newOrganization !== organization)
      updates.organization = newOrganization;
    const newInterestsString = selectedInterests.map((i) => i.value).join(", ");
    if (newInterestsString !== interests)
      updates.interests = newInterestsString;

    if (Object.keys(updates).length > 0) {
      await updateProfile(updates);
    }

    setIsModalOpen(false);
  };

  const handleGoogleLink = async () => {
    await handleLinkGoogleAccount({
      auth,
      db,
      setLinkGoogleError: (msg) => {
        setLinkGoogleError(msg);
        setGoogleToastMessage(msg);
        setGoogleToastType("error");
        setShowGoogleLinkedToast(true);
        setTimeout(() => setShowGoogleLinkedToast(false), 5000);
      },
      setLinkGoogleSuccess: (msg) => {
        setLinkGoogleSuccess(msg);
        setGoogleToastMessage(msg);
        setGoogleToastType("success");
        setShowGoogleLinkedToast(true);
        setTimeout(() => setShowGoogleLinkedToast(false), 5000);
      },
      setLinkingGoogle,
      profilePicture,
      onLinked: (googleUser) => {
        setProfileUser((prev) =>
          prev
            ? {
                ...prev,
                googleAccount: true,
                googleEmail: googleUser.email,
                profilePicture: googleUser.photoURL || prev.profilePicture,
              }
            : prev
        );
      },
    });
  };

  const handleUnlinkGoogle = async () => {
    await handleUnlinkGoogleAccount({
      auth,
      db,
      onSuccess: () => {
        setProfileUser((prev) =>
          prev ? { ...prev, googleAccount: false, googleEmail: null } : prev
        );
        setGoogleToastMessage("Google account unlinked successfully!");
        setGoogleToastType("success");
        setShowGoogleLinkedToast(true);
        setShowUnlinkModal(false);
        setTimeout(() => setShowGoogleLinkedToast(false), 5000);
      },
      onError: (error) => {
        setGoogleToastMessage(
          "Failed to unlink Google account. Please try again."
        );
        setGoogleToastType("error");
        setShowGoogleLinkedToast(true);
        setShowUnlinkModal(false);
        setTimeout(() => setShowGoogleLinkedToast(false), 5000);
      },
    });
  };

  const isOwnProfile =
    currentUser && profileUser && currentUser.uid === profileUser.uid;

  const isGoogleProviderLinked = currentUser?.providerData?.some(
    (provider) => provider.providerId === "google.com"
  );

  useEffect(() => {
    if (
      isOwnProfile &&
      isGoogleProviderLinked &&
      profileUser &&
      !profileUser.googleAccount
    ) {
      const userDocRef = doc(db, "users", profileUser.uid);
      updateDoc(userDocRef, { googleAccount: true }).then(() => {
        setProfileUser((prev) =>
          prev ? { ...prev, googleAccount: true } : prev
        );
      });
    }
  }, [isOwnProfile, isGoogleProviderLinked, profileUser]);

  const canChat = isOwnProfile || (profileUser?.followers?.includes(currentUser?.uid));

  if (loading) {
    return <p className="primary">Loading...</p>;
  }

  if (!profileUser) {
    return <p>User not found.</p>;
  }

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "white" : "black",
      backgroundColor: state.isSelected ? "rgba(189,197,209,.3)" : "white", // random light grey colr (color picksd it)
      "&:hover": {
        backgroundColor: "rgba(189,197,209,.3)",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#1a1a1a",
      padding: "5px",
      borderRadius: "50px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "white",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "white",
      ":hover": {
        backgroundColor: "#1a1a1a",
        color: "white",
      },
    }),
  };

  return (
    <div>
      <div
        className="row fade-in2 d-flex justify-content-center mt-3"
        style={{ marginBottom: "20px" }}
      >
        <div className="row d-flex justify-content-center">
          <div className="col-md-9 box" style={{ padding: "20px" }}>
            <div className="row d-flex justify-content-center">
              <div className="col">
                <div
                  className="col-md"
                  style={{ position: "relative", textAlign: "right" }}
                >
                  {isOwnProfile && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                      }}
                    >
                      {isGoogleProviderLinked || profileUser.googleAccount ? (
                        <>
                          <button
                            className="custom-edit"
                            style={{
                              padding: "10px",
                              borderRadius: "50px",
                              width: "auto",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                            title="Google account already linked"
                            onClick={() => setShowUnlinkModal(true)}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              style={{ marginRight: "6px" }}
                            >
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
                            Connected
                          </button>
                          <Modal
                            show={showUnlinkModal}
                            onHide={() => setShowUnlinkModal(false)}
                            className="box"
                            centered
                          >
                            <Modal.Header
                              style={{
                                background: "#e5e3df",
                                borderBottom: "1px solid white",
                              }}
                              closeButton
                            >
                              <Modal.Title className="primary">
                                Unlink Google Account
                              </Modal.Title>
                            </Modal.Header>
                            <Modal.Body
                              style={{
                                background: "#e5e3df",
                                borderBottom: "1px solid white",
                                padding: "30px",
                              }}
                            >
                              <p className="primary">
                                Are you sure you want to unlink your Google
                                account from this profile?
                              </p>
                            </Modal.Body>
                            <Modal.Footer
                              style={{
                                background: "#e5e3df",
                                borderBottom: "1px solid white",
                              }}
                            >
                              <a
                                className="custom-view"
                                onClick={() => setShowUnlinkModal(false)}
                              >
                                Cancel
                              </a>
                              <a
                                className="custom-view"
                                style={{
                                  background: "#1a1a1a",
                                  color: "white",
                                  border: "none",
                                }}
                                onClick={handleUnlinkGoogle}
                              >
                                Yes, Unlink
                              </a>
                            </Modal.Footer>
                          </Modal>
                        </>
                      ) : (
                        <button
                          className="custom-edit"
                          onClick={handleGoogleLink}
                          style={{
                            padding: "10px",
                            borderRadius: "50px",
                            width: "auto",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                          title="Link your Google account"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            style={{ marginRight: "6px" }}
                          >
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
                          Connect Google Account
                        </button>
                      )}
                      <button 
                        className="custom-edit" 
                        onClick={handleModalOpen}
                        style={{ 
                          padding: "10px", 
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Edit Profile"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          className="bi bi-pencil-square"
                          fill="white"
                          viewBox="0 0 16 16"
                        >
                          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                          <path
                            fillRule="evenodd"
                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                          />
                        </svg>
                      </button>
                      <button
                        className="custom-edit"
                        onClick={handleShareModalOpen}
                        style={{ 
                          padding: "10px", 
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Share Profile"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="white"
                          className="bi bi-share-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                border: "1px solid white",
                position: "relative",
                overflow: "hidden",
                backgroundColor: "transparent",
                cursor: isOwnProfile ? "pointer" : "default",
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={isOwnProfile ? handleProfilePictureClick : undefined}
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    backgroundColor: "transparent",
                  }}
                />
              ) : (
                <img
                  src={blank}
                  alt="Profile"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    backgroundColor: "transparent",
                  }}
                />
              )}
              {isOwnProfile && isHovering && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Change Picture
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-md">
                <h1 className="primary mt-4">
                  {profileUser.fullName}
                  {RESDEX_TEAM_MEMBERS.includes(username) && <ResDexBadge />}
                </h1>
              </div>

              <div
                className="col-md d-flex justify-content-end mt-4"
                style={{ maxHeight: "50px" }}
              >

                {!isOwnProfile && (
                  <>
                    <a
                      className="custom-view"
                      onClick={toggleFollow}
                      disabled={isRequestInProgress || requestSent}
                      style={{ marginRight: '10px' }}
                    >
                      {requestSent ? (
                        <span style={{ position: 'relative', top: '7px' }}>Request Sent
                          <svg style={{ marginLeft: '10px' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-send-plus-fill" viewBox="0 0 16 16">
                            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 1.59 2.498C8 14 8 13 8 12.5a4.5 4.5 0 0 1 5.026-4.47zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
                            <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1a.5.5 0 0 0-.5-.5"/>
                          </svg>
                        </span>
                      ) : isFollowing ? (
                        <span style={{ position: 'relative', top: '7px' }}>Unfollow
                          <svg style={{ marginLeft: '10px' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-people-fill" viewBox="0 0 16 16">
                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                          </svg>
                        </span>
                      ) : (
                        <span style={{ position: 'relative', top: '7px' }}>Follow
                          <svg style={{ marginLeft: '10px' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-person-fill-add" viewBox="0 0 16 16">
                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3.5 3.5 0 0 1 6 0"/>
                            <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                          </svg>
                        </span>
                      )}
                    </a>
                    <a
                      className="custom-view chat-button"
                      onClick={canChat ? handleChatClick : (e) => e.preventDefault()}
                      style={{ 
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "20px", 
                        paddingRight: "20px", 
                        borderRadius: "5px",
                        cursor: canChat ? "pointer" : "not-allowed",
                        opacity: canChat ? 1 : 0.6
                      }}
                      title={!canChat ? "You must be a research fellow to chat" : "Chat with this user"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" style={{ marginRight: "15px" }} height="16" fill="white" class="bi bi-envelope-fill" viewBox="0 0 16 16">
  <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
</svg>
                      Message
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* <p className='primary'> 
   <span className='primary'><strong className='primary'>Following:</strong> {followingCount}</span>
</p> */}

            <p className="primary">{about}</p>
            <div
              className="row d-flex justify-content-center"
              style={{ margin: "0px" }}
            >
              <div
                className="col-md-5 box"
                style={{
                  textAlign: "left",
                  borderLeft: "1px solid white",
                  marginTop: "10px",
                  marginBottom: "20px",
                  padding: "20px",
                  margin: "5px",
                }}
              >
                {organization && (
                  <p className="primary">
                    <svg
                      style={{ marginRight: "10px" }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="primary"
                      className="bi bi-buildings"
                      viewBox="0 0 16 16"
                    >
                      <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z" />
                      <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z" />
                    </svg>
                    <span
                      onClick={() => handleOrganizationClick(organization)}
                      style={{ cursor: "pointer", color: "black", textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.opacity = 0.7}
                      onMouseLeave={(e) => e.target.style.opacity = 1}
                    >
                      {organization}
                    </span>
                  </p>
                )}

                {interests && interests.length > 0 && (
                  <div>
                    <svg
                      style={{ marginRight: "10px" }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="primary"
                      className="bi bi-tags-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                      <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z" />
                    </svg>
                    {interests.split(", ").map((interest, index) => (
                      <span 
                        key={index} 
                        className="interest-pill"
                        onClick={() => handleTagClick(interest)}
                        style={{ 
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.05)";
                          e.target.style.backgroundColor = "#2a2a2a";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)";
                          e.target.style.backgroundColor = "";
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="col-md  box"
                style={{
                  textAlign: "left",
                  borderLeft: "1px solid white",
                  marginTop: "10px",
                  marginBottom: "20px",
                  padding: "20px",
                  margin: "5px",
                }}
              >
                <div className="row">
                  <br></br>
                  <div
                    className="col-md-5"
                    style={{ borderRight: "1px solid black" }}
                  >
                    <h2 className=" primary">
                      {profileUser.contributions || 0}
                    </h2>
                    <p className=" primary">Contributions</p>
                  </div>
                  <div className="col-md offset-md-1">
                    <h2
                      className="primary"
                      style={{ cursor: "pointer" }}
                      onClick={handleShowFollowersModal}
                    >
                      {followerCount}{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="primary"
                        className="bi bi-person-lines-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                      </svg>
                    </h2>
                    <p className=" primary">Research Fellows</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div
                style={{ borderRadius: "5px", margin: "0px" }}
                className="row d-flex justify-content-center"
              >
                <div className="col-md-12 box">
                  <div className="row" style={{ marginTop: "-10px" }}>
                    <div className="col-md d-flex align-items-center">
                      <h4 className="primary">Shared Research</h4>
                    </div>

                    <div
                      className="col-md"
                      style={{ position: "relative", textAlign: "right" }}
                    >
                      {isOwnProfile && (
                        <PDFUpload
                          user={currentUser}
                          onUploadComplete={() => fetchPDFs(currentUser.uid)}
                        />
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      borderRadius: "5px",
                      padding: "20px",
                      paddingBottom: "50px",
                      border: "1px solid white",
                      marginBottom: "10px",
                    }}
                    className="row justify-content-center align-items-center"
                  >
                    {pdfs.length > 0 ? (
                      <Carousel>
                        {pdfs.map((pdf, index) => (
                          <Carousel.Item key={index}>
                            <div
                              style={{
                                marginLeft: "150px",
                                marginRight: "150px",
                              }}
                              className="d-flex  justify-content-center mb-4"
                            >
                              <div className="row mt-3 ">
                                <div className="col-md-4">
                                  <iframe
                                    title="pdf"
                                    src={`${pdf.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    style={{
                                      width: "100%",
                                      height: "300px",
                                      border: "none",
                                      borderRadius: "5px",
                                    }}
                                  />
                                </div>
                                <div className="col-md d-flex justify-content-center align-items-top">
                                  <div
                                    className="text-white mt-3"
                                    style={{
                                      borderLeft: "1px solid #1a1a1a",
                                      paddingLeft: "30px",
                                    }}
                                  >
                                    <h5 className="primary">{pdf.title}</h5>
                                    <p className="primary">{pdf.description}</p>

                                    {pdf.topics && pdf.topics.length > 0 && (
                                      <div style={{ marginBottom: "10px" }}>
                                        <svg
                                          style={{ marginRight: "10px" }}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="primary"
                                          className="bi bi-tags-fill"
                                          viewBox="0 0 16 16"
                                        >
                                          <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                                          <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z" />
                                        </svg>
                                        {pdf.topics.map((topic, index) => (
                                          <span
                                            key={index}
                                            className="interest-pill"
                                            onClick={() =>
                                              handleTagClick(topic)
                                            }
                                            style={{ 
                                              cursor: "pointer",
                                              transition: "all 0.2s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                              e.target.style.transform =
                                                "scale(1.05)";
                                              e.target.style.backgroundColor =
                                                "#2a2a2a";
                                            }}
                                            onMouseLeave={(e) => {
                                              e.target.style.transform =
                                                "scale(1)";
                                              e.target.style.backgroundColor =
                                                "";
                                            }}
                                          >
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <button
                                      className="custom"
                                      style={{ marginRight: "10px" }}
                                      onClick={() =>
                                        window.open(pdf.url, "_blank")
                                      }
                                    >
                                      View ⇗
                                    </button>
                                    {isOwnProfile && (
                                      <button
                                        className="custom"
                                        onClick={() => handleEdit(pdf)}
                                      >
                                        Edit Paper
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    ) : (
                      <div
                        className=" text-center primary"
                        style={{ marginTop: "40px" }}
                      >
                        No Documents Uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Certifications Section */}
              <div className="mt-5">
                <div
                  style={{ borderRadius: "5px", margin: "0px" }}
                  className="row d-flex justify-content-center"
                >
                  <div className="col-md-12 box">
                    <div className="row" style={{ marginTop: "-10px" }}>
                      <div className="col-md d-flex align-items-center">
                        <h4 className="primary">Certifications</h4>
                      </div>

                      <div
                        className="col-md"
                        style={{ position: "relative", textAlign: "right" }}
                      >
                        {isOwnProfile && (
                          <CertificationUpload
                            user={currentUser}
                            onUploadComplete={() => fetchCertifications(currentUser.uid)}
                          />
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        borderRadius: "5px",
                        padding: "20px",
                        paddingBottom: "50px",
                        border: "1px solid white",
                        marginBottom: "10px",
                      }}
                      className="row justify-content-center align-items-center"
                    >
                      {certifications.length > 0 ? (
                        <div style={{ width: "100%", maxWidth: "800px" }}>
                          <div className="position-relative">
                            {/* Left Arrow */}
                            {certifications.length > 1 && (
                              <button
                                style={{
                                  position: "absolute",
                                  left: "-50px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "transparent",
                                  border: "none",
                                  width: "40px",
                                  height: "40px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  zIndex: 10,
                                  transition: "all 0.3s ease"
                                }}
                                onClick={() => {
                                  const newIndex = currentCertificationIndex > 0 ? currentCertificationIndex - 1 : certifications.length - 1;
                                  setCurrentCertificationIndex(newIndex);
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.opacity = "0.7";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.opacity = "1";
                                }}
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  fill="black"
                                  viewBox="0 0 16 16"
                                >
                                  <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                </svg>
                              </button>
                            )}

                            {/* Right Arrow */}
                            {certifications.length > 1 && (
                              <button
                                style={{
                                  position: "absolute",
                                  right: "-50px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "transparent",
                                  border: "none",
                                  width: "40px",
                                  height: "40px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  zIndex: 10,
                                  transition: "all 0.3s ease"
                                }}
                                onClick={() => {
                                  const newIndex = currentCertificationIndex < certifications.length - 1 ? currentCertificationIndex + 1 : 0;
                                  setCurrentCertificationIndex(newIndex);
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.opacity = "0.7";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.opacity = "1";
                                }}
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  fill="black"
                                  viewBox="0 0 16 16"
                                >
                                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                              </button>
                            )}

                            {/* Custom Carousel Container */}
                            <div 
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                gap: "20px",
                                padding: "20px 0"
                              }}
                            >
                              {/* Previous Certification (if exists) */}
                              {certifications.length > 1 && (
                                <div
                                  style={{
                                    opacity: 0.6,
                                    transition: "all 0.3s ease",
                                    maxWidth: "200px",
                                    width: "100%",
                                    cursor: "pointer"
                                  }}
                                  onClick={() => {
                                    const newIndex = currentCertificationIndex > 0 ? currentCertificationIndex - 1 : certifications.length - 1;
                                    setCurrentCertificationIndex(newIndex);
                                  }}
                                >
                                  <iframe
                                    title="prev-certification"
                                    src={`${certifications[currentCertificationIndex > 0 ? currentCertificationIndex - 1 : certifications.length - 1].url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    style={{
                                      width: "100%",
                                      height: "200px",
                                      border: "none",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <p className="primary mt-2" style={{ fontSize: "12px", textAlign: "center" }}>
                                    {certifications[currentCertificationIndex > 0 ? currentCertificationIndex - 1 : certifications.length - 1].title}
                                  </p>
                                </div>
                              )}

                              {/* Main Certification */}
                              <div
                                style={{
                                  position: "relative",
                                  display: "inline-block",
                                  maxWidth: "400px",
                                  width: "100%",
                                }}
                              >
                                <iframe
                                  title={`certification-${currentCertificationIndex}`}
                                  src={`${certifications[currentCertificationIndex].url}#toolbar=0&navpanes=0&scrollbar=0`}
                                  style={{
                                    width: "100%",
                                    height: "300px",
                                    border: "none",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                  }}
                                />
                                
                                {/* Title below the preview */}
                                <h5 className="primary mt-3" style={{ margin: "0", fontSize: "16px", textAlign: "center" }}>
                                  {certifications[currentCertificationIndex].title}
                                </h5>
                              </div>

                              {/* Next Certification (if exists) */}
                              {certifications.length > 1 && (
                                <div
                                  style={{
                                    opacity: 0.6,
                                    transition: "all 0.3s ease",
                                    maxWidth: "200px",
                                    width: "100%",
                                    cursor: "pointer"
                                  }}
                                  onClick={() => {
                                    const newIndex = currentCertificationIndex < certifications.length - 1 ? currentCertificationIndex + 1 : 0;
                                    setCurrentCertificationIndex(newIndex);
                                  }}
                                >
                                  <iframe
                                    title="next-certification"
                                    src={`${certifications[currentCertificationIndex < certifications.length - 1 ? currentCertificationIndex + 1 : 0].url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    style={{
                                      width: "100%",
                                      height: "200px",
                                      border: "none",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <p className="primary mt-2" style={{ fontSize: "12px", textAlign: "center" }}>
                                    {certifications[currentCertificationIndex < certifications.length - 1 ? currentCertificationIndex + 1 : 0].title}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="text-center mt-3">
                              <button
                                className="custom"
                                style={{ marginRight: "10px" }}
                                onClick={() => window.open(certifications[currentCertificationIndex].url, "_blank")}
                              >
                                View ⇗
                              </button>
                              {isOwnProfile && (
                                <button
                                  className="custom"
                                  onClick={() => handleEditCertification(certifications[currentCertificationIndex])}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="text-center primary"
                          style={{ marginTop: "40px" }}
                        >
                          No Certifications Uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Modal
                show={isModalOpen}
                onHide={handleModalClose}
                className="box"
              >
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
                      ></img>
                    </div>
                    <div className="row"></div>
                    Edit Profile
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body
                  style={{
                    background: "#e5e3df",
                    borderBottom: "1px solid white",
                  }}
                >
                  <div
                    style={{
                      borderBottom: "1px solid white",
                      paddingBottom: "20px",
                    }}
                  >
                    <p className="primary">About</p>
                    <textarea
                      spellcheck="false"
                      maxLength="300"
                      value={newAbout}
                      onChange={(e) => setNewAbout(e.target.value)}
                      rows="6"
                      style={{
                        width: "100%",
                        color: "black",
                        borderRadius: "5px",
                        resize: "none",
                        padding: "10px",
                      }}
                    />
                  </div>
                  <br></br>

                  <div
                    style={{
                      borderBottom: "1px solid white",
                      paddingBottom: "20px",
                    }}
                  >
                    <p className="primary">Organization (University)</p>
                    <Select
                      isClearable
                      isSearchable
                      value={
                        newOrganization
                          ? { label: newOrganization, value: newOrganization }
                          : null
                      }
                      onChange={(selectedOption) =>
                        setNewOrganization(
                          selectedOption ? selectedOption.value : ""
                        )
                      }
                      options={[
                        ...canadianUniversities.map((uni) => ({
                          label: uni,
                          value: uni,
                        })),
                      ]}
                      placeholder="Select or type your university"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          color: "black",
                          borderRadius: "5px",
                          padding: "2px",
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          color: state.isSelected ? "black" : "black",
                          backgroundColor: state.isSelected
                            ? "rgba(189,197,209,.3)"
                            : "white",
                          "&:hover": {
                            backgroundColor: "rgba(189,197,209,.3)",
                          },
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "black",
                        }),
                      }}
                    />
                  </div>

                  <br></br>
                  <p className="primary">Interests</p>
                  <Select
                    isMulti
                    name="interests"
                    options={interestOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={selectedInterests}
                    rows="1"
                    onChange={(selected) => {
                      if (selected.length <= 3) {
                        setSelectedInterests(selected);
                      }
                    }}
                    isOptionDisabled={() => selectedInterests.length >= 3}
                    placeholder="Select up to 3 interests"
                    styles={customStyles}
                  />
                  <br></br>
                </Modal.Body>
                <Modal.Footer
                  style={{
                    background: "#e5e3df",
                    borderBottom: "1px solid white",
                  }}
                >
                  <a className="custom-view" onClick={handleModalClose}>
                    Cancel
                  </a>
                  <a className="custom-view" onClick={handleAboutSubmit}>
                    Save
                  </a>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        </div>

        <div className="col"></div>
        {isOwnProfile && (
          <>
            <ProfilePictureUpload
              user={currentUser}
              updateProfilePicture={updateProfilePicture}
              id="profilePictureInput"
              style={{ display: "none" }}
            />
          </>
        )}
      </div>

      <Modal
        show={showChatConfirmModal}
        onHide={() => setShowChatConfirmModal(false)}
        centered
      >
        <Modal.Header
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
          closeButton
        >
          <Modal.Title className="primary">Start Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          <div className="text-center">
            <div className="mb-3">
              <img
                src={
                  profileUser?.profilePicture ||
                  "https://firebasestorage.googleapis.com/v0/b/resdex-4b117.appspot.com/o/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.webp?alt=media&token=edabe458-161b-4a69-bc2e-630674bdb0de"
                }
                alt="Profile"
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <p className="primary">
              Start a conversation with{" "}
              <strong>
                {profileUser?.fullName || profileUser?.displayName}
              </strong>
              ?
            </p>
            <p className="text-muted" style={{ fontSize: "14px" }}>
              You can discuss research, collaborate on projects, or simply
              connect with fellow researchers.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          <button
            className="custom-view"
            onClick={() => setShowChatConfirmModal(false)}
          >
            Cancel
          </button>
          <button className="custom-view" onClick={startChat}>
            Start Chat
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showFollowersModal}
        onHide={() => setShowFollowersModal(false)}
        centered
        size="lg"
      >
        <Modal.Header
          style={{ background: "#e5e3df", borderBottom: "1px solid #2a2a2a" }}
          closeButton
        >
          <Modal.Title className="primary">Research Fellows</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            background: "#e5e3df",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          {followersLoading ? (
            <div>Loading...</div>
          ) : followersList.length === 0 ? (
            <div className="primary">No connected research fellows.</div>
          ) : (
            followersList.map((result, index) => (
              <div
                key={index}
                className="box"
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  maxWidth: "700px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  background: "#e5e3df",
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div
                    className="d-flex align-items-center"
                    style={{ marginRight: "30px" }}
                  >
                    <img
                      src={
                        result.profilePicture ||
                        "https://firebasestorage.googleapis.com/v0/b/resdex-4b117.appspot.com/o/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.webp?alt=media&token=edabe458-161b-4a69-bc2e-630674bdb0de"
                      }
                      alt={`${result.fullName}'s profile`}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        marginRight: "15px",
                      }}
                    />
                    <div>
                      <strong style={{ color: "black" }}>
                        {result.fullName}
                      </strong>
                      <span>
                        <i style={{ color: "gray", marginLeft: "10px" }}>
                          '{result.username}'
                        </i>
                      </span>
                      <br />
                      <span>
                        {result.organization && (
                          <i style={{ color: "gray" }}>
                            <svg
                              style={{ marginRight: "10px" }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="grey"
                              className="bi bi-buildings"
                              viewBox="0 0 16 16"
                            >
                              <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z" />
                              <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z" />
                            </svg>
                            {result.organization}
                          </i>
                        )}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/profile/${result.username}`}
                    className="custom-view"
                    style={{ textDecoration: 'none' }}
                  >
                    View Profile ↗︎
                  </a>
                </div>
              </div>
            ))
          )}
        </Modal.Body>
        <Modal.Footer
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          {/* <Button className='custom-view' onClick={() => setShowFollowersModal(false)}>
      Close
    </Button> */}
        </Modal.Footer>
      </Modal>

      {showCopiedToast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#2a2a2a",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 9999,
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 1.5s ease-in-out",
          }}
        >
          Profile link copied to clipboard!
        </div>
      )}

      <Modal
        show={showRemoveModal}
        className="box"
        onHide={() => setShowRemoveModal(false)}
      >
        <Modal.Header
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
          closeButton
        >
          <Modal.Title style={{ color: "black" }}>
            {certificationToRemove ? "Remove Certification" : "Edit Document"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          {certificationToRemove ? (
            <div className="text-center">
              <p className="primary">
                Are you sure you want to remove the certification "{certificationToRemove.title}"?
              </p>
              <p className="text-muted" style={{ fontSize: "14px" }}>
                This action cannot be undone. The certification will be permanently deleted.
              </p>
            </div>
          ) : (
            <Form
              style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
            >
              <Form.Group className="mb-3" controlId="formDocumentTitle">
                <Form.Label className="primary">Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter new title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formDocumentDescription">
                <Form.Label className="primary">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  maxLength={150}
                  placeholder="Enter new description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formDocumentTags">
                <Form.Label className="primary">Related Topic</Form.Label>
                <Select
                  isMulti
                  name="tags"
                  options={interestOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={editedTags}
                  onChange={(selected) => {
                    if (selected.length <= 3) {
                      setEditedTags(selected);
                    }
                  }}
                  isOptionDisabled={() => editedTags.length >= 3}
                  placeholder="Select a topic!"
                  styles={customStyles}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          <Button className="custom-view" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          {certificationToRemove ? (
            <Button className="custom-view" onClick={confirmRemoveCertification}>
              Confirm Delete
            </Button>
          ) : (
            <>
              <Button className="custom-view" onClick={confirmRemove}>
                Remove
              </Button>
              <Button className="custom-view" onClick={saveChanges}>
                Save Changes
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Share Profile Modal */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        centered
        size="md"
      >
        <Modal.Header
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
          closeButton
        >
          <Modal.Title className="primary">Share Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          <div className="text-center">
            <p className="primary mb-3">Share this profile with others</p>
            
            {/* QR Code Section */}
            <div className="mb-3">
              <div 
                style={{ 
                  display: "inline-block", 
                  padding: "15px", 
                  backgroundColor: "white", 
                  borderRadius: "10px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <QRCodeSVG 
                  value={window.location.href}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p
                className="primary mt-2"
                style={{ fontSize: "12px", color: "#666" }}
              >
                Scan this QR code to visit the profile
              </p>
            </div>

            {/* Link Section */}
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={window.location.href}
                readOnly
                style={{ fontSize: "12px" }}
              />
              <button className="btn custom-view" onClick={handleShareProfile}>
                Copy Link
              </button>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-2">
              <p
                className="primary"
                style={{ fontSize: "12px", color: "#666" }}
              >
                Share via link or scan the QR code above
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          <button
            className="custom-view"
            onClick={() => setShowShareModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {currentUser && profileUser && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          {/* Chat functionality moved to Messages page */}
        </div>
      )}

      <GoogleSignupModal
        show={showGoogleModal}
        onHide={() => setShowGoogleModal(false)}
        onComplete={() => setShowGoogleModal(false)}
        googleUser={googleUser}
        initialFullName={initialFullName}
        initialDisplayName={initialDisplayName}
        externalError={modalError}
      />

      {showGoogleLinkedToast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor:
              googleToastType === "success" ? "#2a2a2a" : "#b00020",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 9999,
            minWidth: "220px",
            textAlign: "center",
            fontWeight: 500,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {googleToastMessage}
        </div>
      )}
    </div>
  );
};

export default Profile;
