const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.file.originalname);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the JSON file.');
    }
    try {
      const jsonData = JSON.parse(data);
      // Simulate extracting specific data; adjust indices as needed for your use case
      const recipe = jsonData.config.recipes[0]; // Simplified to first recipe for example
      if (!recipe) return res.status(404).send('Recipe not found.');

      const tray = recipe.trays[0]; // Simplified to first tray for example
      if (!tray) return res.status(404).send('Tray not found.');

      const position = tray.positions[0]; // Simplified to first position for example
      if (!position) return res.status(404).send('Position not found.');

      const substrate1 = position.substrate1;
      res.json({ substrate1 }); // Send back the extracted substrate1 data
    } catch (parseErr) {
      res.status(500).send('Error parsing the JSON file.');
    }
  });
});

app.post('/update-substrate1', (req, res) => {
  const { fileName, thickness, material } = req.body;
  const filePath = path.join(__dirname, 'uploads', fileName);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading the JSON file.');

    try {
      const jsonData = JSON.parse(data);
      // Simulated update logic; adjust for your use case
      jsonData.config.recipes[0].trays[0].positions[0].substrate1 = { thickness, material };

      fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
        if (writeErr) return res.status(500).send('Error writing the updated JSON file.');
        res.send('Substrate1 updated successfully.');
      });
    } catch (parseErr) {
      res.status(500).send('Error parsing the JSON file.');
    }
  });
});

app.get('/download-updated-json/:fileName', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.fileName);
  res.download(filePath);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
