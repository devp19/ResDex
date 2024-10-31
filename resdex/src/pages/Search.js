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
        if (searchType === "users" && term.trim() !== "") {
            const processedTerm = term.toLowerCase();

            const usersCollection = collection(db, "users");
            const q = query(usersCollection, limit(10));

            const querySnapshot = await getDocs(q);

            const allUsers = querySnapshot.docs.map(doc => doc.data());

            const filteredResults = allUsers.filter(user => 
                user.username.toLowerCase().includes(processedTerm) || 
                user.fullName.toLowerCase().includes(processedTerm)
            );

            const sortedResults = filteredResults.sort((a, b) => {
                const aUsernameMatch = a.username.toLowerCase() === processedTerm;
                const bUsernameMatch = b.username.toLowerCase() === processedTerm;

                if (aUsernameMatch && !bUsernameMatch) return -1;
                if (!aUsernameMatch && bUsernameMatch) return 1;  

                if (a.username.toLowerCase() < b.username.toLowerCase()) return -1;
                if (a.username.toLowerCase() > b.username.toLowerCase()) return 1;

                return a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase());
            });

            setResults(sortedResults); 
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
                        <ul className="list-group">
                            {results.map((user, index) => (
                                <li style={{minWidth: '600px'}} key={index} className="list-group-item d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <img 
                                            src={user.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/resdex-4b117.appspot.com/o/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.webp?alt=media&token=edabe458-161b-4a69-bc2e-630674bdb0de' }  // Default image if no profile picture exists
                                            alt={`${user.fullName}'s profile`}
                                            style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
                                        />
                         
                                        <div>
                                            <strong style={{color: 'black'}}> {user.fullName} </strong> 
                                            <span><i style={{color: 'gray', marginLeft: '10px'}}>'{user.username}'</i></span>
                                        </div>
                                    </div>

                     
                                    <button 
                                        className="custom-view"
                                        onClick={() => goToProfile(user.username)}
                                    >
                                        View Profile ↗︎
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        searchTerm.trim() !== "" && <p>No results found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;