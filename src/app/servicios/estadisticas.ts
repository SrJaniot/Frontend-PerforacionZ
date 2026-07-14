import { Injectable } from '@angular/core';
import { ConfiguracionRutasBackend } from '../config/configuracion.rutas.backend';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SeguridadService } from './seguridad';
import { Observable } from 'rxjs';
import { RespuestaServerObtenerEstadisticaMetrosvsBrocaPorProyecto } from '../Modelos/RespuestaServerObtenerEstadisticaMetrosvsBrocaPorProyecto';
import { RespuestaServerObtenerEstadisticaMetrosvsMarcaBroca } from '../Modelos/RespuestaServerObtenerEstadisticaMetrosvsMarcaBroca';
import { RespuestaServerObtenerEstadisticaMetrosvsModeloBroca } from '../Modelos/RespuestaServerObtenerEstadisticaMetrosvsModeloBroca';

@Injectable({
  providedIn: 'root',
})
export class Estadisticas {

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


  // funcion para obtener Estadistica de metros vs broca por proyecto encontrada
  ObtenerEstadisticaMetrosvsBrocaPorProyecto(): Observable<RespuestaServerObtenerEstadisticaMetrosvsBrocaPorProyecto> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerEstadisticaMetrosvsBrocaPorProyecto>(this.url_ms_negocio + 'ObtenerMetrosvsBrocaPorProyecto', { headers });
  }

  // funcion para obtener Estadistica de METROS VS MARCA DE BROCA
  ObtenerEstadisticaMetrosvsMarcaBroca(): Observable<RespuestaServerObtenerEstadisticaMetrosvsMarcaBroca> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerEstadisticaMetrosvsMarcaBroca>(this.url_ms_negocio + 'ObtenerMetrosvsMarcaBroca', { headers });
  }

  // Funcion para obtener Estadistica de Metros vs  MODELO DE BROCA
  ObtenerEstadisticaMetrosvsModeloBroca(): Observable<RespuestaServerObtenerEstadisticaMetrosvsModeloBroca> {
    const headers = this.getHeaders();
    return this.http.get<RespuestaServerObtenerEstadisticaMetrosvsModeloBroca>(this.url_ms_negocio + 'ObtenerMetrosvsModeloBroca', { headers });
  }






}
