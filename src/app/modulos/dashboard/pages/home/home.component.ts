import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ProyectoListaModel } from '../../../../Modelos/ProyectosLista.model';
import { ModeloBrcoaPrestada } from '../../../../Modelos/ModeloBrcoaPrestada';
import { ModeloBrcoaPrestadaActivos } from '../../../../Modelos/ModeloBrcoaPrestadaActivos';
import { BrocasService } from '../../../../servicios/brocas.service';
import { Estadisticas } from '../../../../servicios/estadisticas';
import { ProyectoService } from '../../../../servicios/proyecto.service';
import { SeguridadService } from '../../../../servicios/seguridad';
import { UsuariosService } from '../../../../servicios/usuarios';

interface HomeStatItem {
  label: string;
  value: string;
  helper: string;
  color: 'blue' | 'emerald' | 'amber' | 'cyan';
  icon: 'users' | 'briefcase' | 'package' | 'dollar' | 'check';
}

interface HomeActionItem {
  title: string;
  subtitle: string;
  route: string;
  color: 'blue' | 'emerald' | 'amber' | 'cyan';
  icon: 'users' | 'briefcase' | 'package' | 'chart';
}

interface HomeActivityItem {
  user: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
}

interface HomeTopProject {
  name: string;
  movimientos: number;
  status: string;
  statusType: 'warning' | 'success' | 'info';
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  esAdmin = false;
  esSupervisor = false;

  cargando = false;
  errorCarga = '';
  idSupervisorActual = '';

  // variable que toma la fecha actual y la formatea en español
  currentDate: string = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  statsAdmin: HomeStatItem[] = [];

  statsSupervisor: HomeStatItem[] = [];

  homeActionsAdmin: HomeActionItem[] = [
    { title: 'Gestionar usuarios', subtitle: 'Crear, editar y revisar roles', route: '/dashboard/usuarios', color: 'blue', icon: 'users' },
    { title: 'Administrar proyectos', subtitle: 'Ver progreso general', route: '/dashboard/proyectos', color: 'emerald', icon: 'briefcase' },
    { title: 'Control de inventario', subtitle: 'Brocas, prestamos e historial', route: '/dashboard/inventario', color: 'amber', icon: 'package' },
    { title: 'Analisis operativo', subtitle: 'Metricas y comparativos', route: '/dashboard/estadisticas', color: 'cyan', icon: 'chart' }
  ];

  homeActionsSupervisor: HomeActionItem[] = [
    { title: 'Mis proyectos', subtitle: 'Seguimiento diario', route: '/dashboard/mis-proyectos', color: 'emerald', icon: 'briefcase' },
    { title: 'Inventario disponible', subtitle: 'Revisar brocas para operacion', route: '/dashboard/inventario', color: 'amber', icon: 'package' },
    { title: 'Actualizar avances', subtitle: 'Registrar movimientos y novedades', route: '/dashboard/mis-proyectos', color: 'blue', icon: 'users' }
  ];

  recentActivity: HomeActivityItem[] = [];

  topProjects: HomeTopProject[] = [];

  constructor(
    private readonly seguridadService: SeguridadService,
    private readonly usuariosService: UsuariosService,
    private readonly proyectoService: ProyectoService,
    private readonly brocasService: BrocasService,
    private readonly estadisticasService: Estadisticas,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const rol = this.seguridadService.obtenerRolIdActual();
    this.esAdmin = rol === 1;
    this.esSupervisor = rol === 2;
    this.idSupervisorActual = this.seguridadService.ObtenerDatosUsuarioIdentificadoSESION()?.usuario?.id_usuario ?? '';

    this.cargarDatosHome();
  }

  get statsVisibles(): HomeStatItem[] {
    return this.esSupervisor ? this.statsSupervisor : this.statsAdmin;
  }

  get accionesVisibles(): HomeActionItem[] {
    return this.esSupervisor ? this.homeActionsSupervisor : this.homeActionsAdmin;
  }

  navegarAccion(route: string, event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl(route);
  }

  irASeguimientoAdmin(): void {
    this.router.navigateByUrl('/dashboard/proyectos');
  }

  irAVerTodosProyectos(): void {
    if (this.esSupervisor) {
      this.router.navigateByUrl('/dashboard/mis-proyectos');
      return;
    }

    this.router.navigateByUrl('/dashboard/proyectos');
  }

  private cargarDatosHome(): void {
    this.cargando = true;
    this.errorCarga = '';
    this.cdr.markForCheck();

    if (this.esSupervisor) {
      this.cargarHomeSupervisor();
      return;
    }

    this.cargarHomeAdmin();
  }

  private cargarHomeAdmin(): void {
    forkJoin({
      usuarios: this.usuariosService.ObtenerUsuarios().pipe(catchError(() => of({ DATOS: [] }))),
      proyectos: this.proyectoService.ObtenerProyectos().pipe(catchError(() => of({ DATOS: [] }))),
      brocas: this.brocasService.ObtenerBrocasInstanciadas().pipe(catchError(() => of({ DATOS: [] }))),
      prestamos: this.brocasService.ObtenerBrocasPrestadasActivos().pipe(catchError(() => of({ DATOS: [] }))),
      estadisticasProyecto: this.estadisticasService.ObtenerEstadisticaMetrosvsBrocaPorProyecto().pipe(catchError(() => of({ DATOS: [] })))
    }).subscribe({
      next: ({ usuarios, proyectos, brocas, prestamos, estadisticasProyecto }) => {
        const usuariosLista = usuarios.DATOS ?? [];
        const proyectosLista = proyectos.DATOS ?? [];
        const brocasLista = brocas.DATOS ?? [];
        const prestamosLista = prestamos.DATOS ?? [];
        const estadisticaLista = estadisticasProyecto.DATOS ?? [];

        const totalActivos = usuariosLista.filter((u) => u.aceptado).length;
        const totalSupervisores = usuariosLista.filter((u) => Number(u.rolid) === 2).length;
        const totalProyectos = proyectosLista.length;
        const proyectosEnEjecucion = proyectosLista.filter((p) => this.esEstadoEnEjecucion(p.ESTADO_PROYECTO)).length;
        const proyectosIniciados = proyectosLista.filter((p) => this.esEstadoIniciado(p.ESTADO_PROYECTO)).length;
        const proyectosActivos = proyectosLista.filter((p) => this.esEstadoActivo(p.ESTADO_PROYECTO));
        const totalBrocas = brocasLista.length;
        const brocasDisponibles = brocasLista.filter((b) => (b.DISPONIBILIDAD_BROCA ?? '').toUpperCase() === 'DISPONIBLE').length;
        const totalMetros = estadisticaLista.reduce((acc, item) => acc + this.numeroSeguro(item.METROS_PERFORADOS), 0);
        const movimientosRegistrados = estadisticaLista.reduce((acc, item) => acc + this.numeroSeguro(item.TOTAL_MOVIMIENTOS), 0);

        this.statsAdmin = [
          { label: 'Usuarios activos', value: this.formatoNumero(totalActivos), helper: `${this.formatoNumero(totalSupervisores)} supervisores`, color: 'blue', icon: 'users' },
          { label: 'Proyectos totales', value: this.formatoNumero(totalProyectos), helper: `${this.formatoNumero(proyectosEnEjecucion)} en curso | ${this.formatoNumero(proyectosIniciados)} iniciados`, color: 'emerald', icon: 'briefcase' },
          { label: 'Brocas registradas', value: this.formatoNumero(totalBrocas), helper: `${this.formatoNumero(brocasDisponibles)} disponibles`, color: 'amber', icon: 'package' },
          { label: 'Metros perforados', value: this.formatoNumero(totalMetros), helper: `${this.formatoNumero(movimientosRegistrados)} movimientos`, color: 'cyan', icon: 'dollar' }
        ];

        this.topProjects = this.construirTopProyectos(proyectosActivos, 4);
        this.recentActivity = this.construirActividadAdmin(proyectosLista, prestamosLista);
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = 'No fue posible cargar la información del Home.';
        this.cdr.markForCheck();
      }
    });
  }

  private cargarHomeSupervisor(): void {
    if (!this.idSupervisorActual) {
      this.cargando = false;
      this.errorCarga = 'No se pudo identificar el supervisor actual.';
      this.cdr.markForCheck();
      return;
    }

    forkJoin({
      proyectos: this.proyectoService.ObtenerProyectosPorSupervisor(this.idSupervisorActual).pipe(catchError(() => of({ DATOS: [] })))
    }).subscribe({
      next: ({ proyectos }) => {
        const proyectosLista = proyectos.DATOS ?? [];
        const proyectosActivos = proyectosLista.filter((p) => this.esEstadoActivo(p.ESTADO_PROYECTO));

        this.cargarPrestamosSupervisorPorProyectos(proyectosActivos).subscribe((prestamosSupervisor) => {
          const brocasDisponibles = new Set(
            prestamosSupervisor
              .filter((p) => this.normalizarEstadoPrestamo(p.ESTADO_PRESTAMO) === 'DISPONIBLE')
              .map((p) => p.ID_BROCA_INSTANCIADA ?? '')
              .filter(Boolean)
          ).size;
          const prestamosPendientes = prestamosSupervisor.filter((p) => this.normalizarEstadoPrestamo(p.ESTADO_PRESTAMO) !== 'DEVUELTO').length;
        const movimientosEstimados = proyectosLista.reduce((acc, item) => acc + this.contarMovimientosProyecto(item), 0);

          this.statsSupervisor = [
            { label: 'Mis proyectos activos', value: this.formatoNumero(proyectosActivos.length), helper: `${this.formatoNumero(proyectosLista.length)} en total`, color: 'emerald', icon: 'briefcase' },
            { label: 'Movimientos registrados', value: this.formatoNumero(movimientosEstimados), helper: 'En perforaciones cargadas', color: 'blue', icon: 'check' },
            { label: 'Brocas disponibles', value: this.formatoNumero(brocasDisponibles), helper: 'Asignadas a mis proyectos', color: 'amber', icon: 'package' },
            { label: 'Prestamos pendientes', value: this.formatoNumero(prestamosPendientes), helper: 'Aun no devueltos', color: 'cyan', icon: 'users' }
          ];

          this.topProjects = this.construirTopProyectos(proyectosActivos, 4);
          this.recentActivity = this.construirActividadSupervisor(proyectosActivos, this.mapPrestamosActivos(prestamosSupervisor));
          this.cargando = false;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = 'No fue posible cargar la información del Home.';
        this.cdr.markForCheck();
      }
    });
  }

  private construirTopProyectos(proyectos: ProyectoListaModel[], limite: number): HomeTopProject[] {
    return [...proyectos]
      .sort((a, b) => this.contarMovimientosProyecto(b) - this.contarMovimientosProyecto(a))
      .slice(0, limite)
      .map((proyecto) => {
        const estado = (proyecto.ESTADO_PROYECTO ?? 'Sin estado').toString();
        const movimientos = this.contarMovimientosProyecto(proyecto);
        return {
          name: proyecto.NOM_PROYECTO ?? 'Proyecto sin nombre',
          movimientos,
          status: estado,
          statusType: this.mapearStatusType(estado)
        };
      });
  }

  private construirActividadAdmin(proyectos: ProyectoListaModel[], prestamos: ModeloBrcoaPrestadaActivos[]): HomeActivityItem[] {
    const actividadesProyecto = [...proyectos]
      .sort((a, b) => this.fechaSeguro(b.FECHA_CREACION).getTime() - this.fechaSeguro(a.FECHA_CREACION).getTime())
      .slice(0, 3)
      .map((item) => ({
        user: item.NOM_SUPERVISOR ?? 'Supervisor',
        action: 'actualizó el proyecto',
        target: item.NOM_PROYECTO ?? 'Sin nombre',
        time: this.formatoFechaRelativa(item.FECHA_CREACION),
        avatar: this.avatarDesdeTexto(item.NOM_SUPERVISOR ?? 'Supervisor')
      }));

    const actividadesPrestamo = [...prestamos]
      .slice(0, 2)
      .map((item) => ({
        user: 'Sistema',
        action: 'registró préstamo de broca',
        target: `${item.NOMBRE_BROCA ?? 'Broca'} en ${item.NOMBRE_PROYECTO ?? 'proyecto'}`,
        time: this.formatoFechaRelativa(item.FECHA_PRESTAMO),
        avatar: 'SY'
      }));

    return [...actividadesProyecto, ...actividadesPrestamo].slice(0, 5);
  }

  private construirActividadSupervisor(proyectos: ProyectoListaModel[], prestamos: ModeloBrcoaPrestadaActivos[]): HomeActivityItem[] {
    const actividadesProyecto = [...proyectos]
      .sort((a, b) => this.fechaSeguro(b.FECHA_CREACION).getTime() - this.fechaSeguro(a.FECHA_CREACION).getTime())
      .slice(0, 3)
      .map((item) => ({
        user: 'Proyecto',
        action: 'con estado',
        target: `${item.NOM_PROYECTO ?? 'Sin nombre'} (${item.ESTADO_PROYECTO ?? 'Sin estado'})`,
        time: this.formatoFechaRelativa(item.FECHA_CREACION),
        avatar: 'PR'
      }));

    const actividadesPrestamo = [...prestamos]
      .slice(0, 2)
      .map((item) => ({
        user: 'Inventario',
        action: 'tiene broca prestada en',
        target: item.NOMBRE_PROYECTO ?? 'proyecto',
        time: this.formatoFechaRelativa(item.FECHA_PRESTAMO),
        avatar: 'IN'
      }));

    return [...actividadesProyecto, ...actividadesPrestamo].slice(0, 5);
  }

  private contarMovimientosProyecto(proyecto: ProyectoListaModel): number {
    const perforaciones = proyecto.PERFORACIONES ?? [];
    return perforaciones.reduce((acc, perforacion) => acc + (perforacion.HISTORIALMOVIMIENTOSBROCA?.length ?? 0), 0);
  }

  private mapearStatusType(estado?: string): 'warning' | 'success' | 'info' {
    if (this.esEstadoFinalizado(estado)) {
      return 'success';
    }
    if (this.esEstadoEnEjecucion(estado)) {
      return 'warning';
    }
    return 'info';
  }

  private esEstadoFinalizado(estado?: string): boolean {
    const valor = this.normalizarEstadoProyecto(estado);
    return valor.includes('FINALIZADO') || valor.includes('COMPLETADO');
  }

  private esEstadoEnEjecucion(estado?: string): boolean {
    const valor = this.normalizarEstadoProyecto(estado);
    return valor.includes('EN_CURSO') || valor.includes('EJECUCION') || valor.includes('EJECUTANDO');
  }

  private esEstadoIniciado(estado?: string): boolean {
    const valor = this.normalizarEstadoProyecto(estado);
    return valor.includes('INICIADO') || valor.includes('INICIANDO');
  }

  private esEstadoActivo(estado?: string): boolean {
    return this.esEstadoEnEjecucion(estado);
  }

  private normalizarEstadoProyecto(estado?: string): string {
    return (estado ?? '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  }

  private normalizarEstadoPrestamo(estado?: string): string {
    return (estado ?? '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private cargarPrestamosSupervisorPorProyectos(proyectos: ProyectoListaModel[]) {
    const idsProyecto = proyectos
      .map((p) => p.ID_PROYECTO)
      .filter((id): id is number => typeof id === 'number');

    if (idsProyecto.length === 0) {
      return of([] as ModeloBrcoaPrestada[]);
    }

    return forkJoin(
      idsProyecto.map((idProyecto) =>
        this.proyectoService
          .ObtenerProyectosConBrocasAsignadasSupervisor(idProyecto)
          .pipe(catchError(() => of({ DATOS: [] })))
      )
    ).pipe(
      map((responses) => responses.flatMap((resp) => resp.DATOS ?? [])),
      catchError(() => of([] as ModeloBrcoaPrestada[]))
    );
  }

  private mapPrestamosActivos(prestamos: ModeloBrcoaPrestada[]): ModeloBrcoaPrestadaActivos[] {
    return prestamos.map((item) => ({
      ID_PRESTAMO: item.ID_PRESTAMO,
      ID_BROCA_INSTANCIADA: item.ID_BROCA_INSTANCIADA,
      ID_PROYECTO: undefined,
      NOMBRE_PROYECTO: undefined,
      NOMBRE_BROCA: item.NOMBRE_BROCA,
      FECHA_PRESTAMO: item.FECHA_PRESTAMO,
      FECHA_DEVOLUCION: item.FECHA_DEVOLUCION,
      ESTADO_PRESTAMO: item.ESTADO_PRESTAMO
    }));
  }

  private formatoNumero(valor: number): string {
    return new Intl.NumberFormat('es-CO').format(valor);
  }

  private numeroSeguro(valor: number | undefined): number {
    if (typeof valor !== 'number' || Number.isNaN(valor)) {
      return 0;
    }

    return valor;
  }

  private avatarDesdeTexto(texto: string): string {
    const partes = texto.trim().split(' ').filter(Boolean);
    if (partes.length === 0) {
      return 'NA';
    }

    return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }

  private fechaSeguro(fecha?: Date): Date {
    if (!fecha) {
      return new Date(0);
    }

    const valor = new Date(fecha);
    return Number.isNaN(valor.getTime()) ? new Date(0) : valor;
  }

  private formatoFechaRelativa(fecha?: Date): string {
    const fechaBase = this.fechaSeguro(fecha);
    if (fechaBase.getTime() === 0) {
      return 'Sin fecha';
    }

    return fechaBase.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
