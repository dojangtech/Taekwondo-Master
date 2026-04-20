import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormularioAlumno } from '../../src/FormularioAlumno';
import { useAlumnos } from '../../src/AlumnosContext';
import { useClases } from '../../src/ClasesContext';
import { confirmar } from '../../src/confirmar';

export default function DetalleAlumno() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { obtener, actualizar, eliminar } = useAlumnos();
  const { clases, clasesDeAlumno } = useClases();

  const alumno = obtener(id);

  if (!alumno) {
    return (
      <View style={styles.center}>
        <Text>Alumno no encontrado</Text>
      </View>
    );
  }

  const asistidas = clasesDeAlumno(alumno.id).length;
  const totalClases = clases.length;
  const porcentaje = totalClases === 0 ? null : Math.round((asistidas / totalClases) * 100);

  const confirmarEliminar = () => {
    confirmar({
      titulo: 'Eliminar alumno',
      mensaje: `¿Eliminar a ${alumno.nombre}?`,
      textoConfirmar: 'Eliminar',
      destructivo: true,
      onConfirmar: () => {
        eliminar(alumno.id);
        router.back();
      },
    });
  };

  const resumen = (
    <View style={styles.resumen}>
      <View style={styles.celda}>
        <Text style={styles.numero}>{asistidas}</Text>
        <Text style={styles.etiqueta}>Asistidas</Text>
      </View>
      <View style={styles.celda}>
        <Text style={styles.numero}>{totalClases}</Text>
        <Text style={styles.etiqueta}>Clases totales</Text>
      </View>
      <View style={styles.celda}>
        <Text style={styles.numero}>{porcentaje === null ? '–' : `${porcentaje}%`}</Text>
        <Text style={styles.etiqueta}>Asistencia</Text>
      </View>
    </View>
  );

  return (
    <FormularioAlumno
      inicial={alumno}
      encabezado={resumen}
      onGuardar={datos => {
        actualizar(alumno.id, datos);
        router.back();
      }}
      onEliminar={confirmarEliminar}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resumen: {
    flexDirection: 'row',
    backgroundColor: '#E7F0F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  celda: { flex: 1, alignItems: 'center' },
  numero: { fontSize: 22, fontWeight: '700', color: '#1F6FB5' },
  etiqueta: { fontSize: 12, color: '#555', marginTop: 2 },
});
