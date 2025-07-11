import { useState } from "react";
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE_MB = 5;
const MAX_UPLOADS_PER_DAY = 10;

const CertificationUpload = ({ user, onUploadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setErrorModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleUploadCertificationClick = () => {
    document.getElementById("certificationInput").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrorMessage(`File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
        setErrorModal(true);
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      setShowModal(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !title.trim()) return;

    setLoading(true);
    setShowModal(false);
    setErrorModal(false);

    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnapshot = await getDoc(userDocRef);
      const currentCertifications = docSnapshot.exists()
        ? docSnapshot.data().certifications || []
        : [];

      const today = new Date().toISOString().split("T")[0];
      const todaysUploads = currentCertifications.filter((cert) =>
        cert.uploadDate.startsWith(today)
      );

      if (todaysUploads.length >= MAX_UPLOADS_PER_DAY) {
        setLoading(false);
        setErrorMessage(
          `You have reached the daily limit of ${MAX_UPLOADS_PER_DAY} uploads.`
        );
        setErrorModal(true);
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", user.uid);

      const response = await fetch("https://resdex.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error("Upload failed");
      }

      const workerUrl = result.url.replace(
        "https://pub-b9219a60c2ea4807b8bb38a7c82cf268.r2.dev",
        "https://view.resdex.ca"
      );

      const certificationData = {
        url: workerUrl,
        objectKey: result.objectKey,
        title: title,
        uploadDate: new Date().toISOString(),
        userUID: user.uid,
      };

      if (!docSnapshot.exists()) {
        await setDoc(userDocRef, { certifications: [certificationData] });
      } else {
        await updateDoc(userDocRef, { certifications: arrayUnion(certificationData) });
      }

      const searchIndexRef = doc(db, "searchIndex", "certificationsList");
      const searchIndexDoc = await getDoc(searchIndexRef);
      let certifications = searchIndexDoc.exists()
        ? searchIndexDoc.data().certifications || []
        : [];

      certifications.push(certificationData);
      await setDoc(searchIndexRef, { certifications });

      if (onUploadComplete) {
        onUploadComplete(user.uid);
      }

      setTitle("");
      setSelectedFile(null);
      setErrorMessage("");
      window.location.reload();
    } catch (error) {
      console.error("Error uploading certification: ", error);
      setErrorMessage("Failed to upload. Please try again.");
      setErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    loadingOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
    },
    uploadArea: {
      cursor: "pointer",
      borderRadius: "5px",
      textAlign: "center",
    },
  };

  return (
    <div>
      <input
        type="file"
        id="certificationInput"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <div style={{ padding: "10px" }} onClick={handleUploadCertificationClick}>
        <button className="custom-edit">
          <svg
            style={{ marginRight: "14px" }}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="white"
            className="bi bi-upload"
            viewBox="0 0 16 16"
          >
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
          </svg>
          Import Certification
        </button>
      </div>

      {/* Upload Modal */}
      <Modal
        show={showModal}
        className="box"
        onHide={() => setShowModal(false)}
      >
        <Modal.Header
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
          closeButton
        >
          <Modal.Title style={{ color: "black" }}>Certification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "black" }}>Title</Form.Label>
              <Form.Control
                maxLength="50"
                type="text"
                placeholder="Enter certification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          <button className="custom-view" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button
            className="custom-view"
            onClick={handleUpload}
            disabled={!title.trim() || loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{ marginRight: "8px" }}
                />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Error Modal */}
      <Modal
        show={showErrorModal}
        onHide={() => setErrorModal(false)}
        centered
      >
        <Modal.Header
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
          closeButton
        >
          <Modal.Title style={{ color: "red" }}>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#e5e3df" }}>
          <p className="primary">{errorMessage}</p>
        </Modal.Body>
        <Modal.Footer
          style={{ background: "#e5e3df", borderBottom: "1px solid white" }}
        >
          <button
            className="custom-view"
            onClick={() => setErrorModal(false)}
          >
            OK
          </button>
        </Modal.Footer>
      </Modal>

      {loading && (
        <div style={styles.loadingOverlay}>
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p className="text-white mt-2">Uploading certification...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationUpload; 