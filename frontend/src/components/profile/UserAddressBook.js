// src/components/profile/UserAddressBook.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './UserAddressBook.css';

const UserAddressBook = ({
    onAddressSelect,
    selectable = false,
    maxAddresses = 10,
    showMap = true,
    enableGeolocation = true,
    enableAddressValidation = true,
    enableRecentAddresses = true,
    variant = 'grid' // 'grid', 'list', 'compact'
}) => {
    const [addresses, setAddresses] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [recentAddresses, setRecentAddresses] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        label: 'home',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
        phone: '',
        name: '',
        landmark: '',
        latitude: null,
        longitude: null,
        delivery_instructions: ''
    });

    // Address type options
    const addressTypes = [
        { value: 'home', label: 'Home', icon: '🏠', color: '#4caf50' },
        { value: 'work', label: 'Work', icon: '💼', color: '#2196f3' },
        { value: 'office', label: 'Office', icon: '🏢', color: '#9c27b0' },
        { value: 'other', label: 'Other', icon: '📍', color: '#ff9800' }
    ];

    // Fetch addresses
    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('/api/users/addresses', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const addressesData = response.data.data || response.data.addresses || [];
            setAddresses(addressesData);

            // Auto-select first address if in selectable mode
            if (selectable && addressesData.length > 0 && !selectedAddressId) {
                const defaultAddr = addressesData.find(addr => addr.is_default);
                setSelectedAddressId(defaultAddr?.address_id || addressesData[0].address_id);
                if (onAddressSelect) {
                    onAddressSelect(defaultAddr || addressesData[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            // Mock data for demo
            const mockAddresses = getMockAddresses();
            setAddresses(mockAddresses);
            toast.error('Using demo data. Please connect to backend.', { duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [selectable, selectedAddressId, onAddressSelect]);

    // Load recent addresses from localStorage
    useEffect(() => {
        if (enableRecentAddresses) {
            const saved = localStorage.getItem('recentAddresses');
            if (saved) {
                setRecentAddresses(JSON.parse(saved).slice(0, 5));
            }
        }
    }, [enableRecentAddresses]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // Filter addresses
    const filteredAddresses = useMemo(() => {
        let filtered = [...addresses];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(addr =>
                addr.address_line1.toLowerCase().includes(term) ||
                addr.city.toLowerCase().includes(term) ||
                addr.state.toLowerCase().includes(term) ||
                (addr.name && addr.name.toLowerCase().includes(term))
            );
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(addr => addr.label === filterType);
        }

        return filtered;
    }, [addresses, searchTerm, filterType]);

    const getMockAddresses = () => [
        {
            address_id: 1,
            label: 'home',
            address_line1: '123 Main Street',
            address_line2: 'Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            is_default: true,
            name: 'John Doe',
            phone: '+91 98765 43210',
            landmark: 'Near City Mall',
            delivery_instructions: 'Ring the doorbell twice',
            created_at: '2024-01-15T10:30:00Z'
        },
        {
            address_id: 2,
            label: 'work',
            address_line1: 'Tech Park, 5th Floor',
            address_line2: 'Sector 62',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301',
            is_default: false,
            name: 'John Doe',
            phone: '+91 98765 43210',
            landmark: 'Near Metro Station',
            delivery_instructions: 'Leave at reception',
            created_at: '2024-02-20T14:15:00Z'
        }
    ];

    const validateForm = () => {
        const errors = {};

        if (!formData.address_line1.trim()) {
            errors.address_line1 = 'Address line 1 is required';
        }
        if (!formData.city.trim()) {
            errors.city = 'City is required';
        }
        if (!formData.state.trim()) {
            errors.state = 'State is required';
        }
        if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
            errors.pincode = 'Please enter a valid 6-digit pincode';
        }
        if (selectable && !formData.name.trim()) {
            errors.name = 'Name is required';
        }
        if (selectable && !formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        }
        if (selectable && formData.phone && !/^[0-9+\-\s]{10,15}$/.test(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const submitData = {
                ...formData,
                pincode: formData.pincode.toString()
            };

            if (editingAddress) {
                await axios.put(`/api/users/addresses/${editingAddress.address_id}`, submitData, config);
                toast.success('Address updated successfully');
            } else {
                await axios.post('/api/users/addresses', submitData, config);
                toast.success('Address added successfully');
            }

            await fetchAddresses();
            resetForm();
        } catch (error) {
            console.error('Error saving address:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to save address';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!addressToDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/addresses/${addressToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Address deleted successfully');

            if (selectedAddressId === addressToDelete) {
                setSelectedAddressId(null);
                if (onAddressSelect) onAddressSelect(null);
            }

            await fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error(error.response?.data?.message || 'Failed to delete address');
        } finally {
            setShowDeleteConfirm(false);
            setAddressToDelete(null);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/users/addresses/${addressId}/default`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Default address updated');
            await fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error(error.response?.data?.message || 'Failed to set default address');
        }
    };

    const handleGetCurrentLocation = () => {
        if (!enableGeolocation) return;

        setIsGettingLocation(true);

        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            setIsGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({ ...prev, latitude, longitude }));

                    // Reverse geocoding to get address
                    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    if (response.data) {
                        const address = response.data.address;
                        setFormData(prev => ({
                            ...prev,
                            address_line1: address.road || address.pedestrian || '',
                            city: address.city || address.town || address.village || '',
                            state: address.state || '',
                            pincode: address.postcode || ''
                        }));
                    }

                    toast.success('Location detected successfully');
                } catch (error) {
                    console.error('Error getting address from coordinates:', error);
                    toast.error('Could not get address from location');
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Please allow location access to use this feature';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                toast.error(errorMessage);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleAddressSuggestion = async (value) => {
        if (!enableAddressValidation || value.length < 3) {
            setShowSuggestions(false);
            return;
        }

        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
            setAddressSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const selectAddressSuggestion = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            address_line1: suggestion.display_name.split(',')[0],
            city: suggestion.address?.city || suggestion.address?.town || '',
            state: suggestion.address?.state || '',
            pincode: suggestion.address?.postcode || '',
            latitude: suggestion.lat,
            longitude: suggestion.lon
        }));
        setShowSuggestions(false);
        setSearchTerm('');
    };

    const resetForm = () => {
        setShowAddForm(false);
        setEditingAddress(null);
        setFormData({
            label: 'home',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            pincode: '',
            is_default: false,
            phone: '',
            name: '',
            landmark: '',
            latitude: null,
            longitude: null,
            delivery_instructions: ''
        });
        setFormErrors({});
        setShowSuggestions(false);
    };

    const editAddress = (address) => {
        setEditingAddress(address);
        setFormData({
            label: address.label || 'home',
            address_line1: address.address_line1 || '',
            address_line2: address.address_line2 || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            is_default: address.is_default || false,
            phone: address.phone || '',
            name: address.name || '',
            landmark: address.landmark || '',
            latitude: address.latitude || null,
            longitude: address.longitude || null,
            delivery_instructions: address.delivery_instructions || ''
        });
        setShowAddForm(true);
        setFormErrors({});
    };

    const handleAddressSelect = (address) => {
        setSelectedAddressId(address.address_id);
        if (onAddressSelect) {
            onAddressSelect(address);
        }

        // Save to recent addresses
        if (enableRecentAddresses) {
            const recent = [address, ...recentAddresses.filter(a => a.address_id !== address.address_id)].slice(0, 5);
            setRecentAddresses(recent);
            localStorage.setItem('recentAddresses', JSON.stringify(recent));
        }
    };

    const getAddressLabelConfig = (label) => {
        return addressTypes.find(type => type.value === label) || addressTypes[3];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="address-book-loading">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading your addresses...</p>
            </div>
        );
    }

    return (
        <div className={`user-address-book ${variant}`}>
            {/* Header Section */}
            <div className="address-book-header">
                <div className="header-left">
                    <h2 className="header-title">
                        <span className="title-icon">📍</span>
                        Address Book
                    </h2>
                    <p className="header-subtitle">Manage your delivery addresses</p>
                </div>
                <div className="header-actions">
                    {addresses.length < maxAddresses && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="add-address-btn"
                        >
                            <span className="btn-icon">+</span>
                            <span>Add New Address</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="address-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search addresses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            ✕
                        </button>
                    )}
                </div>

                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                    >
                        All
                    </button>
                    {addressTypes.map(type => (
                        <button
                            key={type.value}
                            className={`filter-btn ${filterType === type.value ? 'active' : ''}`}
                            onClick={() => setFilterType(type.value)}
                        >
                            <span className="filter-icon">{type.icon}</span>
                            <span>{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Address Count Info */}
            <div className="address-info-bar">
                <span className="address-count">
                    {filteredAddresses.length} of {addresses.length} addresses
                </span>
                {addresses.length >= maxAddresses && (
                    <span className="address-limit-warning">
                        ⚠️ Maximum {maxAddresses} addresses reached
                    </span>
                )}
            </div>

            {/* Addresses Grid/List */}
            {filteredAddresses.length === 0 ? (
                <div className="no-addresses">
                    <div className="empty-state">
                        <div className="empty-state-icon">📍</div>
                        <h3>No Addresses Found</h3>
                        <p>
                            {searchTerm
                                ? `No addresses matching "${searchTerm}"`
                                : 'Add your first address to make checkout faster and easier'}
                        </p>
                        {!searchTerm && (
                            <button onClick={() => setShowAddForm(true)} className="add-first-btn">
                                + Add Your First Address
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className={`addresses-container ${variant === 'list' ? 'list-view' : 'grid-view'}`}>
                    {filteredAddresses.map(address => {
                        const labelConfig = getAddressLabelConfig(address.label);
                        const isSelected = selectable && selectedAddressId === address.address_id;

                        return (
                            <div
                                key={address.address_id}
                                className={`address-card ${address.is_default ? 'default' : ''} ${isSelected ? 'selected' : ''}`}
                                onClick={() => selectable && handleAddressSelect(address)}
                            >
                                {/* Card Header */}
                                <div className="card-header">
                                    <div className="address-label" style={{ background: `${labelConfig.color}15`, color: labelConfig.color }}>
                                        <span className="label-icon">{labelConfig.icon}</span>
                                        <span className="label-name">{labelConfig.label}</span>
                                    </div>
                                    <div className="card-badges">
                                        {address.is_default && (
                                            <span className="default-badge">✓ Default</span>
                                        )}
                                        {isSelected && (
                                            <span className="selected-badge">✓ Selected</span>
                                        )}
                                    </div>
                                </div>

                                {/* Address Details */}
                                <div className="address-details">
                                    {address.name && (
                                        <div className="detail-row">
                                            <span className="detail-icon">👤</span>
                                            <span className="detail-text">{address.name}</span>
                                        </div>
                                    )}
                                    <div className="detail-row">
                                        <span className="detail-icon">🏠</span>
                                        <span className="detail-text">{address.address_line1}</span>
                                    </div>
                                    {address.address_line2 && (
                                        <div className="detail-row">
                                            <span className="detail-icon">📍</span>
                                            <span className="detail-text">{address.address_line2}</span>
                                        </div>
                                    )}
                                    {address.landmark && (
                                        <div className="detail-row">
                                            <span className="detail-icon">🏛️</span>
                                            <span className="detail-text">{address.landmark}</span>
                                        </div>
                                    )}
                                    <div className="detail-row">
                                        <span className="detail-icon">🌆</span>
                                        <span className="detail-text">{address.city}, {address.state} - {address.pincode}</span>
                                    </div>
                                    {address.phone && (
                                        <div className="detail-row">
                                            <span className="detail-icon">📞</span>
                                            <span className="detail-text">{address.phone}</span>
                                        </div>
                                    )}
                                    {address.delivery_instructions && (
                                        <div className="detail-row instructions">
                                            <span className="detail-icon">📝</span>
                                            <span className="detail-text">{address.delivery_instructions}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="card-footer">
                                    <div className="address-meta">
                                        <span className="meta-item">
                                            <span className="meta-icon">🕐</span>
                                            <span>Added {formatDate(address.created_at)}</span>
                                        </span>
                                    </div>

                                    {!selectable && (
                                        <div className="address-actions">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    editAddress(address);
                                                }}
                                                className="action-btn edit-btn"
                                                title="Edit Address"
                                            >
                                                ✏️ Edit
                                            </button>
                                            {!address.is_default && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSetDefault(address.address_id);
                                                    }}
                                                    className="action-btn default-btn"
                                                    title="Set as Default"
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAddressToDelete(address.address_id);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="action-btn delete-btn"
                                                title="Delete Address"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Recent Addresses */}
            {enableRecentAddresses && recentAddresses.length > 0 && !selectable && (
                <div className="recent-addresses">
                    <div className="recent-header">
                        <span className="recent-icon">🕒</span>
                        <h4>Recently Used</h4>
                    </div>
                    <div className="recent-list">
                        {recentAddresses.map(addr => (
                            <button
                                key={addr.address_id}
                                className="recent-item"
                                onClick={() => handleAddressSelect(addr)}
                            >
                                <span className="recent-address">{addr.address_line1.split(',')[0]}</span>
                                <span className="recent-label">{addr.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit Address Modal */}
            {(showAddForm || editingAddress) && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content address-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <span className="modal-icon">{editingAddress ? '✏️' : '➕'}</span>
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <button className="close-modal" onClick={resetForm}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="address-form">
                            {/* Address Type Selection */}
                            <div className="form-group">
                                <label>Address Type *</label>
                                <div className="address-type-buttons">
                                    {addressTypes.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            className={`type-btn ${formData.label === type.value ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, label: type.value })}
                                            style={{
                                                borderColor: formData.label === type.value ? type.color : '#e0e0e0',
                                                background: formData.label === type.value ? `${type.color}10` : 'transparent'
                                            }}
                                        >
                                            <span>{type.icon}</span>
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recipient Information */}
                            {selectable && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter full name"
                                            className={formErrors.name ? 'error' : ''}
                                        />
                                        {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                            className={formErrors.phone ? 'error' : ''}
                                        />
                                        {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Address Line 1 with Suggestions */}
                            <div className="form-group">
                                <label>Address Line 1 *</label>
                                <div className="address-input-wrapper">
                                    <input
                                        type="text"
                                        value={formData.address_line1}
                                        onChange={(e) => {
                                            setFormData({ ...formData, address_line1: e.target.value });
                                            handleAddressSuggestion(e.target.value);
                                        }}
                                        placeholder="House number, street name"
                                        className={formErrors.address_line1 ? 'error' : ''}
                                        autoComplete="off"
                                    />
                                    {showSuggestions && addressSuggestions.length > 0 && (
                                        <div className="address-suggestions">
                                            {addressSuggestions.map((sug, idx) => (
                                                <div
                                                    key={idx}
                                                    className="suggestion-item"
                                                    onClick={() => selectAddressSuggestion(sug)}
                                                >
                                                    <span className="suggestion-icon">📍</span>
                                                    <span className="suggestion-text">{sug.display_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formErrors.address_line1 && <span className="error-message">{formErrors.address_line1}</span>}
                            </div>

                            <div className="form-group">
                                <label>Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.address_line2}
                                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                    placeholder="Apartment, suite, unit, etc."
                                />
                            </div>

                            <div className="form-group">
                                <label>Landmark (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.landmark}
                                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                    placeholder="Nearby landmark"
                                />
                            </div>

                            <div className="form-row three-col">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className={formErrors.city ? 'error' : ''}
                                    />
                                    {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                                </div>

                                <div className="form-group">
                                    <label>State *</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className={formErrors.state ? 'error' : ''}
                                    />
                                    {formErrors.state && <span className="error-message">{formErrors.state}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Pincode *</label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        placeholder="6-digit pincode"
                                        maxLength={6}
                                        className={formErrors.pincode ? 'error' : ''}
                                    />
                                    {formErrors.pincode && <span className="error-message">{formErrors.pincode}</span>}
                                </div>
                            </div>

                            {/* Delivery Instructions */}
                            <div className="form-group">
                                <label>Delivery Instructions (Optional)</label>
                                <textarea
                                    value={formData.delivery_instructions}
                                    onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                                    placeholder="E.g., Gate code, floor number, etc."
                                    rows="2"
                                />
                            </div>

                            {/* Location Detection */}
                            {enableGeolocation && (
                                <div className="form-group">
                                    <button
                                        type="button"
                                        onClick={handleGetCurrentLocation}
                                        className="location-btn"
                                        disabled={isGettingLocation}
                                    >
                                        <span className="location-icon">📍</span>
                                        <span>{isGettingLocation ? 'Detecting location...' : 'Use Current Location'}</span>
                                    </button>
                                </div>
                            )}

                            {/* Default Address Checkbox */}
                            <div className="form-group checkbox">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_default}
                                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span>Set as default address</span>
                                </label>
                            </div>

                            {/* Form Actions */}
                            <div className="modal-actions">
                                <button type="button" onClick={resetForm} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="save-btn">
                                    {submitting ? (
                                        <span className="btn-spinner"></span>
                                    ) : (
                                        editingAddress ? 'Update Address' : 'Add Address'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Address</h3>
                        </div>
                        <div className="modal-body">
                            <div className="warning-icon">⚠️</div>
                            <p>Are you sure you want to delete this address?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="delete-confirm-btn">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAddressBook;