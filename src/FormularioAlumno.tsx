import { useState, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Alumno } from './types';
import { CINTURONES } from './cinturones';
import { SelectorFecha } from './SelectorFecha';

type Props = {
  inicial?: Partial<Alumno>;
  onGuardar: (datos: Omit<Alumno, 'id'>) => void;
  onEliminar?: () => void;
  encabezado?: ReactNode;
};

export function FormularioAlumno({ inicial, onGuardar, onEliminar, encabezado }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [cinturonId, setCinturonId] = useState(inicial?.cinturonId ?? CINTURONES[0].id);
  const [fechaIngreso, setFechaIngreso] = useState(
    inicial?.fechaIngreso ?? new Date().toISOString().slice(0, 10),
  );
  const [notas, setNotas] = useState(inicial?.notas ?? '');

  const puedeGuardar = nombre.trim().length > 0;

  const guardar = () => {
    if (!puedeGuardar) return;
    onGuardar({ nombre: nombre.trim(), cinturonId, fechaIngreso, notas: notas.trim() });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {encabezado}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre y apellidos"
        autoFocus={!inicial}
      />

      <Text style={styles.label}>Fecha de ingreso</Text>
      <SelectorFecha value={fechaIngreso} onChange={setFechaIngreso} />

      <Text style={styles.label}>Cinturón</Text>
      <View style={styles.lista}>
        {CINTURONES.map(c => {
          const seleccionado = c.id === cinturonId;
          return (
            <Pressable
              key={c.id}
              style={[styles.opcion, seleccionado && styles.opcionSel]}
              onPress={() => setCinturonId(c.id)}
            >
              <View style={[styles.swatch, { backgroundColor: c.color }]} />
              <Text style={[styles.opcionTexto, seleccionado && styles.opcionTextoSel]}>
                {c.nombre}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Notas</Text>
      <TextInput
        style={[styles.input, styles.notas]}
        value={notas}
        onChangeText={setNotas}
        placeholder="Lesiones, observaciones, etc."
        multiline
      />

      <Pressable
        style={[styles.boton, !puedeGuardar && styles.botonDisabled]}
        onPress={guardar}
        disabled={!puedeGuardar}
      >
        <Text style={styles.botonTexto}>Guardar</Text>
      </Pressable>

      {onEliminar && (
        <Pressable style={[styles.boton, styles.botonPeligro]} onPress={onEliminar}>
          <Text style={styles.botonTexto}>Eliminar alumno</Text>
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
  lista: { gap: 6 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  opcionSel: { borderColor: '#1F6FB5', backgroundColor: '#E7F0F9' },
  opcionTexto: { color: '#333' },
  opcionTextoSel: { color: '#1F6FB5', fontWeight: '600' },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0003',
  },
  boton: {
    marginTop: 16,
    backgroundColor: '#1F6FB5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonDisabled: { backgroundColor: '#9bb6cf' },
  botonPeligro: { backgroundColor: '#D7263D', marginTop: 8 },
  botonTexto: { color: 'white', fontWeight: '700', fontSize: 16 },
});
