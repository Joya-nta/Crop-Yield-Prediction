import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OutputCard from "./OutputCard";

export default function BestCrop() {
    const { t } = useTranslation();
    // 1. State Management
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);

    // 2. GPS Location State
    const [currentLocation, setCurrentLocation] = useState({ lat: null, lon: null });

    // 3. Form State
    const [formData, setFormData] = useState({
        state: "",
        soil_type: "",
        rainfall: "",
        season: "",
        area: "",
        location: false,
        current_location: ""
    });

    const soilTypes = [
        'Alluvial', 'Black (Regur)', 'Laterite', 'Peaty', 'Red', 'Sandy'
    ];

    // 3. Load State from LocalStorage (Sync with your Profile/Login)
    useEffect(() => {
        const storedState = localStorage.getItem("userState");
        if (storedState) {
            setFormData((prev) => ({
                ...prev,
                state: storedState,
            }));
        }
    }, []);

    // 4. Handle Input Changes
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 5. Get Current Location using GPS (via checkbox toggle)
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

    // 6. Submit Form to Flask API
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Validate that we have the state (likely from localStorage)
            if (!formData.state) {
                throw new Error(t('bestCrop.error.stateMissing'));
            }

            const payload = {
                state: formData.state,
                soil_type: formData.soil_type,
                rainfall_mm: parseFloat(formData.rainfall),
                season: formData.season,
                area_ha: parseFloat(formData.area),
            };

            // Include GPS location if available
            if (currentLocation.lat && currentLocation.lon) {
                payload.latitude = currentLocation.lat;
                payload.longitude = currentLocation.lon;
            }

            const response = await fetch('http://127.0.0.1:5000/recommend-crop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Ensure the property name matches what OutputCard expects
                setResult({ crop: data.recommendations });
            } else {
                const errorMsg = data.message || data.error || "An unknown error occurred.";
                setError(errorMsg);
            }
        } catch (err) {
            setError(err.message || 'Server connection failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-container">
            <h2 className="form-title">{t('bestCrop.title')}</h2>

            <form onSubmit={handleSubmit} className="form">

                {/* Soil Type */}
                <div className="form-group">
                    <label className="form-label">{t('bestCrop.soilType')}</label>
                    <select
                        name="soil_type" // CRITICAL: added name
                        className="form-input"
                        value={formData.soil_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">{t('bestCrop.selectSoilType')}</option>
                        {soilTypes.map((soil) => (
                            <option key={soil} value={soil}>{soil}</option>
                        ))}
                    </select>
                </div>

                {/* Area */}
                <div className="form-group">
                    <label className="form-label">{t('bestCrop.area')}</label>
                    <input
                        name="area" // CRITICAL: added name
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={formData.area}
                        onChange={handleChange}
                        required
                        placeholder={t('bestCrop.areaPlaceholder')}
                    />
                </div>

                {/* Season */}
                <div className="form-group">
                    <label className="form-label">{t('bestCrop.season')}</label>
                    <select
                        name="season" // CRITICAL: added name
                        value={formData.season}
                        onChange={handleChange}
                        required
                        className="form-input"
                    >
                        <option value="">{t('bestCrop.selectSeason')}</option>
                        <option value="Kharif">{t('bestCrop.kharif')}</option>
                        <option value="Rabi">{t('bestCrop.rabi')}</option>
                        <option value="Zaid">{t('bestCrop.zaid')}</option>
                    </select>
                </div>

                {/* Rainfall */}
                <div className="form-group">
                    <label className="form-label">{t('bestCrop.rainfall')}</label>
                    <input
                        type="number"
                        name="rainfall" // CRITICAL: added name
                        value={formData.rainfall}
                        onChange={handleChange}
                        required
                        placeholder={t('bestCrop.rainfallPlaceholder')}
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

                <button
                    type="submit"
                    disabled={loading}
                    className="form-button"
                >
                    {loading ? t('bestCrop.loading') : t('bestCrop.submit')}
                </button>
            </form>

            {/* Error Message */}
            {error && <p className="form-error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            {/* Results Display */}
            {result && <OutputCard result={result} />}
        </div>
    );
}
