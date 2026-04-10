// ============================================================
//  camera.js  –  Webcam + API logic for Register page
//  PURPOSE : Opens webcam, captures frames every 500ms,
//            sends each frame to Flask /capture API using fetch().
// ============================================================

const TARGET_FRAMES = 30;   // Number of face images to collect
let stream          = null; // Holds the webcam MediaStream
let captureTimer    = null; // setInterval reference

// ── Open webcam and tell Flask to start a new session ──
async function startCapture() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) {
    alert('Please enter a name first!');
    return;
  }

  // 1. Tell Flask to reset temp buffer
  await fetch('/capture', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action: 'start', name })
  });

  // 2. Request browser webcam access
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById('video').srcObject = stream;
  } catch (err) {
    setStatus('Camera error: ' + err.message);
    return;
  }

  // 3. Disable Start, enable Stop/Save buttons
  document.querySelector('[onclick="startCapture()"]').disabled = true;
  document.getElementById('stopBtn').disabled = false;

  setStatus('📸 Capturing faces for: ' + name + '...');

  // 4. Capture a frame every 500ms and send to Flask
  captureTimer = setInterval(() => captureFrame(name), 500);
}

// ── Capture one frame from video and POST to Flask ──
async function captureFrame(name) {
  const video  = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx    = canvas.getContext('2d');

  // Draw current video frame onto the hidden canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  // Convert canvas pixels to a base64 JPEG string
  const imageData = canvas.toDataURL('image/jpeg', 0.8);

  try {
    const response = await fetch('/capture', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'capture', name, image: imageData })
    });
    const data = await response.json();

    // Update progress bar and status text
    const count   = data.count || 0;
    const percent = Math.min((count / TARGET_FRAMES) * 100, 100);
    document.getElementById('progress-bar').style.width = percent + '%';

    if (data.status === 'no_face') {
      setStatus('⚠️ No face detected. Move closer.');
    } else {
      setStatus(`✅ Captured ${count}/${TARGET_FRAMES} frames`);
    }

    // Auto-stop and enable Save when enough frames are collected
    if (count >= TARGET_FRAMES) {
      stopCapture();
      document.getElementById('saveBtn').disabled = false;
      setStatus(`🎉 Done! ${count} frames captured. Click "Save Data".`);
    }
  } catch (err) {
    setStatus('Server error: ' + err.message);
  }
}

// ── Stop capturing (clear timer, stop webcam) ──
function stopCapture() {
  clearInterval(captureTimer);
  captureTimer = null;
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  document.querySelector('[onclick="startCapture()"]').disabled = false;
  document.getElementById('stopBtn').disabled = true;
}

// ── Save collected face data as .npy via Flask ──
async function saveData() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) {
    alert('Name is missing!');
    return;
  }

  setStatus('💾 Saving data...');

  try {
    const response = await fetch('/capture', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'save', name })
    });
    const data = await response.json();

    if (data.status === 'saved') {
      setStatus(`✅ Saved ${data.count} face images for "${data.name}" in /data/${name}.npy`);
      document.getElementById('saveBtn').disabled = true;
    } else {
      setStatus('❌ Error: ' + data.message);
    }
  } catch (err) {
    setStatus('Server error: ' + err.message);
  }
}

// ── Helper: update the status text box ──
function setStatus(msg) {
  document.getElementById('status-box').textContent = msg;
}
