import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Select, { components } from 'react-select';

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 16 16">
        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
      </svg>
    </components.DropdownIndicator>
  );
};

const Search = () => {

  useEffect(() => {
      // Animate scrolling marquee once
      const scrollers = document.querySelectorAll(".scroller");
      scrollers.forEach((scroller) => {
        if (scroller.getAttribute("data-animated")) return;
    
        scroller.setAttribute("data-animated", true);
        const scrollerInner = scroller.querySelector(".scroller__inner");
        const scrollerContent = Array.from(scrollerInner.children);
    
        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          duplicatedItem.setAttribute("aria-hidden", true);
          scrollerInner.appendChild(duplicatedItem);
        });
      });
    
      // Fade-in on scroll using IntersectionObserver
      const fadeIns = document.querySelectorAll('.fade-in');
    
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target); // Optional: fade-in only once
            }
          });
        },
        {
          threshold: 0.05,
        }
      );
    
      fadeIns.forEach((el) => observer.observe(el));
    
      return () => {
        fadeIns.forEach((el) => observer.unobserve(el));
      };
    }, []);
    
  const [searchType, setSearchType] = useState({ value: "users", label: "Users" });
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const navigate = useNavigate();

  const searchOptions = [
    { value: "users", label: "Users" },
    { value: "papers", label: "Papers" }
  ];

  const handleSearchTypeChange = (selectedOption) => {
    setSearchType(selectedOption);
  };

  const handleSearchInputChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
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
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, limit(10));
      const querySnapshot = await getDocs(q);
      const allUsers = querySnapshot.docs.map(doc => doc.data());
      let filteredResults;
      if (searchType.value === "users") {
        filteredResults = allUsers.filter(user => 
          user.username.toLowerCase().includes(processedTerm) || 
          user.fullName.toLowerCase().includes(processedTerm)
        );
      } else if (searchType.value === "papers") {
        filteredResults = allUsers.flatMap(user => 
          (user.pdfs || [])
            .filter(pdf => 
              pdf.title.toLowerCase().includes(processedTerm) || 
              pdf.description.toLowerCase().includes(processedTerm) ||
              (pdf.topics && pdf.topics.some(topic => topic.toLowerCase().includes(processedTerm)))
            )
            .map(pdf => ({ ...user, matchedPdf: pdf }))
        );
      }
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  };

  const goToProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: '100px',
      borderTopRightRadius: '5px',
      borderBottomRightRadius: '5px',
      backgroundColor: '#1a1a1a',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0px 8px',
    }),
    singleValue: (provided) => ({
      ...provided,
      marginLeft: '0px',
      color: 'white'
    }),
    menu: (provided) => ({
      ...provided,
      width: '120px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#1a1a1a' : 'white',
      color: state.isSelected ? 'white' : '#1a1a1a',
      ':hover': {
        backgroundColor: '#1a1a1a',
        color: 'white',
      },
      fontSize: '14px',
      padding: '10px 12px',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  return (
    <div className="container">
      <div className='row top'>
        <h1 className='center primary fade-in'>Discover & Connect</h1>
        <br />
        <div className='d-flex justify-content-center input fade-in'>
          <div className="input-group search-input-group box d-flex" style={{maxWidth: '600px', outline: '1px solid white', borderRadius: '6px', marginBottom: '100px', padding: '20px'}}>
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
              placeholder={`Search ${searchType.label}`} 
              value={searchTerm} 
              onChange={handleSearchInputChange}
              style={{borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px'}}
            />
          </div>
        </div>
        <div className="mt-3 center">
          {results.length > 0 ? (
            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: results.length === 1 ? 'center' : 'space-between' }}>
              {results.map((result, index) => (
                <div key={index} className="col box" style={{padding:'20px', borderRadius:'10px', flex: results.length === 1 ? '0 0 100%' : '0 0 calc(50% - 10px)', marginBottom: '20px', maxWidth: results.length === 1 ? '600px' : 'none' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center" style={{marginRight: '30px'}}>
                      <img src={result.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/resdex-4b117.appspot.com/o/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.webp?alt=media&token=edabe458-161b-4a69-bc2e-630674bdb0de'} alt={`${result.fullName}'s profile`} style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }} />
                      <div>
                        <strong style={{color: 'black'}}>{result.fullName}</strong>
                      
                        <span><i style={{color: 'gray', marginLeft: '10px'}}>'{result.username}'</i></span>
                        <br></br>
                        <span>
  {result.organization && (
    <i style={{ color: 'gray' }}>
      <svg
        style={{ marginRight: '10px' }}
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
                    <button className="custom-view" onClick={() => goToProfile(result.username)}>
                      View Profile ↗︎
                    </button>
                  </div>
                  {searchType.value === "papers" && result.matchedPdf && (
  <div style={{ marginTop: '20px', width: '100%' }}>
    <div style={{ marginBottom: '20px' }}>
      <h5 style={{color: 'black'}}>{result.matchedPdf.title}</h5>
      <p style={{color: 'black'}}>{result.matchedPdf.description}</p>
      {result.matchedPdf.topics && result.matchedPdf.topics.length > 0 && (
        <div style={{marginTop: '10px'}}>
          {result.matchedPdf.topics.map((topic, index) => (
            <span key={index} className='interest-pill-black'>
              {topic}
            </span>
          ))}
        </div>
      )}
      <iframe src={result.matchedPdf.url} title={result.matchedPdf.title} width="100%" height="400px" style={{ border: '1px solid #ccc', marginTop: '10px' }}></iframe>
    </div>
  </div>
)}
                </div>
              ))}
            </div>
          ) : (
            searchTerm.trim() !== "" && <p className='primary'>No results found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;