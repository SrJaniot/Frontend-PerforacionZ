import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SeguridadService } from './seguridad';
import { RespuestaServerSinDATA } from '../Modelos/RespuestaServerSinDATA.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MisProyectosService {
  private url_ms_seguridad: string = ConfiguracionRutasBackend.url_backend_ms_seguridad;
  private url_ms_negocio: string = ConfiguracionRutasBackend.url_backend_ms_negocio;


  constructor(
    private http: HttpClient,
    private servicioseguridad: SeguridadService

  ) { }


  //funcion para obtener el token del usuario y mandar la peticion con parse bearer token
  private getHeaders(): HttpHeaders {
    const token = this.servicioseguridad.ObtenerDatosLocalStorage_TOKEN(); // Reemplaza con tu token de autenticación
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }





  //funcion para crear un devolver una broca prestada
  DevolverBrocaPrestada(id_prestamo: number, id_broca_instanciada: string, Nombre_usuario: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}DevolverPrestamoBrocaSupervisor`, {
      id_prestamo: id_prestamo,
      id_broca_instanciada: id_broca_instanciada,
      nom_usuario: Nombre_usuario
    }, { headers });
  }

  //funcion para crear una perforacion
  CrearPerforacion(id_proyecto: number, profundidad_actual: number, fecha_inicio_perforacion: Date, usuario: string, nombre_perforacion: string, profundidad_objetivo: number): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}CrearPerforacion`, {
      id_proyecto: id_proyecto,
      Profundidad_actual: profundidad_actual,
      fecha_inicio_perforacion: fecha_inicio_perforacion,
      usuario: usuario,
      nombre_perforacion: nombre_perforacion,
      profundidad_objetivo: profundidad_objetivo
    }, { headers });
  }


  //eliminar una perforacion
  EliminarPerforacion(id_perforacion: number,): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}EliminarPerforacionSupervisor`, {
      id: id_perforacion,
    }, { headers });
  }


  //Registrar movimiento de broca
  RegistrarMovimientoBroca(id_broca_instanciada: string, id_perforacion: number, Fecha_movimiento: string, tipo_movimiento: string, profundidad_movimiento: number, usuario: string, observaciones: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}RegistrarReporteMovimientoBroca`, {
      id_broca_instanciada: id_broca_instanciada,
      id_perforacion: id_perforacion,
      Fecha_movimiento: Fecha_movimiento,
      tipo_movimiento: tipo_movimiento,
      profundidad_movimiento: profundidad_movimiento,
      usuario: usuario,
      observaciones: observaciones
    }, { headers });
  }

























}
