import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { claimGuestAccount } from '../../services/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!email || !username || !password) { setError('Correo, usuario y contraseña son obligatorios'); return; }
    setError('');
    setLoading(true);
    try {
      await claimGuestAccount({ email: email.trim().toLowerCase(), username: username.trim(), full_name: fullName.trim(), password });
      router.replace('/');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Revisa tus datos e intenta de nuevo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0F0C29', '#1a1040', '#0d0d1a']} style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.inner}>
          <Text style={styles.brand}>Apps JL</Text>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Tus datos te siguen al registrarte</Text>

          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

          {[
            { label: 'Nombre completo', value: fullName, onChange: setFullName, placeholder: 'James Livengood' },
            { label: 'Usuario', value: username, onChange: setUsername, placeholder: 'james', caps: 'none' as const },
            { label: 'Correo electrónico', value: email, onChange: setEmail, placeholder: 'tu@correo.com', keyboard: 'email-address' as const, caps: 'none' as const },
            { label: 'Contraseña', value: password, onChange: setPassword, placeholder: '••••••••', secure: true },
          ].map((f) => (
            <View key={f.label} style={styles.inputWrap}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={f.value}
                onChangeText={f.onChange}
                placeholder={f.placeholder}
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry={f.secure}
                keyboardType={f.keyboard ?? 'default'}
                autoCapitalize={f.caps ?? 'words'}
                color="#fff"
              />
            </View>
          ))}

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Crear cuenta</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.linkWrap}>
            <Text style={styles.link}>¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 28 },
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
  linkWrap: { alignItems: 'center' },
  link: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  linkBold: { color: '#A78BFA', fontWeight: '700' },
});
