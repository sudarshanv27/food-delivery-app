// src/components/profile/UserAddressBook.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationDialog from '../common/ConfirmationDialog';
import './UserAddressBook.css';

const UserAddressBook = () => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [formData, setFormData] = useState({
        type: 'home',
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        phone: '',
        isDefault: false,
        landmark: '',
        addressLine2: '',
        latitude: null,
        longitude: null,
        instructions: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockAddresses = [
                {
                    id: 1,
                    type: 'home',
                    name: 'Home',
                    street: '123 Main Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400001',
                    country: 'India',
                    phone: '9876543210',
                    isDefault: true,
                    landmark: 'Near Central Park',
                    addressLine2: 'Apt 4B',
                    instructions: 'Ring the doorbell twice',
                    createdAt: '2024-01-15T10:00:00',
                    updatedAt: '2024-01-15T10:00:00'
                },
                {
                    id: 2,
                    type: 'work',
                    name: 'Office',
                    street: '456 Business Park',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400002',
                    country: 'India',
                    phone: '9876543211',
                    isDefault: false,
                    landmark: 'Near Times Square',
                    addressLine2: 'Floor 5, Building B',
                    instructions: 'Call on arrival',
                    createdAt: '2024-01-20T14:30:00',
                    updatedAt: '2024-01-20T14:30:00'
                },
                {
                    id: 3,
                    type: 'other',
                    name: 'Gym',
                    street: '789 Fitness Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400003',
                    country: 'India',
                    phone: '9876543212',
                    isDefault: false,
                    landmark: 'Near Metro Station',
                    addressLine2: '',
                    instructions: '',
                    createdAt: '2024-02-01T09:15:00',
                    updatedAt: '2024-02-01T09:15:00'
                }
            ];
            setAddresses(mockAddresses);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Address name is required';
        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        else if (!/^\d{6}$/.test(formData.zipCode)) newErrors.zipCode = 'ZIP code must be 6 digits';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newAddress = {
                ...formData,
                id: editingAddress?.id || Date.now(),
                createdAt: editingAddress?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (editingAddress) {
                setAddresses(prev => prev.map(addr =>
                    addr.id === editingAddress.id ? newAddress : addr
                ));
            } else {
                setAddresses(prev => [...prev, newAddress]);
            }

            setShowAddressModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            type: address.type,
            name: address.name,
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
            phone: address.phone,
            isDefault: address.isDefault,
            landmark: address.landmark || '',
            addressLine2: address.addressLine2 || '',
            latitude: address.latitude || null,
            longitude: address.longitude || null,
            instructions: address.instructions || ''
        });
        setShowAddressModal(true);
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setAddresses(prev => prev.filter(addr => addr.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting address:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setAddresses(prev => prev.map(addr => ({
                ...addr,
                isDefault: addr.id === addressId
            })));
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'home',
            name: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            phone: '',
            isDefault: false,
            landmark: '',
            addressLine2: '',
            latitude: null,
            longitude: null,
            instructions: ''
        });
        setEditingAddress(null);
        setErrors({});
    };

    const getAddressTypeIcon = (type) => {
        switch (type) {
            case 'home': return '🏠';
            case 'work': return '💼';
            case 'other': return '📍';
            default: return '🏠';
        }
    };

    const getAddressTypeLabel = (type) => {
        switch (type) {
            case 'home': return 'Home';
            case 'work': return 'Work';
            case 'other': return 'Other';
            default: return type;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredAddresses = useMemo(() => {
        let filtered = [...addresses];

        if (filterType !== 'all') {
            filtered = filtered.filter(addr => addr.type === filterType);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(addr =>
                addr.name.toLowerCase().includes(term) ||
                addr.street.toLowerCase().includes(term) ||
                addr.city.toLowerCase().includes(term) ||
                addr.landmark?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [addresses, filterType, searchTerm]);

    const defaultAddress = addresses.find(addr => addr.isDefault);
    const otherAddresses = filteredAddresses.filter(addr => !addr.isDefault);

    return (
        <div className="address-book">
            <div className="address-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">📍</span>
                        My Addresses
                    </h2>
                    <p className="header-subtitle">Manage your delivery addresses</p>
                </div>
                <Button variant="primary" onClick={() => {
                    resetForm();
                    setShowAddressModal(true);
                }} icon="+">
                    Add New Address
                </Button>
            </div>

            {/* Search and Filter */}
            {addresses.length > 0 && (
                <div className="address-controls">
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
                            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                        )}
                    </div>
                    <div className="filter-buttons">
                        <button className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
                            All
                        </button>
                        <button className={`filter-btn ${filterType === 'home' ? 'active' : ''}`} onClick={() => setFilterType('home')}>
                            🏠 Home
                        </button>
                        <button className={`filter-btn ${filterType === 'work' ? 'active' : ''}`} onClick={() => setFilterType('work')}>
                            💼 Work
                        </button>
                        <button className={`filter-btn ${filterType === 'other' ? 'active' : ''}`} onClick={() => setFilterType('other')}>
                            📍 Other
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && addresses.length === 0 && (
                <div className="loading-state">
                    <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                    </div>
                    <p>Loading addresses...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && addresses.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📍</div>
                    <h3>No Addresses Yet</h3>
                    <p>Add your first address to start ordering food</p>
                    <Button variant="primary" onClick={() => {
                        resetForm();
                        setShowAddressModal(true);
                    }}>
                        Add Your First Address
                    </Button>
                </div>
            )}

            {/* Addresses Display */}
            {addresses.length > 0 && (
                <div className="addresses-container">
                    {/* Default Address Section */}
                    {defaultAddress && (
                        <div className="address-section">
                            <h3 className="section-title">
                                <span className="section-icon">⭐</span>
                                Default Address
                            </h3>
                            <div className="address-card default">
                                <div className="address-card-header">
                                    <div className="address-type">
                                        <span className="type-icon">{getAddressTypeIcon(defaultAddress.type)}</span>
                                        <span className="type-name">{defaultAddress.name}</span>
                                        <span className="default-badge">Default</span>
                                    </div>
                                    <div className="address-actions">
                                        <button className="action-btn edit" onClick={() => handleEdit(defaultAddress)} title="Edit">
                                            ✏️
                                        </button>
                                        <button className="action-btn delete" onClick={() => setDeleteConfirm(defaultAddress)} title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="address-card-body">
                                    <p className="address-line">{defaultAddress.street}</p>
                                    {defaultAddress.addressLine2 && <p className="address-line">{defaultAddress.addressLine2}</p>}
                                    <p className="address-line">{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.zipCode}</p>
                                    <p className="address-line">{defaultAddress.country}</p>
                                    {defaultAddress.landmark && (
                                        <p className="address-line landmark">📍 Landmark: {defaultAddress.landmark}</p>
                                    )}
                                    <p className="address-line phone">📞 {defaultAddress.phone}</p>
                                    {defaultAddress.instructions && (
                                        <p className="address-line instructions">📝 {defaultAddress.instructions}</p>
                                    )}
                                </div>
                                <div className="address-card-footer">
                                    <span className="added-date">Added on {formatDate(defaultAddress.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other Addresses Section */}
                    {otherAddresses.length > 0 && (
                        <div className="address-section">
                            <h3 className="section-title">
                                <span className="section-icon">📦</span>
                                Other Addresses ({otherAddresses.length})
                            </h3>
                            <div className="addresses-grid">
                                {otherAddresses.map((address) => (
                                    <div key={address.id} className="address-card">
                                        <div className="address-card-header">
                                            <div className="address-type">
                                                <span className="type-icon">{getAddressTypeIcon(address.type)}</span>
                                                <span className="type-name">{address.name}</span>
                                            </div>
                                            <div className="address-actions">
                                                <button className="action-btn edit" onClick={() => handleEdit(address)} title="Edit">
                                                    ✏️
                                                </button>
                                                <button className="action-btn delete" onClick={() => setDeleteConfirm(address)} title="Delete">
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <div className="address-card-body">
                                            <p className="address-line">{address.street}</p>
                                            {address.addressLine2 && <p className="address-line">{address.addressLine2}</p>}
                                            <p className="address-line">{address.city}, {address.state} - {address.zipCode}</p>
                                            <p className="address-line">{address.country}</p>
                                            {address.landmark && (
                                                <p className="address-line landmark">📍 {address.landmark}</p>
                                            )}
                                            <p className="address-line phone">📞 {address.phone}</p>
                                        </div>
                                        <div className="address-card-footer">
                                            <button
                                                className="set-default-btn"
                                                onClick={() => handleSetDefault(address.id)}
                                            >
                                                Set as Default
                                            </button>
                                            <span className="added-date">{formatDate(address.createdAt)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Address Modal */}
            <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title={editingAddress ? 'Edit Address' : 'Add New Address'} size="medium">
                <form onSubmit={handleSubmit} className="address-form">
                    <div className="form-group">
                        <label>Address Type</label>
                        <div className="address-type-selector">
                            <label className={`type-option ${formData.type === 'home' ? 'selected' : ''}`}>
                                <input type="radio" name="type" value="home" checked={formData.type === 'home'} onChange={handleChange} />
                                <span className="type-icon">🏠</span>
                                <span>Home</span>
                            </label>
                            <label className={`type-option ${formData.type === 'work' ? 'selected' : ''}`}>
                                <input type="radio" name="type" value="work" checked={formData.type === 'work'} onChange={handleChange} />
                                <span className="type-icon">💼</span>
                                <span>Work</span>
                            </label>
                            <label className={`type-option ${formData.type === 'other' ? 'selected' : ''}`}>
                                <input type="radio" name="type" value="other" checked={formData.type === 'other'} onChange={handleChange} />
                                <span className="type-icon">📍</span>
                                <span>Other</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Home, Office, etc." className={errors.name ? 'error' : ''} />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Street Address *</label>
                        <input type="text" name="street" value={formData.street} onChange={handleChange} placeholder="House number and street name" className={errors.street ? 'error' : ''} />
                        {errors.street && <span className="error-message">{errors.street}</span>}
                    </div>

                    <div className="form-group">
                        <label>Address Line 2 (Optional)</label>
                        <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="Apartment, suite, unit, etc." />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City *</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className={errors.city ? 'error' : ''} />
                            {errors.city && <span className="error-message">{errors.city}</span>}
                        </div>
                        <div className="form-group">
                            <label>State *</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} className={errors.state ? 'error' : ''} />
                            {errors.state && <span className="error-message">{errors.state}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>ZIP Code *</label>
                            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className={errors.zipCode ? 'error' : ''} />
                            {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <select name="country" value={formData.country} onChange={handleChange}>
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" className={errors.phone ? 'error' : ''} />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <label>Landmark (Optional)</label>
                        <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near any landmark" />
                    </div>

                    <div className="form-group">
                        <label>Delivery Instructions (Optional)</label>
                        <textarea name="instructions" value={formData.instructions} onChange={handleChange} placeholder="e.g., Ring the doorbell, leave at reception, etc." rows="2" />
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
                            Set as default address
                        </label>
                    </div>

                    <div className="form-actions">
                        <Button type="submit" variant="primary" isLoading={isLoading}>
                            {editingAddress ? 'Update Address' : 'Save Address'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddressModal(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Delete Address"
                message={`Are you sure you want to delete "${deleteConfirm?.name}" address?`}
                confirmText="Delete"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
};

export default UserAddressBook;