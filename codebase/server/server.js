// server/server.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.post('/api/signup', async (req, res) => {
  const { fullName, displayName, email, password } = req.body;

  // Input validation
  if (!fullName || !displayName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // Obtain access token for Auth0 Management API
    const tokenResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Create the user in Auth0
    await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
      {
        email: email,
        password: password,
        connection: 'Username-Password-Authentication',
        user_metadata: {
          full_name: fullName,
          display_name: displayName,
        },
        email_verified: false,
        verify_email: true,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(
      'Error creating user:',
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      message: 'Error creating user',
      error: error.response ? error.response.data : error.message,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});