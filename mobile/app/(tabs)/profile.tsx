import { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions, TextInput, Modal, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api, { BASE_URL } from '../../services/api';
import * as storage from '../../services/storage';
import { logout } from '../../services/auth';
import { User, MediaFile } from '../../types';
import DrawerMenu from '../../components/DrawerMenu';

// Subtract 40px for the 20px horizontal padding on each side
const COL_SIZE = (Dimensions.get('window').width - 40) / 3;

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [caption, setCaption] = useState('');
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<MediaFile | null>(null);

  async function load() {
    try {
      const [userRes, mediaRes] = await Promise.all([api.get('/users/me'), api.get('/media/my')]);
      setUser(userRes.data);
      setMedia(mediaRes.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function pickMedia() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setUploadError('Permiso denegado — necesitamos acceso a tus fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8 });
    if (result.canceled) return;

    const picked = result.assets[0];
    setAsset(picked);
    setUploadError('');

    if (Platform.OS === 'web') {
      // Detect type from the data URI since expo doesn't set type/mimeType on web
      const uriMime = picked.uri.startsWith('data:') ? picked.uri.split(';')[0].slice(5) : null;
      const isVid = uriMime?.startsWith('video') ?? false;
      if (isVid) {
        const resp = await fetch(picked.uri);
        const blob = await resp.blob();
        // Re-wrap as video/mp4 — browsers can't play video/quicktime
        setVideoPreviewUrl(URL.createObjectURL(new Blob([blob], { type: 'video/mp4' })));
      } else {
        setVideoPreviewUrl(null);
      }
    }
  }

  async function handleUpload() {
    if (!asset) return;
    setUploading(true);
    setUploadError('');
    try {
      const uriMime = asset.uri.startsWith('data:') ? asset.uri.split(';')[0].slice(5) : null;
      const isVideo = asset.type === 'video' || asset.mimeType?.startsWith('video') || uriMime?.startsWith('video');
      const mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
      const ext = isVideo ? 'mp4' : 'jpg';
      const filename = `upload_${Date.now()}.${ext}`;
      const formData = new FormData();

      if (asset.uri.startsWith('blob:') || asset.uri.startsWith('data:')) {
        const resp = await fetch(asset.uri);
        const blob = await resp.blob();
        formData.append('file', new File([blob], filename, { type: mimeType }));
      } else {
        formData.append('file', { uri: asset.uri, name: filename, type: mimeType } as any);
      }
      formData.append('caption', caption);

      const token = await storage.getItem('auth_token');
      const res = await fetch(`${BASE_URL}/media/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const raw = err?.detail ?? `Error al subir (${res.status})`;
        const msg = Array.isArray(raw) ? raw.map((e: any) => e?.msg ?? JSON.stringify(e)).join(', ') : String(raw);
        setUploadError(msg);
        return;
      }
      setAsset(null);
      setVideoPreviewUrl(null);
      setCaption('');
      await load();
    } catch (e: any) {
      setUploadError(e?.message ?? 'Error al subir — revisa tu conexión e intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarUpload() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (result.canceled) return;
    const picked = result.assets[0];
    try {
      const filename = `avatar_${Date.now()}.jpg`;
      const formData = new FormData();
      if (picked.uri.startsWith('blob:') || picked.uri.startsWith('data:')) {
        const resp = await fetch(picked.uri);
        const blob = await resp.blob();
        formData.append('file', new File([blob], filename, { type: 'image/jpeg' }));
      } else {
        formData.append('file', { uri: picked.uri, name: filename, type: 'image/jpeg' } as any);
      }
      const token = await storage.getItem('auth_token');
      const res = await fetch(`${BASE_URL}/users/me/avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.ok) await load();
    } catch {}
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  if (loading) return (
    <LinearGradient colors={['#0F0C29', '#1a1040']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#A78BFA" />
    </LinearGradient>
  );

  return (
    <DrawerMenu title="Perfil">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Avatar + info */}
        <LinearGradient colors={['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.05)']} style={styles.profileCard}>
          <TouchableOpacity onPress={handleAvatarUpload} activeOpacity={0.8}>
            {user?.avatar_url ? (
              <Image source={{ uri: `${BASE_URL}${user.avatar_url}` }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.avatar}>
                <Text style={styles.avatarInitial}>{user?.username?.[0]?.toUpperCase() ?? '?'}</Text>
              </LinearGradient>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>@{user?.username}</Text>
          {!!user?.full_name && <Text style={styles.fullName}>{user.full_name}</Text>}
          {user?.is_guest && (
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>Cuenta de invitado</Text>
            </View>
          )}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{media.length}</Text>
              <Text style={styles.statLabel}>Publicaciones</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Upload section */}
        <Text style={styles.sectionLabel}>✦ SUBIR FOTO O VIDEO ✦</Text>

        <TouchableOpacity onPress={pickMedia} activeOpacity={0.85} style={styles.uploadPickerWrap}>
          <LinearGradient colors={asset ? ['#1a1a2e', '#0d0d1a'] : ['rgba(99,102,241,0.15)', 'rgba(139,92,246,0.08)']} style={styles.uploadPicker}>
            {asset ? (
              videoPreviewUrl ? (
                <video
                  key={videoPreviewUrl}
                  src={videoPreviewUrl}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' } as any}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <Image source={{ uri: asset.uri }} style={styles.uploadPreview} resizeMode="cover" />
              )
            ) : (
              <View style={styles.uploadPlaceholder}>
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.uploadIconCircle}>
                  <Text style={{ fontSize: 28 }}>☁️</Text>
                </LinearGradient>
                <Text style={styles.uploadPlaceholderTitle}>Toca para seleccionar</Text>
                <Text style={styles.uploadPlaceholderSub}>Fotos o videos de tu galería</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {asset && (
          <TouchableOpacity onPress={pickMedia} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Cambiar selección</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.captionInput}
          value={caption}
          onChangeText={setCaption}
          placeholder="Escribe un pie de foto..."
          placeholderTextColor="rgba(255,255,255,0.25)"
          multiline
          numberOfLines={2}
          color="#fff"
        />

        {!!uploadError && (
          <View style={styles.errorBox}>
            <Text style={{ fontSize: 14 }}>⚠️</Text>
            <Text style={styles.errorText}>{uploadError}</Text>
          </View>
        )}

        <TouchableOpacity onPress={handleUpload} disabled={!asset || uploading} activeOpacity={0.85}>
          <LinearGradient
            colors={asset ? ['#6366F1', '#8B5CF6'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']}
            style={styles.uploadBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            {uploading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={{ fontSize: 18 }}>📤</Text>
                  <Text style={[styles.uploadBtnText, !asset && { color: 'rgba(255,255,255,0.2)' }]}>Publicar en perfil</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>

        {/* Media grid */}
        {media.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>✦ TUS PUBLICACIONES ✦</Text>
            <View style={styles.grid}>
              {[...media].reverse().map((item) => (
                <TouchableOpacity key={item.id} style={styles.gridCell} onPress={() => setLightboxItem(item)} activeOpacity={0.85}>
                  {item.file_type === 'image'
                    ? <Image source={{ uri: `${BASE_URL}${item.file_url}` }} style={styles.gridImage} />
                    : Platform.OS === 'web'
                      ? <video
                          src={`${BASE_URL}${item.file_url}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' } as any}
                          muted
                          preload="metadata"
                        />
                      : <View style={[styles.gridImage, styles.videoCell]}>
                          <Text style={{ fontSize: 32 }}>▶️</Text>
                        </View>
                  }
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Sign out */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
          <Text style={{ fontSize: 16 }}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lightbox modal */}
      <Modal visible={!!lightboxItem} transparent animationType="none" onRequestClose={() => setLightboxItem(null)}>
        <View style={styles.lightboxBg}>
          <SafeAreaView style={styles.lightboxInner}>
            <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxItem(null)}>
              <Text style={styles.lightboxCloseText}>✕</Text>
            </TouchableOpacity>
            {lightboxItem?.file_type === 'image' ? (
              <Image
                source={{ uri: `${BASE_URL}${lightboxItem.file_url}` }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            ) : lightboxItem && Platform.OS === 'web' ? (
              <video
                key={lightboxItem.file_url}
                src={`${BASE_URL}${lightboxItem.file_url}`}
                controls
                autoPlay
                playsInline
                style={{ maxWidth: '100%', maxHeight: '75vh' } as any}
              />
            ) : (
              <View style={styles.lightboxVideo}>
                <Text style={{ fontSize: 64 }}>▶️</Text>
                <Text style={styles.lightboxVideoText}>Toca para reproducir</Text>
              </View>
            )}
            {!!lightboxItem?.caption && (
              <Text style={styles.lightboxCaption}>{lightboxItem.caption}</Text>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </DrawerMenu>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  content: { padding: 20, paddingBottom: 48 },

  profileCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12, justifyContent: 'center', alignItems: 'center' },
  avatarEditBadge: { position: 'absolute', bottom: 10, right: -4, backgroundColor: '#6366F1', borderRadius: 10, width: 22, height: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0F0C29' },
  avatarInitial: { color: '#fff', fontSize: 36, fontWeight: '900' },
  username: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 2 },
  fullName: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  guestBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', marginBottom: 8 },
  guestBadgeText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginTop: 8 },
  stat: { alignItems: 'center', paddingHorizontal: 20 },
  statNumber: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' },

  sectionLabel: { fontSize: 11, color: '#A78BFA', letterSpacing: 3, textTransform: 'uppercase', marginTop: 28, marginBottom: 14 },

  uploadPickerWrap: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' },
  uploadPicker: { height: 200, justifyContent: 'center', alignItems: 'center' },
  uploadPreview: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center', gap: 12 },
  uploadIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  uploadPlaceholderTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  uploadPlaceholderSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

  changeBtn: { alignItems: 'center', paddingVertical: 8 },
  changeBtnText: { color: '#A78BFA', fontSize: 13, fontWeight: '600' },

  captionInput: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, fontSize: 15, minHeight: 60, textAlignVertical: 'top', marginTop: 12 },

  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginTop: 10 },
  errorText: { flex: 1, color: '#FCA5A5', fontSize: 13, lineHeight: 18 },

  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, padding: 18, marginTop: 12 },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 12, overflow: 'hidden' },
  gridCell: { width: COL_SIZE, height: COL_SIZE },
  gridImage: { flex: 1, margin: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  videoCell: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(99,102,241,0.2)' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.08)' },
  logoutText: { color: '#F87171', fontSize: 15, fontWeight: '700' },

  lightboxBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  lightboxInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lightboxClose: { position: 'absolute', top: 16, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  lightboxCloseText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  lightboxImage: { width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.75 },
  lightboxVideo: { alignItems: 'center', gap: 16 },
  lightboxVideoText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  lightboxCaption: { color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center', paddingHorizontal: 32, marginTop: 20 },
});
