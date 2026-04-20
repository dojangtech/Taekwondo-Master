import { useMemo, useState } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useClases } from '../../src/ClasesContext';
import {
  enRango, formatearFecha, rangoMesActual, rangoMesPasado, RangoFecha,
} from '../../src/fechas';

type Filtro = 'mes' | 'mesPasado' | 'todo';

const CHIPS: { id: Filtro; etiqueta: string }[] = [
  { id: 'mes', etiqueta: 'Este mes' },
  { id: 'mesPasado', etiqueta: 'Mes pasado' },
  { id: 'todo', etiqueta: 'Todo' },
];

const rangoDe = (filtro: Filtro): RangoFecha => {
  if (filtro === 'mes') return rangoMesActual();
  if (filtro === 'mesPasado') return rangoMesPasado();
  return null;
};

export default function ListaClases() {
  const { clases, cargando } = useClases();
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>('mes');

  const visibles = useMemo(() => {
    const rango = rangoDe(filtro);
    return clases
      .filter(c => enRango(c.fecha, rango))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [clases, filtro]);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const hayClases = clases.length > 0;

  return (
    <View style={styles.container}>
      {!hayClases ? (
        <View style={styles.center}>
          <Text style={styles.vacio}>Aún no hay clases</Text>
          <Text style={styles.vacioHint}>Pulsa "+ Nueva" para registrar una</Text>
        </View>
      ) : (
        <>
          <View style={styles.chipsFila}>
            {CHIPS.map(c => {
              const seleccionado = filtro === c.id;
              return (
                <Pressable
                  key={c.id}
                  style={[styles.chip, seleccionado && styles.chipSel]}
                  onPress={() => setFiltro(c.id)}
                >
                  <Text style={[styles.chipTexto, seleccionado && styles.chipTextoSel]}>
                    {c.etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.contador}>
            {visibles.length} de {clases.length} {clases.length === 1 ? 'clase' : 'clases'}
          </Text>

          {visibles.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.vacioHint}>Sin clases en este rango</Text>
            </View>
          ) : (
            <FlatList
              data={visibles}
              keyExtractor={c => c.id}
              contentContainerStyle={{ padding: 16, paddingTop: 0 }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() => router.push(`/clase/${item.id}`)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fecha}>{formatearFecha(item.fecha)}</Text>
                    <Text style={styles.subtitulo}>
                      {item.presentes.length} {item.presentes.length === 1 ? 'presente' : 'presentes'}
                    </Text>
                  </View>
                  <Text style={styles.flecha}>›</Text>
                </Pressable>
              )}
            />
          )}
        </>
      )}

      <Link href="/clase/nueva" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+ Nueva</Text>
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
  chipsFila: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipSel: { backgroundColor: '#1F6FB5', borderColor: '#1F6FB5' },
  chipTexto: { color: '#444', fontWeight: '600', fontSize: 13 },
  chipTextoSel: { color: 'white' },
  contador: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#777',
    fontSize: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 1,
  },
  fecha: { fontSize: 15, fontWeight: '600' },
  subtitulo: { color: '#666', marginTop: 2 },
  flecha: { fontSize: 22, color: '#bbb' },
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
