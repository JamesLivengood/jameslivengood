import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createGuestAccount, getStoredToken } from '../services/auth';
import DrawerMenu from '../components/DrawerMenu';

const { width, height } = Dimensions.get('window');

function FloatingOrb({ size, x, y, color, delay }: { size: number; x: number; y: number; color: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 3000 + delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.35, 0.15] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    />
  );
}

function GlowText({ children, style }: { children: string; style?: any }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return <Text style={style}>{children}</Text>;
}

const ORBS = [
  { size: 180, x: -60, y: 80, color: '#6366F1', delay: 0 },
  { size: 120, x: width - 80, y: 160, color: '#8B5CF6', delay: 600 },
  { size: 200, x: width * 0.3, y: height * 0.6, color: '#302B63', delay: 1200 },
  { size: 90, x: 40, y: height * 0.5, color: '#A78BFA', delay: 400 },
  { size: 140, x: width * 0.6, y: 40, color: '#4F46E5', delay: 900 },
];

export default function WelcomeScreen() {
  const [ready, setReady] = useState(false);
  const titleAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function bootstrap() {
      const token = await getStoredToken();
      if (!token) await createGuestAccount();
      setReady(true);
      Animated.stagger(200, [
        Animated.spring(titleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 120 }),
        Animated.spring(taglineAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 100 }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1, duration: 2500, useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 0, duration: 2500, useNativeDriver: true }),
        ])
      ).start();
    }
    bootstrap();
  }, []);

  if (!ready) {
    return (
      <LinearGradient colors={['#0F0C29', '#302B63', '#24243e']} style={styles.loading}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </LinearGradient>
    );
  }

  const titleTranslateY = titleAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const taglineTranslateY = taglineAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <DrawerMenu>
      <LinearGradient colors={['#0F0C29', '#1a1040', '#0d0d1a']} style={styles.hero} pointerEvents="none">
        {ORBS.map((orb, i) => <FloatingOrb key={i} {...orb} />)}

        <View style={styles.gridOverlay}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={[styles.gridLine, { top: (height / 8) * i }]} />
          ))}
        </View>

        <Animated.View style={[styles.titleWrap, { opacity: titleAnim, transform: [{ translateY: titleTranslateY }] }]}>
          <Text style={styles.brandSub}>✦ BIENVENIDO ✦</Text>

          <Animated.View style={{ opacity: shimmerOpacity }}>
            <Text style={styles.brandLine1}>Apps</Text>
            <Text style={styles.brandLine2}>James</Text>
            <Text style={styles.brandLine3}>Livengood</Text>
          </Animated.View>

          <View style={styles.glowBar} />
        </Animated.View>

        <Animated.View style={[styles.taglineWrap, { opacity: taglineAnim, transform: [{ translateY: taglineTranslateY }] }]}>
          <Text style={styles.tagline}>
            Abre el menú para ver los tipos de características que tu app podría tener.
          </Text>
          <Text style={styles.taglineBold}>
            ¡Podemos hacer que tu app tenga casi cualquier cosa!
          </Text>
        </Animated.View>

      </LinearGradient>
    </DrawerMenu>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    overflow: 'hidden',
  },

  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },

  titleWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandSub: {
    fontSize: 11,
    color: '#A78BFA',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  brandLine1: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 64,
    letterSpacing: -2,
    textShadowColor: 'rgba(139,92,246,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  brandLine2: {
    fontSize: 64,
    fontWeight: '900',
    color: '#A78BFA',
    textAlign: 'center',
    lineHeight: 64,
    letterSpacing: -2,
    textShadowColor: 'rgba(167,139,250,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  brandLine3: {
    fontSize: 38,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  glowBar: {
    width: 80,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#A78BFA',
    marginTop: 20,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },

  taglineWrap: {
    alignItems: 'center',
    maxWidth: 300,
    gap: 10,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },
  taglineBold: {
    fontSize: 15,
    color: 'rgba(167,139,250,0.85)',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },

});
