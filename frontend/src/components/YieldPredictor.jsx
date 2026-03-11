import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OutputCard from "./OutputCard";

export default function YieldPredictor() {
    const { t } = useTranslation();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState({ lat: null, lon: null });

    const [formData, setFormData] = useState({
        state: "",
        soil_type: "",
        crop: "",
        season: "",
        rainfall: "",
        area: "",
    });

    const soilTypes = ['Alluvial', 'Black (Regur)', 'Laterite', 'Peaty', 'Red', 'Sandy'];

    useEffect(() => {
        const storedState = localStorage.getItem("userState");
        const storedSoil = localStorage.getItem("userSoilType");
        const storedArea = localStorage.getItem("userArea");

        setFormData((prev) => ({
            ...prev,
            state: storedState || "",
            soil_type: storedSoil || "",
            area: storedArea || "",
        }));
    }, []);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    // Handle GPS Location Toggle
    function handleLocationToggle() {
        // If location is already captured, clear it
        if (currentLocation.lat && currentLocation.lon) {
            setCurrentLocation({ lat: null, lon: null });
            return;
        }

        // Otherwise, get current location
        if (!navigator.geolocation) {
            setError(t('bestCrop.error.geolocationNotSupported'));
            return;
        }

        setLocationLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                setLocationLoading(false);
            },
            (err) => {
                setError(t('bestCrop.error.locationDenied'));
                setLocationLoading(false);
                console.error("GPS Error:", err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            if (!formData.state || !formData.soil_type || !formData.area) {
                throw new Error(t('yieldPredictor.error.missingFields'));
            }

            const payload = {
                state: formData.state,
                soil_type: formData.soil_type,
                rainfall_mm: parseFloat(formData.rainfall),
                season: formData.season,
                area_ha: parseFloat(formData.area),
                crop_name: formData.crop
            };

            // Include GPS location if available
            if (currentLocation.lat && currentLocation.lon) {
                payload.latitude = currentLocation.lat;
                payload.longitude = currentLocation.lon;
            }

            const response = await fetch('http://127.0.0.1:5000/predict-yield', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                setResult({ yield: data.predicted_yield.toFixed(2) + " kg/ha" });
            } else {
                const errorMsg = data.message || data.error || "An unknown error occurred.";
                setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
            }
        } catch (err) {
            setError(err.message || 'Server connection failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-container">
            <h2 className="form-title">{t('yieldPredictor.title')}</h2>

            <form onSubmit={handleSubmit} className="form">

                {/* --- SOIL TYPE FIELD --- */}
                <div className="form-group">
                    <label className="form-label">{t('yieldPredictor.soilType')}</label>
                    <select
                        name="soil_type"
                        value={formData.soil_type}
                        onChange={handleChange}
                        required
                        className="form-input"
                    >
                        <option value="">{t('yieldPredictor.selectSoilType')}</option>
                        {soilTypes.map((soil) => (
                            <option key={soil} value={soil}>{soil}</option>
                        ))}
                    </select>
                </div>

                {/* --- AREA FIELD --- */}
                <div className="form-group">
                    <label className="form-label">{t('yieldPredictor.area')}</label>
                    <input
                        type="number"
                        name="area"
                        step="0.01"
                        value={formData.area}
                        onChange={handleChange}
                        required
                        placeholder={t('yieldPredictor.areaPlaceholder')}
                        className="form-input"
                    />
                </div>

                {/* --- CROP SELECTION --- */}
                <div className="form-group">
                    <label className="form-label">{t('yieldPredictor.crop')}</label>
                    <select name="crop" value={formData.crop} onChange={handleChange} required className="form-input">
                        <option value="">{t('yieldPredictor.selectCrop')}</option>
                        <option value="Rice">{t('yieldPredictor.crops.rice')}</option>
                        <option value="Wheat">{t('yieldPredictor.crops.wheat')}</option>
                        <option value="Maize">{t('yieldPredictor.crops.maize')}</option>
                        <option value="Pulses">{t('yieldPredictor.crops.pulses')}</option>
                        <option value="Oilseeds">{t('yieldPredictor.crops.oilseeds')}</option>
                        <option value="Potato">{t('yieldPredictor.crops.potato')}</option>
                        <option value="Jute">{t('yieldPredictor.crops.jute')}</option>
                        <option value="Sugarcane">{t('yieldPredictor.crops.sugarcane')}</option>
                        <option value="Vegetables">{t('yieldPredictor.crops.vegetables')}</option>
                    </select>
                </div>

                {/* --- SEASON SELECTION --- */}
                <div className="form-group">
                    <label className="form-label">{t('yieldPredictor.season')}</label>
                    <select name="season" value={formData.season} onChange={handleChange} required className="form-input">
                        <option value="">{t('yieldPredictor.selectSeason')}</option>
                        <option value="Kharif">{t('bestCrop.kharif')}</option>
                        <option value="Rabi">{t('bestCrop.rabi')}</option>
                        <option value="Zaid">{t('bestCrop.zaid')}</option>
                    </select>
                </div>

                {/* --- RAINFALL FIELD --- */}
                <div className="form-group">
                    <label className="form-label">{t('yieldPredictor.rainfall')}</label>
                    <input
                        type="number"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleChange}
                        required
                        placeholder={t('yieldPredictor.rainfallPlaceholder')}
                        className="form-input"
                    />
                </div>

                {/* Current Location Toggle */}
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        id="useCurrentLocation"
                        checked={!!(currentLocation.lat && currentLocation.lon)}
                        onChange={handleLocationToggle}
                        disabled={locationLoading}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label
                        htmlFor="useCurrentLocation"
                        style={{ cursor: 'pointer', fontWeight: 'normal' }}
                    >
                        {locationLoading
                            ? t('bestCrop.gettingLocation')
                            : t('bestCrop.useCurrentLocation')}
                    </label>

                    {/* Show captured location */}
                    {currentLocation.lat && currentLocation.lon && (
                        <span style={{ color: '#28a745', fontSize: '14px', marginLeft: '10px' }}>
                            📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lon.toFixed(4)}
                        </span>
                    )}
                </div>

                <button type="submit" disabled={loading} className="form-button">
                    {loading ? t('yieldPredictor.loading') : t('yieldPredictor.submit')}
                </button>
            </form>

            {error && (<p className="form-error">{typeof error === 'object' ? JSON.stringify(error) : error}</p>)}

            {result && <OutputCard result={result} />}
        </div>
    );
}
