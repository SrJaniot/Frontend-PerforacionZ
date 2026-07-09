import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SeguridadService } from './seguridad';
import { RespuestaServerSinDATA } from '../Modelos/RespuestaServerSinDATA.model';
import { Observable } from 'rxjs';
import { RespuestaServerObtenerDepartamentos } from '../Modelos/RespuestaServerObtenerDepartamentos.model';
import { RespuestaServerObtenerModelosBrocas } from '../Modelos/RespuestaServerObtenerModelosBrocas';
import { RespuestaServerObtenerModelosBroca } from '../Modelos/RespuestaServerObtenerModelosBroca';
import { RespuestaServerObtenerModelosBrocasInstanciadas } from '../Modelos/RespuestaServerObtenerModelosBrocasInstanciadas';
import { RespuestaServerObtenerModelosBrocasInstanciada } from '../Modelos/RespuestaServerObtenerModelosBrocasInstanciada';
import { RespuestaServerObtenerBrocasPrestadasActivos } from '../Modelos/RespuestaServerObtenerBrocasPrestadasActivas';
import { RespuestaServerObtenerHistorialPrestamosBrocaInstanciada } from '../Modelos/RespuestaServerObtenerHistorialPrestamosBrocaInstanciada';

@Injectable({
  providedIn: 'root',
})
export class BrocasService {
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





  //funcion para crear un ModeloBroca
  CrearModeloBroca(nom_broca: string, tipo_broca: string, descripcion_broca: string, tamanop_broca: number, matrix_broca: string, marca_broca: string, usuario_creacion: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}CrearBroca`, {
      nom_broca: nom_broca,
      tipo_broca: tipo_broca,
      descripcion_broca: descripcion_broca,
      tamanop_broca: tamanop_broca,
      matrix_broca: matrix_broca,
      marca_broca: marca_broca,
      usuario_creacion: usuario_creacion
    }, { headers });
  }


  // funcion para actualizar un ModeloBroca
  ActualizarModeloBroca(id_broca: number, nom_broca: string, tipo_broca: string, descripcion_broca: string, tamanop_broca: number, matrix_broca: string, marca_broca: string, usuario_modificacion: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}ActualizarBroca`, {
      id_broca: id_broca,
      nom_broca: nom_broca,
      tipo_broca: tipo_broca,
      descripcion_broca: descripcion_broca,
      tamanop_broca: tamanop_broca,
      matrix_broca: matrix_broca,
      marca_broca: marca_broca,
      usuario_creacion: usuario_modificacion
    }, { headers });
  }



  //funcion para crear una instancia de broca
  CrearInstanciaBroca(serial: string, id_broca: number, usuario_creacion: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}CrearBrocaInstanciada`, {
      id_broca_instanciada: serial,
      id_broca: id_broca,
      usuario_creacion: usuario_creacion
    }, { headers });
  }


  //funcion para actualizar una instancia de broca
  ActualizarInstanciaBroca(id_broca_instanciada: string, id_broca: number,estado_broca: string,estado_disponibilidad_broca: string, usuario_modificacion: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}ActualizarBrocaInstanciada`, {
      id_brocaInstanciada: id_broca_instanciada,
      id_broca: id_broca,
      estado_broca: estado_broca,
      estado_disponibilidad_broca: estado_disponibilidad_broca,
      usuario_modificacion: usuario_modificacion
    }, { headers });
  }

  //funcion para eliminar una broca instanciada
  EliminarInstanciaBroca(id_broca_instanciada: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}EliminarBrocaInstanciada`, {
      id: id_broca_instanciada,
    }, { headers });
  }




  //funcion para eliminar un ModeloBroca
  EliminarModeloBroca(id_broca: number): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}EliminarBroca`, {
      id: id_broca,
    }, { headers });
  }


  //funcion para marcar una broca como dañada
  MarcarBrocaDaniada(id_broca_instanciada: string, usuario_modificacion: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}MarcarBrocaDaniada`, {
      id_broca: id_broca_instanciada,
      usuario: usuario_modificacion
    }, { headers });
  }


  //funcion para registrar prestamo de broca
  RegistrarPrestamoBroca(id_broca_instanciada: string, id_proyecto: number, usuario_registro: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}RegistrarPrestamoBroca`, {
      id_broca_instanciada: id_broca_instanciada,
      id_proyecto: id_proyecto,
      nom_usuario: usuario_registro
    }, { headers });
  }



  //funcion para obtener todas las brocas instanciadas
  ObtenerBrocasInstanciadas(): Observable<RespuestaServerObtenerModelosBrocasInstanciadas> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerModelosBrocasInstanciadas>(this.url_ms_negocio + 'ObtenerBrocasInstanciadas', { headers });
  }

  //funcion para obtener una broca instanciada por id
  ObtenerBrocaInstanciadaPorId(id_broca_instanciada: string): Observable<RespuestaServerObtenerModelosBrocasInstanciada> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerModelosBrocasInstanciada>(this.url_ms_negocio + 'ObtenerBrocaInstanciadaID/' + id_broca_instanciada, { headers });
  }


  //funcion para Obtener todas las brocasprestadasActivas
  ObtenerBrocasPrestadasActivos(): Observable<RespuestaServerObtenerBrocasPrestadasActivos> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerBrocasPrestadasActivos>(this.url_ms_negocio + 'ObtenerBrocasPrestadasActivos', { headers });
  }


  //Funcion para obtener el historial de prestamos de una broca instanciada
  ObtenerHistorialPrestamosBrocaInstanciada(id_broca_instanciada: string): Observable<RespuestaServerObtenerHistorialPrestamosBrocaInstanciada> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerHistorialPrestamosBrocaInstanciada>(this.url_ms_negocio + 'ObtenerHistorialPrestamosBroca/' + id_broca_instanciada, { headers });
  }








  //funcion para obtener todos los modelosdebrocas
  ObtenerModelosBrocas(): Observable<RespuestaServerObtenerModelosBrocas> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerModelosBrocas>(this.url_ms_negocio + 'ObtenerBrocas', { headers });
  }

  //funcion para obtener un modelo de broca por id
  ObtenerModeloBrocaPorId(id_broca: String): Observable<RespuestaServerObtenerModelosBroca> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerModelosBroca>(this.url_ms_negocio + 'ObtenerBrocaID/' + id_broca, { headers });
  }
































}
