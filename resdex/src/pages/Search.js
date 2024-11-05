import React, { useState } from 'react';
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Select, { components } from 'react-select';

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="black" viewBox="0 0 16 16">
        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
      </svg>
    </components.DropdownIndicator>
  );
};

const Search = () => {
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
        filteredResults = allUsers.filter(user => 
          user.pdfs && user.pdfs.some(pdf => pdf.title.toLowerCase().includes(processedTerm))
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
      borderTopRightRadius: '0px',
      borderBottomRightRadius: '0px',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0px 8px',
    }),
    singleValue: (provided) => ({
      ...provided,
      marginLeft: '0px',
    }),
    menu: (provided) => ({
      ...provided,
      width: '120px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : 'white',
      color: state.isSelected ? 'white' : 'black',
      ':hover': {
        backgroundColor: '#007bff',
        color: 'white',
      },
      fontSize: '14px',
      padding: '8px 12px',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  return (
    <div className="container">
      <div className='row top'>
        <h1 className='center'>Discover & Connect</h1>
        <br />
        <div className='center input mt-3'>
          <div className="input-group search-input-group" style={{maxWidth: '600px', outline: '1px solid white', borderRadius: '6px'}}>
    
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
              {results.map((user, index) => (
                <div key={index} className="col" style={{ backgroundColor:'white', padding:'20px', borderRadius:'10px', flex: results.length === 1 ? '0 0 100%' : '0 0 calc(50% - 10px)', marginBottom: '20px', maxWidth: results.length === 1 ? '600px' : 'none' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center" style={{marginRight: '30px'}}>
                      <img src={user.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/resdex-4b117.appspot.com/o/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.webp?alt=media&token=edabe458-161b-4a69-bc2e-630674bdb0de'} alt={`${user.fullName}'s profile`} style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }} />
                      <div>
                        <strong style={{color: 'black'}}>{user.fullName}</strong>
                        <br></br>
                        <span><i style={{color: 'gray'}}>'{user.username}'</i></span>
                      </div>
                    </div>
                    <button className="custom-view" onClick={() => goToProfile(user.username)}>
                      View Profile ↗︎
                    </button>
                  </div>
                  {searchType.value === "papers" && user.pdfs && (
                    <div style={{ marginTop: '20px', width: '100%' }}>
                      {user.pdfs.map((pdf, pdfIndex) => (
                        pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) && (
                          <div key={pdfIndex} style={{ marginBottom: '20px' }}>
                            <h5 style={{color: 'black'}}>{pdf.title}</h5>
                            <p style={{color: 'black'}}>{pdf.description}</p>
                            <iframe src={pdf.url} title={pdf.title} width="100%" height="400px" style={{ border: '1px solid #ccc' }}></iframe>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            searchTerm.trim() !== "" && <p>No results found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;