// admin-panel/src/pages/Settings.js

import React, {
  useEffect,
  useState
} from 'react';

import {
  Bell,
  CheckCircle,
  Globe,
  Palette,
  Save,
  Shield,
  User
} from 'lucide-react';

import toast from 'react-hot-toast';

const SETTINGS_STORAGE_KEY =
  'foodiedash_admin_settings';

const DEFAULT_SETTINGS = {
  siteName: 'FoodieDash Admin',
  adminEmail: '',
  notificationsEnabled: true,
  darkMode: false,
  language: 'en'
};

const Settings = () => {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    try {
      const storedSettings =
        localStorage.getItem(
          SETTINGS_STORAGE_KEY
        );

      if (!storedSettings) {
        /*
         * If no settings have been saved yet,
         * try to get the email from the logged-in
         * admin account.
         */
        const storedAdmin =
          localStorage.getItem(
            'adminUser'
          );

        if (storedAdmin) {
          try {
            const admin =
              JSON.parse(storedAdmin);

            if (admin?.email) {
              setSettings((previous) => ({
                ...previous,
                adminEmail:
                  admin.email
              }));
            }
          } catch (error) {
            console.error(
              'Failed to parse admin user:',
              error
            );
          }
        }

        return;
      }

      const parsedSettings =
        JSON.parse(storedSettings);

      if (
        parsedSettings &&
        typeof parsedSettings === 'object'
      ) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsedSettings
        });
      }
    } catch (error) {
      console.error(
        'Failed to load admin settings:',
        error
      );
    }
  }, []);

  const handleChange = (
    key,
    value
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    const siteName =
      settings.siteName.trim();

    const adminEmail =
      settings.adminEmail.trim();

    if (!siteName) {
      toast.error(
        'Please enter a site name.'
      );
      return;
    }

    if (!adminEmail) {
      toast.error(
        'Please enter an admin email.'
      );
      return;
    }

    setSaving(true);

    try {
      const normalizedSettings = {
        ...settings,
        siteName,
        adminEmail
      };

      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(
          normalizedSettings
        )
      );

      setSettings(
        normalizedSettings
      );

      setSaved(true);

      toast.success(
        'Settings saved successfully.'
      );
    } catch (error) {
      console.error(
        'Failed to save settings:',
        error
      );

      toast.error(
        'Failed to save settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const confirmed =
      window.confirm(
        'Reset all admin panel settings to their default values?'
      );

    if (!confirmed) {
      return;
    }

    let adminEmail = '';

    try {
      const storedAdmin =
        localStorage.getItem(
          'adminUser'
        );

      if (storedAdmin) {
        const admin =
          JSON.parse(storedAdmin);

        adminEmail =
          admin?.email || '';
      }
    } catch (error) {
      console.error(
        'Failed to read admin account:',
        error
      );
    }

    const resetSettings = {
      ...DEFAULT_SETTINGS,
      adminEmail
    };

    setSettings(resetSettings);

    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(
        resetSettings
      )
    );

    setSaved(true);

    toast.success(
      'Settings have been reset.'
    );
  };

  return (
    <div style={styles.container}>
      {/* ================= HEADER ================= */}

      <div style={styles.pageHeader}>
        <div style={styles.headingRow}>
          <div style={styles.headingIcon}>
            <Shield size={27} />
          </div>

          <div>
            <h1 style={styles.heading}>
              Settings
            </h1>

            <p style={styles.subheading}>
              Manage your FoodieDash admin
              panel preferences.
            </p>
          </div>
        </div>

        {saved && (
          <div style={styles.savedIndicator}>
            <CheckCircle size={16} />
            Saved
          </div>
        )}
      </div>

      <div style={styles.content}>
        {/* ================= GENERAL SETTINGS ================= */}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div
              style={{
                ...styles.sectionIcon,
                backgroundColor: '#fff0f1',
                color: '#ff4757'
              }}
            >
              <Globe size={21} />
            </div>

            <div>
              <h2 style={styles.sectionTitle}>
                General Settings
              </h2>

              <p style={styles.sectionDescription}>
                Configure basic information
                displayed across the admin
                panel.
              </p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label
                htmlFor="site-name"
                style={styles.label}
              >
                Site Name
              </label>

              <input
                id="site-name"
                type="text"
                value={settings.siteName}
                onChange={(event) =>
                  handleChange(
                    'siteName',
                    event.target.value
                  )
                }
                placeholder="FoodieDash Admin"
                style={styles.input}
                autoComplete="organization"
              />

              <span style={styles.helpText}>
                The name used for the
                administration platform.
              </span>
            </div>

            <div style={styles.formGroup}>
              <label
                htmlFor="admin-email"
                style={styles.label}
              >
                Admin Email
              </label>

              <input
                id="admin-email"
                type="email"
                value={settings.adminEmail}
                onChange={(event) =>
                  handleChange(
                    'adminEmail',
                    event.target.value
                  )
                }
                placeholder="admin@example.com"
                style={styles.input}
                autoComplete="email"
              />

              <span style={styles.helpText}>
                Email address associated with
                this admin account.
              </span>
            </div>

            <div style={styles.formGroup}>
              <label
                htmlFor="language"
                style={styles.label}
              >
                Language
              </label>

              <select
                id="language"
                value={settings.language}
                onChange={(event) =>
                  handleChange(
                    'language',
                    event.target.value
                  )
                }
                style={styles.input}
              >
                <option value="en">
                  English
                </option>

                <option value="kn">
                  Kannada
                </option>

                <option value="hi">
                  Hindi
                </option>
              </select>

              <span style={styles.helpText}>
                Select the preferred admin
                panel language.
              </span>
            </div>
          </div>
        </section>

        {/* ================= NOTIFICATION SETTINGS ================= */}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div
              style={{
                ...styles.sectionIcon,
                backgroundColor: '#fff6e6',
                color: '#ffa502'
              }}
            >
              <Bell size={21} />
            </div>

            <div>
              <h2 style={styles.sectionTitle}>
                Notification Settings
              </h2>

              <p style={styles.sectionDescription}>
                Control how the admin panel
                handles notifications.
              </p>
            </div>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <strong style={styles.settingTitle}>
                Enable Notifications
              </strong>

              <span style={styles.settingDescription}>
                Receive notifications for new
                orders, restaurant activity,
                delivery updates, and other
                important events.
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                settings.notificationsEnabled
              }
              aria-label="Enable notifications"
              onClick={() =>
                handleChange(
                  'notificationsEnabled',
                  !settings.notificationsEnabled
                )
              }
              style={{
                ...styles.switch,
                ...(settings.notificationsEnabled
                  ? styles.switchActive
                  : styles.switchInactive)
              }}
            >
              <span
                style={{
                  ...styles.switchThumb,
                  ...(settings.notificationsEnabled
                    ? styles.switchThumbActive
                    : {})
                }}
              />
            </button>
          </div>
        </section>

        {/* ================= APPEARANCE SETTINGS ================= */}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div
              style={{
                ...styles.sectionIcon,
                backgroundColor: '#f5efff',
                color: '#a55de8'
              }}
            >
              <Palette size={21} />
            </div>

            <div>
              <h2 style={styles.sectionTitle}>
                Appearance
              </h2>

              <p style={styles.sectionDescription}>
                Customize the visual preferences
                of your admin panel.
              </p>
            </div>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <strong style={styles.settingTitle}>
                Dark Mode
              </strong>

              <span style={styles.settingDescription}>
                Switch between light and dark
                admin panel themes.
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                settings.darkMode
              }
              aria-label="Enable dark mode"
              onClick={() =>
                handleChange(
                  'darkMode',
                  !settings.darkMode
                )
              }
              style={{
                ...styles.switch,
                ...(settings.darkMode
                  ? styles.switchActive
                  : styles.switchInactive)
              }}
            >
              <span
                style={{
                  ...styles.switchThumb,
                  ...(settings.darkMode
                    ? styles.switchThumbActive
                    : {})
                }}
              />
            </button>
          </div>

          {settings.darkMode && (
            <div style={styles.infoBox}>
              <Palette size={17} />

              <span>
                Dark mode preference is saved
                locally. Full application-wide
                theme styling can be connected
                later.
              </span>
            </div>
          )}
        </section>

        {/* ================= ADMIN ACCOUNT ================= */}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div
              style={{
                ...styles.sectionIcon,
                backgroundColor: '#edf5ff',
                color: '#1e90ff'
              }}
            >
              <User size={21} />
            </div>

            <div>
              <h2 style={styles.sectionTitle}>
                Admin Account
              </h2>

              <p style={styles.sectionDescription}>
                Current administrator account
                information.
              </p>
            </div>
          </div>

          <div style={styles.accountBox}>
            <div style={styles.accountAvatar}>
              {settings.adminEmail
                .charAt(0)
                .toUpperCase() || 'A'}
            </div>

            <div style={styles.accountInfo}>
              <strong>
                Administrator
              </strong>

              <span>
                {settings.adminEmail ||
                  'No email configured'}
              </span>
            </div>

            <span style={styles.accountBadge}>
              Admin
            </span>
          </div>
        </section>

        {/* ================= ACTIONS ================= */}

        <div style={styles.actions}>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            style={{
              ...styles.resetButton,
              ...(saving
                ? styles.disabledButton
                : {})
            }}
          >
            Reset Settings
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              ...styles.saveButton,
              ...(saving
                ? styles.disabledButton
                : {})
            }}
          >
            <Save size={18} />

            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    background: '#f5f6fa',
    minHeight: '100vh'
  },

  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '24px'
  },

  headingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  headingIcon: {
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    backgroundColor: '#fff0f1',
    color: '#ff4757',
    flexShrink: 0
  },

  heading: {
    margin: 0,
    fontSize: '30px',
    lineHeight: 1.2,
    color: '#2c3e50',
    fontWeight: '700'
  },

  subheading: {
    margin: '7px 0 0',
    color: '#7f8c8d',
    fontSize: '14px'
  },

  savedIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '20px',
    backgroundColor: '#eaf8ef',
    color: '#198754',
    fontSize: '12px',
    fontWeight: '600'
  },

  content: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto'
  },

  card: {
    padding: '22px',
    marginBottom: '18px',
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '13px',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.04)'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '22px'
  },

  sectionIcon: {
    width: '43px',
    height: '43px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    flexShrink: 0
  },

  sectionTitle: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '17px',
    fontWeight: '700'
  },

  sectionDescription: {
    margin: '4px 0 0',
    color: '#868e96',
    fontSize: '12px'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '18px'
  },

  formGroup: {
    minWidth: 0
  },

  label: {
    display: 'block',
    marginBottom: '7px',
    color: '#343a40',
    fontSize: '13px',
    fontWeight: '600'
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    height: '42px',
    padding: '0 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#343a40',
    fontSize: '13px'
  },

  helpText: {
    display: 'block',
    marginTop: '6px',
    color: '#adb5bd',
    fontSize: '11px',
    lineHeight: 1.4
  },

  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px'
  },

  settingInfo: {
    flex: 1,
    minWidth: 0
  },

  settingTitle: {
    display: 'block',
    marginBottom: '5px',
    color: '#343a40',
    fontSize: '14px'
  },

  settingDescription: {
    display: 'block',
    maxWidth: '650px',
    color: '#868e96',
    fontSize: '12px',
    lineHeight: 1.5
  },

  switch: {
    position: 'relative',
    width: '50px',
    height: '28px',
    padding: 0,
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    flexShrink: 0,
    transition:
      'background-color 0.2s ease'
  },

  switchActive: {
    backgroundColor: '#ff4757'
  },

  switchInactive: {
    backgroundColor: '#ced4da'
  },

  switchThumb: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    transition:
      'transform 0.2s ease',
    boxShadow:
      '0 1px 3px rgba(0,0,0,0.2)'
  },

  switchThumbActive: {
    transform: 'translateX(22px)'
  },

  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginTop: '18px',
    padding: '11px 13px',
    borderRadius: '8px',
    backgroundColor: '#edf5ff',
    color: '#1e5aa8',
    fontSize: '12px',
    lineHeight: 1.5
  },

  accountBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    borderRadius: '10px',
    backgroundColor: '#f8f9fa'
  },

  accountAvatar: {
    width: '43px',
    height: '43px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#fff0f1',
    color: '#ff4757',
    fontSize: '17px',
    fontWeight: '700',
    flexShrink: 0
  },

  accountInfo: {
    flex: 1,
    minWidth: 0
  },

  accountInfoStrong: {
    display: 'block'
  },

  accountInfoSpan: {
    display: 'block'
  },

  accountBadge: {
    padding: '5px 9px',
    borderRadius: '15px',
    backgroundColor: '#fff0f1',
    color: '#ff4757',
    fontSize: '11px',
    fontWeight: '700'
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingBottom: '20px'
  },

  resetButton: {
    padding: '10px 16px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#6c757d',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  saveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minWidth: '145px',
    padding: '10px 18px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ff4757',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};

export default Settings;