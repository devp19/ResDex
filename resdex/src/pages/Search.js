import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import Select, { components } from "react-select";
import Logo from "../images/dark-transparent.png";
import ResDexIcon from "../images/logo-icon.png";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { LoadingSpinner } from "../components/common";
import { canadianUniversities } from "../Orgs/canadianUniversities";
import { Tooltip } from "react-tooltip";

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
      data-tooltip-id="resdex-badge-tooltip-search"
      data-tooltip-content="Member of ResDex"
      style={{
        marginLeft: "5px",
        cursor: "pointer",
        transition: "transform 0.2s ease",
        width: "16px",
        height: "16px",
      }}
      onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
    />
    <Tooltip 
      id="resdex-badge-tooltip-search" 
      place="top" 
      effect="solid" 
      className="z-index-tooltip"
    />
  </>
);

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        fill="white"
        viewBox="0 0 16 16"
      >
        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
      </svg>
    </components.DropdownIndicator>
  );
};

const Search = () => {
  // Use the custom animation hook
  useAnimationEffect();

  const [searchType, setSearchType] = useState({
    value: "users",
    label: "Users",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [universitySuggestions, setUniversitySuggestions] = useState([]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (universitySuggestions.length > 0) {
        const searchContainer = document.querySelector(".search-input-group");
        if (searchContainer && !searchContainer.contains(event.target)) {
          setUniversitySuggestions([]);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [universitySuggestions.length]);

  const searchOptions = [
    { value: "users", label: "Users" },
    { value: "papers", label: "Papers" },
    { value: "universities", label: "Universities" },
  ];

  const handleSearchTypeChange = (selectedOption) => {
    setSearchType(selectedOption);
    setSearchTerm("");
    setResults([]);
    setUniversitySuggestions([]);
  };

  const handleSearchInputChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    // Show university suggestions for university search
    if (searchType.value === "universities" && newSearchTerm.length >= 2) {
      const filteredUniversities = canadianUniversities
        .filter((uni) =>
          uni.toLowerCase().includes(newSearchTerm.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions
      setUniversitySuggestions(filteredUniversities);
    } else {
      setUniversitySuggestions([]);
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      handleSearch(newSearchTerm);
    }, 300);

    setDebounceTimeout(newTimeout);
  };

  const handleSearch = async (term) => {
    if (term.trim() !== "") {
      const processedTerm = term.toLowerCase();
      let filteredResults = [];

      if (searchType.value === "users" && processedTerm.length >= 3) {
        try {
          const searchIndexDocRef = doc(db, "searchIndex", "usersList");
          const searchIndexDoc = await getDoc(searchIndexDocRef);
          if (searchIndexDoc.exists()) {
            const usersList = searchIndexDoc.data().users || [];

            filteredResults = usersList.filter(
              (user) =>
                user.username.toLowerCase().includes(processedTerm) ||
                user.fullName.toLowerCase().includes(processedTerm)
            );

            const updatedResults = [];

            for (let user of filteredResults) {
              const userDocRef = doc(db, "users", user.userId);
              const docSnapshot = await getDoc(userDocRef);

              if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const organization = userData.organization;
                const profilePicture = userData.profilePicture || null;
                updatedResults.push({
                  ...user,
                  organization: organization,
                  profilePicture: profilePicture,
                });
              }
            }

            setResults(updatedResults);
          } else {
            console.warn("No users found in searchIndex.");
            setResults([]);
          }
        } catch (error) {
          console.error("Error fetching from searchIndex:", error);
          setResults([]);
        }
      } else if (
        searchType.value === "universities" &&
        processedTerm.length >= 2
      ) {
        try {
          const searchIndexDocRef = doc(db, "searchIndex", "usersList");
          const searchIndexDoc = await getDoc(searchIndexDocRef);
          if (searchIndexDoc.exists()) {
            const usersList = searchIndexDoc.data().users || [];

            // Filter users by organization/university
            filteredResults = usersList.filter((user) => {
              // First get the user's organization from their document
              return true; // We'll filter after getting the full user data
            });

            const updatedResults = [];

            for (let user of filteredResults) {
              const userDocRef = doc(db, "users", user.userId);
              const docSnapshot = await getDoc(userDocRef);

              if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const organization = userData.organization;
                const profilePicture = userData.profilePicture || null;

                // Only include users whose organization matches the search term
                if (
                  organization &&
                  organization.toLowerCase().includes(processedTerm)
                ) {
                  updatedResults.push({
                    ...user,
                    organization: organization,
                    profilePicture: profilePicture,
                  });
                }
              }
            }

            setResults(updatedResults);
          } else {
            console.warn("No users found in searchIndex.");
            setResults([]);
          }
        } catch (error) {
          console.error("Error fetching from searchIndex:", error);
          setResults([]);
        }
      } else if (searchType.value === "papers" && processedTerm.length >= 3) {
        try {
          const searchIndexDocRef = doc(db, "searchIndex", "papersList");
          const searchIndexDoc = await getDoc(searchIndexDocRef);

          if (searchIndexDoc.exists()) {
            const papersList = searchIndexDoc.data().papers || [];
            filteredResults = papersList.filter(
              (pdf) =>
                pdf.title.toLowerCase().includes(processedTerm) ||
                pdf.description.toLowerCase().includes(processedTerm) ||
                (pdf.topics &&
                  pdf.topics.some((topic) =>
                    topic.toLowerCase().includes(processedTerm)
                  ))
            );

            const formattedResults = [];

            for (let pdf of filteredResults) {
              const userDocRef = doc(db, "users", pdf.userUID);
              const docSnapshot = await getDoc(userDocRef);
              if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const organization = userData.organization || "N/A";
                const profilePicture = userData.profilePicture || null;
                const fullName = userData.fullName || "Anonymous";
                const username = userData.username || "Anonymous";

                formattedResults.push({
                  ...pdf,
                  matchedPdf: {
                    title: pdf.title,
                    description: pdf.description,
                    topics: pdf.topics,
                    url: pdf.url,
                  },
                  fullName: fullName,
                  organization: organization,
                  profilePicture: profilePicture,
                  username: username,
                });
              }
            }

            setResults(formattedResults);
          } else {
            console.warn("No papers found in searchIndex.");
            setResults([]);
          }
        } catch (error) {
          console.error("Error fetching papers from searchIndex:", error);
          setResults([]);
        }
      }
    } else {
      setResults([]);
    }
  };

  const handleResultClick = (result) => {
    // Handle result click if needed
  };

  const handleUniversitySuggestionClick = (university) => {
    setSearchTerm(university);
    setUniversitySuggestions([]);
    handleSearch(university);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: searchType.value === "universities" ? "140px" : "100px",
      borderTopRightRadius: "5px",
      borderBottomRightRadius: "5px",
      backgroundColor: "#1a1a1a",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0px 8px",
    }),
    singleValue: (provided) => ({
      ...provided,
      marginLeft: "0px",
      color: "white",
    }),
    menu: (provided) => ({
      ...provided,
      width: searchType.value === "universities" ? "160px" : "120px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#1a1a1a" : "white",
      color: state.isSelected ? "white" : "#1a1a1a",
      ":hover": {
        backgroundColor: "#1a1a1a",
        color: "white",
      },
      fontSize: "14px",
      padding: "10px 12px",
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  // Custom placeholder logic
  let searchPlaceholder = "";
  switch (searchType.label) {
    case "Users":
      searchPlaceholder = "Search for a user by name or username...";
      break;
    case "Papers":
      searchPlaceholder = "Search for research papers, topics, or authors...";
      break;
    case "Universities":
      searchPlaceholder = "Search by university name...";
      break;
    default:
      searchPlaceholder = `Search ${searchType.label}`;
  }

  return (
    <div className="container">
      <div className="row mt-4">
        <div style={{ textAlign: "center" }}>
          <div className="row justify-content-center d-flex fade-in">
            <img
              src={Logo}
              style={{ maxWidth: "70px", fill: "black" }}
              alt="resdex-logo"
            ></img>
          </div>
          <div className="row text-center fade-in">
            <p className="primary">⏐</p>
          </div>
          <h1 className="primary monarque fade-in">Explore ResDex</h1>
        </div>
        <br />
        <div
          className="d-flex justify-content-center input fade-in"
          style={{ marginTop: "20px" }}
        >
          <div
            className="input-group search-input-group box d-flex"
            style={{
              maxWidth: "600px",
              outline: "1px solid white",
              borderRadius: "6px",
              marginBottom: "100px",
              padding: "20px",
              position: "relative",
            }}
          >
            <Select
              value={searchType}
              onChange={handleSearchTypeChange}
              options={searchOptions}
              components={{ DropdownIndicator }}
              styles={customStyles}
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <input
              type="search"
              className="form-control"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchInputChange}
              style={{
                borderTopLeftRadius: "0px",
                borderBottomLeftRadius: "0px",
              }}
            />
            {/* University suggestions dropdown */}
            {searchType.value === "universities" &&
              universitySuggestions.length > 0 && (
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    marginTop: "5px",
                  }}
                >
                  {universitySuggestions.map((university, index) => (
                    <div
                      key={index}
                      className="p-2 cursor-pointer"
                      style={{
                        borderBottom:
                          index < universitySuggestions.length - 1
                            ? "1px solid #eee"
                            : "none",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleUniversitySuggestionClick(university)
                      }
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "white";
                      }}
                    >
                      <div className="d-flex align-items-center">
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
                          <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1H8zm2 0h1v1H8zM8 5h1v1H8zm2 0h1v1H8zm2 0h1v1H8zm0-2h1v1H8z" />
                        </svg>
                        <span style={{ color: "black" }}>{university}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
        <div className="mt-3 center">
          {results.length > 0 ? (
            <div
              className="row"
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent:
                  results.length === 1 ? "center" : "space-between",
              }}
            >
              {results.map((result, index) => (
                <div
                  key={index}
                  className="col box"
                  style={{
                    padding: "20px",
                    borderRadius: "10px",
                    flex:
                      results.length === 1
                        ? "0 0 100%"
                        : "0 0 calc(50% - 10px)",
                    marginBottom: "20px",
                    maxWidth: results.length === 1 ? "600px" : "none",
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
                          {RESDEX_TEAM_MEMBERS.includes(result.username) && <ResDexBadge />}
                        </strong>

                        <span>
                          <i style={{ color: "gray", marginLeft: "10px" }}>
                            '{result.username}'
                          </i>
                        </span>
                        <br></br>
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
                                <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1H8zm2 0h1v1H8zM8 5h1v1H8zm2 0h1v1H8zm2 0h1v1H8zm0-2h1v1H8z" />
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
                  {searchType.value === "papers" && result.matchedPdf && (
                    <div style={{ marginTop: "20px", width: "100%" }}>
                      <div style={{ marginBottom: "20px" }}>
                        <h5 style={{ color: "black" }}>
                          {result.matchedPdf.title}
                        </h5>
                        <p style={{ color: "black" }}>
                          {result.matchedPdf.description}
                        </p>
                        {result.matchedPdf.topics &&
                          result.matchedPdf.topics.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                              {result.matchedPdf.topics.map((topic, index) => (
                                <span
                                  key={index}
                                  className="interest-pill-black"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        <iframe
                          src={result.matchedPdf.url}
                          title={result.matchedPdf.title}
                          width="100%"
                          height="400px"
                          style={{
                            border: "1px solid #ccc",
                            marginTop: "10px",
                          }}
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            searchTerm.trim() !== "" && (
              <p className="primary">
                {searchType.value === "universities"
                  ? "No users found at this university. Try searching for a different university or check the spelling."
                  : "No results found. Please enter 3 or more characters."}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
