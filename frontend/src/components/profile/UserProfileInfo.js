// src/components/profile/UserProfileInfo.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './UserProfileInfo.css';

const UserProfileInfo = ({ user, updateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        location: user?.location || '',
        website: user?.website || '',
        avatar: user?.avatar || ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.full_name.trim()) {
            errors.full_name = 'Full name is required';
        } else if (formData.full_name.trim().length < 2) {
            errors.full_name = 'Full name must be at least 2 characters';
        } else if (formData.full_name.trim().length > 100) {
            errors.full_name = 'Full name must be less than 100 characters';
        }

        if (formData.phone && formData.phone.trim()) {
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
                errors.phone = 'Please enter a valid phone number';
            }
        }

        if (formData.website && formData.website.trim()) {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRegex.test(formData.website)) {
                errors.website = 'Please enter a valid URL';
            }
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

        setLoading(true);

        const submitData = new FormData();
        submitData.append('full_name', formData.full_name.trim());
        if (formData.phone) submitData.append('phone', formData.phone.trim());
        if (formData.bio) submitData.append('bio', formData.bio.trim());
        if (formData.location) submitData.append('location', formData.location.trim());
        if (formData.website) submitData.append('website', formData.website.trim());

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.put('/api/users/profile', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            const updatedUser = response.data.data || response.data.user || response.data;

            if (updateUser) {
                updateUser(updatedUser);
            }

            setSuccessMessage('Profile updated successfully!');
            toast.success('Profile updated successfully', {
                icon: '✅',
                duration: 2000
            });

            setIsEditing(false);
        } catch (error) {
            console.error('Profile update error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update profile';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);

        setUploadingAvatar(true);
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/users/upload-avatar', avatarFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            const avatarUrl = response.data.avatarUrl || response.data.url || response.data.data;

            if (updateUser) {
                updateUser({ ...user, avatar: avatarUrl });
            }

            setFormData(prev => ({ ...prev, avatar: avatarUrl }));
            toast.success('Avatar updated successfully', {
                icon: '📸',
                duration: 2000
            });
        } catch (error) {
            console.error('Avatar upload error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to upload avatar';
            toast.error(errorMsg);
            setAvatarPreview(null);
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveAvatar = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete('/api/users/avatar', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (updateUser) {
                updateUser({ ...user, avatar: null });
            }

            setFormData(prev => ({ ...prev, avatar: '' }));
            setAvatarPreview(null);
            toast.success('Avatar removed successfully');
        } catch (error) {
            console.error('Avatar removal error:', error);
            toast.error(error.response?.data?.message || 'Failed to remove avatar');
        }
    };

    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        const avatar = formData.avatar || user?.avatar;
        if (avatar && avatar.startsWith('http')) {
            return avatar;
        }
        if (avatar) {
            return `${process.env.REACT_APP_API_URL || ''}${avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=ff4757&color=fff&length=2&size=128`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return 'Not set';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
        }
        return phone;
    };

    const getInitials = () => {
        const name = user?.full_name || 'User';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!isEditing) {
        return (
            <div className="profile-info-view">
                {successMessage && (
                    <div className="success-toast">{successMessage}</div>
                )}

                <div className="section-header">
                    <div className="header-title">
                        <h2>
                            <span className="header-icon">👤</span>
                            Profile Information
                        </h2>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                        ✏️ Edit Profile
                    </button>
                </div>

                <div className="profile-avatar-display">
                    <div className="avatar-wrapper-large">
                        {getAvatarUrl().includes('ui-avatars') ? (
                            <div className="avatar-initials">{getInitials()}</div>
                        ) : (
                            <img
                                src={getAvatarUrl()}
                                alt={user?.full_name || 'User avatar'}
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=ff4757&color=fff&length=2&size=128`;
                                    e.target.onerror = null;
                                }}
                            />
                        )}
                        {user?.role === 'premium' && (
                            <div className="premium-badge">⭐ Premium</div>
                        )}
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <label>Full Name</label>
                        <p>{user?.full_name || 'Not set'}</p>
                    </div>
                    <div className="info-item">
                        <label>Email Address</label>
                        <p>{user?.email || 'Not set'}</p>
                    </div>
                    <div className="info-item">
                        <label>Phone Number</label>
                        <p>{formatPhoneNumber(user?.phone)}</p>
                    </div>
                    <div className="info-item">
                        <label>Member Since</label>
                        <p>{formatDate(user?.created_at)}</p>
                    </div>
                    {user?.bio && (
                        <div className="info-item full-width">
                            <label>Bio</label>
                            <p>{user.bio}</p>
                        </div>
                    )}
                    {user?.location && (
                        <div className="info-item">
                            <label>Location</label>
                            <p>📍 {user.location}</p>
                        </div>
                    )}
                    {user?.website && (
                        <div className="info-item">
                            <label>Website</label>
                            <p>
                                <a href={user.website} target="_blank" rel="noopener noreferrer">
                                    {user.website}
                                </a>
                            </p>
                        </div>
                    )}
                    {user?.role && (
                        <div className="info-item">
                            <label>Account Type</label>
                            <p className={`role-badge ${user.role}`}>
                                {user?.role?.toUpperCase() || 'CUSTOMER'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Account Stats */}
                <div className="account-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <span className="stat-value">{user?.orders_count || 0}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-info">
                            <span className="stat-value">{user?.reviews_count || 0}</span>
                            <span className="stat-label">Reviews</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">❤️</div>
                        <div className="stat-info">
                            <span className="stat-value">{user?.favorites_count || 0}</span>
                            <span className="stat-label">Favorites</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="profile-info-edit">
            <div className="section-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">✏️</span>
                        Edit Profile
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setIsEditing(false);
                        setFormErrors({});
                        setAvatarPreview(null);
                        setFormData({
                            full_name: user?.full_name || '',
                            phone: user?.phone || '',
                            bio: user?.bio || '',
                            location: user?.location || '',
                            website: user?.website || '',
                            avatar: user?.avatar || ''
                        });
                    }}
                    className="cancel-edit-btn"
                >
                    Cancel
                </button>
            </div>

            {/* Avatar Upload Section */}
            <div className="avatar-upload-section">
                <div className="current-avatar">
                    <div className="avatar-wrapper-large">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" />
                        ) : getAvatarUrl().includes('ui-avatars') ? (
                            <div className="avatar-initials">{getInitials()}</div>
                        ) : (
                            <img
                                src={getAvatarUrl()}
                                alt={user?.full_name || 'User avatar'}
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=ff4757&color=fff&length=2&size=128`;
                                    e.target.onerror = null;
                                }}
                            />
                        )}
                        {uploadingAvatar && (
                            <div className="avatar-overlay">
                                <div className="avatar-loading-spinner"></div>
                                <span>Uploading...</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="avatar-actions">
                    <label className="upload-avatar-btn">
                        📸 {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleAvatarUpload}
                            hidden
                            disabled={uploadingAvatar}
                        />
                    </label>
                    {(formData.avatar || user?.avatar) && !uploadingAvatar && (
                        <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="remove-avatar-btn"
                        >
                            🗑️ Remove
                        </button>
                    )}
                </div>
                <small className="avatar-hint">
                    Recommended: Square image, max 5MB (JPEG, PNG, GIF, WEBP)
                </small>
            </div>

            {/* Form Fields */}
            <div className="form-group">
                <label>Full Name *</label>
                <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        disabled={loading}
                        className={formErrors.full_name ? 'error' : ''}
                    />
                </div>
                {formErrors.full_name && (
                    <span className="error-message">{formErrors.full_name}</span>
                )}
            </div>

            <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                    <span className="input-icon">✉️</span>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="disabled-input"
                    />
                </div>
                <small className="form-hint">
                    Email cannot be changed. Contact support for assistance.
                </small>
            </div>

            <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                    <span className="input-icon">📞</span>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        disabled={loading}
                        className={formErrors.phone ? 'error' : ''}
                    />
                </div>
                {formErrors.phone && (
                    <span className="error-message">{formErrors.phone}</span>
                )}
                <small className="form-hint">
                    Format: +91 XXXXX XXXXX (10 digits)
                </small>
            </div>

            <div className="form-group">
                <label>Bio</label>
                <div className="input-wrapper">
                    <span className="input-icon">📝</span>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us a little about yourself"
                        rows="3"
                        disabled={loading}
                    />
                </div>
                <small className="form-hint">
                    Brief description about yourself (max 500 characters)
                </small>
            </div>

            <div className="form-group">
                <label>Location</label>
                <div className="input-wrapper">
                    <span className="input-icon">📍</span>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter your city/location"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Website</label>
                <div className="input-wrapper">
                    <span className="input-icon">🌐</span>
                    <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        disabled={loading}
                        className={formErrors.website ? 'error' : ''}
                    />
                </div>
                {formErrors.website && (
                    <span className="error-message">{formErrors.website}</span>
                )}
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    disabled={loading}
                    className="save-profile-btn"
                >
                    {loading ? (
                        <>
                            <span className="saving-spinner"></span>
                            Saving...
                        </>
                    ) : (
                        '💾 Save Changes'
                    )}
                </button>
            </div>
        </form>
    );
};

export default UserProfileInfo;