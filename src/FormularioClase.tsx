import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Clase } from './types';
import { useAlumnos } from './AlumnosContext';
import { cinturonPorId } from './cinturones';
import { SelectorFecha } from './SelectorFecha';

type Props = {
  inicial?: Partial<Clase>;
  onGuardar: (datos: Omit<Clase, 'id'>) => void;
  onEliminar?: () => void;
};

export function FormularioClase({ inicial, onGuardar, onEliminar }: Props) {
  const { alumnos } = useAlumnos();
  const [fecha, setFecha] = useState(
    inicial?.fecha ?? new Date().toISOString().slice(0, 10),
  );
  const [presentes, setPresentes] = useState<string[]>(inicial?.presentes ?? []);
  const [notas, setNotas] = useState(inicial?.notas ?? '');

  const togglePresente = (id: string) => {
    setPresentes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const marcarTodos = () => setPresentes(alumnos.map(a => a.id));
  const desmarcarTodos = () => setPresentes([]);

  const guardar = () => {
    onGuardar({ fecha, presentes, notas: notas.trim() });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Fecha</Text>
      <SelectorFecha value={fecha} onChange={setFecha} />

      <View style={styles.cabeceraLista}>
        <Text style={styles.label}>
          Asistencia ({presentes.length}/{alumnos.length})
        </Text>
        <View style={styles.acciones}>
          <Pressable onPress={marcarTodos} style={styles.botonMini}>
            <Text style={styles.botonMiniTexto}>Todos</Text>
          </Pressable>
          <Pressable onPress={desmarcarTodos} style={styles.botonMini}>
            <Text style={styles.botonMiniTexto}>Ninguno</Text>
          </Pressable>
        </View>
      </View>

      {alumnos.length === 0 ? (
        <Text style={styles.aviso}>No hay alumnos. Crea alumnos antes de registrar clases.</Text>
      ) : (
        <View style={{ gap: 6 }}>
          {alumnos.map(a => {
            const marcado = presentes.includes(a.id);
            const cint = cinturonPorId(a.cinturonId);
            return (
              <Pressable
                key={a.id}
                style={[styles.fila, marcado && styles.filaSel]}
                onPress={() => togglePresente(a.id)}
              >
                <View style={[styles.check, marcado && styles.checkSel]}>
                  {marcado && <Text style={styles.checkTexto}>✓</Text>}
                </View>
                <View style={[styles.swatch, { backgroundColor: cint?.color ?? '#ccc' }]} />
                <Text style={styles.nombre}>{a.nombre}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.label}>Notas</Text>
      <TextInput
        style={[styles.input, styles.notas]}
        value={notas}
        onChangeText={setNotas}
        placeholder="Tema de la clase, observaciones..."
        multiline
      />

      <Pressable style={styles.boton} onPress={guardar}>
        <Text style={styles.botonTexto}>Guardar</Text>
      </Pressable>

      {onEliminar && (
        <Pressable style={[styles.boton, styles.botonPeligro]} onPress={onEliminar}>
          <Text style={styles.botonTexto}>Eliminar clase</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, paddingBottom: 40 },
  label: { fontWeight: '600', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  notas: { minHeight: 80, textAlignVertical: 'top' },
  cabeceraLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  acciones: { flexDirection: 'row', gap: 6 },
  botonMini: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E7F0F9',
  },
  botonMiniTexto: { color: '#1F6FB5', fontWeight: '600', fontSize: 12 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  filaSel: { borderColor: '#1F6FB5', backgroundColor: '#E7F0F9' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkSel: { borderColor: '#1F6FB5', backgroundColor: '#1F6FB5' },
  checkTexto: { color: 'white', fontWeight: '700' },
  swatch: {
    width: 14,
    height: 24,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#0003',
  },
  nombre: { flex: 1, fontSize: 15 },
  aviso: { color: '#777', fontStyle: 'italic', padding: 12 },
  boton: {
    marginTop: 16,
    backgroundColor: '#1F6FB5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonPeligro: { backgroundColor: '#D7263D', marginTop: 8 },
  botonTexto: { color: 'white', fontWeight: '700', fontSize: 16 },
});
