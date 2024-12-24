const express = require('express');
const app = express();
const path = require('path');

// Tell Express to serve static files from the "Styles" directory
app.use('/Styles', express.static(path.join(__dirname, 'Styles')));

// Serve your index.html file when the root path is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
