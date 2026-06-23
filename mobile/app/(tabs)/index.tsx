import { ScrollView, Text, TouchableOpacity, StyleSheet, View, Linking } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const CARDS: { title: string; subtitle: string; route: string; icon: string; grad: [string, string] }[] = [
  { title: 'Restaurant', subtitle: 'Book a table', route: '/(tabs)/restaurant', icon: '🍽️', grad: ['#FF6B6B', '#FF8E53'] },
  { title: 'Hotel', subtitle: 'Book a stay', route: '/(tabs)/hotel', icon: '🛏️', grad: ['#11998e', '#38ef7d'] },
  { title: 'My Bookings', subtitle: 'View history', route: '/bookings', icon: '📅', grad: ['#2193b0', '#6dd5ed'] },
  { title: 'Payment', subtitle: 'Make a payment', route: '/(tabs)/payment', icon: '💳', grad: ['#A78BFA', '#C084FC'] },
  { title: 'Profile', subtitle: 'Your account', route: '/(tabs)/profile', icon: '👤', grad: ['#34D399', '#059669'] },
];

export default function HomeScreen() {
  return (
    <LinearGradient colors={['#0F0C29', '#1a1040', '#0d0d1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Bienvenido</Text>
        <Text style={styles.title}>James Livengood</Text>
        <View style={styles.grid}>
          {CARDS.map((card) => (
            <TouchableOpacity key={card.title} onPress={() => router.push(card.route as any)} activeOpacity={0.85} style={styles.cardWrap}>
              <LinearGradient colors={card.grad} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.whatsappBtn} onPress={() => Linking.openURL('https://wa.me/524438608286')} activeOpacity={0.85}>
          <Text style={styles.whatsappIcon}>💬</Text>
          <Text style={styles.whatsappText}>¿Tienes una idea? Escríbeme por WhatsApp</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  cardWrap: { width: '47%' },
  card: { borderRadius: 18, padding: 20, gap: 6 },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginTop: 4 },
  cardSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#25D366',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },
  whatsappIcon: { fontSize: 24 },
  whatsappText: { fontSize: 15, fontWeight: '600', color: '#fff', flex: 1 },
});
