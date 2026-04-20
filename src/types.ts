export type Alumno = {
  id: string;
  nombre: string;
  cinturonId: string;
  fechaIngreso: string;
  notas?: string;
};

export type Clase = {
  id: string;
  fecha: string;
  presentes: string[];
  notas?: string;
};
