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
import { Amplify } from 'aws-amplify';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  resendSignUpCode,
  type SignInOutput,
} from 'aws-amplify/auth';

type AuthMode = 'login' | 'signup' | 'confirm' | 'forgotPassword' | 'resetConfirm';

function getAuthErrorMessage(err: any): string {
  if (typeof err === 'string') return err;

  // Check error name first (more reliable for Amplify errors)
  const name = err?.name || '';
  if (name === 'UserAlreadyAuthenticatedException') return 'Already signed in. Restarting...';
  if (name === 'UserNotConfirmedException') return 'Please verify your email first.';
  if (name === 'NotAuthorizedException') return 'Incorrect email or password.';
  if (name === 'UserNotFoundException') return 'No account found with that email.';
  if (name === 'UsernameExistsException') return 'An account with this email already exists.';
  if (name === 'CodeMismatchException') return 'Invalid verification code.';
  if (name === 'ExpiredCodeException') return 'Code has expired. Please resend.';
  if (name === 'LimitExceededException') return 'Too many attempts. Please wait and try again.';
  if (name === 'InvalidPasswordException') return 'Password must be 8+ characters with uppercase, lowercase, number, and symbol.';
  if (name === 'InvalidParameterException') return 'Please check your input and try again.';

  // Fallback to message checking
  const message = err?.message || err?.code || '';
  if (message.includes('UserAlreadyAuthenticatedException')) return 'Already signed in. Restarting...';
  if (message.includes('UserNotConfirmedException')) return 'Please verify your email first.';
  if (message.includes('NotAuthorizedException')) return 'Incorrect email or password.';
  if (message.includes('UserNotFoundException')) return 'No account found with that email.';
  if (message.includes('UsernameExistsException')) return 'An account with this email already exists.';
  if (message.includes('CodeMismatchException')) return 'Invalid verification code.';
  if (message.includes('ExpiredCodeException')) return 'Code has expired. Please resend.';
  if (message.includes('LimitExceededException')) return 'Too many attempts. Please wait and try again.';
  if (message.includes('InvalidPasswordException')) return 'Password must be 8+ characters with uppercase, lowercase, number, and symbol.';
  if (message.includes('InvalidParameterException')) return 'Please check your input and try again.';

  return message || 'Something went wrong. Please try again.';
}

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Verify Amplify is configured
    try {
      const config = Amplify.getConfig();
      console.log('[AUTH INIT] Amplify configured on AuthScreen mount:', !!config.Auth);
      console.log('[AUTH INIT] User Pool ID:', config.Auth?.Cognito?.userPoolId);
      console.log('[AUTH INIT] User Pool Client ID:', config.Auth?.Cognito?.userPoolClientId);

      // Test basic network connectivity
      fetch('https://www.google.com', { method: 'HEAD' })
        .then(() => console.log('[AUTH INIT] Network test: SUCCESS'))
        .catch((err) => console.error('[AUTH INIT] Network test: FAILED', err));
    } catch (err) {
      console.error('[AUTH INIT] Failed to get Amplify config:', err);
    }
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

  const cleanEmail = () => email.trim().toLowerCase();

  const handleLogin = async () => {
    const trimmedEmail = cleanEmail();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      // Diagnostic: check crypto + network + Amplify config
      const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';
      console.log('[AUTH DEBUG] crypto.getRandomValues available:', hasCrypto);

      try {
        const config = Amplify.getConfig();
        console.log('[AUTH DEBUG] Amplify configured:', !!config.Auth);
        console.log('[AUTH DEBUG] User pool ID:', config.Auth?.Cognito?.userPoolId);
      } catch (configErr) {
        console.error('[AUTH DEBUG] Amplify config error:', configErr);
      }

      try {
        const res = await fetch('https://cognito-idp.us-west-2.amazonaws.com/', { method: 'POST', headers: { 'Content-Type': 'application/x-amz-json-1.1' } });
        console.log('[AUTH DEBUG] Cognito endpoint reachable, status:', res.status);
      } catch (netErr) {
        console.error('[AUTH DEBUG] Cognito endpoint NOT reachable:', netErr);
        setError('Cannot reach authentication server. Check your internet connection.');
        setLoading(false);
        return;
      }

      try { await signOut({ global: true }); } catch { }
      console.log('[AUTH DEBUG] Attempting sign in with email:', trimmedEmail);
      const result: SignInOutput = await signIn({ username: trimmedEmail, password });
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        setMode('confirm');
        setInfo('Please check your email for the verification code.');
      }
    } catch (err: any) {
      console.error('Login error FULL:', err);
      console.error('Login error name:', err?.name);
      console.error('Login error message:', err?.message);
      console.error('Login error recoverySuggestion:', err?.recoverySuggestion);
      console.error('Login error cause:', err?.cause);
      console.error('Login error stack:', err?.stack);
      console.error('Login error underlying:', JSON.stringify(err?.underlyingError));
      console.error('Login error keys:', Object.keys(err || {}));

      // Check if there's a nested error
      if (err?.underlyingError) {
        console.error('Underlying error keys:', Object.keys(err.underlyingError || {}));
        console.error('Underlying error toString:', String(err.underlyingError));
      }

      // Check constructor name
      console.error('Error constructor:', err?.constructor?.name);

      // Try to get more info from prototype chain
      let proto = Object.getPrototypeOf(err);
      console.error('Error prototype chain:', proto?.constructor?.name);

      const msg = getAuthErrorMessage(err);

      // Special handling for Unknown errors - they might need verification
      if (err?.name === 'Unknown') {
        console.warn('[AUTH] Unknown error detected - this might mean unverified email or wrong credentials');
        setError('Unable to sign in. Please check your email and password, or try signing up if you don\'t have an account yet.');
      } else if (msg.includes('verify your email')) {
        setMode('confirm');
        setInfo('Please check your email for the verification code.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const trimmedEmail = cleanEmail();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { nextStep } = await signUp({
        username: trimmedEmail,
        password,
        options: { userAttributes: { email: trimmedEmail } },
      });
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setMode('confirm');
        setInfo('Verification code sent to your email.');
      }
    } catch (err: any) {
      console.error('Signup error FULL:', err);
      console.error('Signup error name:', err?.name);
      console.error('Signup error message:', err?.message);
      console.error('Signup error recoverySuggestion:', err?.recoverySuggestion);
      console.error('Signup error cause:', err?.cause);

      const msg = getAuthErrorMessage(err);
      if (err?.name === 'Unknown') {
        console.warn('[AUTH] Unknown signup error - check Amplify configuration');
        setError('Unable to create account. Please try again or check your internet connection.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const trimmedEmail = cleanEmail();
    if (!trimmedEmail) {
      setError('Email is missing. Please go back and enter it.');
      return;
    }
    if (!confirmCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      console.log('[CONFIRM] Starting confirmSignUp for:', trimmedEmail);
      await confirmSignUp({ username: trimmedEmail, confirmationCode: confirmCode.trim() });
      console.log('[CONFIRM] confirmSignUp SUCCESS');

      console.log('[CONFIRM] Signing out any existing session...');
      try { await signOut({ global: true }); } catch { }

      // Small delay to let Cognito fully activate the user
      console.log('[CONFIRM] Waiting 500ms for Cognito to activate user...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('[CONFIRM] Attempting auto sign-in for:', trimmedEmail);
      await signIn({ username: trimmedEmail, password });
      console.log('[CONFIRM] Auto sign-in SUCCESS');
    } catch (err: any) {
      console.error('Confirm error FULL:', err);
      console.error('Confirm error name:', err?.name);
      console.error('Confirm error message:', err?.message);
      console.error('Confirm error recoverySuggestion:', err?.recoverySuggestion);
      console.error('Confirm error cause:', err?.cause);

      // Check if it's just the auto-login that failed AFTER successful confirmation
      if (err?.message?.includes('Current status is CONFIRMED')) {
        // User is already confirmed, just switch to login mode
        console.log('[CONFIRM] User already confirmed, switching to login');
        setMode('login');
        setInfo('Email verified! Please log in with your credentials.');
        setError('');
        setLoading(false);
        return;
      }

      const msg = getAuthErrorMessage(err);
      if (err?.name === 'Unknown') {
        // Unknown error during auto-login - user might be confirmed but login failed
        console.warn('[AUTH] Unknown error during auto-login - user may be confirmed but sign-in failed');
        setMode('login');
        setInfo('Email verified! Please log in manually.');
        setError('');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const trimmedEmail = cleanEmail();
    if (!trimmedEmail) {
      setError('Please enter your email first.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await resendSignUpCode({ username: trimmedEmail });
      setInfo('New verification code sent to your email.');
    } catch (err: any) {
      console.error('Resend error:', JSON.stringify(err, null, 2));
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = cleanEmail();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await resetPassword({ username: trimmedEmail });
      setMode('resetConfirm');
      setInfo('Reset code sent to your email.');
    } catch (err: any) {
      console.error('Forgot password error:', JSON.stringify(err, null, 2));
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async () => {
    const trimmedEmail = cleanEmail();
    if (!trimmedEmail) {
      setError('Email is missing. Please go back and enter it.');
      return;
    }
    if (!confirmCode.trim() || !newPassword) {
      setError('Please enter the code and your new password.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await confirmResetPassword({
        username: trimmedEmail,
        confirmationCode: confirmCode.trim(),
        newPassword,
      });
      setPassword(newPassword);
      setMode('login');
      setInfo('Password reset successful! You can log in now.');
    } catch (err: any) {
      console.error('Reset confirm error:', JSON.stringify(err, null, 2));
      setError(getAuthErrorMessage(err));
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

  const switchMode = (newMode: AuthMode) => {
    setError('');
    setInfo('');
    setConfirmCode('');
    if (newMode === 'signup' || newMode === 'login') {
      setConfirmPassword('');
      setNewPassword('');
    }
    setMode(newMode);
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
              {(mode === 'login' || mode === 'signup' || mode === 'forgotPassword' || mode === 'confirm' || mode === 'resetConfirm') && (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={mode !== 'confirm' && mode !== 'resetConfirm'}
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
                  autoCorrect={false}
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
                  autoCorrect={false}
                  textContentType="newPassword"
                />
              )}

              {(mode === 'confirm' || mode === 'resetConfirm') && (
                <TextInput
                  style={styles.input}
                  placeholder="Verification Code"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={confirmCode}
                  onChangeText={setConfirmCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="oneTimeCode"
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
                  autoCorrect={false}
                  textContentType="newPassword"
                />
              )}

              {error !== '' && <Text style={styles.error}>{error}</Text>}
              {info !== '' && <Text style={styles.info}>{info}</Text>}

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

              {mode === 'confirm' && (
                <Pressable onPress={handleResendCode} disabled={loading}>
                  <Text style={styles.forgotText}>Didn&apos;t get a code? Resend</Text>
                </Pressable>
              )}

              {mode === 'login' && (
                <Pressable onPress={() => switchMode('forgotPassword')}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.toggleContainer}>
              {mode === 'login' && (
                <Pressable onPress={() => switchMode('signup')}>
                  <Text style={styles.toggleText}>
                    New here? <Text style={styles.toggleHighlight}>Sign up</Text>
                  </Text>
                </Pressable>
              )}
              {mode === 'signup' && (
                <Pressable onPress={() => switchMode('login')}>
                  <Text style={styles.toggleText}>
                    Already have an account? <Text style={styles.toggleHighlight}>Log in</Text>
                  </Text>
                </Pressable>
              )}
              {mode === 'confirm' && (
                <Pressable onPress={() => switchMode('login')}>
                  <Text style={styles.toggleText}>
                    Back to <Text style={styles.toggleHighlight}>Log in</Text>
                  </Text>
                </Pressable>
              )}
              {(mode === 'forgotPassword' || mode === 'resetConfirm') && (
                <Pressable onPress={() => switchMode('login')}>
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
  info: {
    color: '#4CD964',
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
