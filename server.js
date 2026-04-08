require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests from both your local dev environment AND your live Vercel frontend
const allowedOrigins = [
  'http://localhost:5173', 
  'https://forge-api-client.vercel.app' // Make sure this exactly matches your frontend URL!
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/', require('./src/routes/generate'));

try { 
  app.use('/', require('./src/routes/history')) 
} catch(e) { console.log('No history route') }

try { 
  app.use('/', require('./src/routes/ai')) 
} catch(e) { console.log('No AI route') }

try { 
  app.use('/', require('./src/routes/user')) 
} catch(e) { console.log('No user route') }

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route " + req.method + " " + req.path + " not found" 
  })
});

// Only listen locally. Vercel will handle the routing natively.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// THIS IS THE MAGIC LINE VERCEL NEEDS:
module.exports = app;