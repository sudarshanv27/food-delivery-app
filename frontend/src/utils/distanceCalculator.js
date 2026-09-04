/**
 * Earth's radius in kilometers
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Earth's radius in miles
 */
const EARTH_RADIUS_MILES = 3959;

/**
 * Convert degrees to radians
 * @param {number} degrees - Value in degrees
 * @returns {number} Value in radians
 */
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} point1 - First coordinate { latitude, longitude }
 * @param {Object} point2 - Second coordinate { latitude, longitude }
 * @param {string} unit - Unit of measurement ('km' or 'miles')
 * @returns {number} Distance in specified unit
 */
export const calculateDistance = (point1, point2, unit = 'km') => {
    if (!point1 || !point2) return 0;

    const radius = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM;

    const lat1 = toRadians(point1.latitude);
    const lat2 = toRadians(point2.latitude);
    const deltaLat = toRadians(point2.latitude - point1.latitude);
    const deltaLon = toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c;
};

/**
 * Calculate distance between two coordinates in kilometers
 * @param {Object} point1 - First coordinate
 * @param {Object} point2 - Second coordinate
 * @returns {number} Distance in kilometers
 */
export const calculateDistanceKm = (point1, point2) => {
    return calculateDistance(point1, point2, 'km');
};

/**
 * Calculate distance between two coordinates in miles
 * @param {Object} point1 - First coordinate
 * @param {Object} point2 - Second coordinate
 * @returns {number} Distance in miles
 */
export const calculateDistanceMiles = (point1, point2) => {
    return calculateDistance(point1, point2, 'miles');
};

/**
 * Calculate estimated delivery time based on distance
 * @param {number} distance - Distance in kilometers
 * @param {number} averageSpeed - Average speed in km/h (default: 30)
 * @param {number} preparationTime - Preparation time in minutes (default: 15)
 * @returns {number} Estimated delivery time in minutes
 */
export const calculateDeliveryTime = (distance, averageSpeed = 30, preparationTime = 15) => {
    const travelTimeMinutes = (distance / averageSpeed) * 60;
    return Math.ceil(travelTimeMinutes + preparationTime);
};

/**
 * Get formatted distance string
 * @param {number} distance - Distance in kilometers
 * @param {string} unit - Unit ('km' or 'miles')
 * @param {boolean} showUnit - Whether to show unit in output
 * @returns {string} Formatted distance
 */
export const formatDistance = (distance, unit = 'km', showUnit = true) => {
    if (distance < 1) {
        const meters = Math.round(distance * 1000);
        return showUnit ? `${meters} m` : `${meters}`;
    }
    const formatted = distance.toFixed(1);
    return showUnit ? `${formatted} ${unit}` : formatted;
};

/**
 * Calculate fare based on distance
 * @param {number} distance - Distance in kilometers
 * @param {Object} rates - Rate configuration
 * @returns {number} Calculated fare
 */
export const calculateFare = (distance, rates = {}) => {
    const {
        baseFare = 30,
        perKmRate = 10,
        minFare = 40,
        surgeMultiplier = 1,
    } = rates;

    let fare = baseFare + (distance * perKmRate);
    fare = Math.max(fare, minFare);
    fare = fare * surgeMultiplier;

    return Math.ceil(fare);
};

/**
 * Find nearest location from a list
 * @param {Object} origin - Origin coordinates
 * @param {Array} destinations - Array of destination coordinates with id
 * @returns {Object} Nearest destination
 */
export const findNearestLocation = (origin, destinations) => {
    if (!destinations.length) return null;

    let nearest = null;
    let minDistance = Infinity;

    destinations.forEach(destination => {
        const distance = calculateDistanceKm(origin, destination.coordinates);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = { ...destination, distance };
        }
    });

    return nearest;
};

/**
 * Get distance level description
 * @param {number} distance - Distance in kilometers
 * @returns {string} Distance description
 */
export const getDistanceLevel = (distance) => {
    if (distance < 2) return 'Very Close';
    if (distance < 5) return 'Close';
    if (distance < 10) return 'Moderate';
    if (distance < 20) return 'Far';
    return 'Very Far';
};

/**
 * Validate coordinates
 * @param {Object} coordinates - { latitude, longitude }
 * @returns {boolean} True if coordinates are valid
 */
export const isValidCoordinates = (coordinates) => {
    if (!coordinates) return false;
    const { latitude, longitude } = coordinates;
    return (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        latitude >= -90 && latitude <= 90 &&
        longitude >= -180 && longitude <= 180
    );
};

/**
 * Get approximate driving distance (simplified - uses straight line with factor)
 * @param {number} straightLineKm - Straight line distance in km
 * @returns {number} Approximate driving distance in km
 */
export const drivingDistance = (straightLineKm) => {
    // Road distance is typically 20-30% longer than straight line
    return straightLineKm * 1.25;
};

/**
 * Get bounding box around a point
 * @param {Object} center - Center coordinates
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} Bounding box { minLat, maxLat, minLng, maxLng }
 */
export const getBoundingBox = (center, radiusKm) => {
    const lat = center.latitude;
    const lng = center.longitude;

    // Approximate degree to km conversion
    const latDegree = radiusKm / 111;
    const lngDegree = radiusKm / (111 * Math.cos(toRadians(lat)));

    return {
        minLat: lat - latDegree,
        maxLat: lat + latDegree,
        minLng: lng - lngDegree,
        maxLng: lng + lngDegree,
    };
};

/**
 * Check if point is within radius
 * @param {Object} center - Center coordinates
 * @param {Object} point - Point coordinates
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} True if point is within radius
 */
export const isWithinRadius = (center, point, radiusKm) => {
    const distance = calculateDistanceKm(center, point);
    return distance <= radiusKm;
};

/**
 * Sort locations by distance from origin
 * @param {Object} origin - Origin coordinates
 * @param {Array} locations - Array of location objects with coordinates
 * @returns {Array} Sorted locations by distance
 */
export const sortByDistance = (origin, locations) => {
    return [...locations].sort((a, b) => {
        const distA = calculateDistanceKm(origin, a.coordinates);
        const distB = calculateDistanceKm(origin, b.coordinates);
        return distA - distB;
    });
};

export default {
    calculateDistance,
    calculateDistanceKm,
    calculateDistanceMiles,
    calculateDeliveryTime,
    formatDistance,
    calculateFare,
    findNearestLocation,
    getDistanceLevel,
    isValidCoordinates,
    drivingDistance,
    getBoundingBox,
    isWithinRadius,
    sortByDistance,
};