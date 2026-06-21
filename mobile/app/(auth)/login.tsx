import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { login } from '../../services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) { setError('Por favor llena todos los campos'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0F0C29', '#1a1040', '#0d0d1a']} style={styles.root}>
      <KeyboardAvoidingView style={styles.inner} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.brand}>Apps JL</Text>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

        {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="rgba(255,255,255,0.3)" placeholder="tu@correo.com" />
        </View>
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="rgba(255,255,255,0.3)" placeholder="••••••••" />
        </View>

        <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Iniciar sesión</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkWrap}>
          <Text style={styles.link}>¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.linkWrap}>
          <Text style={styles.link}>← Volver al inicio</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  brand: { fontSize: 13, color: '#A78BFA', letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 32 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#FCA5A5', fontSize: 14, textAlign: 'center' },
  inputWrap: { marginBottom: 16 },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff' },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  linkWrap: { alignItems: 'center', marginBottom: 12 },
  link: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  linkBold: { color: '#A78BFA', fontWeight: '700' },
});
