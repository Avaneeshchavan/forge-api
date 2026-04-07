require('dotenv').config(); // <-- ADD THIS AT THE TOP
const express = require('express');
// ... the rest of your codeconst express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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

app.use((req, res) => {
  res.status(404).json({ 
    error: "Route " + req.method + " " + req.path + " not found" 
  })
})

// Only listen locally. Vercel will handle the routing natively.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// THIS IS THE MAGIC LINE VERCEL NEEDS:
module.exports = app;