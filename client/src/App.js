// Importing necessary modules: React for building the UI, useState for managing state, and axios for making HTTP requests.
import React, { useState } from 'react';
import axios from 'axios';

// Defining the App functional component.
function App() {
  // State management for the selected file, extracted data from that file, and the file's name.
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState({});
  const [fileName, setFileName] = useState('');

  // Handler for file selection. It updates the selectedFile and fileName states with the selected file and its name.
  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
  };

  // Handler for uploading the file. This function is asynchronous to handle the promise returned by axios.
  const handleUpload = async () => {
    // Check if a file has been selected before attempting to upload.
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    // Preparing the file data for upload using FormData.
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Attempt to upload the file to the server using axios. On success, extract and set the returned data.
      const response = await axios.post('http://localhost:4000/upload', formData);
      setExtractedData(response.data.substrate1); // Update the state with the extracted data from the response.
      alert('File uploaded successfully. Data extracted.');
    } catch (error) {
      // Handle any errors that occur during the upload.
      alert('Upload failed');
    }
  };

  // Handler for changes to the input fields (thickness and material). It updates the extractedData state.
  const handleDataChange = (e) => {
    setExtractedData({ ...extractedData, [e.target.name]: e.target.value });
  };

  // Handler for submitting the modified data back to the server.
  const handleSubmitChanges = async () => {
    try {
      // Send the modified data back to the server to update the original JSON file.
      await axios.post('http://localhost:4000/update-substrate1', {
        fileName, // Include the fileName to identify which file to update on the server.
        thickness: extractedData.thickness,
        material: extractedData.material,
      });
      alert('Data updated successfully.');
    } catch (error) {
      // Handle any errors that occur during the update process.
      alert('Failed to update data.');
    }
  };

  // Handler for downloading the updated JSON file.
  const handleDownloadUpdatedJson = async () => {
    try {
      // Request the updated file from the server.
      const response = await axios.get(`http://localhost:4000/download-updated-json/${fileName}`, { responseType: 'blob' });
      // Create a URL for the file blob and trigger the download using a temporary anchor element.
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Set the download attribute to define the file name.
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up by removing the temporary anchor element.
    } catch (error) {
      // Handle any errors that occur during the download process.
      alert('Failed to download the updated file.');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      <button onClick={handleUpload}>Upload JSON File</button>
      {Object.keys(extractedData).length > 0 && (
        <div>
          <div>
            <label>Thickness:</label>
            <input
              name="thickness"
              value={extractedData.thickness || ''}
              onChange={handleDataChange}
            />
          </div>
          <div>
            <label>Material:</label>
            <input
              name="material"
              value={extractedData.material || ''}
              onChange={handleDataChange}
            />
          </div>
          <button onClick={handleSubmitChanges}>Submit Changes</button>
          <button onClick={handleDownloadUpdatedJson}>Download Updated JSON</button>
        </div>
      )}
    </div>
  );
}

export default App;
