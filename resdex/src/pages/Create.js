import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { auth, db } from '../firebaseConfig'; // Assuming you have firebaseConfig set up
import { components } from 'react-select';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const Create = () => {

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
    
  const interestOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Engineering', label: 'Engineering' },
  ];

  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [Title, setTitle] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [collaboratorOptions, setCollaboratorOptions] = useState([]);



  const CustomOption = (props) => {
    return (
      <components.Option {...props}>
        <div  style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={props.data.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
            alt={`${props.data.label}'s profile`}
            style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
          />
          <span className='primary'>{props.data.label}</span>
        </div>
      </components.Option>
    );
  };


  const CustomMultiValue = (props) => {
    return (
      <components.MultiValue {...props}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={props.data.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
            alt={`${props.data.label}'s profile`}
            style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '5px' }}
          />
          <span style={{ color: 'white' }}>{props.data.label}</span>
        </div>
      </components.MultiValue>
    );
  };





  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'white' : 'black',
      backgroundColor: state.isSelected ? 'rgba(189,197,209,.3)' : 'white',
      '&:hover': {
        backgroundColor: 'rgba(189,197,209,.3)',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'black',
      padding: '5px',
      borderRadius: '5px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      ':hover': {
        backgroundColor: 'black',
        color: 'white',
      },
    }),
  };

  // Function to load collaborators when the select box is opened
  const loadCollaborators = async () => {
    if (collaboratorOptions.length === 0) {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const researchFellows = userData.following || [];
  
            const fellowPromises = researchFellows.map(async (fellowId) => {
              const fellowDocRef = doc(db, 'users', fellowId);
              const fellowDoc = await getDoc(fellowDocRef);
              if (fellowDoc.exists()) {
                const fellowData = fellowDoc.data();
                return {
                  value: fellowId,
                  label: fellowData.fullName || 'Unknown',
                  profilePicture: fellowData.profilePicture, // Ensure this field is available
                };
              } else {
                return null;
              }
            });
  
            const optionsArray = await Promise.all(fellowPromises);
            const options = optionsArray.filter((option) => option !== null);
            setCollaboratorOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching research fellows:", error);
      }
    }
  };


  

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
  
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const username = userData.username; // Ensure this field is available
  
          const newResearch = {
            title: Title,
            description: description,
            interests: selectedTopics.map(topic => topic.label),
            collaborators: selectedCollaborators.map(collaborator => collaborator.label),
            createdAt: new Date(),
          };
  
          // Update the user's document with the new research entry
          await updateDoc(userDocRef, {
            collaboratedResearch: arrayUnion(newResearch)
          });
  
          setSuccess('Research created successfully!');
          setError('');
          navigate(`/profile/${username}`); // Use the actual username
        }
      }
    } catch (error) {
      console.error("Error saving research:", error);
      setError('Failed to create research. Please try again.');
      setSuccess('');
    }
  };


  return (
    <div>
      <h1 className='primary' style={{ marginTop: '40px' }}>
        Create, Collaborate, Upload.
      </h1>
      <div className='row mt-5 justify-content-center align-items-center d-flex'>
        <div className='col-md-7 box'>
          <div className='row'>
            <h1 className='col-md-11 primary monarque mb-4' style={{ overflowWrap: 'break-word' }}>{Title}</h1>
            <p className='col-md-11 primary text-muted mb-4' style={{ overflowWrap: 'break-word' }}>{description}</p>
            {selectedTopics.length > 0 && (
              <div style={{marginBottom: '30px'}}>
                <svg style={{ marginRight: '10px' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-tags-fill" viewBox="0 0 16 16">
                  <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                  <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
                </svg>
                {selectedTopics.map((topic, index) => (
                  <span key={index} className="interest-pill">
                    {topic.label}
                  </span>
                ))}
              </div>
            )}
            <Form className="contact-form">
              <Form.Group className="mb-3" style={{ borderTop: '1px solid #1a1a1a', paddingTop: '30px' }} controlId="formBasicFullName">
                <Form.Label className='primary'>Research Paper Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Title"
                  value={Title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength="120"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className='primary'>Description</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: 'black' }}>Relevant Topics</Form.Label>
                <Select
                  isMulti
                  name="topics"
                  options={interestOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedTopics}
                  onChange={(selected) => {
                    if (selected.length <= 3) {
                      setSelectedTopics(selected);
                    }
                  }}
                  isOptionDisabled={() => selectedTopics.length >= 3}
                  placeholder="Select up to 3 topics"
                  styles={customStyles}
                />
              </Form.Group>
              <Form.Group className="mb-3">
        <Form.Label style={{ color: 'black' }}>Collaborators</Form.Label>
        <Select
          isMulti
          name="collaborators"
          options={collaboratorOptions}
          className="basic-multi-select primary"
          classNamePrefix="select"
          value={selectedCollaborators}
          onChange={(selected) => setSelectedCollaborators(selected)}
          placeholder="Select collaborators"
          styles={customStyles}
          onMenuOpen={loadCollaborators} // Load collaborators when menu opens
  components={{ Option: CustomOption, MultiValue: CustomMultiValue }} // Use the custom MultiValue component

        />
      </Form.Group>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {success && <p style={{ color: 'green' }}>{success}</p>}
              <Button className="custom" style={{ marginBottom: '20px' }} type="submit" onClick={handleSubmit}>
  Create
</Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;