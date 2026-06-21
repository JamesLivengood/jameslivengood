import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getRestaurantBookings, getHotelBookings, cancelRestaurantBooking, cancelHotelBooking } from '../services/bookings';
import { RestaurantBooking, HotelBooking } from '../types';
import DrawerMenu from '../components/DrawerMenu';

type Tab = 'restaurant' | 'hotel';

const STATUS: Record<string, { color: string; bg: string }> = {
  pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  confirmed: { color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
  cancelled: { color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
};

export default function BookingsScreen() {
  const [tab, setTab] = useState<Tab>('restaurant');
  const [restaurantBookings, setRestaurantBookings] = useState<RestaurantBooking[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRestaurantBookings(), getHotelBookings()])
      .then(([r, h]) => { setRestaurantBookings(r); setHotelBookings(h); })
      .catch(() => Alert.alert('Error', 'No se pudieron cargar las reservas'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: number) {
    try {
      if (tab === 'restaurant') { await cancelRestaurantBooking(id); setRestaurantBookings((p) => p.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b)); }
      else { await cancelHotelBooking(id); setHotelBookings((p) => p.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b)); }
    } catch { Alert.alert('Error', 'No se pudo cancelar la reserva'); }
  }

  if (loading) return (
    <LinearGradient colors={['#0F0C29', '#1a1040']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#A78BFA" />
    </LinearGradient>
  );

  const bookings = tab === 'restaurant' ? restaurantBookings : hotelBookings;

  return (
    <DrawerMenu title="Mis Reservas">
      <View style={styles.container}>
        <View style={styles.tabs}>
          {(['restaurant', 'hotel'] as Tab[]).map((t) => (
            <TouchableOpacity key={t} style={styles.tabBtn} onPress={() => setTab(t)} activeOpacity={0.8}>
              {tab === t ? (
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.tabActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={{ fontSize: 15 }}>{t === 'restaurant' ? '🍽️' : '🛏️'}</Text>
                  <Text style={styles.tabTextActive}>{t === 'restaurant' ? 'Restaurante' : 'Hotel'}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={{ fontSize: 15 }}>{t === 'restaurant' ? '🍽️' : '🛏️'}</Text>
                  <Text style={styles.tabText}>{t === 'restaurant' ? 'Restaurante' : 'Hotel'}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 48 }}>📅</Text>
              <Text style={styles.empty}>Aún no tienes reservas</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isR = tab === 'restaurant';
            const r = item as RestaurantBooking;
            const h = item as HotelBooking;
            const s = STATUS[item.status] ?? { color: '#999', bg: 'rgba(153,153,153,0.1)' };
            return (
              <View style={styles.card}>
                <LinearGradient colors={['rgba(99,102,241,0.15)', 'rgba(139,92,246,0.05)']} style={styles.cardGrad}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardIcon}>
                      <Text style={{ fontSize: 16 }}>{isR ? '🍽️' : '🛏️'}</Text>
                    </View>
                    <Text style={styles.cardName}>{isR ? r.restaurant_name : h.hotel_name}</Text>
                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.badgeText, { color: s.color }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetail}>
                    {isR ? `${r.date} at ${r.time} · ${r.party_size} guests` : `${h.check_in} → ${h.check_out} · ${h.room_type}`}
                  </Text>
                  {item.status !== 'cancelled' && (
                    <TouchableOpacity onPress={() => handleCancel(item.id)} style={styles.cancelBtn}>
                      <Text style={styles.cancelText}>Cancelar reserva</Text>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </View>
            );
          }}
        />
      </View>
    </DrawerMenu>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  tabs: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  tabBtn: { flex: 1 },
  tabActive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 12 },
  tabInactive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  tabTextActive: { fontSize: 14, color: '#fff', fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 15 },
  card: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
  cardGrad: { padding: 16, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.15)', justifyContent: 'center', alignItems: 'center' },
  cardName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#fff' },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardDetail: { fontSize: 13, color: 'rgba(255,255,255,0.5)', paddingLeft: 44 },
  cancelBtn: { alignSelf: 'flex-start', marginLeft: 44, marginTop: 4, paddingVertical: 4 },
  cancelText: { fontSize: 12, color: '#F87171', fontWeight: '600' },
});
