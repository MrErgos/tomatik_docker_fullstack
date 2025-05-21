import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://188.225.45.142:5000';

export default function App() {
  const [token, setToken] = useState('');
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState([]);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });

  const handleAuth = async (selectedMode) => {
    try {
      const res = await axios.post(`${API_BASE}/${selectedMode}`, form);
      if (res.data.token) {
        setToken(res.data.token);
        alert('Logged in successfully');
      } else if (res.data.message) {
        alert(res.data.message);
        if (selectedMode === 'register') setMode('login');
      }
    } catch (err) {
        console.error('Auth error:', err.response || err);
      alert(err.response?.data?.error || 'Authentication error');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid image file');
      setFile(null);
    }
  };

  const handlePredict = async () => {
    if (!file || !token) {
      alert('Image and login required');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE}/predict`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOutput(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Prediction failed');
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tomato Ripeness Classifier</h1>

      {!token && (
        <div className="space-y-2 mb-6">
          <input
            placeholder="Username"
            className="border p-2 w-full"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />
          <input
            placeholder="Password"
            type="password"
            className="border p-2 w-full"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => handleAuth('register')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Register
            </button>
            <button
              onClick={() => handleAuth('login')}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {token && (
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 w-full"
          />
          <button
            onClick={handlePredict}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Predict
          </button>
            {output.image_base64 && (
              <div className="mt-4">
                <h2 className="font-bold mb-2">Predicted Image</h2>
                <img
                  src={`data:image/jpeg;base64,${output.image_base64}`}
                  alt="Prediction Result"
                  className="border rounded"
                />
              </div>
            )}
          {output.length > 0 && (
            <div className="mt-4">
              <h2 className="font-bold mb-2">Predictions</h2>
              <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
                {JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}