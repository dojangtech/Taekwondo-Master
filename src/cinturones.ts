export type Cinturon = {
  id: string;
  nombre: string;
  color: string;
  orden: number;
};

export const CINTURONES: Cinturon[] = [
  { id: '10gup', nombre: '10º Gup - Blanco', color: '#FFFFFF', orden: 1 },
  { id: '9gup', nombre: '9º Gup - Blanco punta amarilla', color: '#FFF7B0', orden: 2 },
  { id: '8gup', nombre: '8º Gup - Amarillo', color: '#FFE600', orden: 3 },
  { id: '7gup', nombre: '7º Gup - Amarillo punta verde', color: '#D6E94C', orden: 4 },
  { id: '6gup', nombre: '6º Gup - Verde', color: '#2FB14E', orden: 5 },
  { id: '5gup', nombre: '5º Gup - Verde punta azul', color: '#3FA39A', orden: 6 },
  { id: '4gup', nombre: '4º Gup - Azul', color: '#1F6FB5', orden: 7 },
  { id: '3gup', nombre: '3º Gup - Azul punta roja', color: '#7A4FA8', orden: 8 },
  { id: '2gup', nombre: '2º Gup - Rojo', color: '#D7263D', orden: 9 },
  { id: '1gup', nombre: '1º Gup - Rojo punta negra', color: '#5A0A18', orden: 10 },
  { id: '1dan', nombre: '1º Dan - Negro', color: '#111111', orden: 11 },
  { id: '2dan', nombre: '2º Dan - Negro', color: '#111111', orden: 12 },
  { id: '3dan', nombre: '3º Dan - Negro', color: '#111111', orden: 13 },
  { id: '4dan', nombre: '4º Dan - Negro', color: '#111111', orden: 14 },
  { id: '5dan', nombre: '5º Dan - Negro', color: '#111111', orden: 15 },
  { id: '6dan', nombre: '6º Dan - Negro', color: '#111111', orden: 16 },
  { id: '7dan', nombre: '7º Dan - Negro', color: '#111111', orden: 17 },
  { id: '8dan', nombre: '8º Dan - Negro', color: '#111111', orden: 18 },
  { id: '9dan', nombre: '9º Dan - Negro', color: '#111111', orden: 19 },
];

export const cinturonPorId = (id: string): Cinturon | undefined =>
  CINTURONES.find(c => c.id === id);
