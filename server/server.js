require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hostel Management API is running' });
});

// We will add more routes here based on Phase 1 & 2
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/problems', require('./routes/problems'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
