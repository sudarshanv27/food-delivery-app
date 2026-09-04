import React, { useState } from 'react';
import { Save, Bell, Shield, Palette, Globe } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'FoodieDash Admin',
    adminEmail: 'admin@foodapp.com',
    notificationsEnabled: true,
    darkMode: false,
    language: 'en',
  });

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div style={{ padding: '24px', background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#2c3e50', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: '#7f8c8d' }}>Manage your admin panel preferences</p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* General Settings */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Globe size={24} color="#ff4757" />
            <h2 style={{ fontSize: '18px', color: '#2c3e50' }}>General Settings</h2>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>Site Name</label>
            <input 
              type="text" 
              value={settings.siteName} 
              onChange={(e) => handleChange('siteName', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>Admin Email</label>
            <input 
              type="email" 
              value={settings.adminEmail} 
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Bell size={24} color="#ff4757" />
            <h2 style={{ fontSize: '18px', color: '#2c3e50' }}>Notification Settings</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>Enable Notifications</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>Receive email notifications for new orders</span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input 
                type="checkbox" 
                checked={settings.notificationsEnabled}
                onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{ 
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                background: settings.notificationsEnabled ? '#ff4757' : '#ccc',
                borderRadius: '24px', transition: '0.3s'
              }}>
                <span style={{ 
                  position: 'absolute', height: '20px', width: '20px', left: '2px', bottom: '2px',
                  background: 'white', borderRadius: '50%', transition: '0.3s',
                  transform: settings.notificationsEnabled ? 'translateX(26px)' : 'translateX(0)'
                }}></span>
              </span>
            </label>
          </div>
        </div>

        {/* Appearance Settings */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Palette size={24} color="#ff4757" />
            <h2 style={{ fontSize: '18px', color: '#2c3e50' }}>Appearance</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>Dark Mode</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>Switch between light and dark theme</span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input 
                type="checkbox" 
                checked={settings.darkMode}
                onChange={(e) => handleChange('darkMode', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{ 
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                background: settings.darkMode ? '#ff4757' : '#ccc',
                borderRadius: '24px', transition: '0.3s'
              }}>
                <span style={{ 
                  position: 'absolute', height: '20px', width: '20px', left: '2px', bottom: '2px',
                  background: 'white', borderRadius: '50%', transition: '0.3s',
                  transform: settings.darkMode ? 'translateX(26px)' : 'translateX(0)'
                }}></span>
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ textAlign: 'center' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;