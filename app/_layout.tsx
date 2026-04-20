import { Stack } from 'expo-router';
import { AlumnosProvider } from '../src/AlumnosContext';

export default function RootLayout() {
  return (
    <AlumnosProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Alumnos' }} />
        <Stack.Screen name="alumno/nuevo" options={{ title: 'Nuevo alumno', presentation: 'modal' }} />
        <Stack.Screen name="alumno/[id]" options={{ title: 'Alumno' }} />
      </Stack>
    </AlumnosProvider>
  );
}
