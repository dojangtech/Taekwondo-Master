import { Alert, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormularioAlumno } from '../../src/FormularioAlumno';
import { useAlumnos } from '../../src/AlumnosContext';

export default function DetalleAlumno() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { obtener, actualizar, eliminar } = useAlumnos();

  const alumno = obtener(id);

  if (!alumno) {
    return (
      <View style={styles.center}>
        <Text>Alumno no encontrado</Text>
      </View>
    );
  }

  const confirmarEliminar = () => {
    Alert.alert('Eliminar alumno', `¿Eliminar a ${alumno.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          eliminar(alumno.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <FormularioAlumno
      inicial={alumno}
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
});
