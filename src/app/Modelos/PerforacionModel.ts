import { MovimientoBrocaModel } from "./MovimientoBroca.model";

export class PerforacionModel {
  ID_PERFORACION?: string;
  NOMBRE_PERFORACION?: string;
  ESTADO_PERFORACION?: string;
  PROFUNDIDAD_OBJETIVO?: number;
  PROFUNDIDAD_ACTUAL?: number;
  SUPERVISOR?: string;
  HISTORIALMOVIMIENTOSBROCA?: MovimientoBrocaModel[]; // Assuming it's an array of movement records


}
