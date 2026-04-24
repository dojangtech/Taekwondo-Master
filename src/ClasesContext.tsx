import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Clase } from './types';

const STORAGE_KEY = '@taekwondo:clases';

type ClasesContextValue = {
  clases: Clase[];
  cargando: boolean;
  agregar: (data: Omit<Clase, 'id'>) => Clase;
  actualizar: (id: string, data: Partial<Omit<Clase, 'id'>>) => void;
  eliminar: (id: string) => void;
  obtener: (id: string) => Clase | undefined;
  clasesDeAlumno: (alumnoId: string) => Clase[];
};

const ClasesContext = createContext<ClasesContextValue | null>(null);

export function ClasesProvider({ children }: { children: ReactNode }) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setClases(JSON.parse(raw));
      })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (cargando) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(clases));
  }, [clases, cargando]);

  const agregar: ClasesContextValue['agregar'] = data => {
    const nueva: Clase = { ...data, id: Date.now().toString(36) };
    setClases(prev => [...prev, nueva]);
    return nueva;
  };

  const actualizar: ClasesContextValue['actualizar'] = (id, data) => {
    setClases(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const eliminar: ClasesContextValue['eliminar'] = id => {
    setClases(prev => prev.filter(c => c.id !== id));
  };

  const obtener: ClasesContextValue['obtener'] = id =>
    clases.find(c => c.id === id);

  const clasesDeAlumno: ClasesContextValue['clasesDeAlumno'] = alumnoId =>
    clases.filter(c => c.presentes.includes(alumnoId));

  return (
    <ClasesContext.Provider
      value={{ clases, cargando, agregar, actualizar, eliminar, obtener, clasesDeAlumno }}
    >
      {children}
    </ClasesContext.Provider>
  );
}

export function useClases() {
  const ctx = useContext(ClasesContext);
  if (!ctx) throw new Error('useClases debe usarse dentro de <ClasesProvider>');
  return ctx;
}
