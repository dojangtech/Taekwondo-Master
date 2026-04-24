export const parseYMD = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};

export const toYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatearFecha = (s: string): string => {
  try {
    return parseYMD(s).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return s;
  }
};

export type RangoFecha = { desde: string; hasta: string } | null;

export const rangoMesActual = (hoy = new Date()): RangoFecha => {
  const y = hoy.getFullYear();
  const m = hoy.getMonth();
  return {
    desde: toYMD(new Date(y, m, 1)),
    hasta: toYMD(new Date(y, m + 1, 0)),
  };
};

export const rangoMesPasado = (hoy = new Date()): RangoFecha => {
  const y = hoy.getFullYear();
  const m = hoy.getMonth();
  return {
    desde: toYMD(new Date(y, m - 1, 1)),
    hasta: toYMD(new Date(y, m, 0)),
  };
};

export const enRango = (fecha: string, rango: RangoFecha): boolean => {
  if (!rango) return true;
  return fecha >= rango.desde && fecha <= rango.hasta;
};
