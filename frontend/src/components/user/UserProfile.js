// src/components/profile/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import './UserProfile.css';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        avatar: '',
        date_of_birth: '',
        gender: '',
        bio: ''
    });
    const [errors, setErrors] = useState({});
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                avatar: user.avatar || '',
                date_of_birth: user.date_of_birth || '',
                gender: user.gender || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name) {
            newErrors.full_name = 'Full name is required';
        } else if (formData.full_name.length < 2) {
            newErrors.full_name = 'Name must be at least 2 characters';
        } else if (formData.full_name.length > 100) {
            newErrors.full_name = 'Name must be less than 100 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (formData.date_of_birth) {
            const birthDate = new Date(formData.date_of_birth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 13) {
                newErrors.date_of_birth = 'You must be at least 13 years old';
            } else if (age > 120) {
                newErrors.date_of_birth = 'Please enter a valid date of birth';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.current_password) {
            newErrors.current_password = 'Current password is required';
        }

        if (!passwordData.new_password) {
            newErrors.new_password = 'New password is required';
        } else if (passwordData.new_password.length < 6) {
            newErrors.new_password = 'Password must be at least 6 characters';
        }

        if (!passwordData.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password';
        } else if (passwordData.new_password !== passwordData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        setPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrors({ avatar: 'Please upload an image file' });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrors({ avatar: 'Image must be less than 2MB' });
            return;
        }

        setUploadingAvatar(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const avatarUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatar: avatarUrl }));
            setErrors(prev => ({ ...prev, avatar: '' }));
        } catch (error) {
            console.error('Avatar upload error:', error);
            setErrors({ avatar: 'Failed to upload image' });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await updateUser(formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Profile update error:', error);
            setErrors({ submit: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        setIsChangingPassword(true);
        try {
            // API call to change password
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Password changed successfully!');
            setShowPasswordModal(false);
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            console.error('Password change error:', error);
            setPasswordErrors({ submit: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: user.full_name || user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatar: user.avatar || '',
            date_of_birth: user.date_of_birth || '',
            gender: user.gender || '',
            bio: user.bio || ''
        });
        setErrors({});
        setIsEditing(false);
    };

    const getRoleBadge = () => {
        const roles = {
            admin: { label: 'Admin', icon: '👑', color: '#f44336' },
            restaurant_owner: { label: 'Restaurant Owner', icon: '🏪', color: '#ff9800' },
            delivery_partner: { label: 'Delivery Partner', icon: '🚚', color: '#2196f3' },
            user: { label: 'Customer', icon: '👤', color: '#4caf50' }
        };
        const role = roles[user?.role] || roles.user;
        return (
            <span className="role-badge" style={{ background: role.color }}>
                {role.icon} {role.label}
            </span>
        );
    };

    if (!isEditing) {
        return (
            <div className="user-profile">
                <div className="profile-cover">
                    <div className="profile-cover-overlay"></div>
                </div>

                <div className="profile-content">
                    <div className="profile-header">
                        <div className="profile-avatar-container">
                            <div className="profile-avatar">
                                <img
                                    src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name)}&background=667eea&color=fff&size=128`}
                                    alt={formData.full_name}
                                />
                                {getRoleBadge()}
                            </div>
                        </div>
                        <div className="profile-info">
                            <h2 className="profile-name">{formData.full_name}</h2>
                            <p className="profile-email">{formData.email}</p>
                            {formData.phone && <p className="profile-phone">📞 {formData.phone}</p>}
                            <p className="profile-member-since">
                                Member since: {new Date(user?.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="profile-actions">
                            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                ✏️ Edit Profile
                            </button>
                            <button className="change-password-btn" onClick={() => setShowPasswordModal(true)}>
                                🔒 Change Password
                            </button>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="details-section">
                            <h3>
                                <span className="section-icon">📝</span>
                                About
                            </h3>
                            {formData.bio ? (
                                <p className="bio-text">{formData.bio}</p>
                            ) : (
                                <p className="no-data">No bio added yet</p>
                            )}
                        </div>

                        <div className="details-section">
                            <h3>
                                <span className="section-icon">👤</span>
                                Personal Information
                            </h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Full Name:</span>
                                    <span className="info-value">{formData.full_name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{formData.email}</span>
                                </div>
                                {formData.phone && (
                                    <div className="info-item">
                                        <span className="info-label">Phone:</span>
                                        <span className="info-value">{formData.phone}</span>
                                    </div>
                                )}
                                {formData.date_of_birth && (
                                    <div className="info-item">
                                        <span className="info-label">Date of Birth:</span>
                                        <span className="info-value">
                                            {new Date(formData.date_of_birth).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                                {formData.gender && (
                                    <div className="info-item">
                                        <span className="info-label">Gender:</span>
                                        <span className="info-value">
                                            {formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="details-section">
                            <h3>
                                <span className="section-icon">📊</span>
                                Account Statistics
                            </h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-value">12</div>
                                    <div className="stat-label">Total Orders</div>
                                    <div className="stat-icon">📦</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">5</div>
                                    <div className="stat-label">Wishlist Items</div>
                                    <div className="stat-icon">❤️</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">8</div>
                                    <div className="stat-label">Reviews</div>
                                    <div className="stat-icon">⭐</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">₹2,450</div>
                                    <div className="stat-label">Total Spent</div>
                                    <div className="stat-icon">💰</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                        <div className="password-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Change Password</h3>
                                <button className="close-modal" onClick={() => setShowPasswordModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handlePasswordSubmit} className="password-form">
                                <div className="form-group">
                                    <label>Current Password *</label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        className={passwordErrors.current_password ? 'error' : ''}
                                    />
                                    {passwordErrors.current_password && <span className="error-message">{passwordErrors.current_password}</span>}
                                </div>
                                <div className="form-group">
                                    <label>New Password *</label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        className={passwordErrors.new_password ? 'error' : ''}
                                    />
                                    {passwordErrors.new_password && <span className="error-message">{passwordErrors.new_password}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password *</label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordChange}
                                        className={passwordErrors.confirm_password ? 'error' : ''}
                                    />
                                    {passwordErrors.confirm_password && <span className="error-message">{passwordErrors.confirm_password}</span>}
                                </div>
                                {passwordErrors.submit && <div className="submit-error">{passwordErrors.submit}</div>}
                                <div className="modal-actions">
                                    <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                                        Update Password
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="user-profile edit-mode">
            <div className="profile-cover">
                <div className="profile-cover-overlay"></div>
            </div>

            <div className="profile-content">
                <div className="profile-header edit">
                    <div className="profile-avatar-edit">
                        <div className="avatar-wrapper">
                            <img
                                src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name)}&background=667eea&color=fff&size=128`}
                                alt={formData.full_name}
                            />
                            <label className="avatar-upload-label">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                />
                                <span className="upload-icon">📸</span>
                            </label>
                            {uploadingAvatar && <div className="avatar-uploading">Uploading...</div>}
                        </div>
                        {errors.avatar && <span className="error-message avatar-error">{errors.avatar}</span>}
                    </div>
                    <h2>Edit Profile</h2>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className={errors.full_name ? 'error' : ''}
                                placeholder="Enter your full name"
                            />
                            {errors.full_name && <span className="error-message">{errors.full_name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                disabled
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className={errors.date_of_birth ? 'error' : ''}
                            />
                            {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Tell us a little about yourself..."
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="submit-error">{errors.submit}</div>
                    )}

                    <div className="form-actions">
                        <Button type="submit" variant="primary" isLoading={isLoading}>
                            Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;