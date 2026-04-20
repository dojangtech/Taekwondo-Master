import { View, Text, Button, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Hola! 👋</Text>
      <Button title="Ir al detalle" onPress={() => router.push('/detalle')} />
      <Link href="/detalle" style={styles.link}>O usar un Link</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  link: { color: 'blue', marginTop: 12 },
});