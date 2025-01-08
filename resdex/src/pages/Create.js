import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { auth, db } from '../firebaseConfig'; // Assuming you have firebaseConfig set up
import { doc, getDoc } from 'firebase/firestore';

const Create = () => {
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
      borderRadius: '5px'
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

  useEffect(() => {
    const fetchResearchFellows = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const researchFellows = userData.following || []; // Assuming 'following' contains the list of research fellows

            researchFellows.forEach(fellow => {
                console.log('Research Fellow:', fellow);
              });
              
            const options = researchFellows.map(fellow => ({
              value: fellow.uid, // Assuming each fellow has a unique ID
              label: fellow.displayName || fellow.username // Assuming each fellow has a displayName or username
            }));
            setCollaboratorOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching research fellows:", error);
      }
    };

    fetchResearchFellows();
  }, []);

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
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedCollaborators}
                  onChange={(selected) => setSelectedCollaborators(selected)}
                  placeholder="Select collaborators"
                  styles={customStyles}
                />
              </Form.Group>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {success && <p style={{ color: 'green' }}>{success}</p>}
              <Button className="custom" style={{ marginBottom: '20px' }} type="submit">
                Submit Ticket
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;