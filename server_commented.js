// Required modules
const express = require('express'); // Express.js for routing and middleware
const multer = require('multer'); // Multer for handling multipart/form-data, primarily used for uploading files
const cors = require('cors'); // CORS (Cross-Origin Resource Sharing) middleware to enable CORS requests
const fs = require('fs'); // File System module to interact with the file system
const path = require('path'); // Path module provides utilities for working with file and directory paths
const bodyParser = require('body-parser'); // Body-parser middleware to parse incoming request bodies

// Initialize the Express application
const app = express();
const port = 4000; // Port on which the server will listen

// Apply middleware
app.use(cors()); // Enable all CORS requests
app.use(bodyParser.json()); // Parse JSON bodies

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Set destination folder for uploads
  filename: (req, file, cb) => cb(null, file.originalname), // Use original file name
});
const upload = multer({ storage }); // Initialize multer with the storage configuration

// Route for handling file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  // Construct the file path where the uploaded file is saved
  const filePath = path.join(__dirname, 'uploads', req.file.originalname);

  // Read the uploaded file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      // Handle file read errors
      return res.status(500).send('Error reading the JSON file.');
    }
    try {
      // Parse the file content as JSON
      const jsonData = JSON.parse(data);

      // For simplicity, we're directly accessing the first recipe, tray, and position.
      // In a real-world scenario, you might need to dynamically find these based on some criteria.
      const recipe = jsonData.config.recipes[0];
      if (!recipe) return res.status(404).send('Recipe not found.');

      const tray = recipe.trays[0];
      if (!tray) return res.status(404).send('Tray not found.');

      const position = tray.positions[0];
      if (!position) return res.status(404).send('Position not found.');

      // Extract substrate1 data and send it back in the response
      const substrate1 = position.substrate1;
      res.json({ substrate1 }); // Return the extracted data as JSON
    } catch (parseErr) {
      // Handle JSON parsing errors
      res.status(500).send('Error parsing the JSON file.');
    }
  });
});

// Route for updating substrate1 data
app.post('/update-substrate1', (req, res) => {
  // Extract request body data
  const { fileName, thickness, material } = req.body;
  // Construct the file path
  const filePath = path.join(__dirname, 'uploads', fileName);
  
  // Read the existing JSON file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading the JSON file.');

    try {
      // Parse the file content as JSON
      const jsonData = JSON.parse(data);
      // Update substrate1 data based on the request
      jsonData.config.recipes[0].trays[0].positions[0].substrate1 = { thickness, material };

      // Write the updated JSON data back to the file
      fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
        if (writeErr) return res.status(500).send('Error writing the updated JSON file.');
        res.send('Substrate1 updated successfully.');
      });
    } catch (parseErr) {
      // Handle JSON parsing errors
      res.status(500).send('Error parsing the JSON file.');
    }
  });
});

// Route for downloading the updated JSON file
app.get('/download-updated-json/:fileName', (req, res) => {
  // Construct the file path using the fileName parameter from the route
  const filePath = path.join(__dirname, 'uploads', req.params.fileName);
  // Trigger file download
  res.download(filePath);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
