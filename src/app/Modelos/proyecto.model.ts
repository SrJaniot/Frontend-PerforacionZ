export interface ProyectoModel {
  idProyecto: string;
  nombreSupervisor: string;
  nombreProyecto: string;
  departamento: string;
  municipio: string;
  descripcionProyecto: string;
  fechaCreacion: string;
  status: string;
  priority: string;
  color: string;
  perforaciones: PerforacionModel[];
}

export interface MovimientoBrocaModel {
  fecha: string;
  tipo: 'Entrada' | 'Salida';
  serialBroca: string;
  broca: string;
  metrosPerforados: number;
  observacion: string;
}

export interface PerforacionModel {
  idPerforacion: string;
  nombrePerforacion: string;
  estado: string;
  profundidadObjetivo: string;
  metrosPerforados: string;
  supervisor: string;
  historialMovimientoBrocas: MovimientoBrocaModel[];
}
