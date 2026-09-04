import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with reactive state
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if no stored value exists
 * @returns {[any, function]} State and setter function
 */
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    const removeValue = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key) {
                try {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
                    setStoredValue(newValue);
                } catch (error) {
                    console.error(`Error parsing storage change for key "${key}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
};

export default useLocalStorage;