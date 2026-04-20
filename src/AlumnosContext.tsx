import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alumno } from './types';

const STORAGE_KEY = '@taekwondo:alumnos';

type AlumnosContextValue = {
  alumnos: Alumno[];
  cargando: boolean;
  agregar: (data: Omit<Alumno, 'id'>) => Alumno;
  actualizar: (id: string, data: Partial<Omit<Alumno, 'id'>>) => void;
  eliminar: (id: string) => void;
  obtener: (id: string) => Alumno | undefined;
};

const AlumnosContext = createContext<AlumnosContextValue | null>(null);

export function AlumnosProvider({ children }: { children: ReactNode }) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setAlumnos(JSON.parse(raw));
      })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (cargando) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alumnos));
  }, [alumnos, cargando]);

  const agregar: AlumnosContextValue['agregar'] = data => {
    const nuevo: Alumno = { ...data, id: Date.now().toString(36) };
    setAlumnos(prev => [...prev, nuevo]);
    return nuevo;
  };

  const actualizar: AlumnosContextValue['actualizar'] = (id, data) => {
    setAlumnos(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
  };

  const eliminar: AlumnosContextValue['eliminar'] = id => {
    setAlumnos(prev => prev.filter(a => a.id !== id));
  };

  const obtener: AlumnosContextValue['obtener'] = id =>
    alumnos.find(a => a.id === id);

  return (
    <AlumnosContext.Provider
      value={{ alumnos, cargando, agregar, actualizar, eliminar, obtener }}
    >
      {children}
    </AlumnosContext.Provider>
  );
}

export function useAlumnos() {
  const ctx = useContext(AlumnosContext);
  if (!ctx) throw new Error('useAlumnos debe usarse dentro de <AlumnosProvider>');
  return ctx;
}
