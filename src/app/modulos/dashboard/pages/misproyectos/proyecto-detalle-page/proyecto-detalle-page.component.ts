import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { ProyectoModel } from '../../../../../Modelos/proyecto.model';
import { ProyectoListaModel } from '../../../../../Modelos/ProyectosLista.model';
import { ModeloBrcoaPrestada } from '../../../../../Modelos/ModeloBrcoaPrestada';
import { PerforacionModel as BackendPerforacionModel } from '../../../../../Modelos/PerforacionModel';
import { MovimientoBrocaModel as BackendMovimientoBrocaModel } from '../../../../../Modelos/MovimientoBroca.model';
import { ProyectoService } from '../../../../../servicios/proyecto.service';
import { MisProyectosService } from '../../../../../servicios/mis-proyectos-service';
import { SeguridadService } from '../../../../../servicios/seguridad';

interface MovimientoGraficaPunto {
  x: number;
  y: number;
  fecha: string;
  tipo: 'Entrada' | 'Salida';
  serialBroca: string;
  metros: number;
}

interface MovimientoGraficaLinea {
  y: number;
  label: string;
}

interface MovimientoGraficaData {
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  points: MovimientoGraficaPunto[];
  gridLines: MovimientoGraficaLinea[];
  linePoints: string;
}

interface BrocaPrestadaViewModel {
  idPrestamo: string;
  serialBroca: string;
  nombreBroca: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  estadoPrestamo: string;
}

@Component({
  selector: 'app-proyecto-detalle-page',
  standalone: false,
  templateUrl: './proyecto-detalle-page.component.html',
  styleUrls: ['./proyecto-detalle-page.component.scss']
})
export class ProyectoSupervisorDetallePageComponent implements OnInit {
  proyecto: ProyectoModel | null = null;
  cargandoProyecto = false;
  id_usuario: string | null = null;
  cargandoBrocasPrestadas = false;
  devolviendoPrestamo = false;
  creandoPerforacion = false;
  eliminandoPerforacion = false;
  registrandoMovimiento = false;
  mostrarModalDevolverPrestamo = false;
  mostrarModalCrearPerforacion = false;
  mostrarModalEliminarPerforacion = false;
  mostrarModalRegistrarMovimiento = false;
  fechaHoraMovimientoMax = '';
  prestamoSeleccionado: BrocaPrestadaViewModel | null = null;
  perforacionSeleccionada: ProyectoModel['perforaciones'][number] | null = null;
  brocasPrestadas: BrocaPrestadaViewModel[] = [];
  private idProyecto: string | null = null;
  private readonly chartWidth = 1000;
  private readonly chartHeight = 280;
  private readonly chartPaddingLeft = 64;
  private readonly chartPaddingRight = 24;
  private readonly chartPaddingTop = 20;
  private readonly chartPaddingBottom = 52;
  readonly crearPerforacionForm = new FormGroup({
    nombre_perforacion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    profundidad_objetivo: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    profundidad_actual: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    fecha_inicio_perforacion: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });
  readonly registrarMovimientoForm = new FormGroup({
    id_broca_instanciada: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tipo_movimiento: new FormControl('ENTRADA', { nonNullable: true, validators: [Validators.required] }),
    profundidad_movimiento: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    fecha_movimiento: new FormControl('', { nonNullable: true, validators: [Validators.required, this.validarFechaNoFutura] }),
    observaciones: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proyectoService: ProyectoService,
    private misProyectosService: MisProyectosService,
    private seguridadService: SeguridadService,
    private toast: NgToastService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idProyecto = this.route.snapshot.paramMap.get('id');
    this.cargarProyecto();
  }

  volver(): void {
    this.router.navigate(['/dashboard/mis-proyectos']);
  }

  get proyectoFinalizado(): boolean {
    if (!this.proyecto) {
      return false;
    }

    return this.esProyectoFinalizado(this.proyecto.status, this.proyecto.fechaFinProyecto);
  }

  get brocasDisponiblesParaMovimiento(): BrocaPrestadaViewModel[] {
    return this.brocasPrestadas.filter(prestamo => this.puedeRegistrarMovimientoConPrestamo(prestamo));
  }

  puedeDevolverPrestamo(prestamo: BrocaPrestadaViewModel): boolean {
    return this.normalizarTexto(prestamo.estadoPrestamo) === 'disponible' && !this.proyectoFinalizado;
  }

  puedeRegistrarMovimientoConPrestamo(prestamo: BrocaPrestadaViewModel): boolean {
    return this.normalizarTexto(prestamo.estadoPrestamo) !== 'devuelto' && !this.proyectoFinalizado;
  }

  puedeEliminarPerforacion(perforacion: ProyectoModel['perforaciones'][number]): boolean {
    return !this.proyectoFinalizado && !this.perforacionTieneMovimientos(perforacion);
  }

  perforacionTieneMovimientos(perforacion: ProyectoModel['perforaciones'][number]): boolean {
    return (perforacion.historialMovimientoBrocas ?? []).length > 0;
  }

  abrirModalDevolverPrestamo(prestamo: BrocaPrestadaViewModel): void {
    if (!this.puedeDevolverPrestamo(prestamo) || this.devolviendoPrestamo) {
      return;
    }

    this.prestamoSeleccionado = prestamo;
    this.mostrarModalDevolverPrestamo = true;
  }

  cerrarModalDevolverPrestamo(): void {
    if (this.devolviendoPrestamo) {
      return;
    }

    this.mostrarModalDevolverPrestamo = false;
    this.prestamoSeleccionado = null;
  }

  confirmarDevolverPrestamo(): void {
    const prestamo = this.prestamoSeleccionado;
    if (!prestamo || this.devolviendoPrestamo) {
      return;
    }

    const idPrestamo = Number(prestamo.idPrestamo);
    if (Number.isNaN(idPrestamo)) {
      this.toast.danger('El id del préstamo no es válido.', 'Error', 5000, true, true, true);
      return;
    }

    const usuario = this.obtenerNombreUsuarioSesion();
    this.devolviendoPrestamo = true;
    this.cd.detectChanges();

    this.misProyectosService.DevolverBrocaPrestada(idPrestamo, prestamo.serialBroca, usuario)
      .pipe(finalize(() => {
        this.devolviendoPrestamo = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO !== 200) {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible devolver la broca.', 'Error', 5000, true, true, true);
            return;
          }

          this.toast.success(respuesta.MENSAJE || 'Broca devuelta correctamente.', 'Éxito', 5000, true, true, true);
          this.mostrarModalDevolverPrestamo = false;
          this.prestamoSeleccionado = null;
          this.cargarProyecto();
        },
        error: () => {
          this.toast.danger('Error al devolver la broca.', 'Error', 5000, true, true, true);
        }
      });
  }

  abrirModalCrearPerforacion(): void {
    if (this.proyectoFinalizado || this.creandoPerforacion) {
      return;
    }

    this.crearPerforacionForm.reset({
      nombre_perforacion: '',
      profundidad_objetivo: 0,
      profundidad_actual: 0,
      fecha_inicio_perforacion: this.fechaLocalParaInput()
    });
    this.mostrarModalCrearPerforacion = true;
  }

  cerrarModalCrearPerforacion(): void {
    if (this.creandoPerforacion) {
      return;
    }

    this.mostrarModalCrearPerforacion = false;
  }

  crearPerforacion(): void {
    if (this.proyectoFinalizado || this.creandoPerforacion || !this.proyecto) {
      return;
    }

    if (this.crearPerforacionForm.invalid) {
      this.crearPerforacionForm.markAllAsTouched();
      return;
    }

    const idProyecto = Number(this.proyecto.idProyecto);
    if (Number.isNaN(idProyecto)) {
      this.toast.danger('El id del proyecto no es válido para crear la perforación.', 'Error', 5000, true, true, true);
      return;
    }

    const valor = this.crearPerforacionForm.getRawValue();
    const profundidadObjetivo = Number(valor.profundidad_objetivo);
    const profundidadActual = Number(valor.profundidad_actual);

    if (profundidadObjetivo > 0 && profundidadActual > profundidadObjetivo) {
      this.toast.warning('La profundidad actual no puede ser mayor que la profundidad objetivo.', 'Advertencia', 5000, true, true, true);
      return;
    }

    const usuario = this.obtenerNombreUsuarioSesion();

    this.creandoPerforacion = true;
    this.cd.detectChanges();

    this.misProyectosService.CrearPerforacion(
      idProyecto,
      profundidadActual,
      new Date(valor.fecha_inicio_perforacion),
      usuario,
      valor.nombre_perforacion,
      profundidadObjetivo
    )
      .pipe(finalize(() => {
        this.creandoPerforacion = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO !== 200) {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible crear la perforación.', 'Error', 5000, true, true, true);
            return;
          }

          this.toast.success(respuesta.MENSAJE || 'Perforación creada correctamente.', 'Éxito', 5000, true, true, true);
          this.mostrarModalCrearPerforacion = false;
          this.cargarProyecto();
        },
        error: () => {
          this.toast.danger('Error al crear la perforación.', 'Error', 5000, true, true, true);
        }
      });
  }

  abrirModalEliminarPerforacion(perforacion: ProyectoModel['perforaciones'][number]): void {
    if (!this.puedeEliminarPerforacion(perforacion) || this.eliminandoPerforacion) {
      return;
    }

    this.perforacionSeleccionada = perforacion;
    this.mostrarModalEliminarPerforacion = true;
  }

  cerrarModalEliminarPerforacion(): void {
    if (this.eliminandoPerforacion) {
      return;
    }

    this.mostrarModalEliminarPerforacion = false;
    this.perforacionSeleccionada = null;
  }

  confirmarEliminarPerforacion(): void {
    const perforacion = this.perforacionSeleccionada;
    if (!perforacion || this.eliminandoPerforacion) {
      return;
    }

    const idPerforacion = Number(perforacion.idPerforacion);
    if (Number.isNaN(idPerforacion)) {
      this.toast.danger('El id de la perforación no es válido.', 'Error', 5000, true, true, true);
      return;
    }

    this.eliminandoPerforacion = true;
    this.cd.detectChanges();

    this.misProyectosService.EliminarPerforacion(idPerforacion)
      .pipe(finalize(() => {
        this.eliminandoPerforacion = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO !== 200) {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible eliminar la perforación.', 'Error', 5000, true, true, true);
            return;
          }

          this.toast.success(respuesta.MENSAJE || 'Perforación eliminada correctamente.', 'Éxito', 5000, true, true, true);
          this.mostrarModalEliminarPerforacion = false;
          this.perforacionSeleccionada = null;
          this.cargarProyecto();
        },
        error: () => {
          this.toast.danger('Error al eliminar la perforación.', 'Error', 5000, true, true, true);
        }
      });
  }

  abrirModalRegistrarMovimiento(perforacion: ProyectoModel['perforaciones'][number]): void {
    if (this.proyectoFinalizado || this.registrandoMovimiento) {
      return;
    }

    this.perforacionSeleccionada = perforacion;
    this.fechaHoraMovimientoMax = this.fechaHoraLocalParaInput();
    this.registrarMovimientoForm.reset({
      id_broca_instanciada: this.brocasDisponiblesParaMovimiento[0]?.serialBroca ?? '',
      tipo_movimiento: 'ENTRADA',
      profundidad_movimiento: 0,
      fecha_movimiento: this.fechaHoraMovimientoMax,
      observaciones: ''
    });
    this.registrarMovimientoForm.controls.fecha_movimiento.updateValueAndValidity();
    this.mostrarModalRegistrarMovimiento = true;
  }

  cerrarModalRegistrarMovimiento(): void {
    if (this.registrandoMovimiento) {
      return;
    }

    this.mostrarModalRegistrarMovimiento = false;
    this.perforacionSeleccionada = null;
  }

  registrarMovimientoBroca(): void {
    const perforacion = this.perforacionSeleccionada;
    if (!perforacion || this.proyectoFinalizado || this.registrandoMovimiento) {
      return;
    }

    if (this.registrarMovimientoForm.invalid) {
      this.registrarMovimientoForm.markAllAsTouched();
      return;
    }

    const fechaMovimiento = new Date(this.registrarMovimientoForm.controls.fecha_movimiento.value);
    if (fechaMovimiento.getTime() > Date.now()) {
      this.registrarMovimientoForm.controls.fecha_movimiento.setErrors({ futureDate: true });
      this.registrarMovimientoForm.controls.fecha_movimiento.markAsTouched();
      this.toast.warning('No puedes registrar movimientos con fecha u hora futura.', 'Advertencia', 5000, true, true, true);
      return;
    }

    const idPerforacion = Number(perforacion.idPerforacion);
    if (Number.isNaN(idPerforacion)) {
      this.toast.danger('El id de la perforación no es válido.', 'Error', 5000, true, true, true);
      return;
    }

    const valor = this.registrarMovimientoForm.getRawValue();
    const usuario = this.obtenerNombreUsuarioSesion();

    this.registrandoMovimiento = true;
    this.cd.detectChanges();

    this.misProyectosService.RegistrarMovimientoBroca(
      valor.id_broca_instanciada,
      idPerforacion,
      this.formatearFechaHoraLocalParaBackend(valor.fecha_movimiento),
      valor.tipo_movimiento,
      Number(valor.profundidad_movimiento),
      usuario,
      valor.observaciones
    )
      .pipe(finalize(() => {
        this.registrandoMovimiento = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          console.log('Respuesta del servidor al registrar movimiento de broca:', respuesta);
          if (respuesta.CODIGO !== 200) {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible registrar el movimiento.', 'Error', 5000, true, true, true);
            return;
          }

          this.toast.success(respuesta.MENSAJE || 'Movimiento registrado correctamente.', 'Éxito', 5000, true, true, true);
          this.mostrarModalRegistrarMovimiento = false;
          this.perforacionSeleccionada = null;
          this.cargarProyecto();
        },
        error: () => {
          this.toast.danger('Error al registrar el movimiento de broca.', 'Error', 5000, true, true, true);
        }
      });
  }

  private obtenerNombreUsuarioSesion(): string {
    const sesion = this.seguridadService.ObtenerDatosUsuarioIdentificadoSESION();
    return sesion?.usuario?.nombre || sesion?.usuario?.id_usuario || 'supervisor';
  }

  private fechaLocalParaInput(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private fechaHoraLocalParaInput(): string {
    return this.formatearFechaHoraParaInputLocal(new Date());
  }

  private formatearFechaHoraLocalParaBackend(valor: string): string {
    if (!valor) {
      return valor;
    }

    const fechaLocal = new Date(valor);
    if (Number.isNaN(fechaLocal.getTime())) {
      return valor;
    }

    const baseSinSegundos = valor.slice(0, 16);
    const segundosAleatorios = String(this.generarSegundosAleatorios()).padStart(2, '0');
    const base = `${baseSinSegundos}:${segundosAleatorios}`;
    return `${base}${this.formatearOffsetZonaHoraria(fechaLocal)}`;
  }

  private generarSegundosAleatorios(): number {
    return Math.floor(Math.random() * 60);
  }

  private formatearFechaHoraParaInputLocal(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private formatearOffsetZonaHoraria(fecha: Date): string {
    const offsetMinutos = -fecha.getTimezoneOffset();
    const signo = offsetMinutos >= 0 ? '+' : '-';
    const absoluto = Math.abs(offsetMinutos);
    const horas = String(Math.floor(absoluto / 60)).padStart(2, '0');
    const minutos = String(absoluto % 60).padStart(2, '0');

    return `${signo}${horas}:${minutos}`;
  }

  private validarFechaNoFutura(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) {
      return null;
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return { invalidDate: true };
    }

    return fecha.getTime() > Date.now() ? { futureDate: true } : null;
  }






  colorClass(color: string): string {
    if (color === 'blue') return 'bg-blue-500';
    if (color === 'emerald') return 'bg-emerald-500';
    if (color === 'amber') return 'bg-amber-500';
    if (color === 'cyan') return 'bg-cyan-500';
    if (color === 'red') return 'bg-red-500';
    if (color === 'purple') return 'bg-violet-500';
    return 'bg-slate-500';
  }

  trackPerforacion(index: number, perforacion: ProyectoModel['perforaciones'][number]): string {
    return perforacion.idPerforacion ?? String(index);
  }

  trackMovimiento(index: number): number {
    return index;
  }

  trackPrestamo(index: number, prestamo: BrocaPrestadaViewModel): string {
    return prestamo.idPrestamo || String(index);
  }

  badgePrestamoEstado(estado: string): string {
    const valor = this.normalizarTexto(estado);

    if (valor === 'disponible') return 'badge-success';
    if (valor === 'devuelto') return 'badge-info';
    return 'badge-neutral';
  }

  statusClass(estado: string): string {
    const valor = this.normalizarTexto(estado);

    if (valor === 'completado' || valor === 'finalizado') return 'badge-success';
    if (valor === 'completando') return 'badge-info';
    if (valor === 'iniciado') return 'badge-info';
    if (valor === 'en curso' || valor === 'en_curso') return 'badge-warning';
    return 'badge-neutral';
  }

  private cargarProyecto(): void {
    this.cargandoProyecto = true;
    this.cd.detectChanges();
    this.id_usuario = this.seguridadService.ObtenerDatosUsuarioIdentificadoSESION()?.usuario?.id_usuario || '';

    this.proyectoService.ObtenerProyectosPorSupervisor(this.id_usuario).subscribe({
      next: respuesta => {
        const proyectoEncontrado = (respuesta.DATOS ?? []).find(item => String(item.ID_PROYECTO ?? '') === this.idProyecto);
        this.proyecto = proyectoEncontrado ? this.mapProyectoDesdeApi(proyectoEncontrado) : null;
        if (proyectoEncontrado?.ID_PROYECTO !== undefined && proyectoEncontrado?.ID_PROYECTO !== null) {
          this.cargarBrocasPrestadasPorProyecto(Number(proyectoEncontrado.ID_PROYECTO));
        } else {
          this.brocasPrestadas = [];
        }
        this.cargandoProyecto = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.proyecto = null;
        this.brocasPrestadas = [];
        this.cargandoProyecto = false;
        this.cd.detectChanges();
      }
    });
  }

  private cargarBrocasPrestadasPorProyecto(idProyecto: number): void {
    this.cargandoBrocasPrestadas = true;
    this.cd.detectChanges();

    this.proyectoService.ObtenerProyectosConBrocasAsignadasSupervisor(idProyecto).subscribe({
      next: respuesta => {
        this.brocasPrestadas = (respuesta.DATOS ?? []).map(prestamo => this.mapPrestamoDesdeApi(prestamo));
        this.cargandoBrocasPrestadas = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.brocasPrestadas = [];
        this.cargandoBrocasPrestadas = false;
        this.cd.detectChanges();
      }
    });
  }

  private mapProyectoDesdeApi(proyecto: ProyectoListaModel): ProyectoModel {
    return {
      idProyecto: String(proyecto.ID_PROYECTO ?? ''),
      idSupervisor: proyecto.ID_SUPERVISOR ?? '',
      idDepartamento: proyecto.ID_DPTO ?? '',
      idMunicipio: proyecto.ID_MUNICIPIO ?? '',
      nombreSupervisor: proyecto.NOM_SUPERVISOR ?? '',
      nombreProyecto: proyecto.NOM_PROYECTO ?? '',
      departamento: proyecto.NOM_DEPARTAMENTO ?? '',
      municipio: proyecto.NOM_MUNICIPIO ?? '',
      descripcionProyecto: proyecto.DESCRIPCION_PROYECTO ?? '',
      fechaCreacion: this.formatearFecha(proyecto.FECHA_CREACION),
      fechaFinProyecto: this.formatearFecha(proyecto.FECHA_FIN_PROYECTO),
      status: this.mapEstadoProyectoDesdeApi(proyecto.ESTADO_PROYECTO),
      priority: proyecto.PRIORIDAD_PROYECTO ?? 'Media',
      color: proyecto.COLOR ?? 'blue',
      perforaciones: (proyecto.PERFORACIONES ?? []).map(perforacion => this.mapPerforacionDesdeApi(perforacion))
    };
  }

  private mapPerforacionDesdeApi(perforacion: BackendPerforacionModel): ProyectoModel['perforaciones'][number] {
    return {
      idPerforacion: perforacion.ID_PERFORACION ?? '',
      nombrePerforacion: perforacion.NOMBRE_PERFORACION ?? '',
      estado: perforacion.ESTADO_PERFORACION ?? '',
      profundidadObjetivo: this.formatearNumero(perforacion.PROFUNDIDAD_OBJETIVO),
      metrosPerforados: this.formatearNumero(perforacion.PROFUNDIDAD_ACTUAL),
      supervisor: perforacion.SUPERVISOR ?? '',
      historialMovimientoBrocas: (perforacion.HISTORIALMOVIMIENTOSBROCA ?? []).map(movimiento => this.mapMovimientoDesdeApi(movimiento))
    };
  }

  private mapMovimientoDesdeApi(movimiento: BackendMovimientoBrocaModel): ProyectoModel['perforaciones'][number]['historialMovimientoBrocas'][number] {
    const tipoMovimiento = String(movimiento.TIPO_MOVIMIENTO ?? '').trim().toLowerCase();

    return {
      fecha: this.formatearFechaHora(movimiento.FECHA_HORA_MOVIMIENTO),
      tipo: tipoMovimiento.includes('entrada') || tipoMovimiento.includes('ingreso') ? 'Entrada' : 'Salida',
      serialBroca: movimiento.ID_BROCA_INSTANCIADA ?? '',
      broca: movimiento.NOMBRE_BROCA ?? '',
      metrosPerforados: movimiento.PROFUNDIDAD_MOVIMIENTO ?? 0,
      observacion: movimiento.OBSERVACIONES_MOVIMIENTO ?? ''
    };
  }

  private mapPrestamoDesdeApi(prestamo: ModeloBrcoaPrestada): BrocaPrestadaViewModel {
    return {
      idPrestamo: String(prestamo.ID_PRESTAMO ?? ''),
      serialBroca: prestamo.ID_BROCA_INSTANCIADA ?? '',
      nombreBroca: prestamo.NOMBRE_BROCA ?? '',
      fechaPrestamo: this.formatearFecha(prestamo.FECHA_PRESTAMO),
      fechaDevolucion: this.formatearFecha(prestamo.FECHA_DEVOLUCION),
      estadoPrestamo: prestamo.ESTADO_PRESTAMO ?? ''
    };
  }

  private formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) {
      return '';
    }

    const fechaNormalizada = new Date(fecha);
    if (Number.isNaN(fechaNormalizada.getTime())) {
      return '';
    }

    return fechaNormalizada.toISOString().slice(0, 10);
  }

  private formatearFechaHora(fecha: Date | string | undefined): string {
    if (!fecha) {
      return '';
    }

    const fechaNormalizada = new Date(fecha);
    if (Number.isNaN(fechaNormalizada.getTime())) {
      return '';
    }

    return fechaNormalizada.toLocaleString('es-CO');
  }

  private formatearNumero(valor: number | undefined): string {
    return valor === undefined || valor === null ? '' : String(valor);
  }

  private normalizarTexto(valor: string | undefined | null): string {
    return (valor ?? '').trim().toLowerCase();
  }

  private mapEstadoProyectoDesdeApi(estado: string | undefined): string {
    const valor = this.normalizarTexto(estado).replace(/\s+/g, '_');

    if (valor === 'iniciado') return 'Iniciado';
    if (valor === 'en_curso') return 'En curso';
    if (valor === 'finalizado') return 'FINALIZADO';

    return estado ?? 'Nuevo';
  }

  private esProyectoFinalizado(estado: string | undefined | null, fechaFinProyecto: string | undefined | null): boolean {
    return this.normalizarTexto(estado) === 'finalizado' || Boolean((fechaFinProyecto ?? '').trim());
  }

  getMovimientoGrafica(perforacion: ProyectoModel['perforaciones'][number]): MovimientoGraficaData {
    const movimientos = [...(perforacion.historialMovimientoBrocas ?? [])];

    const width = this.chartWidth;
    const height = this.chartHeight;
    const paddingLeft = this.chartPaddingLeft;
    const paddingRight = this.chartPaddingRight;
    const paddingTop = this.chartPaddingTop;
    const paddingBottom = this.chartPaddingBottom;
    const innerWidth = width - paddingLeft - paddingRight;
    const innerHeight = height - paddingTop - paddingBottom;
    const maxValue = Math.max(1, ...movimientos.map(item => Number(item.metrosPerforados ?? 0)));
    const minValue = 0;
    const rawPoints = movimientos.map((movimiento, index) => {
      const total = movimientos.length;
      const x = total <= 1 ? paddingLeft + innerWidth / 2 : paddingLeft + (index * innerWidth) / (total - 1);
      const value = Number(movimiento.metrosPerforados ?? 0);
      const normalized = (value - minValue) / (maxValue - minValue || 1);
      const y = paddingTop + innerHeight - normalized * innerHeight;

      return {
        x,
        y,
        fecha: movimiento.fecha,
        tipo: movimiento.tipo,
        serialBroca: movimiento.serialBroca,
        metros: value
      } as MovimientoGraficaPunto;
    });

    const gridLines: MovimientoGraficaLinea[] = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      const y = paddingTop + innerHeight - ratio * innerHeight;
      const label = this.formatearNumeroGrafica(maxValue * ratio);
      return { y, label };
    });

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      points: rawPoints,
      gridLines,
      linePoints: rawPoints.map(point => `${point.x},${point.y}`).join(' ')
    };
  }

  private formatearNumeroGrafica(valor: number): string {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor) + ' m';
  }
}
