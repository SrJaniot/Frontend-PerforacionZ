import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProyectoModel } from '../../../../../Modelos/proyecto.model';
import { ProyectoListaModel } from '../../../../../Modelos/ProyectosLista.model';
import { ModeloBrcoaPrestada } from '../../../../../Modelos/ModeloBrcoaPrestada';
import { PerforacionModel as BackendPerforacionModel } from '../../../../../Modelos/PerforacionModel';
import { MovimientoBrocaModel as BackendMovimientoBrocaModel } from '../../../../../Modelos/MovimientoBroca.model';
import { ProyectoService } from '../../../../../servicios/proyecto.service';

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
export class ProyectoDetallePageComponent implements OnInit {
  proyecto: ProyectoModel | null = null;
  cargandoProyecto = false;
  cargandoBrocasPrestadas = false;
  brocasPrestadas: BrocaPrestadaViewModel[] = [];
  private idProyecto: string | null = null;
  private readonly chartWidth = 1000;
  private readonly chartHeight = 280;
  private readonly chartPaddingLeft = 64;
  private readonly chartPaddingRight = 24;
  private readonly chartPaddingTop = 20;
  private readonly chartPaddingBottom = 52;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proyectoService: ProyectoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idProyecto = this.route.snapshot.paramMap.get('id');
    this.cargarProyecto();
  }

  volver(): void {
    this.router.navigate(['/dashboard/proyectos']);
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

  private cargarProyecto(): void {
    this.cargandoProyecto = true;
    this.cd.detectChanges();

    this.proyectoService.ObtenerProyectos().subscribe({
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

    this.proyectoService.ObtenerProyectosConBrocasAsignadas(idProyecto).subscribe({
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
      nombreSupervisor: proyecto.NOM_SUPERVISOR ?? '',
      nombreProyecto: proyecto.NOM_PROYECTO ?? '',
      departamento: proyecto.NOM_DEPARTAMENTO ?? '',
      municipio: proyecto.NOM_MUNICIPIO ?? '',
      descripcionProyecto: proyecto.DESCRIPCION_PROYECTO ?? '',
      fechaCreacion: this.formatearFecha(proyecto.FECHA_CREACION),
      status: proyecto.ESTADO_PROYECTO ?? 'Nuevo',
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
