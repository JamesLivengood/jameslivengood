import { ScrollView, Text, TouchableOpacity, StyleSheet, View, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ContactScreen() {
  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/524438608286');
  };

  const openEmail = () => {
    Linking.openURL('mailto:james.livengood@gmail.com');
  };

  return (
    <LinearGradient colors={['#0F0C29', '#1a1040', '#0d0d1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Hablemos</Text>
        <Text style={styles.title}>¿Tienes una idea?</Text>
        <Text style={styles.subtitle}>
          Me encantaría escucharte. Ya sea un proyecto nuevo, una colaboración o simplemente una pregunta — escríbeme.
        </Text>

        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoEmoji}>📸</Text>
          <Text style={styles.photoLabel}>Foto próximamente</Text>
        </View>

        <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp} activeOpacity={0.85}>
          <Text style={styles.whatsappIcon}>💬</Text>
          <View>
            <Text style={styles.btnLabel}>WhatsApp</Text>
            <Text style={styles.btnSub}>+52 443 860 8286</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emailBtn} onPress={openEmail} activeOpacity={0.85}>
          <Text style={styles.emailIcon}>✉️</Text>
          <View>
            <Text style={styles.btnLabel}>Correo electrónico</Text>
            <Text style={styles.btnSub}>james.livengood@gmail.com</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  eyebrow: { fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '900', color: '#fff', marginBottom: 12 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 22, marginBottom: 36 },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.3)',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  photoEmoji: { fontSize: 36 },
  photoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#25D366',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  whatsappIcon: { fontSize: 28 },
  emailIcon: { fontSize: 28 },
  btnLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});
