export interface Institucion {
  idinstitucion: string;
  clavect?: string | null;
  nombre: string;
  direccion?: string | null;
  colonia?: string | null;
  municipio?: string | null;
  estado?: string | null;
  codigopostal?: string | null;
  email: string;
  telefono: string;
  activa?: boolean | null;
}
