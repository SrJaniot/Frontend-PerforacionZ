import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProyectoModel, PerforacionModel, MovimientoBrocaModel } from '../../../../../Modelos/proyecto.model';
import { MIS_PROYECTOS_MOCK } from '../mis-proyectos-data';

type ModalActivo = 'perforacion' | 'movimiento' | null;

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
  idPerforacion: string;
  nombrePerforacion: string;
  serialBroca: string;
  nombreBroca: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  estadoPrestamo: string;
}

@Component({
  selector: 'app-mis-proyecto-detalle-page',
  templateUrl: './mis-proyecto-detalle-page.component.html',
  styleUrls: ['./mis-proyecto-detalle-page.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class MisProyectoDetallePageComponent implements OnInit {
  proyecto: ProyectoModel | null = null;
  cargandoProyecto = false;
  modalActivo: ModalActivo = null;
  modoEdicion = false;
  mostrarModalDevolucion = false;
  indicePerforacionActiva: number | null = null;
  indiceMovimientoActiva: number | null = null;
  prestamoSeleccionado: BrocaPrestadaViewModel | null = null;
  brocasPrestadas: BrocaPrestadaViewModel[] = [];

  private readonly chartWidth = 1000;
  private readonly chartHeight = 280;
  private readonly chartPaddingLeft = 64;
  private readonly chartPaddingRight = 24;
  private readonly chartPaddingTop = 20;
  private readonly chartPaddingBottom = 52;

  perforacionForm: FormGroup;
  movimientoForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.perforacionForm = this.fb.group({
      nombrePerforacion: ['', Validators.required],
      estado: ['', Validators.required],
      profundidadObjetivo: ['', Validators.required],
      metrosPerforados: ['', Validators.required],
      supervisor: ['', Validators.required]
    });

    this.movimientoForm = this.fb.group({
      fecha: ['', Validators.required],
      tipo: ['Entrada', Validators.required],
      serialBroca: ['', Validators.required],
      broca: ['', Validators.required],
      metrosPerforados: ['', Validators.required],
      observacion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarProyecto();
  }

  volver(): void {
    this.router.navigate(['/dashboard/misproyectos']);
  }

  abrirNuevaPerforacion(): void {
    this.modoEdicion = false;
    this.indicePerforacionActiva = null;
    this.perforacionForm.reset({
      nombrePerforacion: '',
      estado: 'Activa',
      profundidadObjetivo: '0 m',
      metrosPerforados: '0 m',
      supervisor: this.proyecto?.nombreSupervisor ?? ''
    });
    this.modalActivo = 'perforacion';
  }

  editarPerforacion(indice: number): void {
    if (!this.proyecto) {
      return;
    }

    const perforacion = this.proyecto.perforaciones[indice];
    this.modoEdicion = true;
    this.indicePerforacionActiva = indice;
    this.perforacionForm.patchValue({
      nombrePerforacion: perforacion.nombrePerforacion,
      estado: perforacion.estado,
      profundidadObjetivo: perforacion.profundidadObjetivo,
      metrosPerforados: perforacion.metrosPerforados,
      supervisor: perforacion.supervisor
    });
    this.modalActivo = 'perforacion';
  }

  guardarPerforacion(): void {
    if (this.perforacionForm.invalid || !this.proyecto) {
      this.perforacionForm.markAllAsTouched();
      return;
    }

    const rawValue = this.perforacionForm.getRawValue();
    const nuevaPerforacion: PerforacionModel = {
      idPerforacion: this.indicePerforacionActiva === null ? this.generarId('PERF') : this.proyecto.perforaciones[this.indicePerforacionActiva].idPerforacion,
      nombrePerforacion: rawValue.nombrePerforacion,
      estado: rawValue.estado,
      profundidadObjetivo: rawValue.profundidadObjetivo,
      metrosPerforados: rawValue.metrosPerforados,
      supervisor: rawValue.supervisor,
      historialMovimientoBrocas: this.indicePerforacionActiva === null ? [] : this.proyecto.perforaciones[this.indicePerforacionActiva].historialMovimientoBrocas
    };

    if (this.indicePerforacionActiva === null) {
      this.proyecto.perforaciones = [...this.proyecto.perforaciones, nuevaPerforacion];
    } else {
      this.proyecto.perforaciones = this.proyecto.perforaciones.map((perforacion: PerforacionModel, index: number) =>
        index === this.indicePerforacionActiva ? nuevaPerforacion : perforacion
      );
    }

    this.cerrarModal();
  }

  eliminarPerforacion(indice: number): void {
    if (!this.proyecto) {
      return;
    }

    this.proyecto.perforaciones = this.proyecto.perforaciones.filter((_: PerforacionModel, index: number) => index !== indice);
  }

  abrirNuevoMovimiento(indicePerforacion: number): void {
    if (!this.proyecto) {
      return;
    }

    this.modoEdicion = false;
    this.indicePerforacionActiva = indicePerforacion;
    this.indiceMovimientoActiva = null;
    this.movimientoForm.reset({
      fecha: this.formatearFechaHoraInput(new Date()),
      tipo: 'Entrada',
      serialBroca: '',
      broca: '',
      metrosPerforados: '0',
      observacion: ''
    });
    this.modalActivo = 'movimiento';
  }

  editarMovimiento(indicePerforacion: number, indiceMovimiento: number): void {
    if (!this.proyecto) {
      return;
    }

    const movimiento = this.proyecto.perforaciones[indicePerforacion].historialMovimientoBrocas[indiceMovimiento];
    this.modoEdicion = true;
    this.indicePerforacionActiva = indicePerforacion;
    this.indiceMovimientoActiva = indiceMovimiento;
    this.movimientoForm.patchValue({
      fecha: this.formatearFechaHoraInput(movimiento.fecha),
      tipo: movimiento.tipo,
      serialBroca: movimiento.serialBroca,
      broca: movimiento.broca,
      metrosPerforados: String(movimiento.metrosPerforados),
      observacion: movimiento.observacion
    });
    this.modalActivo = 'movimiento';
  }

  guardarMovimiento(): void {
    if (this.movimientoForm.invalid || !this.proyecto || this.indicePerforacionActiva === null) {
      this.movimientoForm.markAllAsTouched();
      return;
    }

    const rawValue = this.movimientoForm.getRawValue();
    const movimiento: MovimientoBrocaModel = {
      fecha: this.formatearFechaHoraSalida(rawValue.fecha),
      tipo: rawValue.tipo,
      serialBroca: rawValue.serialBroca,
      broca: rawValue.broca,
      metrosPerforados: Number(rawValue.metrosPerforados),
      observacion: rawValue.observacion
    };

    const perforacion = this.proyecto.perforaciones[this.indicePerforacionActiva];
    const historial = [...perforacion.historialMovimientoBrocas];

    if (this.indiceMovimientoActiva === null) {
      historial.push(movimiento);
    } else {
      historial[this.indiceMovimientoActiva] = movimiento;
    }

    this.proyecto.perforaciones = this.proyecto.perforaciones.map((item: PerforacionModel, index: number) => {
      if (index !== this.indicePerforacionActiva) {
        return item;
      }

      const metrosActuales = Number(item.metrosPerforados.replace(/[^0-9.]/g, '')) || 0;
      const metrosMovimiento = Number(rawValue.metrosPerforados) || 0;

      return {
        ...item,
        metrosPerforados: `${this.indiceMovimientoActiva === null ? metrosActuales + metrosMovimiento : metrosActuales} m`,
        historialMovimientoBrocas: historial
      };
    });

    this.cerrarModal();
  }

  abrirModalDevolverBroca(prestamo: BrocaPrestadaViewModel): void {
    this.prestamoSeleccionado = prestamo;
    this.mostrarModalDevolucion = true;
  }

  cerrarModalDevolverBroca(): void {
    this.mostrarModalDevolucion = false;
    this.prestamoSeleccionado = null;
  }

  confirmarDevolucionBroca(): void {
    if (!this.prestamoSeleccionado) {
      return;
    }

    this.brocasPrestadas = this.brocasPrestadas.map(prestamo =>
      prestamo.idPrestamo === this.prestamoSeleccionado?.idPrestamo
        ? {
            ...prestamo,
            estadoPrestamo: 'Devuelto',
            fechaDevolucion: this.formatearFecha(new Date())
          }
        : prestamo
    );

    this.cerrarModalDevolverBroca();
  }

  eliminarMovimiento(indicePerforacion: number, indiceMovimiento: number): void {
    if (!this.proyecto) {
      return;
    }

    this.proyecto.perforaciones = this.proyecto.perforaciones.map((perforacion: PerforacionModel, index: number) => {
      if (index !== indicePerforacion) {
        return perforacion;
      }

      return {
        ...perforacion,
        historialMovimientoBrocas: perforacion.historialMovimientoBrocas.filter((_: MovimientoBrocaModel, movimientoIndex: number) => movimientoIndex !== indiceMovimiento)
      };
    });
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

  trackPerforacion(index: number, perforacion: PerforacionModel): string {
    return perforacion.idPerforacion || String(index);
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
    if (valor === 'prestada') return 'badge-warning';
    return 'badge-neutral';
  }

  getMovimientoGrafica(perforacion: PerforacionModel): MovimientoGraficaData {
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

  cerrarModal(): void {
    this.modalActivo = null;
    this.modoEdicion = false;
    this.indicePerforacionActiva = null;
    this.indiceMovimientoActiva = null;
    this.perforacionForm.reset();
    this.movimientoForm.reset();
  }

  private cargarProyecto(): void {
    this.cargandoProyecto = true;
    const idProyecto = this.route.snapshot.paramMap.get('id');
    this.proyecto = MIS_PROYECTOS_MOCK.find(item => item.idProyecto === idProyecto) ?? null;
    this.brocasPrestadas = this.proyecto ? this.crearBrocasPrestadasLocales(this.proyecto) : [];
    this.cargandoProyecto = false;
  }

  private crearBrocasPrestadasLocales(proyecto: ProyectoModel): BrocaPrestadaViewModel[] {
    const brocas: BrocaPrestadaViewModel[] = [];

    proyecto.perforaciones.forEach((perforacion, index) => {
      const movimientoBase = perforacion.historialMovimientoBrocas[0];

      brocas.push({
        idPrestamo: `${perforacion.idPerforacion || 'PERF'}-${index + 1}`,
        idPerforacion: perforacion.idPerforacion,
        nombrePerforacion: perforacion.nombrePerforacion,
        serialBroca: movimientoBase?.serialBroca || `SER-${index + 1}`,
        nombreBroca: movimientoBase?.broca || `Broca ${index + 1}`,
        fechaPrestamo: movimientoBase?.fecha ? movimientoBase.fecha : this.formatearFecha(new Date()),
        fechaDevolucion: '',
        estadoPrestamo: 'Prestada'
      });
    });

    return brocas;
  }

  private formatearFechaHoraInput(fecha: Date | string): string {
    const fechaNormalizada = new Date(fecha);

    if (Number.isNaN(fechaNormalizada.getTime())) {
      return '';
    }

    const pad = (valor: number): string => String(valor).padStart(2, '0');
    return `${fechaNormalizada.getFullYear()}-${pad(fechaNormalizada.getMonth() + 1)}-${pad(fechaNormalizada.getDate())}T${pad(fechaNormalizada.getHours())}:${pad(fechaNormalizada.getMinutes())}`;
  }

  private formatearFechaHoraSalida(valor: string): string {
    const fechaNormalizada = new Date(valor);

    if (Number.isNaN(fechaNormalizada.getTime())) {
      return valor;
    }

    return fechaNormalizada.toISOString();
  }

  private formatearNumeroGrafica(valor: number): string {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor) + ' m';
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

  private normalizarTexto(valor: string | undefined | null): string {
    return (valor ?? '').trim().toLowerCase();
  }

  private generarId(prefijo: string): string {
    const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${prefijo}-${aleatorio}`;
  }
}
