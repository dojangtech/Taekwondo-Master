import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormularioClase } from '../../src/FormularioClase';
import { useClases } from '../../src/ClasesContext';
import { confirmar } from '../../src/confirmar';

export default function DetalleClase() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { obtener, actualizar, eliminar } = useClases();

  const clase = obtener(id);

  if (!clase) {
    return (
      <View style={styles.center}>
        <Text>Clase no encontrada</Text>
      </View>
    );
  }

  const confirmarEliminar = () => {
    confirmar({
      titulo: 'Eliminar clase',
      mensaje: `¿Eliminar la clase del ${clase.fecha}?`,
      textoConfirmar: 'Eliminar',
      destructivo: true,
      onConfirmar: () => {
        eliminar(clase.id);
        router.back();
      },
    });
  };

  return (
    <FormularioClase
      inicial={clase}
      onGuardar={datos => {
        actualizar(clase.id, datos);
        router.back();
      }}
      onEliminar={confirmarEliminar}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
