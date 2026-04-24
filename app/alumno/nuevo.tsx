import { useRouter } from 'expo-router';
import { FormularioAlumno } from '../../src/FormularioAlumno';
import { useAlumnos } from '../../src/AlumnosContext';

export default function NuevoAlumno() {
  const router = useRouter();
  const { agregar } = useAlumnos();

  return (
    <FormularioAlumno
      onGuardar={datos => {
        agregar(datos);
        router.back();
      }}
    />
  );
}
