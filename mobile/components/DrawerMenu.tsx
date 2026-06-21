import { useRef, useState } from 'react';
import {
  Animated, Dimensions, StyleSheet, Text, TouchableOpacity,
  TouchableWithoutFeedback, View, ScrollView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.78, 300);

const MENU_ITEMS: { label: string; route: string; icon: string; grad: [string, string] }[] = [
  { label: 'Inicio',             route: '/',                  icon: '🏠', grad: ['#6366F1', '#8B5CF6'] },
  { label: 'Restaurante',        route: '/(tabs)/restaurant', icon: '🍽️', grad: ['#FF6B6B', '#FF8E53'] },
  { label: 'Hotel',              route: '/(tabs)/hotel',      icon: '🛏️', grad: ['#11998e', '#38ef7d'] },
  { label: 'Mis Reservas',       route: '/bookings',          icon: '📅', grad: ['#2193b0', '#6dd5ed'] },
  { label: 'Pagos',              route: '/(tabs)/payment',    icon: '💳', grad: ['#A78BFA', '#C084FC'] },
  { label: 'Perfil',             route: '/(tabs)/profile',    icon: '👤', grad: ['#34D399', '#059669'] },
  { label: 'Iniciar sesión',     route: '/(auth)/login',      icon: '🔑', grad: ['#0066FF', '#00C6FF'] },
];

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function DrawerMenu({ children, title }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  function openMenu() {
    setMenuOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }

  function closeMenu() {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: -DRAWER_WIDTH, useNativeDriver: true, damping: 20, stiffness: 200 }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setMenuOpen(false));
  }

  function navigate(route: string) {
    closeMenu();
    setTimeout(() => router.push(route as any), 260);
  }

  return (
    <View style={styles.root}>
      {/* Scaled content */}
      <View style={styles.pageWrap}>
        {/* Menu button row */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openMenu} activeOpacity={0.6} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>☰</Text>
          </TouchableOpacity>
          {title ? <Text style={styles.headerTitle}>{title}</Text> : <View />}
        </View>

        {/* Page content below header */}
        <View style={styles.content}>{children}</View>
      </View>

      {/* Overlay */}
      {menuOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
        </TouchableWithoutFeedback>
      )}

      {/* Drawer — only in DOM when open so it never blocks the menu button */}
      {menuOpen && <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient colors={['#0F0C29', '#302B63', '#1a1a2e']} style={styles.drawerGradient}>
          {/* Decorative circles */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.drawerGreeting}>Bienvenido</Text>
              <Text style={styles.drawerTitle}>Apps JL</Text>
            </View>
            <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => navigate(item.route)} activeOpacity={0.75}>
                <LinearGradient colors={item.grad} style={styles.menuIconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.menuIconEmoji}>{item.icon}</Text>
                </LinearGradient>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.drawerFooter}>Apps James Livengood</Text>
        </LinearGradient>
      </Animated.View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0C29' },

  pageWrap: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 14 : 54,
    paddingBottom: 14,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#0F0C29',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99,102,241,0.2)',
  },
  menuBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBtnText: {
    fontSize: 24,
    color: '#fff',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  content: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 10,
  },

  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  drawerGradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },

  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99,102,241,0.15)',
    top: -60,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(139,92,246,0.1)',
    bottom: 80,
    left: -40,
  },

  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  drawerGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  drawerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginTop: 4,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 14,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  menuIconEmoji: {
    fontSize: 18,
  },
  menuChevron: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.3)',
    lineHeight: 22,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  drawerFooter: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 12,
  },
});
