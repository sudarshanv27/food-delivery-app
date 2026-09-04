import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to get user's geolocation
 * @param {Object} options - Geolocation options
 * @returns {Object} Location state (location, error, loading, getLocation)
 */
const useGeolocation = (options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
                setLoading(false);
            },
            (err) => {
                let errorMessage = 'Unable to get your location';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Please enable location access to use this feature';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                    default:
                        errorMessage = err.message;
                }
                setError(errorMessage);
                setLoading(false);
            },
            options
        );
    }, [options]);

    const watchLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return null;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
                setError(null);
            },
            (err) => {
                setError(err.message);
            },
            options
        );

        return watchId;
    }, [options]);

    const stopWatching = useCallback((watchId) => {
        if (watchId && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    useEffect(() => {
        return () => {
            // Cleanup any ongoing watches
        };
    }, []);

    return { location, error, loading, getLocation, watchLocation, stopWatching };
};

export default useGeolocation;