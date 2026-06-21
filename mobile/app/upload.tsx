import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import api from '../services/api';
import DrawerMenu from '../components/DrawerMenu';

export default function UploadScreen() {
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  async function pickMedia() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to upload');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    });
    if (!result.canceled) setAsset(result.assets[0]);
  }

  async function handleUpload() {
    if (!asset) return;
    setUploading(true);
    try {
      const filename = asset.uri.split('/').pop() ?? 'upload.jpg';
      const mimeType = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
      const formData = new FormData();
      formData.append('file', { uri: asset.uri, name: filename, type: mimeType } as any);
      formData.append('caption', caption);
      await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Uploaded!', 'Your media has been shared', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Upload Failed', 'Please check your connection and try again');
    } finally {
      setUploading(false);
    }
  }

  return (
    <DrawerMenu title="Upload Media">
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.picker} onPress={pickMedia} activeOpacity={0.8}>
        {asset ? (
          <Image source={{ uri: asset.uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ fontSize: 52 }}>☁️</Text>
            <Text style={styles.placeholderTitle}>Select Photo or Video</Text>
            <Text style={styles.placeholderSub}>Tap to open your gallery</Text>
          </View>
        )}
      </TouchableOpacity>

      {asset && (
        <TouchableOpacity style={styles.changeBtn} onPress={pickMedia}>
          <Text style={styles.changeBtnText}>Change media</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.captionInput}
        value={caption}
        onChangeText={setCaption}
        placeholder="Write a caption..."
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.uploadBtn, !asset && styles.uploadBtnDisabled]}
        onPress={handleUpload}
        disabled={!asset || uploading}
      >
        {uploading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.uploadBtnText}>Share</Text>}
      </TouchableOpacity>
    </ScrollView>
    </DrawerMenu>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  picker: { height: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f0f2f5', marginBottom: 12 },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  placeholderTitle: { fontSize: 17, fontWeight: '600', color: '#333' },
  placeholderSub: { fontSize: 14, color: '#888' },
  changeBtn: { alignItems: 'center', marginBottom: 12 },
  changeBtnText: { color: '#0066FF', fontSize: 14 },
  captionInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 15, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  uploadBtn: { backgroundColor: '#0066FF', borderRadius: 10, padding: 16, alignItems: 'center' },
  uploadBtnDisabled: { backgroundColor: '#bbb' },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
