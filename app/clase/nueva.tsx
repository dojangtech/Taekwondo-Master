import { useRouter } from 'expo-router';
import { FormularioClase } from '../../src/FormularioClase';
import { useClases } from '../../src/ClasesContext';

export default function NuevaClase() {
  const router = useRouter();
  const { agregar } = useClases();

  return (
    <FormularioClase
      onGuardar={datos => {
        agregar(datos);
        router.back();
      }}
    />
  );
}
