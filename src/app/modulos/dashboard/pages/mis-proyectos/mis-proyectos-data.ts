import { ProyectoModel } from '../../../../Modelos/proyecto.model';
import { PROYECTOS_MOCK } from '../proyectos/proyectos-data';

type ProyectoFuente = {
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
  perforaciones: Array<{
    idPerforacion: string;
    nombrePerforacion: string;
    estado: string;
    profundidadObjetivo: string;
    metrosPerforados: string;
    supervisor: string;
    historialMovimientoBrocas: Array<{
      fecha: string;
      tipo: 'Entrada' | 'Salida';
      broca: string;
      metrosPerforados: number;
      observacion: string;
    }>;
  }>;
};

function clonarProyecto(proyecto: ProyectoFuente): ProyectoModel {
  return {
    idProyecto: proyecto.idProyecto,
    nombreSupervisor: proyecto.nombreSupervisor,
    nombreProyecto: proyecto.nombreProyecto,
    departamento: proyecto.departamento,
    municipio: proyecto.municipio,
    descripcionProyecto: proyecto.descripcionProyecto,
    fechaCreacion: proyecto.fechaCreacion,
    status: proyecto.status,
    priority: proyecto.priority,
    color: proyecto.color,
    perforaciones: proyecto.perforaciones.map(perforacion => ({
      idPerforacion: perforacion.idPerforacion,
      nombrePerforacion: perforacion.nombrePerforacion,
      estado: perforacion.estado,
      profundidadObjetivo: perforacion.profundidadObjetivo,
      metrosPerforados: perforacion.metrosPerforados,
      supervisor: perforacion.supervisor,
      historialMovimientoBrocas: perforacion.historialMovimientoBrocas.map((movimiento, index) => ({
        fecha: movimiento.fecha,
        tipo: movimiento.tipo,
        serialBroca: `${movimiento.broca}-${index + 1}`,
        broca: movimiento.broca,
        metrosPerforados: movimiento.metrosPerforados,
        observacion: movimiento.observacion
      }))
    }))
  };
}

export const MIS_PROYECTOS_MOCK: ProyectoModel[] = (PROYECTOS_MOCK as unknown as ProyectoFuente[]).map(clonarProyecto);
