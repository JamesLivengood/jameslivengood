import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { createRestaurantBooking } from '../../services/bookings';
import DrawerMenu from '../../components/DrawerMenu';

const RESTAURANTS = ['El Gran Bistró', 'Parrilla Costera', 'Cocina Urbana', 'La Azotea'];
const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];

export default function RestaurantScreen() {
  const [restaurant, setRestaurant] = useState(RESTAURANTS[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleBook() {
    if (!selectedDate || !selectedTime) { Alert.alert('Faltan datos', 'Por favor selecciona una fecha y hora'); return; }
    setLoading(true);
    try {
      await createRestaurantBooking({ restaurant_name: restaurant, date: selectedDate, time: selectedTime, party_size: Math.max(1, parseInt(partySize) || 2), special_requests: notes });
      Alert.alert('🎉 ¡Reserva confirmada!', `${restaurant}\n${selectedDate} a las ${selectedTime} · ${partySize} personas`);
      setSelectedDate(''); setSelectedTime(''); setNotes('');
    } catch {
      Alert.alert('Error', 'No se pudo crear la reserva. ¿Está corriendo la API?');
    } finally { setLoading(false); }
  }

  return (
    <DrawerMenu title="Restaurante">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>✦ ELIGE EL LUGAR ✦</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {RESTAURANTS.map((r) => (
            <TouchableOpacity key={r} onPress={() => setRestaurant(r)} activeOpacity={0.8}>
              {restaurant === r ? (
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.chipActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.chipTextActive}>{r}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.chip}><Text style={styles.chipText}>{r}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>✦ ELIGE LA FECHA ✦</Text>
        <View style={styles.calendarWrap}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#6366F1' } } : {}}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              backgroundColor: 'transparent', calendarBackground: 'transparent',
              textSectionTitleColor: 'rgba(255,255,255,0.4)', dayTextColor: '#fff',
              todayTextColor: '#A78BFA', selectedDayBackgroundColor: '#6366F1',
              selectedDayTextColor: '#fff', monthTextColor: '#fff',
              arrowColor: '#A78BFA', textDisabledColor: 'rgba(255,255,255,0.2)',
            }}
          />
        </View>

        <Text style={styles.sectionLabel}>✦ ELIGE LA HORA ✦</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((t) => (
            <TouchableOpacity key={t} onPress={() => setSelectedTime(t)} activeOpacity={0.8}>
              {selectedTime === t ? (
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.timeSlotActive}>
                  <Text style={styles.timeTextActive}>{t}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.timeSlot}><Text style={styles.timeText}>{t}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>✦ NÚMERO DE PERSONAS ✦</Text>
        <TextInput style={styles.input} value={partySize} onChangeText={setPartySize} keyboardType="number-pad" placeholder="2" placeholderTextColor="rgba(255,255,255,0.3)" color="#fff" />

        <Text style={styles.sectionLabel}>✦ PETICIONES ESPECIALES ✦</Text>
        <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} placeholder="Alergias, silla para bebé, etc." placeholderTextColor="rgba(255,255,255,0.3)" multiline numberOfLines={3} color="#fff" />

        <TouchableOpacity onPress={handleBook} disabled={loading} activeOpacity={0.85} style={{ marginTop: 24 }}>
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
  sectionLabel: { fontSize: 11, color: '#A78BFA', letterSpacing: 3, textTransform: 'uppercase', marginTop: 24, marginBottom: 12 },
  calendarWrap: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 4 },
  chip: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  chipActive: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginRight: 8 },
  chipText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  chipTextActive: { fontSize: 13, color: '#fff', fontWeight: '700' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  timeSlotActive: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  timeText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  timeTextActive: { fontSize: 13, color: '#fff', fontWeight: '700' },
  input: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff' },
  textarea: { height: 80, textAlignVertical: 'top' },
  btn: { borderRadius: 14, padding: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
