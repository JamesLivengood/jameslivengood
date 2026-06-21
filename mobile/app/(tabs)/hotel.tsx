import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DateData } from 'react-native-calendars';
import { createHotelBooking } from '../../services/bookings';
import DrawerMenu from '../../components/DrawerMenu';

const HOTELS = ['Hotel Gran Palacio', 'Resort Vista al Mar', 'Cabaña en la Montaña', 'Posada Centro'];
const ROOM_TYPES = ['Estándar', 'Deluxe', 'Suite', 'Penthouse'];

export default function HotelScreen() {
  const [hotel, setHotel] = useState(HOTELS[0]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selecting, setSelecting] = useState<'check_in' | 'check_out'>('check_in');
  const [roomType, setRoomType] = useState(ROOM_TYPES[0]);
  const [guests, setGuests] = useState('2');
  const [loading, setLoading] = useState(false);

  function onDayPress(day: DateData) {
    if (selecting === 'check_in') { setCheckIn(day.dateString); setCheckOut(''); setSelecting('check_out'); }
    else { day.dateString > checkIn ? setCheckOut(day.dateString) : Alert.alert('Fecha inválida', 'La salida debe ser después de la llegada'); }
  }

  const markedDates: Record<string, any> = {};
  if (checkIn) markedDates[checkIn] = { startingDay: true, color: '#6366F1', textColor: '#fff' };
  if (checkOut) markedDates[checkOut] = { endingDay: true, color: '#6366F1', textColor: '#fff' };

  async function handleBook() {
    if (!checkIn || !checkOut) { Alert.alert('Faltan datos', 'Por favor selecciona fechas de llegada y salida'); return; }
    setLoading(true);
    try {
      await createHotelBooking({ hotel_name: hotel, check_in: checkIn, check_out: checkOut, guests: Math.max(1, parseInt(guests) || 2), room_type: roomType });
      Alert.alert('🎉 ¡Reserva confirmada!', `${roomType} en ${hotel}\n${checkIn} → ${checkOut}`);
      setCheckIn(''); setCheckOut(''); setSelecting('check_in');
    } catch { Alert.alert('Error', 'No se pudo crear la reserva. ¿Está corriendo la API?'); }
    finally { setLoading(false); }
  }

  return (
    <DrawerMenu title="Hotel">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>✦ ELIGE EL HOTEL ✦</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {HOTELS.map((h) => (
            <TouchableOpacity key={h} onPress={() => setHotel(h)} activeOpacity={0.8}>
              {hotel === h ? (
                <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.chipActive}>
                  <Text style={styles.chipTextActive}>{h}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.chip}><Text style={styles.chipText}>{h}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>✦ {selecting === 'check_in' ? 'FECHA DE LLEGADA' : 'FECHA DE SALIDA'} ✦</Text>
        <View style={styles.dateRow}>
          {[{ label: 'Llegada', val: checkIn, key: 'check_in' as const }, { label: 'Salida', val: checkOut, key: 'check_out' as const }].map((d) => (
            <TouchableOpacity key={d.key} style={[styles.dateBtn, selecting === d.key && styles.dateBtnActive]} onPress={() => setSelecting(d.key)}>
              <Text style={styles.dateBtnLabel}>{d.label}</Text>
              <Text style={styles.dateBtnVal}>{d.val || '—'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.calendarWrap}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType="period"
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              backgroundColor: 'transparent', calendarBackground: 'transparent',
              textSectionTitleColor: 'rgba(255,255,255,0.4)', dayTextColor: '#fff',
              todayTextColor: '#38ef7d', monthTextColor: '#fff',
              arrowColor: '#38ef7d', textDisabledColor: 'rgba(255,255,255,0.2)',
            }}
          />
        </View>

        <Text style={styles.sectionLabel}>✦ TIPO DE HABITACIÓN ✦</Text>
        <View style={styles.chipRow}>
          {ROOM_TYPES.map((r) => (
            <TouchableOpacity key={r} onPress={() => setRoomType(r)} activeOpacity={0.8}>
              {roomType === r ? (
                <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.chipActive}>
                  <Text style={styles.chipTextActive}>{r}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.chip}><Text style={styles.chipText}>{r}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>✦ HUÉSPEDES ✦</Text>
        <TextInput style={styles.input} value={guests} onChangeText={setGuests} keyboardType="number-pad" placeholder="2" placeholderTextColor="rgba(255,255,255,0.3)" color="#fff" />

        <TouchableOpacity onPress={handleBook} disabled={loading} activeOpacity={0.85} style={{ marginTop: 24 }}>
          <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirmar reserva</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </DrawerMenu>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  content: { padding: 20, paddingBottom: 48 },
  sectionLabel: { fontSize: 11, color: '#38ef7d', letterSpacing: 3, textTransform: 'uppercase', marginTop: 24, marginBottom: 12 },
  calendarWrap: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginRight: 8, marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
  chipActive: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginRight: 8, marginBottom: 4 },
  chipText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  chipTextActive: { fontSize: 13, color: '#fff', fontWeight: '700' },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  dateBtn: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, backgroundColor: 'rgba(255,255,255,0.05)' },
  dateBtnActive: { borderColor: '#38ef7d', backgroundColor: 'rgba(56,239,125,0.08)' },
  dateBtnLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 4 },
  dateBtnVal: { fontSize: 14, color: '#fff', fontWeight: '600' },
  input: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff' },
  btn: { borderRadius: 14, padding: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
