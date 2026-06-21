import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import { User } from '../types';

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/me').then((res) => {
      setUser(res.data);
      setFullName(res.data.full_name ?? '');
      setBio(res.data.bio ?? '');
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch('/users/me', { full_name: fullName || undefined, bio: bio || undefined });
      Alert.alert('Saved', 'Profile updated');
    } catch {
      Alert.alert('Error', 'Could not save changes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Profile</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your full name" />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={bio}
        onChangeText={setBio}
        placeholder="Tell people about yourself"
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
      </TouchableOpacity>

      <Text style={styles.section}>Account</Text>
      <View style={styles.infoRow}><Text style={styles.infoKey}>Email</Text><Text style={styles.infoVal}>{user?.email}</Text></View>
      <View style={styles.infoRow}><Text style={styles.infoKey}>Username</Text><Text style={styles.infoVal}>@{user?.username}</Text></View>

      <Text style={styles.section}>App</Text>
      <View style={styles.infoRow}><Text style={styles.infoKey}>Version</Text><Text style={styles.infoVal}>1.0.0</Text></View>
      <View style={styles.infoRow}><Text style={styles.infoKey}>API</Text><Text style={styles.infoVal}>localhost:8000</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  section: { fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 28, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 16 },
  textarea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#0066FF', borderRadius: 10, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoKey: { fontSize: 14, color: '#555' },
  infoVal: { fontSize: 14, color: '#333', fontWeight: '500' },
});
