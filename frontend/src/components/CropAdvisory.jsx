import { useEffect, useState } from "react";
import OutputCard from "./OutputCard";

export default function CropAdvisory() {
  const [result, setResult] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [form, setForm] = useState({
    crop: "",
    season: "",
    area: "",
    rainfall: "",
    tmax: "",
    tmin: "",
    humidity: ""
  });

  // 🔹 Detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        err => {
          console.error("Location error:", err);
        }
      );
    }
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    let yieldVal = (Math.random() * 3 + 2).toFixed(2); // 2–5 t/ha
    setResult({
      crop: form.crop,
      season: form.season,
      yield: `${yieldVal} t/ha`,
      fertilizer: "Apply 35kg N, 25kg P/ha",
      irrigation: "30 mm needed",
      risk: "Medium",
      location: coords
    });
  }

  return (
    <div>
      <h2>🌾 Advisory for Specific Crop</h2>
      {coords.lat && (
        <p>
          📍 Location detected: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
        </p>
      )}

      <form onSubmit={handleSubmit} className="form">
        <label>Crop Name:</label>
        <select name="crop" value={form.crop} onChange={handleChange} required>
          <option value="">--Select Crop--</option>
          <option>Rice</option>
          <option>Wheat</option>
          <option>Maize</option>
          <option>Pulses</option>
        </select>

        <label>Season:</label>
        <select name="season" value={form.season} onChange={handleChange} required>
          <option value="">--Select Season--</option>
          <option>Kharif</option>
          <option>Rabi</option>
          <option>Zaid</option>
        </select>

        <label>Area Sown (ha):</label>
        <input type="number" name="area" value={form.area} onChange={handleChange} />

        <label>Rainfall (mm):</label>
        <input type="number" name="rainfall" value={form.rainfall} onChange={handleChange} />

        <label>Max Temp (°C):</label>
        <input type="number" name="tmax" value={form.tmax} onChange={handleChange} />

        <label>Min Temp (°C):</label>
        <input type="number" name="tmin" value={form.tmin} onChange={handleChange} />

        <label>Humidity (%):</label>
        <input type="number" name="humidity" value={form.humidity} onChange={handleChange} />

        <button type="submit">Get Advisory</button>
      </form>

      {result && <OutputCard result={result} />}
    </div>
  );
}
