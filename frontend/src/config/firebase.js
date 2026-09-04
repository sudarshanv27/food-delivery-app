// frontend/src/config/firebase.js
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    TwitterAuthProvider,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    getRedirectResult
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    arrayUnion,
    arrayRemove,
    increment,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll
} from 'firebase/storage';
import {
    getAnalytics,
    logEvent,
    setUserId,
    setUserProperties
} from 'firebase/analytics';
import {
    getMessaging,
    getToken,
    onMessage,
    isSupported
} from 'firebase/messaging';

// Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics = null;
let messaging = null;

// Initialize analytics only in browser environment
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);

    // Initialize messaging if supported
    isSupported().then(supported => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
}

// ============================================
// Authentication Providers
// ============================================

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Facebook Auth Provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email', 'public_profile');

// GitHub Auth Provider
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');

// Twitter Auth Provider
export const twitterProvider = new TwitterAuthProvider();

// ============================================
// Authentication Functions
// ============================================

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;

        // Update profile with display name
        if (displayName) {
            await updateProfile(user, { displayName });
        }

        // Send email verification
        await sendEmailVerification(user);

        // Create user document in Firestore
        await createUserDocument(user, { displayName });

        // Log analytics event
        if (analytics) {
            logEvent(analytics, 'sign_up', { method: 'email' });
        }

        return { success: true, user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;

        // Check if email is verified
        if (!user.emailVerified) {
            await sendEmailVerification(user);
            return { success: false, error: 'Please verify your email before logging in.' };
        }

        // Update last login timestamp
        await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: serverTimestamp()
        });

        // Log analytics event
        if (analytics) {
            logEvent(analytics, 'login', { method: 'email' });
            setUserId(analytics, user.uid);
        }

        return { success: true, user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
};

// Sign in with Google
export const signInWithGoogle = async (useRedirect = false) => {
    try {
        let result;
        if (useRedirect) {
            await signInWithRedirect(auth, googleProvider);
            return { success: true, redirect: true };
        } else {
            result = await signInWithPopup(auth, googleProvider);
        }

        const { user } = result;
        await handleSocialLogin(user, 'google');

        return { success: true, user };
    } catch (error) {
        console.error('Google sign in error:', error);
        return { success: false, error: error.message };
    }
};

// Sign in with Facebook
export const signInWithFacebook = async (useRedirect = false) => {
    try {
        let result;
        if (useRedirect) {
            await signInWithRedirect(auth, facebookProvider);
            return { success: true, redirect: true };
        } else {
            result = await signInWithPopup(auth, facebookProvider);
        }

        const { user } = result;
        await handleSocialLogin(user, 'facebook');

        return { success: true, user };
    } catch (error) {
        console.error('Facebook sign in error:', error);
        return { success: false, error: error.message };
    }
};

// Sign in with GitHub
export const signInWithGithub = async () => {
    try {
        const result = await signInWithPopup(auth, githubProvider);
        const { user } = result;
        await handleSocialLogin(user, 'github');
        return { success: true, user };
    } catch (error) {
        console.error('GitHub sign in error:', error);
        return { success: false, error: error.message };
    }
};

// Sign in with Twitter
export const signInWithTwitter = async () => {
    try {
        const result = await signInWithPopup(auth, twitterProvider);
        const { user } = result;
        await handleSocialLogin(user, 'twitter');
        return { success: true, user };
    } catch (error) {
        console.error('Twitter sign in error:', error);
        return { success: false, error: error.message };
    }
};

// Handle redirect result (for redirect sign-ins)
export const handleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const { user } = result;
            await handleSocialLogin(user, 'redirect');
            return { success: true, user };
        }
        return { success: false };
    } catch (error) {
        console.error('Redirect result error:', error);
        return { success: false, error: error.message };
    }
};

// Helper function to handle social login
const handleSocialLogin = async (user, provider) => {
    // Create/update user document
    await createUserDocument(user, {
        lastLogin: serverTimestamp(),
        provider
    });

    // Log analytics event
    if (analytics) {
        logEvent(analytics, 'login', { method: provider });
        setUserId(analytics, user.uid);
    }
};

// Create user document in Firestore
export const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const { displayName, email, photoURL, phoneNumber } = user;
        const createdAt = serverTimestamp();

        try {
            await setDoc(userRef, {
                uid: user.uid,
                displayName,
                email,
                photoURL,
                phoneNumber,
                createdAt,
                role: 'user',
                isActive: true,
                ...additionalData
            });
        } catch (error) {
            console.error('Error creating user document:', error);
        }
    } else {
        // Update existing user document
        await updateDoc(userRef, {
            lastLogin: serverTimestamp(),
            ...additionalData
        });
    }
};

// Send password reset email
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);

        if (analytics) {
            logEvent(analytics, 'password_reset_request', { method: 'email' });
        }

        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
};

// Send email verification
export const verifyEmail = async () => {
    try {
        const user = auth.currentUser;
        if (user) {
            await sendEmailVerification(user);
            return { success: true };
        }
        return { success: false, error: 'No user logged in' };
    } catch (error) {
        console.error('Email verification error:', error);
        return { success: false, error: error.message };
    }
};

// Update user profile
export const updateUserProfile = async (updates) => {
    try {
        const user = auth.currentUser;
        if (user) {
            await updateProfile(user, updates);

            // Update Firestore document
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, updates);

            if (analytics) {
                logEvent(analytics, 'profile_update');
            }

            return { success: true };
        }
        return { success: false, error: 'No user logged in' };
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
    }
};

// Change email
export const changeUserEmail = async (newEmail, password) => {
    try {
        const user = auth.currentUser;
        if (user) {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            // Update email
            await updateEmail(user, newEmail);

            // Update Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { email: newEmail });

            // Send verification for new email
            await sendEmailVerification(user);

            if (analytics) {
                logEvent(analytics, 'email_change');
            }

            return { success: true };
        }
        return { success: false, error: 'No user logged in' };
    } catch (error) {
        console.error('Email change error:', error);
        return { success: false, error: error.message };
    }
};

// Change password
export const changeUserPassword = async (currentPassword, newPassword) => {
    try {
        const user = auth.currentUser;
        if (user) {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            if (analytics) {
                logEvent(analytics, 'password_change');
            }

            return { success: true };
        }
        return { success: false, error: 'No user logged in' };
    } catch (error) {
        console.error('Password change error:', error);
        return { success: false, error: error.message };
    }
};

// Sign out
export const signOutUser = async () => {
    try {
        await signOut(auth);

        if (analytics) {
            logEvent(analytics, 'logout');
        }

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
};

// Get current user
export const getCurrentUser = () => {
    return auth.currentUser;
};

// Auth state observer
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ============================================
// Firestore Functions
// ============================================

// Generic CRUD operations
export const createDocument = async (collectionName, data, id = null) => {
    try {
        const docRef = id ? doc(db, collectionName, id) : doc(db, collectionName);
        await setDoc(docRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Create document error:', error);
        return { success: false, error: error.message };
    }
};

export const getDocument = async (collectionName, id) => {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        }
        return { success: false, error: 'Document not found' };
    } catch (error) {
        console.error('Get document error:', error);
        return { success: false, error: error.message };
    }
};

export const updateDocument = async (collectionName, id, data) => {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Update document error:', error);
        return { success: false, error: error.message };
    }
};

export const deleteDocument = async (collectionName, id) => {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error('Delete document error:', error);
        return { success: false, error: error.message };
    }
};

export const queryDocuments = async (collectionName, constraints = []) => {
    try {
        const collectionRef = collection(db, collectionName);
        const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
        const querySnapshot = await getDocs(q);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: documents };
    } catch (error) {
        console.error('Query documents error:', error);
        return { success: false, error: error.message };
    }
};

// Real-time listener
export const listenToDocument = (collectionName, id, callback) => {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        } else {
            callback(null);
        }
    });
};

export const listenToCollection = (collectionName, callback, constraints = []) => {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    return onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
    });
};

// ============================================
// Storage Functions
// ============================================

// Upload file
export const uploadFile = async (path, file, onProgress = null) => {
    try {
        const storageRef = ref(storage, path);
        let uploadTask;

        if (onProgress) {
            uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            });
            await uploadTask;
        } else {
            await uploadBytes(storageRef, file);
        }

        const downloadURL = await getDownloadURL(storageRef);
        return { success: true, url: downloadURL };
    } catch (error) {
        console.error('Upload file error:', error);
        return { success: false, error: error.message };
    }
};

// Upload user avatar
export const uploadUserAvatar = async (userId, file, onProgress = null) => {
    const fileExtension = file.name.split('.').pop();
    const path = `users/${userId}/avatar.${fileExtension}`;
    return uploadFile(path, file, onProgress);
};

// Upload restaurant image
export const uploadRestaurantImage = async (restaurantId, file, onProgress = null) => {
    const fileExtension = file.name.split('.').pop();
    const path = `restaurants/${restaurantId}/cover.${fileExtension}`;
    return uploadFile(path, file, onProgress);
};

// Upload menu item image
export const uploadMenuItemImage = async (restaurantId, itemId, file, onProgress = null) => {
    const fileExtension = file.name.split('.').pop();
    const path = `restaurants/${restaurantId}/menu/${itemId}.${fileExtension}`;
    return uploadFile(path, file, onProgress);
};

// Delete file
export const deleteFile = async (path) => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return { success: true };
    } catch (error) {
        console.error('Delete file error:', error);
        return { success: false, error: error.message };
    }
};

// Get file URL
export const getFileURL = async (path) => {
    try {
        const storageRef = ref(storage, path);
        const url = await getDownloadURL(storageRef);
        return { success: true, url };
    } catch (error) {
        console.error('Get file URL error:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// Push Notification Functions
// ============================================

// Get FCM token for push notifications
export const getFCMToken = async (vapidKey) => {
    if (!messaging) return null;

    try {
        const token = await getToken(messaging, { vapidKey });
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

// Listen for foreground messages
export const onMessageListener = (callback) => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        callback(payload);
    });
};

// ============================================
// Analytics Functions
// ============================================

// Log custom event
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
    if (analytics) {
        logEvent(analytics, eventName, eventParams);
    }
};

// Set user properties
export const setAnalyticsUserProperties = (properties) => {
    if (analytics) {
        setUserProperties(analytics, properties);
    }
};

// Set user ID for analytics
export const setAnalyticsUserId = (userId) => {
    if (analytics) {
        setUserId(analytics, userId);
    }
};

// ============================================
// Helper Functions
// ============================================

// Get user role from Firestore
export const getUserRole = async (userId) => {
    const result = await getDocument('users', userId);
    if (result.success) {
        return result.data.role || 'user';
    }
    return 'user';
};

// Check if user is admin
export const isUserAdmin = async (userId) => {
    const role = await getUserRole(userId);
    return role === 'admin';
};

// Get user document
export const getUserDocument = async (userId) => {
    return getDocument('users', userId);
};

export default {
    // Auth
    auth,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGithub,
    signInWithTwitter,
    handleRedirectResult,
    signOutUser,
    resetPassword,
    verifyEmail,
    updateUserProfile,
    changeUserEmail,
    changeUserPassword,
    getCurrentUser,
    onAuthStateChange,

    // Firestore
    db,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    listenToDocument,
    listenToCollection,

    // Storage
    storage,
    uploadFile,
    uploadUserAvatar,
    uploadRestaurantImage,
    uploadMenuItemImage,
    deleteFile,
    getFileURL,

    // Notifications
    getFCMToken,
    onMessageListener,

    // Analytics
    analytics,
    logAnalyticsEvent,
    setAnalyticsUserProperties,
    setAnalyticsUserId,

    // Helpers
    getUserRole,
    isUserAdmin,
    getUserDocument,

    // Providers
    googleProvider,
    facebookProvider,
    githubProvider,
    twitterProvider
};