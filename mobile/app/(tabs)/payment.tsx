import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';
import { processPayment } from '../../services/payments';
import DrawerMenu from '../../components/DrawerMenu';

const PRESETS = [
  { label: 'Cuenta del restaurante', amount: 85.50, description: 'Cena para dos', color: '#FF6B6B' },
  { label: 'Estadía en hotel', amount: 249.00, description: '1 noche habitación Deluxe', color: '#4ECDC4' },
  { label: 'Servicio al cuarto', amount: 42.00, description: 'Comida en habitación', color: '#A78BFA' },
];

interface Payment {
  id: number;
  amount: number;
  description: string;
  status: string;
  mock_card_last4: string;
  created_at: string;
}

export default function PaymentScreen() {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/26');
  const [cvv, setCvv] = useState('123');
  const [amount, setAmount] = useState('85.50');
  const [description, setDescription] = useState('Cena para dos');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  async function loadPayments() {
    try {
      const res = await api.get('/payments/');
      setPayments(res.data);
    } catch {}
  }

  useFocusEffect(useCallback(() => { loadPayments(); }, []));

  async function handlePay() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { Alert.alert('Monto inválido', 'Por favor ingresa un monto válido'); return; }
    setLoading(true);
    try {
      const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';
      await processPayment({ amount: amt, description, mock_card_last4: last4 });
      setSuccess(true);
      await loadPayments();
    } catch { Alert.alert('Pago fallido', 'Por favor intenta de nuevo'); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <DrawerMenu title="Pagos">
        <LinearGradient colors={['#0d0d1a', '#1a1040']} style={styles.successContainer}>
          <LinearGradient colors={['#34D399', '#059669']} style={styles.successIcon}>
            <Text style={{ fontSize: 48 }}>✓</Text>
          </LinearGradient>
          <Text style={styles.successTitle}>Pago exitoso</Text>
          <Text style={styles.successAmount}>${parseFloat(amount).toFixed(2)}</Text>
          <Text style={styles.successDesc}>{description}</Text>
          <TouchableOpacity onPress={() => setSuccess(false)} activeOpacity={0.85}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Hacer otro pago</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </DrawerMenu>
    );
  }

  return (
    <DrawerMenu title="Pagos">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.testBadge}>
          <Text style={styles.testBadgeText}>⚡ MODO PRUEBA — No se mueve dinero real</Text>
        </View>

        <Text style={styles.sectionLabel}>✦ SELECCIÓN RÁPIDA ✦</Text>
        {PRESETS.map((p) => (
          <TouchableOpacity key={p.label} style={[styles.preset, amount === p.amount.toFixed(2) && styles.presetActive]}
            onPress={() => { setAmount(p.amount.toFixed(2)); setDescription(p.description); }} activeOpacity={0.8}>
            <View style={[styles.presetDot, { backgroundColor: p.color }]} />
            <Text style={styles.presetLabel}>{p.label}</Text>
            <Text style={styles.presetAmount}>${p.amount.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>✦ DATOS DE LA TARJETA ✦</Text>
        <View style={styles.cardBox}>
          <Text style={styles.cardFieldLabel}>Número de tarjeta</Text>
          <TextInput style={styles.cardInput} value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" maxLength={19} color="#fff" placeholderTextColor="rgba(255,255,255,0.3)" />
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardFieldLabel}>Vencimiento</Text>
              <TextInput style={styles.cardInput} value={expiry} onChangeText={setExpiry} placeholder="MM/AA" color="#fff" placeholderTextColor="rgba(255,255,255,0.3)" />
            </View>
            <View style={{ width: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardFieldLabel}>CVV</Text>
              <TextInput style={styles.cardInput} value={cvv} onChangeText={setCvv} keyboardType="number-pad" maxLength={3} secureTextEntry color="#fff" placeholderTextColor="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>✦ MONTO (USD) ✦</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" color="#fff" placeholderTextColor="rgba(255,255,255,0.3)" />

        <Text style={styles.sectionLabel}>✦ DESCRIPCIÓN ✦</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="¿Para qué es este pago?" color="#fff" placeholderTextColor="rgba(255,255,255,0.3)" />

        <TouchableOpacity onPress={handlePay} disabled={loading} activeOpacity={0.85} style={{ marginTop: 28 }}>
          <LinearGradient colors={['#A78BFA', '#6366F1']} style={styles.payBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pagar ${parseFloat(amount || '0').toFixed(2)}</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {payments.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>✦ HISTORIAL DE PAGOS ✦</Text>
            {[...payments].reverse().map((p) => (
              <View key={p.id} style={styles.historyCard}>
                <LinearGradient colors={['rgba(99,102,241,0.12)', 'rgba(139,92,246,0.04)']} style={styles.historyGrad}>
                  <View style={styles.historyTop}>
                    <View style={styles.historyIconWrap}>
                      <Text style={{ fontSize: 16 }}>💳</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDesc}>{p.description}</Text>
                      <Text style={styles.historyCard4}>•••• {p.mock_card_last4}</Text>
                    </View>
                    <Text style={styles.historyAmount}>${p.amount.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(p.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </DrawerMenu>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  content: { padding: 20, paddingBottom: 48 },
  testBadge: { backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)', marginBottom: 4 },
  testBadgeText: { fontSize: 12, color: '#A78BFA', textAlign: 'center', fontWeight: '600', letterSpacing: 0.5 },
  sectionLabel: { fontSize: 11, color: '#A78BFA', letterSpacing: 3, textTransform: 'uppercase', marginTop: 24, marginBottom: 12 },
  preset: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.04)', gap: 12 },
  presetActive: { borderColor: '#A78BFA', backgroundColor: 'rgba(167,139,250,0.1)' },
  presetDot: { width: 10, height: 10, borderRadius: 5 },
  presetLabel: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  presetAmount: { fontSize: 15, fontWeight: '800', color: '#A78BFA' },
  cardBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardFieldLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  cardInput: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)', paddingVertical: 8, fontSize: 16, marginBottom: 14, color: '#fff' },
  cardRow: { flexDirection: 'row' },
  input: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff' },
  payBtn: { borderRadius: 14, padding: 18, alignItems: 'center' },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8 },
  successAmount: { fontSize: 52, fontWeight: '900', color: '#34D399', marginBottom: 8 },
  successDesc: { fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 48 },
  doneBtn: { borderRadius: 14, padding: 16, paddingHorizontal: 36 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historyCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)', marginBottom: 10 },
  historyGrad: { padding: 14, gap: 8 },
  historyTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.15)', justifyContent: 'center', alignItems: 'center' },
  historyDesc: { fontSize: 14, fontWeight: '700', color: '#fff' },
  historyCard4: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  historyAmount: { fontSize: 16, fontWeight: '900', color: '#34D399' },
  historyDate: { fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.3 },
});
