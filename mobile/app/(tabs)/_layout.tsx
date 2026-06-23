import { Text, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';

const TABS: { name: string; title: string; icon: string }[] = [
  { name: 'index', title: 'Inicio', icon: '🏠' },
  { name: 'restaurant', title: 'Restaurante', icon: '🍽️' },
  { name: 'hotel', title: 'Hotel', icon: '🛏️' },
  { name: 'profile', title: 'Perfil', icon: '👤' },
  { name: 'payment', title: 'Pagos', icon: '💳' },
  { name: 'contact', title: 'Contacto', icon: '💬' },
];

export default function TabLayout() {
  const { width } = useWindowDimensions();
  // Each tab gets width/5. If that's under 72px, we're on a narrow screen.
  const tabWidth = width / TABS.length;
  const iconSize = tabWidth < 72 ? 14 : tabWidth < 90 ? 17 : 20;
  const labelSize = tabWidth < 72 ? 9 : tabWidth < 90 ? 10 : 11;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarStyle: {
          backgroundColor: '#0F0C29',
          borderTopColor: 'rgba(99,102,241,0.2)',
          height: tabWidth < 72 ? 52 : 60,
        },
        tabBarLabelStyle: {
          fontSize: labelSize,
          marginBottom: 2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: iconSize, opacity: focused ? 1 : 0.5 }}>{tab.icon}</Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
