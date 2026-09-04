import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

export const THEME_COLORS = {
    light: {
        primary: '#ff4757',
        secondary: '#ff6b81',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#333333',
        textSecondary: '#666666',
        border: '#e0e0e0',
        error: '#f44336',
        success: '#4caf50',
        warning: '#ff9800',
        info: '#2196f3',
    },
    dark: {
        primary: '#ff6b81',
        secondary: '#ff8a9e',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#333333',
        error: '#ff6b6b',
        success: '#6bcf7f',
        warning: '#ffb74d',
        info: '#64b5f6',
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
                return savedTheme;
            }
        } catch (error) {
            console.error('Error reading theme from localStorage:', error);
        }
        return THEMES.SYSTEM;
    });

    const [resolvedTheme, setResolvedTheme] = useState(THEMES.LIGHT);
    const [isLoading, setIsLoading] = useState(true);
    const [transitioning, setTransitioning] = useState(false);

    const getSystemTheme = useCallback(() => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? THEMES.DARK
            : THEMES.LIGHT;
    }, []);

    const applyTheme = useCallback(async (themeToApply) => {
        let actualTheme = themeToApply;

        if (themeToApply === THEMES.SYSTEM) {
            actualTheme = getSystemTheme();
        }

        setTransitioning(true);

        if (actualTheme === THEMES.DARK) {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
            document.documentElement.style.colorScheme = 'dark';

            const darkColors = THEME_COLORS.dark;
            Object.entries(darkColors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(`--color-${key}`, value);
            });
        } else {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
            document.documentElement.style.colorScheme = 'light';

            const lightColors = THEME_COLORS.light;
            Object.entries(lightColors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(`--color-${key}`, value);
            });
        }

        setResolvedTheme(actualTheme);

        setTimeout(() => setTransitioning(false), 300);
    }, [getSystemTheme]);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = localStorage.getItem('theme');
                let initialTheme = THEMES.SYSTEM;

                if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
                    initialTheme = savedTheme;
                }

                setTheme(initialTheme);
                await applyTheme(initialTheme);
            } catch (error) {
                console.error('Error loading theme:', error);
                await applyTheme(THEMES.SYSTEM);
            } finally {
                setIsLoading(false);
            }
        };

        loadTheme();
    }, [applyTheme]);

    useEffect(() => {
        if (theme !== THEMES.SYSTEM) return;

        let mediaQuery;
        let handleChange;

        try {
            mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            handleChange = () => {
                applyTheme(THEMES.SYSTEM);
            };

            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            } else {
                mediaQuery.addListener(handleChange);
            }

            return () => {
                if (mediaQuery.removeEventListener) {
                    mediaQuery.removeEventListener('change', handleChange);
                } else {
                    mediaQuery.removeListener(handleChange);
                }
            };
        } catch (error) {
            console.error('Error setting up system theme listener:', error);
        }
    }, [theme, applyTheme]);

    const saveTheme = useCallback(async (newTheme) => {
        if (!Object.values(THEMES).includes(newTheme)) {
            console.error('Invalid theme:', newTheme);
            return;
        }

        try {
            localStorage.setItem('theme', newTheme);
            setTheme(newTheme);
            await applyTheme(newTheme);

            window.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: newTheme, resolved: resolvedTheme }
            }));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }, [applyTheme, resolvedTheme]);

    const toggleTheme = useCallback(() => {
        const newTheme = resolvedTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        saveTheme(newTheme);
    }, [resolvedTheme, saveTheme]);

    const setLightTheme = useCallback(() => saveTheme(THEMES.LIGHT), [saveTheme]);
    const setDarkTheme = useCallback(() => saveTheme(THEMES.DARK), [saveTheme]);
    const setSystemTheme = useCallback(() => saveTheme(THEMES.SYSTEM), [saveTheme]);

    const isDarkMode = useCallback(() => resolvedTheme === THEMES.DARK, [resolvedTheme]);
    const isLightMode = useCallback(() => resolvedTheme === THEMES.LIGHT, [resolvedTheme]);
    const isSystemMode = useCallback(() => theme === THEMES.SYSTEM, [theme]);

    const getCurrentColors = useCallback(() => {
        return resolvedTheme === THEMES.DARK ? THEME_COLORS.dark : THEME_COLORS.light;
    }, [resolvedTheme]);

    const getCSSVariables = useCallback(() => {
        const colors = getCurrentColors();
        return Object.entries(colors).reduce((acc, [key, value]) => {
            acc[`--color-${key}`] = value;
            return acc;
        }, {});
    }, [getCurrentColors]);

    const value = useMemo(() => ({
        theme,
        resolvedTheme,
        isLoading,
        transitioning,
        colors: getCurrentColors(),
        themeColors: THEME_COLORS,
        setTheme: saveTheme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setSystemTheme,
        isDarkMode,
        isLightMode,
        isSystemMode,
        getCurrentColors,
        getCSSVariables,
        THEMES,
    }), [
        theme,
        resolvedTheme,
        isLoading,
        transitioning,
        getCurrentColors,
        getCSSVariables,
        saveTheme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setSystemTheme,
        isDarkMode,
        isLightMode,
        isSystemMode
    ]);

    useEffect(() => {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content',
                resolvedTheme === THEMES.DARK ? '#121212' : '#ffffff'
            );
        }
    }, [resolvedTheme]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: resolvedTheme === THEMES.DARK ? '#121212' : '#ffffff'
            }}>
                <div className="theme-loading-spinner"></div>
            </div>
        );
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;