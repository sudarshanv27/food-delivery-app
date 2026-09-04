import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signup({
      full_name: fullName,
      email,
      phone,
      password,
      user_type: 'customer'
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Signup Failed', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#FF6B6B',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  signupButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginTextBold: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
});

export default SignupScreen;// mobile-app/src/screens/SignupScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        user_type: 'customer'
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, verifyOTP } = useAuth();

    const handleSendOTP = async () => {
        if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (formData.phone.length !== 10) {
            Alert.alert('Error', 'Phone number must be 10 digits');
            return;
        }

        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await signup(formData);
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', 'OTP sent! Check backend console');
            setStep(2);
        } else {
            Alert.alert('Error', result.message);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter valid 6-digit OTP');
            return;
        }

        setLoading(true);
        const result = await verifyOTP(formData.email, otp);
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Account created successfully!');
            navigation.replace('Main');
        } else {
            Alert.alert('Error', result.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>🍔 Create Account</Text>
            <Text style={styles.subtitle}>
                {step === 1 ? 'Sign up to start ordering' : `Verify OTP sent to ${formData.email}`}
            </Text>

            {step === 1 ? (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number (10 digits)"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        keyboardType="phone-pad"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password (min 6 characters)"
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.signupBtn} onPress={handleSendOTP} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.signupBtnText}>Send OTP</Text>}
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <View style={styles.otpBox}>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            textAlign="center"
                        />
                    </View>
                    <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyOTP} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.verifyBtnText}>Verify & Create Account</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setStep(1)}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                </>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#ff6b35',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    signupBtn: {
        backgroundColor: '#ff6b35',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    signupBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    otpBox: {
        alignItems: 'center',
        marginBottom: 20,
    },
    otpInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 24,
        fontWeight: 'bold',
        width: '80%',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
    },
    verifyBtn: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    verifyBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backText: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    loginText: {
        textAlign: 'center',
        color: '#ff6b35',
        fontWeight: 'bold',
        marginTop: 20,
    },
});