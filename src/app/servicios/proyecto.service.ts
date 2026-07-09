import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SeguridadService } from './seguridad';
import { RespuestaServerSinDATA } from '../Modelos/RespuestaServerSinDATA.model';
import { Observable } from 'rxjs';
import { RespuestaServerObtenerProyectos } from '../Modelos/RespuestaServerObtenerProyectos';
import { RespuestaServerObtenerDepartamentos } from '../Modelos/RespuestaServerObtenerDepartamentos.model';
import { RespuestaServerObtenerMunicipiosPorDepartamento } from '../Modelos/RespuestaServerObtenerMunicipiosPorDepartamento';
import { RespuestaServerObtenerBrocasPrestadasProyecto } from '../Modelos/RespuestaServerObtenerBrocasPrestadasProyecto';

@Injectable({
  providedIn: 'root',
})
export class ProyectoService {
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

  //funcion para crear un Proyecto
  CrearProyecto(id_supervisor: string, nom_proyecto: string, id_municipio: string, descripcion: string, ususario_creacion: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}CrearProyecto`, {
      id_supervisor: id_supervisor,
      nom_proyecto: nom_proyecto,
      id_municipio: id_municipio,
      descripcion_proyecto: descripcion,
      usuario_insert: ususario_creacion
    }, { headers });
  }


  //funcion para actualizar un Proyecto
  ActualizarProyecto(id_proyecto: String, nom_proyecto: String, id_municipio: String, descripcion: String, ususario_modificacion: String, id_supervisor: String, estado_proyecto: string, prioridad_proyecto: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}ActualizarProyecto`, {
      id_supervisor: id_supervisor,
      nom_proyecto: nom_proyecto,
      id_municipio: id_municipio,
      descripcion_proyecto: descripcion,
      usuario_insert: ususario_modificacion,
      id_proyecto: id_proyecto,
      estado_proyecto: estado_proyecto,
      prioridad_proyecto: prioridad_proyecto

    }, { headers });
  }

  //funcion para obtener todos los Proyectos
  ObtenerProyectos(): Observable<RespuestaServerObtenerProyectos> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerProyectos>(this.url_ms_negocio + 'ObtenerProyectos', { headers });
  }

  //Funcion para obtener todas las brocas asignadas a un proyecto
  ObtenerProyectosConBrocasAsignadas( id_proyecto: number): Observable<RespuestaServerObtenerBrocasPrestadasProyecto> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerBrocasPrestadasProyecto>(this.url_ms_negocio + 'ObtenerBrocasPorProyecto/' + id_proyecto, { headers });
  }





  //funcion para obtener un usuario por id
  // ObtenerUsuarioPorId(id_usuario: String): Observable<RespuestaServerObtener> {
  //   const headers = this.getHeaders();
  //   return this.http.get<RespuestaServerObtenerUsuario>(this.url_ms_negocio + 'ObtenerUsuarioSeguridadPorId/' + id_usuario, { headers });
  // }







  ObtenerDepartamentos(): Observable<RespuestaServerObtenerDepartamentos> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerDepartamentos>(this.url_ms_negocio + 'ObtenerDepartamentos', { headers });
  }

  ObtenerMunicipiosPorDepartamento(id_departamento: string): Observable<RespuestaServerObtenerMunicipiosPorDepartamento> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerMunicipiosPorDepartamento>(`${this.url_ms_negocio}ObtenerMunicipiosIDDepartamento/${id_departamento}`, { headers });
  }

























}
