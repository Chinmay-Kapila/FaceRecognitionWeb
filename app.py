
from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import os
import base64
from sklearn.neighbors import KNeighborsClassifier

#Flask app
app = Flask(__name__)

#database
DATA_PATH = './data/'
os.makedirs(DATA_PATH, exist_ok=True)

face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_alt.xml')

temp_face_data = []


#decode base64 image (sent from browser) to OpenCV image ──
def decode_image(base64_str):
    img_bytes = base64.b64decode(base64_str.split(',')[1])  # Remove "data:image/..." prefix
    np_arr   = np.frombuffer(img_bytes, np.uint8)
    frame    = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return frame


#detection 
def detect_and_crop_face(frame):
    faces = face_cascade.detectMultiScale(frame, 1.3, 5)
    if len(faces) == 0:
        return None
    # Pick the face with the largest area (closest to camera)
    face   = sorted(faces, key=lambda f: f[2] * f[3])[-1]
    x, y, w, h = face
    offset = 10  # small border around face
    # Clamp so we don't crop outside the image
    y1, y2 = max(0, y - offset), min(frame.shape[0], y + h + offset)
    x1, x2 = max(0, x - offset), min(frame.shape[1], x + w + offset)
    face_img = frame[y1:y2, x1:x2]
    face_img = cv2.resize(face_img, (100, 100))   # uniform size
    return face_img


# ROUTES
# Home page
@app.route('/')
def index():
    return render_template('index.html')

# Register page
@app.route('/register')
def register():
    return render_template('register.html')

# Recognize page
@app.route('/recognize')
def recognize():
    return render_template('recognize.html')


# ── API: capture frames for registration ──
@app.route('/capture', methods=['POST'])
def capture():
    """
    Handles three actions from JavaScript:
      'start'   - clear temp buffer
      'capture' - add one face frame to temp buffer
      'save'    - flatten buffer & write .npy file to /data/
    """
    global temp_face_data
    data   = request.json
    action = data.get('action', 'capture')
    name   = data.get('name', '').strip()

    # ── Action: START a new session ──
    if action == 'start':
        temp_face_data = []
        return jsonify({'status': 'started'})

    # ── Action: SAVE collected frames to .npy ──
    if action == 'save':
        if action == 'save' and name == "":
            return jsonify({'status': 'error', 'message': 'Name required'}) 
        if len(temp_face_data) == 0:
            return jsonify({'status': 'error', 'message': 'No face data collected!'})
        face_array = np.array(temp_face_data)
        face_array = face_array.reshape((face_array.shape[0], -1))  # flatten each image
        np.save(os.path.join(DATA_PATH, name + '.npy'), face_array)
        temp_face_data = []
        return jsonify({'status': 'saved', 'count': int(face_array.shape[0]), 'name': name})

    # ── Action: CAPTURE one frame ──
    frame    = decode_image(data.get('image', ''))
    face_img = detect_and_crop_face(frame)
    if face_img is None:
        return jsonify({'status': 'no_face', 'count': len(temp_face_data)})
    temp_face_data.append(face_img)
    return jsonify({'status': 'captured', 'count': len(temp_face_data)})


# ── API: predict who is in the camera frame ──
@app.route('/predict', methods=['POST'])
def predict():
    """
    1. Load all .npy files from /data/ (each file = one person)
    2. Train KNN on the spot
    3. Predict the face in the incoming frame
    """
    npy_files = [f for f in os.listdir(DATA_PATH) if f.endswith('.npy')]
    if not npy_files:
        return jsonify({'status': 'error', 'message': 'No training data! Register a face first.'})

    face_data, labels, names, class_id = [], [], {}, 0
    for fx in npy_files:
        names[class_id] = fx[:-4]                            # remove .npy for display name
        data_item = np.load(os.path.join(DATA_PATH, fx))
        face_data.append(data_item)
        labels.append(class_id * np.ones((data_item.shape[0],)))
        class_id += 1

    X = np.concatenate(face_data, axis=0)   # all face images stacked
    y = np.concatenate(labels,    axis=0)   # matching labels

    # Train KNN classifier (k=5 neighbours)
    clf = KNeighborsClassifier(n_neighbors=min(5, len(y)))
    clf.fit(X, y)

    # Decode and predict incoming frame
    frame    = decode_image(request.json.get('image', ''))
    face_img = detect_and_crop_face(frame)
    if face_img is None:
        return jsonify({'status': 'no_face', 'name': 'No face detected'})

    pred          = clf.predict([face_img.flatten()])
    predicted_name = names[int(pred[0])]
    return jsonify({'status': 'success', 'name': predicted_name})


# ── API: list all registered persons ──
@app.route('/registered_users')
def registered_users():
    users = [f[:-4] for f in os.listdir(DATA_PATH) if f.endswith('.npy')]
    return jsonify({'users': users})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
