import React, { useState } from 'react';
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const Search = () => {
    const [searchType, setSearchType] = useState("users");
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const navigate = useNavigate();

    const handleSearchTypeChange = (event) => {
        setSearchType(event.target.value);
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

            if (searchType === "users") {
                filteredResults = allUsers.filter(user => 
                    user.username.toLowerCase().includes(processedTerm) || 
                    user.fullName.toLowerCase().includes(processedTerm)
                );
            } else if (searchType === "papers") {
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

    return (
        <div className="container">
            <div className='row top'>
                <h1 className='center'>Discover & Connect</h1>
                <br />
                <div className='center input mt-3'>
                    <div className="input-group search-input-group" style={{maxWidth: '600px', outline: '1px solid white', borderRadius: '6px'}}>
                        
                        <select
                            value={searchType}
                            onChange={handleSearchTypeChange}
                            className="form-select"
                            style={{maxWidth: '100px'}}
                        >
                            <option value="users">Users</option>
                            <option value="papers">Papers</option>
                        </select>
                        <input
                            type="search"
                            className="form-control"
                            placeholder={`Search ${searchType}`}
                            value={searchTerm}
                            onChange={handleSearchInputChange} 
                        />
                    </div>
                </div>
                <div className="mt-3 center">
                    {results.length > 0 ? (
                        <div 
                            className="row" 
                            style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                justifyContent: results.length === 1 ? 'center' : 'space-between' 
                            }}
                        >
                            {results.map((user, index) => (
                                <div 
                                    key={index} 
                                    className="col" 
                                    style={{ 
                                        backgroundColor:'white', 
                                        padding:'20px', 
                                        borderRadius:'10px', 
                                        flex: results.length === 1 ? '0 0 100%' : '0 0 calc(50% - 10px)', 
                                        marginBottom: '20px',
                                        maxWidth: results.length === 1 ? '600px' : 'none'
                                    }}
                                >
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center" style={{marginRight: '30px'}}>
                                            <img 
                                                src={user.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/resdex-4b117.appspot.com/o/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.webp?alt=media&token=edabe458-161b-4a69-bc2e-630674bdb0de' }  
                                                alt={`${user.fullName}'s profile`}
                                                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
                                            />
                                            <div>
                                                <strong style={{color: 'black'}}> {user.fullName} </strong> 
                                                <br></br>
                                                <span><i style={{color: 'gray'}}>'{user.username}'</i></span>
                                            </div>
                                        </div>

                                        <button 
                                            className="custom-view"
                                            onClick={() => goToProfile(user.username)}
                                        >
                                            View Profile ↗︎
                                        </button>
                                    </div>

                                    {searchType === "papers" && user.pdfs && (
                                        <div style={{ marginTop: '20px', width: '100%' }}>
                                            {user.pdfs.map((pdf, pdfIndex) => (
                                                pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) && (
                                                    <div key={pdfIndex} style={{ marginBottom: '20px' }}>
                                                        <h5 style={{color: 'black'}}>{pdf.title}</h5>
                                                        <p style={{color: 'black'}}>{pdf.description}</p>
                                                        <iframe 
                                                            src={pdf.url} 
                                                            title={pdf.title}
                                                            width="100%" 
                                                            height="400px" 
                                                            style={{ border: '1px solid #ccc' }}
                                                        ></iframe>
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