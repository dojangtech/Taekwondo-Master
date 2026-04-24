import { Alert, Platform } from 'react-native';

export function confirmar(opciones: {
  titulo: string;
  mensaje?: string;
  textoConfirmar?: string;
  destructivo?: boolean;
  onConfirmar: () => void;
}) {
  const { titulo, mensaje, textoConfirmar = 'Aceptar', destructivo, onConfirmar } = opciones;

  if (Platform.OS === 'web') {
    if (window.confirm(mensaje ? `${titulo}\n\n${mensaje}` : titulo)) {
      onConfirmar();
    }
    return;
  }

  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: textoConfirmar,
      style: destructivo ? 'destructive' : 'default',
      onPress: onConfirmar,
    },
  ]);
}
