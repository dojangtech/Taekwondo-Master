import { Stack } from 'expo-router';
import { AlumnosProvider } from '../src/AlumnosContext';
import { ClasesProvider } from '../src/ClasesContext';

export default function RootLayout() {
  return (
    <AlumnosProvider>
      <ClasesProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="alumno/nuevo" options={{ title: 'Nuevo alumno', presentation: 'modal' }} />
          <Stack.Screen name="alumno/[id]" options={{ title: 'Alumno' }} />
          <Stack.Screen name="clase/nueva" options={{ title: 'Nueva clase', presentation: 'modal' }} />
          <Stack.Screen name="clase/[id]" options={{ title: 'Clase' }} />
        </Stack>
      </ClasesProvider>
    </AlumnosProvider>
  );
}
