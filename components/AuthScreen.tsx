import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  type SignInOutput,
} from 'aws-amplify/auth';

type AuthMode = 'login' | 'signup' | 'confirm' | 'forgotPassword' | 'resetConfirm';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const animatePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signOut();
      const result: SignInOutput = await signIn({ username: email, password });
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        setMode('confirm');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setMode('confirm');
      }
    } catch (err: any) {
      setError(err.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: confirmCode });
      await signIn({ username: email, password });
    } catch (err: any) {
      setError(err.message ?? 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setLoading(true);
    try {
      await resetPassword({ username: email });
      setMode('resetConfirm');
    } catch (err: any) {
      setError(err.message ?? 'Could not send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: confirmCode,
        newPassword,
      });
      setPassword(newPassword);
      setMode('login');
      setError('Password reset! You can log in now.');
    } catch (err: any) {
      setError(err.message ?? 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    switch (mode) {
      case 'login': return handleLogin();
      case 'signup': return handleSignUp();
      case 'confirm': return handleConfirm();
      case 'forgotPassword': return handleForgotPassword();
      case 'resetConfirm': return handleResetConfirm();
    }
  };

  const ctaLabel = {
    login: 'Enter the Arena',
    signup: 'Create Your Account',
    confirm: 'Verify Code',
    forgotPassword: 'Send Reset Code',
    resetConfirm: 'Reset Password',
  }[mode];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(255,59,48,0.15)', 'transparent', 'transparent']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.brandContainer}>
              <Text style={styles.title}>SNIPR</Text>
              <Text style={styles.subtitle}>Catch. Compete. Conquer.</Text>
            </View>

            <View style={styles.form}>
              {(mode === 'login' || mode === 'signup' || mode === 'forgotPassword') && (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              )}

              {(mode === 'login' || mode === 'signup') && (
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                />
              )}

              {mode === 'signup' && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                />
              )}

              {(mode === 'confirm' || mode === 'resetConfirm') && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirmation Code"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={confirmCode}
                  onChangeText={setConfirmCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
              )}

              {mode === 'resetConfirm' && (
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                />
              )}

              {error !== '' && <Text style={styles.error}>{error}</Text>}

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                  style={styles.ctaButton}
                  onPress={handleSubmit}
                  onPressIn={animatePressIn}
                  onPressOut={animatePressOut}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.ctaText}>{ctaLabel}</Text>
                  )}
                </Pressable>
              </Animated.View>

              {mode === 'login' && (
                <Pressable onPress={() => { setError(''); setMode('forgotPassword'); }}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.toggleContainer}>
              {mode === 'login' && (
                <Pressable onPress={() => { setError(''); setConfirmPassword(''); setMode('signup'); }}>
                  <Text style={styles.toggleText}>
                    New here? <Text style={styles.toggleHighlight}>Sign up</Text>
                  </Text>
                </Pressable>
              )}
              {mode === 'signup' && (
                <Pressable onPress={() => { setError(''); setConfirmPassword(''); setMode('login'); }}>
                  <Text style={styles.toggleText}>
                    Already have an account? <Text style={styles.toggleHighlight}>Log in</Text>
                  </Text>
                </Pressable>
              )}
              {mode === 'confirm' && (
                <Pressable onPress={() => { setError(''); setMode('login'); }}>
                  <Text style={styles.toggleText}>
                    Back to <Text style={styles.toggleHighlight}>Log in</Text>
                  </Text>
                </Pressable>
              )}
              {(mode === 'forgotPassword' || mode === 'resetConfirm') && (
                <Pressable onPress={() => { setError(''); setMode('login'); }}>
                  <Text style={styles.toggleText}>
                    Back to <Text style={styles.toggleHighlight}>Log in</Text>
                  </Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: '500',
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: 'rgba(255,59,48,0.9)',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  toggleContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleHighlight: {
    color: '#FF3B30',
    fontWeight: '700',
  },
});
