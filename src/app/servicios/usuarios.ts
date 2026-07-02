import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SeguridadService } from './seguridad';
import { RespuestaServerSinDATA } from '../Modelos/RespuestaServerSinDATA.model';
import { Observable } from 'rxjs';
import { RespuestaServer } from '../Modelos/RespuestaServer.model';
import { RespuestaServerObtenerUsuarios } from '../Modelos/RespuestaServerObtenerUsuarios.model';
import { RespuestaServerObtenerUsuario } from '../Modelos/RespuestaServerObtenerUsuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private url_ms_seguridad : string = ConfiguracionRutasBackend.url_backend_ms_seguridad;
  private url_ms_negocio : string = ConfiguracionRutasBackend.url_backend_ms_negocio;


  constructor(
    private http: HttpClient,
    private servicioseguridad:SeguridadService

  ) {}


  //funcion para obtener el token del usuario y mandar la peticion con parse bearer token
  private getHeaders(): HttpHeaders {
    const token = this.servicioseguridad.ObtenerDatosLocalStorage_TOKEN(); // Reemplaza con tu token de autenticación
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  //funcion para crear un supervisor
  CrearSupervisor(id_supervisor: string, nombre_supervisor: string, Correo_supervisor: string, numero_celular: string, ususario_creacion: string): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}CrearSupervisor`, {
      id_supervisor: id_supervisor,
      nom_supervisor: nombre_supervisor,
      correo_supervisor: Correo_supervisor,
      num_cel_supervisor: numero_celular,
      ususario_creacion: ususario_creacion
    }, { headers });
  }

  //funcion para actualizar un supervisor
  ActualizarSupervisor(id_supervisor: String, nombre_supervisor: String, Correo_supervisor: String, numero_celular: String, ususario_modificacion: String, cuenta_activa: boolean): Observable<RespuestaServerSinDATA> {
    const headers = this.getHeaders();
    return this.http.post<RespuestaServerSinDATA>(`${this.url_ms_negocio}ActualizarSupervisor`, {
      id_supervisor: id_supervisor,
      nom_supervisor: nombre_supervisor,
      correo_supervisor: Correo_supervisor,
      num_cel_supervisor: numero_celular,
      ususario_creacion: ususario_modificacion,
      cuenta_activa: cuenta_activa

    }, { headers });
  }

  //funcion para obtener todos los Usuarios
    ObtenerUsuarios(): Observable<RespuestaServerObtenerUsuarios> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerUsuarios>(this.url_ms_negocio + 'ObtenerUsuariosSeguridad', { headers });
  }

  //funcion para obtener un usuario por id
  ObtenerUsuarioPorId(id_usuario: String): Observable<RespuestaServerObtenerUsuario> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerUsuario>(this.url_ms_negocio + 'ObtenerUsuarioSeguridadPorId/' + id_usuario, { headers });
  }












}
