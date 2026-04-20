import { useMemo, useState } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAlumnos } from '../../src/AlumnosContext';
import { cinturonPorId } from '../../src/cinturones';

export default function ListaAlumnos() {
  const { alumnos, cargando } = useAlumnos();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtrados = q
      ? alumnos.filter(a => a.nombre.toLowerCase().includes(q))
      : alumnos;

    return [...filtrados].sort((a, b) => {
      const oa = cinturonPorId(a.cinturonId)?.orden ?? 0;
      const ob = cinturonPorId(b.cinturonId)?.orden ?? 0;
      if (oa !== ob) return ob - oa;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [alumnos, query]);

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
        <>
          <View style={styles.buscadorContenedor}>
            <TextInput
              style={styles.buscador}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por nombre..."
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} style={styles.limpiar}>
                <Text style={styles.limpiarTexto}>×</Text>
              </Pressable>
            )}
          </View>

          {visibles.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.vacioHint}>Sin resultados para "{query}"</Text>
            </View>
          ) : (
            <FlatList
              data={visibles}
              keyExtractor={a => a.id}
              contentContainerStyle={{ padding: 16, paddingTop: 0 }}
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
        </>
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
  buscadorContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  buscador: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  limpiar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  limpiarTexto: { fontSize: 18, color: '#555', lineHeight: 20 },
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
