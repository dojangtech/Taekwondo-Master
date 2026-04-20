import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#1F6FB5' }}>
      <Tabs.Screen name="index" options={{ title: 'Alumnos' }} />
      <Tabs.Screen name="clases" options={{ title: 'Clases' }} />
    </Tabs>
  );
}
