import { PerforacionModel } from "./PerforacionModel";

export class ProyectoListaModel {

  ID_PROYECTO?: number;
  ID_SUPERVISOR?: string;
  NOM_SUPERVISOR?: string;
  NOM_PROYECTO?: string;
  NOM_DEPARTAMENTO?: string;
  NOM_MUNICIPIO?: string;
  DESCRIPCION_PROYECTO?: string;
  ESTADO_PROYECTO?: string;
  PRIORIDAD_PROYECTO?: string;
  FECHA_CREACION?: Date;
  COLOR: string= 'blue';
  PERFORACIONES?: PerforacionModel[];







}
