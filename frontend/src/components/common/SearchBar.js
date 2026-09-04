// frontend/src/components/common/SearchBar.js (Fixed Version)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SearchBar.css';

const SearchBar = ({
    placeholder = 'Search...',
    onSearch,
    onSuggestionClick,
    suggestions = [],
    isLoading = false,
    debounceDelay = 300,
    minChars = 2,
    maxSuggestions = 5,
    showSuggestions = true,
    clearOnSearch = false,
    autoFocus = false, // Keep prop but handle differently
    size = 'medium',
    variant = 'default',
    className = '',
    initialValue = '',
    recentSearches = [],
    onRecentSearchClick,
    onClearRecentSearches,
    historyEnabled = true,
    maxHistoryItems = 10,
    showVoiceSearch = false,
    onVoiceSearchResult,
    showFilter = false,
    filters = [],
    onFilterChange,
    selectedFilter = null,
    showAdvanced = false,
    advancedOptions = {},
    onAdvancedSearch,
    loadingText = 'Searching...',
    noResultsText = 'No results found',
    clearButtonAriaLabel = 'Clear search',
    searchButtonAriaLabel = 'Search',
    voiceSearchAriaLabel = 'Voice search'
}) => {
    const [query, setQuery] = useState(initialValue);
    const [isOpen, setIsOpen] = useState(false);
    const [showRecent, setShowRecent] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [advancedValues, setAdvancedValues] = useState(advancedOptions);
    const [filterValue, setFilterValue] = useState(selectedFilter);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const containerRef = useRef(null);
    const hasAutoFocused = useRef(false);

    // Handle autoFocus with a useEffect instead of autoFocus prop
    useEffect(() => {
        if (autoFocus && inputRef.current && !hasAutoFocused.current) {
            // Small delay to ensure the input is ready
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                hasAutoFocused.current = true;
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [autoFocus]);

    // Save search to history
    const saveToHistory = useCallback((searchTerm) => {
        if (!historyEnabled || !searchTerm.trim()) return;

        const savedHistory = localStorage.getItem('searchHistory');
        let history = savedHistory ? JSON.parse(savedHistory) : [];

        history = [searchTerm, ...history.filter(item => item !== searchTerm)];
        history = history.slice(0, maxHistoryItems);

        localStorage.setItem('searchHistory', JSON.stringify(history));
    }, [historyEnabled, maxHistoryItems]);

    // Load search history
    useEffect(() => {
        if (historyEnabled && recentSearches.length === 0) {
            const savedHistory = localStorage.getItem('searchHistory');
            if (savedHistory) {
                const history = JSON.parse(savedHistory);
                onClearRecentSearches?.();
                history.forEach(item => onRecentSearchClick?.(item));
            }
        }
    }, [historyEnabled]);

    useEffect(() => {
        setQuery(initialValue);
    }, [initialValue]);

    // Debounced search
    useEffect(() => {
        if (!query || query.length < minChars) {
            if (query === '' && historyEnabled) {
                setShowRecent(true);
                setIsOpen(true);
            }
            return;
        }

        setShowRecent(false);
        const timer = setTimeout(() => {
            onSearch?.(query, { filter: filterValue, advanced: advancedValues });
        }, debounceDelay);

        return () => clearTimeout(timer);
    }, [query, minChars, debounceDelay, onSearch, filterValue, advancedValues]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                !inputRef.current.contains(event.target) &&
                !event.target.closest('.search-filter-dropdown')
            ) {
                setIsOpen(false);
                setShowRecent(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut for focusing (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(-1);

        if (value.length >= minChars) {
            setIsOpen(true);
            setShowRecent(false);
        } else if (value === '' && historyEnabled) {
            setShowRecent(true);
            setIsOpen(true);
        }
    };

    const handleSearch = () => {
        if (query.trim()) {
            saveToHistory(query);
            onSearch?.(query, { filter: filterValue, advanced: advancedValues });
            if (clearOnSearch) {
                setQuery('');
            }
            setIsOpen(false);
            setShowRecent(false);
        }
    };

    const handleKeyDown = (e) => {
        const items = showRecent ? recentSearches : suggestions;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < items.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    if (showRecent) {
                        handleRecentClick(items[selectedIndex]);
                    } else {
                        handleSuggestionClick(items[selectedIndex]);
                    }
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setShowRecent(false);
                inputRef.current?.blur();
                break;
            case '/':
                if (!isFocused) {
                    e.preventDefault();
                    inputRef.current?.focus();
                }
                break;
            default:
                break;
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const value = suggestion.name || suggestion;
        setQuery(value);
        saveToHistory(value);
        onSuggestionClick?.(suggestion);
        setIsOpen(false);
        setShowRecent(false);
        onSearch?.(value, { filter: filterValue, advanced: advancedValues });
    };

    const handleRecentClick = (search) => {
        setQuery(search);
        saveToHistory(search);
        onRecentSearchClick?.(search);
        setIsOpen(false);
        setShowRecent(false);
        onSearch?.(search, { filter: filterValue, advanced: advancedValues });
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
        onSearch?.('', { filter: filterValue, advanced: advancedValues });
    };

    const handleVoiceSearchResult = (transcript) => {
        setQuery(transcript);
        onVoiceSearchResult?.(transcript);
        handleSearch();
    };

    const handleFilterChange = (filter) => {
        setFilterValue(filter);
        onFilterChange?.(filter);
        if (query.length >= minChars) {
            onSearch?.(query, { filter, advanced: advancedValues });
        }
    };

    const handleAdvancedChange = (key, value) => {
        const newValues = { ...advancedValues, [key]: value };
        setAdvancedValues(newValues);
        if (showAdvancedOptions && onAdvancedSearch) {
            onAdvancedSearch(newValues);
        }
    };

    const highlightMatch = (text) => {
        if (!query || query.length < 2) return text;

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i} className="highlight">{part}</mark> : part
        );
    };

    const showSuggestionsList = (isOpen && (suggestions.length > 0 || (showRecent && recentSearches.length > 0))) ||
        (isOpen && isLoading);

    return (
        <div
            ref={containerRef}
            className={`search-bar search-bar-${size} search-bar-${variant} ${isFocused ? 'focused' : ''} ${className}`}
        >
            <div className="search-bar-container">
                <span className="search-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </span>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setIsFocused(true);
                        if (!query && historyEnabled && recentSearches.length > 0) {
                            setShowRecent(true);
                            setIsOpen(true);
                        } else if (query && query.length >= minChars) {
                            setIsOpen(true);
                        }
                    }}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    // Remove autoFocus prop - handled in useEffect
                    className="search-input"
                    aria-label={placeholder}
                />

                {/* Keyboard shortcut hint */}
                {!isFocused && !query && (
                    <div className="keyboard-hint">
                        <kbd>⌘</kbd> + <kbd>K</kbd>
                    </div>
                )}

                {isLoading && (
                    <div className="search-loading-indicator">
                        <div className="loading-spinner"></div>
                    </div>
                )}

                {query && !isLoading && (
                    <button
                        className="clear-btn"
                        onClick={handleClear}
                        aria-label={clearButtonAriaLabel}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}

                {showVoiceSearch && (
                    <VoiceSearch
                        onResult={handleVoiceSearchResult}
                        onError={(error) => console.error('Voice search error:', error)}
                        ariaLabel={voiceSearchAriaLabel}
                    />
                )}

                {showFilter && filters.length > 0 && (
                    <div className="search-filter-dropdown">
                        <button
                            className="filter-btn"
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                            aria-label="Filter options"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
                            </svg>
                            {filterValue && <span className="filter-badge" />}
                        </button>
                        {showAdvancedOptions && (
                            <div className="filter-menu">
                                {filters.map(filter => (
                                    <button
                                        key={filter.value}
                                        className={`filter-option ${filterValue === filter.value ? 'active' : ''}`}
                                        onClick={() => handleFilterChange(filter.value)}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button
                    className="search-btn"
                    onClick={handleSearch}
                    disabled={isLoading}
                    aria-label={searchButtonAriaLabel}
                >
                    {isLoading ? (
                        <div className="btn-loader"></div>
                    ) : (
                        <span>Search</span>
                    )}
                </button>
            </div>

            {showSuggestionsList && (
                <div ref={suggestionsRef} className="search-suggestions">
                    {showRecent && recentSearches.length > 0 && (
                        <div className="recent-searches">
                            <div className="recent-header">
                                <span className="recent-title">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Recent Searches
                                </span>
                                {onClearRecentSearches && (
                                    <button className="clear-recent" onClick={onClearRecentSearches}>
                                        Clear All
                                    </button>
                                )}
                            </div>
                            {recentSearches.slice(0, maxSuggestions).map((search, index) => (
                                <div
                                    key={index}
                                    className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                                    onClick={() => handleRecentClick(search)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <span className="recent-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </span>
                                    <span className="suggestion-text">{highlightMatch(search)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showRecent && suggestions.length > 0 && (
                        <div className="search-suggestions-list">
                            {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <span className="suggestion-icon">
                                        {suggestion.icon || (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="M21 21l-4.35-4.35" />
                                            </svg>
                                        )}
                                    </span>
                                    <div className="suggestion-content">
                                        <span className="suggestion-name">
                                            {highlightMatch(suggestion.name || suggestion)}
                                        </span>
                                        {suggestion.description && (
                                            <span className="suggestion-description">{suggestion.description}</span>
                                        )}
                                        {suggestion.category && (
                                            <span className="suggestion-category">{suggestion.category}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showRecent && suggestions.length === 0 && query.length >= minChars && !isLoading && (
                        <div className="no-results">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            <p>{noResultsText}</p>
                            <span className="no-results-hint">Try different keywords or check spelling</span>
                        </div>
                    )}

                    {isLoading && (
                        <div className="suggestions-loading">
                            <div className="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span>{loadingText}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Advanced Search Options */}
            {showAdvanced && Object.keys(advancedOptions).length > 0 && (
                <div className={`advanced-search ${showAdvancedOptions ? 'expanded' : ''}`}>
                    <button
                        className="advanced-toggle"
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
                        </svg>
                        Advanced Search
                        <span className={`toggle-arrow ${showAdvancedOptions ? 'open' : ''}`}>▼</span>
                    </button>

                    {showAdvancedOptions && (
                        <div className="advanced-options">
                            {Object.entries(advancedOptions).map(([key, config]) => (
                                <div key={key} className="advanced-option">
                                    <label>{config.label}</label>
                                    {config.type === 'select' ? (
                                        <select
                                            value={advancedValues[key]}
                                            onChange={(e) => handleAdvancedChange(key, e.target.value)}
                                        >
                                            <option value="">All</option>
                                            {config.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : config.type === 'range' ? (
                                        <div className="range-input">
                                            <input
                                                type="range"
                                                min={config.min}
                                                max={config.max}
                                                value={advancedValues[key] || config.min}
                                                onChange={(e) => handleAdvancedChange(key, parseInt(e.target.value))}
                                            />
                                            <span className="range-value">{advancedValues[key] || config.min}</span>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder={config.placeholder}
                                            value={advancedValues[key] || ''}
                                            onChange={(e) => handleAdvancedChange(key, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                            <button
                                className="apply-advanced-btn"
                                onClick={() => onAdvancedSearch?.(advancedValues)}
                            >
                                Apply Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add CSS for keyboard hint */}
            <style jsx>{`
                .keyboard-hint {
                    position: absolute;
                    right: 80px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 11px;
                    color: #999;
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                }
                
                .dark-mode .keyboard-hint {
                    background: #333;
                    color: #666;
                }
                
                kbd {
                    font-family: monospace;
                    font-size: 10px;
                }
            `}</style>
        </div>
    );
};

// Voice Search Component (Enhanced)
export const VoiceSearch = ({ onResult, onError, ariaLabel = 'Voice search' }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onstart = () => {
                setIsListening(true);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
                if (audioContextRef.current) {
                    audioContextRef.current.close();
                }
            };

            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (event.results[0].isFinal) {
                    onResult?.(transcript);
                }
            };

            recognitionInstance.onerror = (event) => {
                onError?.(event.error);
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, [onResult, onError]);

    const startListening = async () => {
        if (recognition) {
            try {
                // Request microphone permission
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                // Create audio context for visualizer
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContextRef.current.createMediaStreamSource(stream);
                const analyser = audioContextRef.current.createAnalyser();
                source.connect(analyser);

                // Update volume meter
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const updateVolume = () => {
                    if (isListening) {
                        analyser.getByteFrequencyData(dataArray);
                        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                        setVolume(average / 255);
                        requestAnimationFrame(updateVolume);
                    }
                };
                updateVolume();

                recognition.start();
            } catch (error) {
                onError?.(error.message);
            }
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

    if (!recognition) return null;

    return (
        <button
            className={`voice-search-btn ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            title="Voice Search"
            aria-label={ariaLabel}
        >
            {isListening ? (
                <>
                    <div className="voice-wave">
                        <div className="wave-bar" style={{ height: `${10 + volume * 30}px` }}></div>
                        <div className="wave-bar" style={{ height: `${15 + volume * 40}px` }}></div>
                        <div className="wave-bar" style={{ height: `${20 + volume * 50}px` }}></div>
                        <div className="wave-bar" style={{ height: `${15 + volume * 40}px` }}></div>
                        <div className="wave-bar" style={{ height: `${10 + volume * 30}px` }}></div>
                    </div>
                    <span className="listening-text">Listening...</span>
                </>
            ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            )}
        </button>
    );
};

export default SearchBar;