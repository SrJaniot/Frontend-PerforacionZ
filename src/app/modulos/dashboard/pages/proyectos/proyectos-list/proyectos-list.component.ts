import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { ProyectoModel } from '../../../../../Modelos/proyecto.model';
import { ProyectoListaModel } from '../../../../../Modelos/ProyectosLista.model';
import { DepartamentoModel } from '../../../../../Modelos/DepartamentoModel';
import { MunicipioModel } from '../../../../../Modelos/MunicipioModel';
import { PerforacionModel as BackendPerforacionModel } from '../../../../../Modelos/PerforacionModel';
import { MovimientoBrocaModel as BackendMovimientoBrocaModel } from '../../../../../Modelos/MovimientoBroca.model';
import { ProyectoService } from '../../../../../servicios/proyecto.service';
import { UsuariosService } from '../../../../../servicios/usuarios';
import { SeguridadService } from '../../../../../servicios/seguridad';
import { usuarioModel } from '../../../../../Modelos/usuario.model';

@Component({
  selector: 'app-proyectos-list',
  templateUrl: './proyectos-list.component.html',
  styleUrls: ['./proyectos-list.component.scss'],
  standalone: false
})
export class ProyectosListComponent implements OnInit, OnDestroy {
  view: 'cards' | 'list' = 'cards';
  showModal = false;
  showEditar = false;
  searchQuery = '';
  proyectoSeleccionado: ProyectoModel | null = null;
  private bodyOverflowBeforeModal = '';
  cargandoProyectos = false;
  cargandoConfiguracion = false;
  cargandoSupervisores = false;
  errorCarga = '';
  currentPage = 1;
  readonly pageSize = 6;

  projectForm = new FormGroup({
    id_supervisor: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nom_proyecto: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    departamento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    id_municipio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion_proyecto: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  departamentos: DepartamentoModel[] = [];
  municipiosCrearDisponibles: MunicipioModel[] = [];
  supervisoresDisponibles: usuarioModel[] = [];

  projects: ProyectoModel[] = [];
  constructor(
    private router: Router,
    private proyectoService: ProyectoService,
    private usuariosService: UsuariosService,
    private seguridadService: SeguridadService,
    private toast: NgToastService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarDepartamentos();
    this.cargarSupervisores();
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  get filteredProjects() {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      return this.projects;
    }

    return this.projects.filter(project =>
      [
        project.idProyecto,
        project.nombreSupervisor,
          project.nombreProyecto,
        project.departamento,
        project.municipio,
        project.descripcionProyecto,
        project.fechaCreacion,
        project.status,
        project.priority
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query))
    );
  }

  get totalProjects(): number {
    return this.filteredProjects.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalProjects / this.pageSize));
  }

  get safeCurrentPage(): number {
    return Math.min(Math.max(this.currentPage, 1), this.totalPages);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get mobilePageNumbers(): number[] {
    return this.buildMobilePageNumbers(this.safeCurrentPage, this.totalPages);
  }

  get paginatedProjects(): ProyectoModel[] {
    const page = this.safeCurrentPage;
    const startIndex = (page - 1) * this.pageSize;

    return this.filteredProjects.slice(startIndex, startIndex + this.pageSize);
  }

  get startProjectIndex(): number {
    if (this.totalProjects === 0) {
      return 0;
    }

    return (this.safeCurrentPage - 1) * this.pageSize + 1;
  }

  get endProjectIndex(): number {
    return Math.min(this.startProjectIndex + this.pageSize - 1, this.totalProjects);
  }

  priorityClass(p: string) {
    if (p === 'Alta') return 'badge-danger';
    if (p === 'Media') return 'badge-warning';
    return 'badge-neutral';
  }

  statusClass(s: string) {
    if (s === 'Completado') return 'badge-success';
    if (s === 'Completando') return 'badge-info';
    if (s === 'En curso') return 'badge-warning';
    return 'badge-neutral';
  }

  colorClass(color: string) {
    if (color === 'blue') return 'bg-blue-500';
    if (color === 'emerald') return 'bg-emerald-500';
    if (color === 'amber') return 'bg-amber-500';
    if (color === 'cyan') return 'bg-cyan-500';
    if (color === 'red') return 'bg-red-500';
    if (color === 'purple') return 'bg-violet-500';

    return 'bg-slate-500';
  }

  abrirDetalle(proyecto: ProyectoModel): void {
    this.router.navigate(['/dashboard/proyectos/detalle', proyecto.idProyecto]);
  }

  abrirEditar(proyecto: ProyectoModel): void {
    this.proyectoSeleccionado = proyecto;
    this.showEditar = true;
  }

  abrirCrearModal(): void {
    this.resetCreateForm();
    this.lockBodyScroll();
    this.showModal = true;
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages) {
      return;
    }

    this.currentPage = pagina;
  }

  paginaAnterior(): void {
    this.irAPagina(this.currentPage - 1);
  }

  paginaSiguiente(): void {
    this.irAPagina(this.currentPage + 1);
  }

  private buildMobilePageNumbers(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 2) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage >= totalPages) {
      return [totalPages - 1, totalPages];
    }

    return [currentPage, currentPage + 1];
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  cerrarCrearModal(): void {
    this.showModal = false;
    this.resetCreateForm();
    this.restoreBodyScroll();
  }

  cerrarEditar(): void {
    this.showEditar = false;
    this.proyectoSeleccionado = null;
  }

  actualizarLista(proyectoActualizado: ProyectoModel): void {
    this.projects = this.projects.map(proyecto =>
      proyecto.idProyecto === proyectoActualizado.idProyecto ? proyectoActualizado : proyecto
    );
  }

  cargarProyectos(): void {
    this.cargandoProyectos = true;
    this.errorCarga = '';
    this.cd.detectChanges();

    this.proyectoService.ObtenerProyectos()
      .pipe(finalize(() => {
        this.cargandoProyectos = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          this.projects = (respuesta.DATOS ?? []).map(proyecto => this.mapProyectoDesdeApi(proyecto));
          this.currentPage = 1;
          this.cd.detectChanges();
        },
        error: () => {
          this.projects = [];
          this.errorCarga = 'No fue posible cargar los proyectos desde la base de datos.';
          this.currentPage = 1;
          this.cd.detectChanges();
        }
      });
  }

  cargarDepartamentos(): void {
    this.cargandoConfiguracion = true;
    this.cd.detectChanges();

    this.proyectoService.ObtenerDepartamentos()
      .pipe(finalize(() => {
        this.cargandoConfiguracion = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          this.departamentos = (respuesta.DATOS ?? []).map(departamento => ({
            ID_DPTO: departamento.ID_DPTO,
            NOM_DPTO: departamento.NOM_DPTO
          }));
          this.cd.detectChanges();
        },
        error: () => {
          this.departamentos = [];
          this.toast.danger('Error al cargar los departamentos', 'Error', 5000, true, true, true);
          this.cd.detectChanges();
        }
      });
  }

  cargarSupervisores(): void {
    this.cargandoSupervisores = true;
    this.cd.detectChanges();

    this.usuariosService.ObtenerUsuarios()
      .pipe(finalize(() => {
        this.cargandoSupervisores = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          this.supervisoresDisponibles = (respuesta.DATOS ?? []).filter(usuario => Number(usuario.rolid) === 2);
          this.cd.detectChanges();
        },
        error: () => {
          this.supervisoresDisponibles = [];
          this.toast.danger('Error al cargar los supervisores', 'Error', 5000, true, true, true);
          this.cd.detectChanges();
        }
      });
  }

  onDepartamentoCrearChange(): void {
    const idDepartamento = this.projectForm.controls.departamento.value;

    this.projectForm.controls.id_municipio.setValue('');
    this.municipiosCrearDisponibles = [];

    if (!idDepartamento) {
      this.projectForm.controls.id_municipio.setValue('');
      this.municipiosCrearDisponibles = [];

      return;
    }

    this.proyectoService.ObtenerMunicipiosPorDepartamento(idDepartamento).subscribe({
      next: respuesta => {
        this.municipiosCrearDisponibles = (respuesta.DATOS ?? []).map(municipio => ({
          ID_MUNICIPIO: municipio.ID_MUNICIPIO,
          NOM_MUNICIPIO: municipio.NOM_MUNICIPIO
        }));
        this.cd.detectChanges();
      },
      error: () => {
        this.municipiosCrearDisponibles = [];
        this.toast.danger('Error al cargar los municipios', 'Error', 5000, true, true, true);
        this.cd.detectChanges();
      }
    });
  }

  crearProyecto(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      this.toast.warning('Por favor complete todos los campos correctamente', 'Advertencia', 5000, true, true, true);
      return;
    }

    const usuarioInsert = this.seguridadService.ObtenerDatosUsuarioIdentificadoSESION()?.usuario?.nombre || 'admin';
    const idSupervisor = this.projectForm.controls.id_supervisor.value;
    const nomProyecto = this.projectForm.controls.nom_proyecto.value;
    const idMunicipio = this.projectForm.controls.id_municipio.value;
    const descripcionProyecto = this.projectForm.controls.descripcion_proyecto.value;

    this.proyectoService.CrearProyecto(idSupervisor, nomProyecto, idMunicipio, descripcionProyecto, usuarioInsert)
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Proyecto creado correctamente', 'Éxito', 5000, true, true, true);
            this.cerrarCrearModal();
            this.cargarProyectos();
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible crear el proyecto', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al crear el proyecto', 'Error', 5000, true, true, true);
        }
      });
  }

  private resetCreateForm(): void {
    this.projectForm.reset({
      id_supervisor: '',
      nom_proyecto: '',
      departamento: '',
      id_municipio: '',
      descripcion_proyecto: ''
    });
    this.municipiosCrearDisponibles = [];
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

  private lockBodyScroll(): void {
    if (typeof document === 'undefined') {
      return;
    }

    this.bodyOverflowBeforeModal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  private restoreBodyScroll(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow = this.bodyOverflowBeforeModal;
  }
}
