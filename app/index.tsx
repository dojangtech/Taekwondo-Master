import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAlumnos } from '../src/AlumnosContext';
import { cinturonPorId } from '../src/cinturones';

export default function ListaAlumnos() {
  const { alumnos, cargando } = useAlumnos();
  const router = useRouter();

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {alumnos.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.vacio}>Aún no hay alumnos</Text>
          <Text style={styles.vacioHint}>Pulsa "+ Nuevo" para empezar</Text>
        </View>
      ) : (
        <FlatList
          data={alumnos}
          keyExtractor={a => a.id}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const cint = cinturonPorId(item.cinturonId);
            return (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/alumno/${item.id}`)}
              >
                <View style={[styles.cinturon, { backgroundColor: cint?.color ?? '#ccc' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{item.nombre}</Text>
                  <Text style={styles.subtitulo}>{cint?.nombre ?? 'Sin cinturón'}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <Link href="/alumno/nuevo" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+ Nuevo</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  vacio: { fontSize: 18, fontWeight: '600', color: '#444' },
  vacioHint: { marginTop: 6, color: '#777' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    gap: 12,
    elevation: 1,
  },
  cinturon: {
    width: 10,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0002',
  },
  nombre: { fontSize: 16, fontWeight: '600' },
  subtitulo: { color: '#666', marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    backgroundColor: '#1F6FB5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3,
  },
  fabText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
