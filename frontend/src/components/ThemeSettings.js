// frontend/src/components/ThemeSettings.jsx
import React from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

const ThemeSettings = () => {
    const { theme, resolvedTheme, setTheme, isDarkMode } = useTheme();
    const { syncThemeAcrossDevices, isConnected } = useSocket();

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);

        // Sync theme across other devices
        if (isConnected) {
            syncThemeAcrossDevices(newTheme);
        }
    };

    const themes = [
        { id: THEMES.LIGHT, name: 'Light', icon: Sun },
        { id: THEMES.DARK, name: 'Dark', icon: Moon },
        { id: THEMES.SYSTEM, name: 'System', icon: Monitor },
    ];

    return (
        <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Theme Preferences
            </h3>

            <div className="space-y-3">
                {themes.map(({ id, name, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => handleThemeChange(id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${theme === id
                                ? isDarkMode
                                    ? 'bg-blue-900/30 border border-blue-500'
                                    : 'bg-blue-50 border border-blue-500'
                                : isDarkMode
                                    ? 'bg-gray-700 hover:bg-gray-600'
                                    : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${theme === id
                                    ? 'text-blue-500'
                                    : isDarkMode
                                        ? 'text-gray-400'
                                        : 'text-gray-600'
                                }`} />
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                {name}
                            </span>
                            {theme === id && (
                                <span className="text-xs text-blue-500">(Active)</span>
                            )}
                        </div>
                        {theme === id && (
                            <Check className="w-5 h-5 text-blue-500" />
                        )}
                    </button>
                ))}
            </div>

            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Current theme:
                    </span>
                    <span className={`font-medium ${resolvedTheme === THEMES.DARK
                            ? 'text-blue-400'
                            : 'text-orange-500'
                        }`}>
                        {resolvedTheme === THEMES.DARK ? 'Dark Mode' : 'Light Mode'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Sync status:
                    </span>
                    <span className={`font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                        {isConnected ? 'Connected' : 'Offline'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;