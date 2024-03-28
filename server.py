from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS  # Import CORS
import os
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'json'}

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file and allowed_file(file.filename):
        filename = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filename)
        # Read and extract data from the JSON file after saving
        with open(filename, 'r') as f:
            data = json.load(f)
            substrate1 = data['config']['recipes'][0]['trays'][0]['positions'][0]['substrate1']
            return jsonify(substrate1=substrate1)
    return 'File type not allowed', 400

@app.route('/update-substrate1', methods=['POST'])
def update_substrate1():
    content = request.json
    filename = os.path.join(UPLOAD_FOLDER, content['fileName'])
    thickness = content['thickness']
    material = content['material']
    
    try:
        with open(filename, 'r+') as f:
            data = json.load(f)
            data['config']['recipes'][0]['trays'][0]['positions'][0]['substrate1']['thickness'] = thickness
            data['config']['recipes'][0]['trays'][0]['positions'][0]['substrate1']['material'] = material
            f.seek(0)
            json.dump(data, f, indent=2)
            f.truncate()
            return 'Substrate1 updated successfully.'
    except FileNotFoundError:
        return 'File not found', 404

@app.route('/download-updated-json/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(directory=UPLOAD_FOLDER, filename=filename, as_attachment=True)

if __name__ == '__main__':
    app.run(port=4000)
