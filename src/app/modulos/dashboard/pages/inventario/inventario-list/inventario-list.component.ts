import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { ModeloBroca } from '../../../../../Modelos/ModeloBroca.model';
import { BrocaInstanciadaModel } from '../../../../../Modelos/BrocaInstanciadaModel';
import { ModeloBrcoaPrestadaActivos } from '../../../../../Modelos/ModeloBrcoaPrestadaActivos';
import { ModeloHistorialBrocaInstanciada } from '../../../../../Modelos/ModeloHistorialBrocaInstanciada';
import { ProyectoListaModel } from '../../../../../Modelos/ProyectosLista.model';
import { BrocasService } from '../../../../../servicios/brocas.service';
import { ProyectoService } from '../../../../../servicios/proyecto.service';
import { SeguridadService } from '../../../../../servicios/seguridad';

interface ModeloBrocaViewModel {
  idModeloBroca: string;
  nombreBroca: string;
  tipoBroca: string;
  descripcionBroca: string;
  tamanoBroca: string;
  matrixBroca: string;
  marcaBroca: string;
}

interface BrocaInstanciadaViewModel {
  idBrocaInstanciada: string;
  idModeloBroca: string;
  nombreModeloBroca: string;
  tipoModeloBroca: string;
  estadoBroca: string;
  disponibilidadBroca: string;
  fechaRegistroBroca: string;
  fechaUltimoUsoBroca: string;
}

interface ProyectoPrestamoViewModel {
  idProyecto: number;
  nombreProyecto: string;
  estadoProyecto: string;
}

interface BrocaPrestadaActivaViewModel {
  idPrestamo: number;
  idBrocaInstanciada: string;
  idProyecto: number;
  nombreProyecto: string;
  nombreBroca: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  estadoPrestamo: string;
}

interface HistorialPrestamoBrocaViewModel {
  idEvento: string;
  idPrestamo: number;
  idProyecto: number;
  nombreProyecto: string;
  tipoEvento: 'PRESTAMO' | 'DEVOLUCION';
  fechaEvento: string;
  estadoPrestamo: string;
  fechaOrden: number;
}

type InventarioTab = 'modelos' | 'brocas' | 'prestadas' | 'historial';

@Component({
  selector: 'app-inventario-list',
  templateUrl: './inventario-list.component.html',
  styleUrls: ['./inventario-list.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class InventarioListComponent implements OnInit, OnDestroy {
  activeTab: InventarioTab = 'modelos';
  searchModelos = '';
  searchBrocas = '';
  searchPrestadas = '';
  serialHistorialTemp = '';
  serialHistorial = '';
  showModeloModal = false;
  showModeloEditModal = false;
  showBrocaModal = false;
  showBrocaEditModal = false;
  showPrestamoModal = false;
  showSerialHistorialModal = false;
  showEliminarBrocaModal = false;
  showMarcarDaniadaModal = false;
  loadingModelos = false;
  loadingBrocas = false;
  loadingPrestadas = false;
  loadingHistorial = false;
  loadingProyectosPrestamo = false;
  savingModelo = false;
  savingBroca = false;
  savingPrestamo = false;
  deletingModeloId = '';
  deletingBrocaId = '';
  markingDaniadaId = '';
  errorCargaModelos = '';
  errorCargaBrocas = '';
  errorCargaPrestadas = '';
  errorCargaHistorial = '';
  currentModelosPage = 1;
  currentBrocasPage = 1;
  currentPrestadasPage = 1;
  readonly pageSize = 6;
  modeloSeleccionado: ModeloBrocaViewModel | null = null;
  brocaSeleccionada: BrocaInstanciadaViewModel | null = null;
  brocaPendienteEliminar: BrocaInstanciadaViewModel | null = null;
  brocaPendienteDaniada: BrocaInstanciadaViewModel | null = null;
  private bodyOverflowBeforeModal = '';

  readonly tiposBroca = ['PDC', 'Tricónica', 'Diamante', 'Híbrida', 'Cono de rodillos'];
  readonly matricesBroca = ['M-1', 'M-2', 'M-3', 'M-4'];
  readonly marcasBroca = ['Smith', 'Baker Hughes', 'Halliburton', 'Schlumberger', 'National Oilwell'];
  readonly estadoBrocaOptions = ['NUEVA', 'EN_USO', 'USADA', 'DESGASTADA'];
  readonly disponibilidadBrocaOptions = ['DISPONIBLE', 'NO_DISPONIBLE'];

  modelosBroca: ModeloBrocaViewModel[] = [];
  brocasRegistradas: BrocaInstanciadaViewModel[] = [];
  brocasPrestadasActivas: BrocaPrestadaActivaViewModel[] = [];
  historialPrestamosBroca: HistorialPrestamoBrocaViewModel[] = [];
  proyectosDisponiblesPrestamo: ProyectoPrestamoViewModel[] = [];

  modeloForm = new FormGroup({
    nom_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tipo_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tamanop_broca: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
    matrix_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    marca_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  modeloEditForm = new FormGroup({
    id_broca: new FormControl({ value: '', disabled: true }),
    nom_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tipo_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tamanop_broca: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
    matrix_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    marca_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  brocaForm = new FormGroup({
    id_broca_instanciada: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    id_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  brocaEditForm = new FormGroup({
    id_broca_instanciada: new FormControl({ value: '', disabled: true }),
    id_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    disponibilidad_broca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fecha_registro_broca: new FormControl({ value: '', disabled: true }),
    fecha_ultimo_uso_broca: new FormControl({ value: '', disabled: true })
  });

  prestamoBrocaForm = new FormGroup({
    id_broca_instanciada: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    id_proyecto: new FormControl<number | null>(null, { validators: [Validators.required] })
  });

  constructor(
    private brocasService: BrocasService,
    private proyectoService: ProyectoService,
    private seguridadService: SeguridadService,
    private router: Router,
    private toast: NgToastService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarModelosBroca();
    this.cargarBrocasInstanciadas();
    this.cargarBrocasPrestadasActivas();
    this.cargarProyectosPrestamo();
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  get modelosFiltrados(): ModeloBrocaViewModel[] {
    const query = this.searchModelos.trim().toLowerCase();

    if (!query) {
      return this.modelosBroca;
    }

    return this.modelosBroca.filter(modelo =>
      [
        modelo.idModeloBroca,
        modelo.nombreBroca,
        modelo.tipoBroca,
        modelo.descripcionBroca,
        modelo.tamanoBroca,
        modelo.matrixBroca,
        modelo.marcaBroca
      ]
        .filter(Boolean)
        .some(valor => String(valor).toLowerCase().includes(query))
    );
  }

  get totalModelosPages(): number {
    return Math.max(1, Math.ceil(this.totalModelos / this.pageSize));
  }

  get safeCurrentModelosPage(): number {
    return Math.min(Math.max(this.currentModelosPage, 1), this.totalModelosPages);
  }

  get pageNumbersModelos(): number[] {
    return Array.from({ length: this.totalModelosPages }, (_, index) => index + 1);
  }

  get mobilePageNumbersModelos(): number[] {
    return this.buildMobilePageNumbers(this.safeCurrentModelosPage, this.totalModelosPages);
  }

  get paginatedModelos(): ModeloBrocaViewModel[] {
    const startIndex = (this.safeCurrentModelosPage - 1) * this.pageSize;
    return this.modelosFiltrados.slice(startIndex, startIndex + this.pageSize);
  }

  get startModelosIndex(): number {
    if (this.totalModelos === 0) {
      return 0;
    }

    return (this.safeCurrentModelosPage - 1) * this.pageSize + 1;
  }

  get endModelosIndex(): number {
    return Math.min(this.startModelosIndex + this.pageSize - 1, this.totalModelos);
  }

  get brocasFiltradas(): BrocaInstanciadaViewModel[] {
    const query = this.searchBrocas.trim().toLowerCase();

    if (!query) {
      return this.brocasRegistradas;
    }

    return this.brocasRegistradas.filter(broca =>
      [
        broca.idBrocaInstanciada,
        broca.idModeloBroca,
        broca.nombreModeloBroca,
        broca.tipoModeloBroca,
        broca.estadoBroca,
        broca.disponibilidadBroca,
        broca.fechaRegistroBroca,
        broca.fechaUltimoUsoBroca
      ]
        .filter(Boolean)
        .some(valor => String(valor).toLowerCase().includes(query))
    );
  }

  get totalBrocasPages(): number {
    return Math.max(1, Math.ceil(this.totalBrocas / this.pageSize));
  }

  get safeCurrentBrocasPage(): number {
    return Math.min(Math.max(this.currentBrocasPage, 1), this.totalBrocasPages);
  }

  get pageNumbersBrocas(): number[] {
    return Array.from({ length: this.totalBrocasPages }, (_, index) => index + 1);
  }

  get mobilePageNumbersBrocas(): number[] {
    return this.buildMobilePageNumbers(this.safeCurrentBrocasPage, this.totalBrocasPages);
  }

  get paginatedBrocas(): BrocaInstanciadaViewModel[] {
    const startIndex = (this.safeCurrentBrocasPage - 1) * this.pageSize;
    return this.brocasFiltradas.slice(startIndex, startIndex + this.pageSize);
  }

  get startBrocasIndex(): number {
    if (this.totalBrocas === 0) {
      return 0;
    }

    return (this.safeCurrentBrocasPage - 1) * this.pageSize + 1;
  }

  get endBrocasIndex(): number {
    return Math.min(this.startBrocasIndex + this.pageSize - 1, this.totalBrocas);
  }

  get totalModelos(): number {
    return this.modelosFiltrados.length;
  }

  get totalBrocas(): number {
    return this.brocasFiltradas.length;
  }

  get prestadasFiltradas(): BrocaPrestadaActivaViewModel[] {
    const query = this.searchPrestadas.trim().toLowerCase();

    if (!query) {
      return this.brocasPrestadasActivas;
    }

    return this.brocasPrestadasActivas.filter(prestada =>
      [
        prestada.idPrestamo,
        prestada.idBrocaInstanciada,
        prestada.idProyecto,
        prestada.nombreProyecto,
        prestada.nombreBroca,
        prestada.estadoPrestamo,
        prestada.fechaPrestamo,
        prestada.fechaDevolucion
      ]
        .filter(Boolean)
        .some(valor => String(valor).toLowerCase().includes(query))
    );
  }

  get totalPrestadas(): number {
    return this.prestadasFiltradas.length;
  }

  get totalPrestadasPages(): number {
    return Math.max(1, Math.ceil(this.totalPrestadas / this.pageSize));
  }

  get safeCurrentPrestadasPage(): number {
    return Math.min(Math.max(this.currentPrestadasPage, 1), this.totalPrestadasPages);
  }

  get pageNumbersPrestadas(): number[] {
    return Array.from({ length: this.totalPrestadasPages }, (_, index) => index + 1);
  }

  get mobilePageNumbersPrestadas(): number[] {
    return this.buildMobilePageNumbers(this.safeCurrentPrestadasPage, this.totalPrestadasPages);
  }

  get paginatedPrestadas(): BrocaPrestadaActivaViewModel[] {
    const startIndex = (this.safeCurrentPrestadasPage - 1) * this.pageSize;
    return this.prestadasFiltradas.slice(startIndex, startIndex + this.pageSize);
  }

  get startPrestadasIndex(): number {
    if (this.totalPrestadas === 0) {
      return 0;
    }

    return (this.safeCurrentPrestadasPage - 1) * this.pageSize + 1;
  }

  get endPrestadasIndex(): number {
    return Math.min(this.startPrestadasIndex + this.pageSize - 1, this.totalPrestadas);
  }

  get proyectosConPrestamoActivo(): number {
    return new Set(this.brocasPrestadasActivas.map(item => item.idProyecto).filter(id => id > 0)).size;
  }

  get totalMovimientosHistorial(): number {
    return this.historialPrestamosBroca.length;
  }

  get tiposBrocaDisponibles(): number {
    return new Set(this.modelosBroca.map(modelo => modelo.tipoBroca).filter(Boolean)).size;
  }

  get matricesBrocaDisponibles(): number {
    return new Set(this.modelosBroca.map(modelo => modelo.matrixBroca).filter(Boolean)).size;
  }

  get marcasBrocaDisponibles(): number {
    return new Set(this.modelosBroca.map(modelo => modelo.marcaBroca).filter(Boolean)).size;
  }

  get brocasDisponibles(): number {
    return this.brocasRegistradas.filter(item => this.esDisponible(item)).length;
  }

  get brocasEnUso(): number {
    return this.brocasRegistradas.filter(item => this.esEnUso(item)).length;
  }

  get brocasNuevas(): number {
    return this.brocasRegistradas.filter(item => this.esNueva(item)).length;
  }

  get brocasEnUsoEstado(): number {
    return this.brocasRegistradas.filter(item => this.esEnUsoEstado(item)).length;
  }

  get brocasUsadas(): number {
    return this.brocasRegistradas.filter(item => this.esUsada(item)).length;
  }

  get brocasDesgastadas(): number {
    return this.brocasRegistradas.filter(item => this.esDesgastada(item)).length;
  }

  get modelosDisponiblesParaBroca(): ModeloBrocaViewModel[] {
    return this.modelosBroca;
  }

  cambiarTab(tab: InventarioTab): void {
    this.activeTab = tab;
    this.cd.detectChanges();

    if (tab === 'prestadas' && !this.loadingPrestadas && this.brocasPrestadasActivas.length === 0) {
      this.cargarBrocasPrestadasActivas();
    }

    if (tab === 'historial' && !this.serialHistorial.trim()) {
      this.solicitarSerialHistorial();
    }
  }

  irAPaginaModelos(pagina: number): void {
    if (pagina < 1 || pagina > this.totalModelosPages) {
      return;
    }

    this.currentModelosPage = pagina;
  }

  paginaAnteriorModelos(): void {
    this.irAPaginaModelos(this.currentModelosPage - 1);
  }

  paginaSiguienteModelos(): void {
    this.irAPaginaModelos(this.currentModelosPage + 1);
  }

  irAPaginaBrocas(pagina: number): void {
    if (pagina < 1 || pagina > this.totalBrocasPages) {
      return;
    }

    this.currentBrocasPage = pagina;
  }

  paginaAnteriorBrocas(): void {
    this.irAPaginaBrocas(this.currentBrocasPage - 1);
  }

  paginaSiguienteBrocas(): void {
    this.irAPaginaBrocas(this.currentBrocasPage + 1);
  }

  irAPaginaPrestadas(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPrestadasPages) {
      return;
    }

    this.currentPrestadasPage = pagina;
  }

  paginaAnteriorPrestadas(): void {
    this.irAPaginaPrestadas(this.currentPrestadasPage - 1);
  }

  paginaSiguientePrestadas(): void {
    this.irAPaginaPrestadas(this.currentPrestadasPage + 1);
  }

  irAProyectoPrestamo(prestamo: BrocaPrestadaActivaViewModel): void {
    if (!prestamo.idProyecto) {
      this.toast.warning('No se encontró el proyecto asociado al préstamo', 'Advertencia', 5000, true, true, true);
      return;
    }

    this.router.navigate(['/dashboard/proyectos/detalle', prestamo.idProyecto]);
  }

  consultarHistorialPrestamo(): void {
    const serial = this.serialHistorial.trim();

    if (!serial) {
      this.toast.warning('Debe ingresar el serial de la broca', 'Advertencia', 5000, true, true, true);
      return;
    }

    this.loadingHistorial = true;
    this.errorCargaHistorial = '';
    this.cd.detectChanges();

    this.brocasService.ObtenerHistorialPrestamosBrocaInstanciada(serial)
      .pipe(finalize(() => {
        this.loadingHistorial = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          const historial = (respuesta.DATOS ?? [])
            .flatMap(item => this.mapHistorialDesdeApi(item))
            .sort((a, b) => a.fechaOrden - b.fechaOrden);

          this.historialPrestamosBroca = [...historial];
          this.cd.detectChanges();
        },
        error: () => {
          this.historialPrestamosBroca = [];
          this.errorCargaHistorial = 'No fue posible cargar el historial de préstamos para la broca indicada.';
          this.cd.detectChanges();
        }
      });
  }

  solicitarSerialHistorial(): void {
    this.serialHistorialTemp = this.serialHistorial;
    this.lockBodyScroll();
    this.showSerialHistorialModal = true;
    this.cd.detectChanges();
  }

  confirmarSerialHistorial(): void {
    const serialNormalizado = this.serialHistorialTemp.trim();
    if (!serialNormalizado) {
      this.toast.warning('Debe ingresar un serial válido', 'Advertencia', 5000, true, true, true);
      return;
    }

    this.serialHistorial = serialNormalizado;
    this.showSerialHistorialModal = false;
    this.restoreBodyScroll();
    this.consultarHistorialPrestamo();
  }

  irAProyectoHistorial(historial: HistorialPrestamoBrocaViewModel): void {
    if (!historial.idProyecto) {
      this.toast.warning('Este movimiento no tiene proyecto asociado', 'Advertencia', 5000, true, true, true);
      return;
    }

    this.router.navigate(['/dashboard/proyectos/detalle', historial.idProyecto]);
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

  obtenerNombreModelo(idModeloBroca: string): string {
    return this.modelosBroca.find(modelo => modelo.idModeloBroca === idModeloBroca)?.nombreBroca ?? 'Sin modelo';
  }

  obtenerTipoModelo(idModeloBroca: string): string {
    return this.modelosBroca.find(modelo => modelo.idModeloBroca === idModeloBroca)?.tipoBroca ?? 'Sin tipo';
  }

  obtenerMarcaModelo(idModeloBroca: string): string {
    return this.modelosBroca.find(modelo => modelo.idModeloBroca === idModeloBroca)?.marcaBroca ?? 'Sin marca';
  }

  obtenerModeloCompleto(idModeloBroca: string): string {
    const modelo = this.modelosBroca.find(item => item.idModeloBroca === idModeloBroca);

    if (!modelo) {
      return 'Sin modelo';
    }

    return `${modelo.nombreBroca} · ${modelo.tipoBroca}`;
  }

  badgeEstadoModelo(_: ModeloBrocaViewModel): string {
    return 'badge-neutral';
  }

  badgeEstadoBroca(estado: string): string {
    const valor = this.normalizarTexto(estado);

    if (valor === 'disponible' || valor === 'nueva') return 'badge-success';
    if (valor === 'no_disponible') return 'badge-danger';
    if (valor === 'en_uso') return 'badge-info';
    if (valor === 'usada') return 'badge-warning';
    if (valor === 'desgastada') return 'badge-danger';
    return 'badge-neutral';
  }

  badgeEstadoPrestamo(estado: string): string {
    const valor = this.normalizarTexto(estado);

    if (valor.includes('activo') || valor.includes('prestado')) return 'badge-info';
    if (valor.includes('devuelto') || valor.includes('cerrado')) return 'badge-success';
    if (valor.includes('vencido') || valor.includes('atrasado')) return 'badge-warning';
    return 'badge-neutral';
  }

  badgeEstadoHistorial(estado: string): string {
    const valor = this.normalizarTexto(estado);

    if (valor === 'en_uso') return 'badge-info';
    if (valor === 'devuelto') return 'badge-success';
    return 'badge-neutral';
  }

  solicitarConfirmacionEliminarBroca(broca: BrocaInstanciadaViewModel): void {
    this.brocaPendienteEliminar = broca;
    this.lockBodyScroll();
    this.showEliminarBrocaModal = true;
  }

  confirmarEliminarBroca(): void {
    if (!this.brocaPendienteEliminar) {
      return;
    }

    const broca = this.brocaPendienteEliminar;
    this.showEliminarBrocaModal = false;
    this.brocaPendienteEliminar = null;
    this.restoreBodyScroll();

    this.deletingBrocaId = broca.idBrocaInstanciada;
    this.brocasService.EliminarInstanciaBroca(broca.idBrocaInstanciada)
      .pipe(finalize(() => {
        this.deletingBrocaId = '';
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Broca instanciada eliminada correctamente', 'Éxito', 5000, true, true, true);
            this.cargarBrocasInstanciadas();
            this.cargarBrocasPrestadasActivas();
            if (this.serialHistorial.trim() === broca.idBrocaInstanciada) {
              this.consultarHistorialPrestamo();
            }
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible eliminar la broca instanciada', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al eliminar la broca instanciada', 'Error', 5000, true, true, true);
        }
      });
  }

  solicitarConfirmacionMarcarDaniada(broca: BrocaInstanciadaViewModel): void {
    if (this.normalizarTexto(broca.estadoBroca) === 'desgastada') {
      this.toast.warning('La broca ya está marcada como desgastada', 'Advertencia', 5000, true, true, true);
      return;
    }

    this.brocaPendienteDaniada = broca;
    this.lockBodyScroll();
    this.showMarcarDaniadaModal = true;
  }

  confirmarMarcarDaniada(): void {
    if (!this.brocaPendienteDaniada) {
      return;
    }

    const broca = this.brocaPendienteDaniada;
    this.showMarcarDaniadaModal = false;
    this.brocaPendienteDaniada = null;
    this.restoreBodyScroll();

    this.markingDaniadaId = broca.idBrocaInstanciada;
    this.brocasService.MarcarBrocaDaniada(broca.idBrocaInstanciada, this.obtenerUsuarioSesion())
      .pipe(finalize(() => {
        this.markingDaniadaId = '';
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Broca marcada como dañada correctamente', 'Éxito', 5000, true, true, true);
            this.cargarBrocasInstanciadas();
            if (this.serialHistorial.trim() === broca.idBrocaInstanciada) {
              this.consultarHistorialPrestamo();
            }
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible marcar la broca como dañada', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al marcar la broca como dañada', 'Error', 5000, true, true, true);
        }
      });
  }

  abrirCrearModelo(): void {
    this.modeloForm.reset({
      nom_broca: '',
      tipo_broca: '',
      descripcion_broca: '',
      tamanop_broca: null,
      matrix_broca: '',
      marca_broca: ''
    });
    this.modeloSeleccionado = null;
    this.lockBodyScroll();
    this.showModeloModal = true;
  }

  abrirEditarModelo(modelo: ModeloBrocaViewModel): void {
    this.modeloSeleccionado = modelo;
    this.modeloEditForm.patchValue({
      id_broca: modelo.idModeloBroca,
      nom_broca: modelo.nombreBroca,
      tipo_broca: modelo.tipoBroca,
      descripcion_broca: modelo.descripcionBroca,
      tamanop_broca: this.obtenerTamanioComoNumero(modelo.tamanoBroca),
      matrix_broca: modelo.matrixBroca,
      marca_broca: modelo.marcaBroca
    });
    this.lockBodyScroll();
    this.showModeloEditModal = true;
  }

  abrirCrearBroca(): void {
    this.brocaForm.reset({
      id_broca_instanciada: '',
      id_broca: ''
    });
    this.brocaSeleccionada = null;
    this.lockBodyScroll();
    this.showBrocaModal = true;
  }

  abrirEditarBroca(broca: BrocaInstanciadaViewModel): void {
    this.brocaSeleccionada = broca;
    this.brocaEditForm.patchValue({
      id_broca_instanciada: broca.idBrocaInstanciada,
      id_broca: broca.idModeloBroca,
      estado_broca: broca.estadoBroca,
      disponibilidad_broca: broca.disponibilidadBroca,
      fecha_registro_broca: broca.fechaRegistroBroca,
      fecha_ultimo_uso_broca: broca.fechaUltimoUsoBroca
    });
    this.lockBodyScroll();
    this.showBrocaEditModal = true;
  }

  abrirPrestamoModal(broca: BrocaInstanciadaViewModel): void {
    this.prestamoBrocaForm.reset({
      id_broca_instanciada: broca.idBrocaInstanciada,
      id_proyecto: null
    });
    this.brocaSeleccionada = broca;
    this.lockBodyScroll();
    this.showPrestamoModal = true;

    if (this.proyectosDisponiblesPrestamo.length === 0) {
      this.cargarProyectosPrestamo();
    }
  }

  cerrarModales(): void {
    this.showModeloModal = false;
    this.showModeloEditModal = false;
    this.showBrocaModal = false;
    this.showBrocaEditModal = false;
    this.showPrestamoModal = false;
    this.showSerialHistorialModal = false;
    this.showEliminarBrocaModal = false;
    this.showMarcarDaniadaModal = false;
    this.modeloSeleccionado = null;
    this.brocaSeleccionada = null;
    this.brocaPendienteEliminar = null;
    this.brocaPendienteDaniada = null;
    this.restoreBodyScroll();
  }

  cargarModelosBroca(): void {
    this.loadingModelos = true;
    this.errorCargaModelos = '';
    this.cd.detectChanges();

    this.brocasService.ObtenerModelosBrocas()
      .pipe(finalize(() => {
        this.loadingModelos = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          this.modelosBroca = (respuesta.DATOS ?? []).map(modelo => this.mapModeloDesdeApi(modelo));
          this.refrescarTiposDeBrocas();
          this.currentModelosPage = 1;
          this.cd.detectChanges();
        },
        error: () => {
          this.modelosBroca = [];
          this.errorCargaModelos = 'No fue posible cargar los modelos de broca desde la base de datos.';
          this.currentModelosPage = 1;
          this.cd.detectChanges();
        }
      });
  }

  cargarBrocasInstanciadas(): void {
    this.loadingBrocas = true;
    this.errorCargaBrocas = '';
    this.cd.detectChanges();

    this.brocasService.ObtenerBrocasInstanciadas()
      .pipe(finalize(() => {
        this.loadingBrocas = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          this.brocasRegistradas = (respuesta.DATOS ?? []).map(broca => this.mapBrocaDesdeApi(broca));
          this.refrescarTiposDeBrocas();
          this.currentBrocasPage = 1;
          this.cd.detectChanges();
        },
        error: () => {
          this.brocasRegistradas = [];
          this.errorCargaBrocas = 'No fue posible cargar las brocas instanciadas desde la base de datos.';
          this.currentBrocasPage = 1;
          this.cd.detectChanges();
        }
      });
  }

  cargarBrocasPrestadasActivas(): void {
    this.loadingPrestadas = true;
    this.errorCargaPrestadas = '';
    this.cd.detectChanges();

    this.brocasService.ObtenerBrocasPrestadasActivos()
      .pipe(finalize(() => {
        this.loadingPrestadas = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          this.brocasPrestadasActivas = (respuesta.DATOS ?? []).map(prestamo => this.mapPrestamoDesdeApi(prestamo));
          this.currentPrestadasPage = 1;
          this.cd.detectChanges();
        },
        error: () => {
          this.brocasPrestadasActivas = [];
          this.errorCargaPrestadas = 'No fue posible cargar las brocas prestadas activas desde la base de datos.';
          this.currentPrestadasPage = 1;
          this.cd.detectChanges();
        }
      });
  }

  cargarProyectosPrestamo(): void {
    this.loadingProyectosPrestamo = true;
    this.cd.detectChanges();

    this.proyectoService.ObtenerProyectos()
      .pipe(finalize(() => {
        this.loadingProyectosPrestamo = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          const proyectos = respuesta.DATOS ?? [];
          this.proyectosDisponiblesPrestamo = proyectos
            .filter(proyecto => !this.esProyectoFinalizado(proyecto.ESTADO_PROYECTO))
            .map(proyecto => this.mapProyectoPrestamo(proyecto));
          this.cd.detectChanges();
        },
        error: () => {
          this.proyectosDisponiblesPrestamo = [];
          this.toast.danger('No fue posible cargar los proyectos disponibles para préstamo', 'Error', 5000, true, true, true);
          this.cd.detectChanges();
        }
      });
  }

  guardarModelo(): void {
    if (this.modeloForm.invalid) {
      this.modeloForm.markAllAsTouched();
      return;
    }

    const value = this.modeloForm.getRawValue();

    this.savingModelo = true;
    this.brocasService.CrearModeloBroca(
      value.nom_broca,
      value.tipo_broca,
      value.descripcion_broca,
      Number(value.tamanop_broca ?? 0),
      value.matrix_broca,
      value.marca_broca,
      this.obtenerUsuarioSesion()
    )
      .pipe(finalize(() => {
        this.savingModelo = false;
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Modelo de broca creado correctamente', 'Éxito', 5000, true, true, true);
            this.cerrarModales();
            this.cargarModelosBroca();
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible crear el modelo de broca', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al crear el modelo de broca', 'Error', 5000, true, true, true);
        }
      });
  }

  actualizarModelo(): void {
    if (this.modeloEditForm.invalid || !this.modeloSeleccionado) {
      this.modeloEditForm.markAllAsTouched();
      return;
    }

    const value = this.modeloEditForm.getRawValue();

    this.savingModelo = true;
    this.brocasService.ActualizarModeloBroca(
      Number(value.id_broca ?? 0),
      value.nom_broca,
      value.tipo_broca,
      value.descripcion_broca,
      Number(value.tamanop_broca ?? 0),
      value.matrix_broca,
      value.marca_broca,
      this.obtenerUsuarioSesion()
    )
      .pipe(finalize(() => {
        this.savingModelo = false;
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Modelo de broca actualizado correctamente', 'Éxito', 5000, true, true, true);
            this.cerrarModales();
            this.cargarModelosBroca();
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible actualizar el modelo de broca', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al actualizar el modelo de broca', 'Error', 5000, true, true, true);
        }
      });
  }

  eliminarModelo(modelo: ModeloBrocaViewModel): void {
    const confirmar = window.confirm(`¿Eliminar el modelo ${modelo.nombreBroca}?`);
    if (!confirmar) {
      return;
    }

    this.deletingModeloId = modelo.idModeloBroca;
    this.brocasService.EliminarModeloBroca(Number(modelo.idModeloBroca))
      .pipe(finalize(() => {
        this.deletingModeloId = '';
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Modelo de broca eliminado correctamente', 'Éxito', 5000, true, true, true);
            this.cargarModelosBroca();
            this.cargarBrocasInstanciadas();
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible eliminar el modelo de broca', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al eliminar el modelo de broca', 'Error', 5000, true, true, true);
        }
      });
  }

  guardarBroca(): void {
    if (this.brocaForm.invalid) {
      this.brocaForm.markAllAsTouched();
      return;
    }

    const value = this.brocaForm.getRawValue();

    this.savingBroca = true;
    this.brocasService.CrearInstanciaBroca(value.id_broca_instanciada, Number(value.id_broca), this.obtenerUsuarioSesion())
      .pipe(finalize(() => {
        this.savingBroca = false;
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Broca instanciada creada correctamente', 'Éxito', 5000, true, true, true);
            this.cerrarModales();
            this.cargarBrocasInstanciadas();
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible crear la broca instanciada', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al crear la broca instanciada', 'Error', 5000, true, true, true);
        }
      });
  }

  actualizarBroca(): void {
    if (this.brocaEditForm.invalid || !this.brocaSeleccionada) {
      this.brocaEditForm.markAllAsTouched();
      return;
    }

    //SI EL ESTADO DE BROCA ES NUEVO MOSTRAR MENSAJE DE ERROR Y NO PERMITIR ACTUALIZAR
    if (this.brocaEditForm.get('estado_broca')?.value === 'NUEVA') {
      this.toast.danger('No se puede actualizar una broca con estado NUEVA', 'Error', 5000, true, true, true);
      return;
    }

    const value = this.brocaEditForm.getRawValue();

    this.savingBroca = true;
    this.brocasService.ActualizarInstanciaBroca(
      String(value.id_broca_instanciada ?? this.brocaSeleccionada.idBrocaInstanciada),
      Number(value.id_broca),
      value.estado_broca,
      value.disponibilidad_broca,
      this.obtenerUsuarioSesion()
    )
      .pipe(finalize(() => {
        this.savingBroca = false;
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Broca instanciada actualizada correctamente', 'Éxito', 5000, true, true, true);
            this.cerrarModales();
            this.cargarBrocasInstanciadas();
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible actualizar la broca instanciada', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al actualizar la broca instanciada', 'Error', 5000, true, true, true);
        }
      });
  }

  eliminarBroca(broca: BrocaInstanciadaViewModel): void {
    this.solicitarConfirmacionEliminarBroca(broca);
  }

  marcarBrocaDaniada(broca: BrocaInstanciadaViewModel): void {
    this.solicitarConfirmacionMarcarDaniada(broca);
  }

  registrarPrestamoBroca(): void {
    if (this.prestamoBrocaForm.invalid) {
      this.prestamoBrocaForm.markAllAsTouched();
      return;
    }

    const value = this.prestamoBrocaForm.getRawValue();
    if (!value.id_proyecto) {
      this.toast.warning('Debe seleccionar un proyecto', 'Advertencia', 5000, true, true, true);
      return;
    }

    this.savingPrestamo = true;
    this.brocasService.RegistrarPrestamoBroca(
      value.id_broca_instanciada,
      Number(value.id_proyecto),
      this.obtenerUsuarioSesion()
    )
      .pipe(finalize(() => {
        this.savingPrestamo = false;
      }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO === 200) {
            this.toast.success(respuesta.MENSAJE || 'Préstamo registrado correctamente', 'Éxito', 5000, true, true, true);
            this.cerrarModales();
            this.cargarBrocasInstanciadas();
            this.cargarBrocasPrestadasActivas();
            if (this.serialHistorial.trim() === value.id_broca_instanciada) {
              this.consultarHistorialPrestamo();
            }
          } else {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible registrar el préstamo', 'Error', 5000, true, true, true);
          }
        },
        error: () => {
          this.toast.danger('Error al registrar el préstamo', 'Error', 5000, true, true, true);
        }
      });
  }

  private mapModeloDesdeApi(modelo: ModeloBroca): ModeloBrocaViewModel {
    return {
      idModeloBroca: String(modelo.ID_BROCA ?? ''),
      nombreBroca: modelo.NOM_BROCA ?? '',
      tipoBroca: modelo.TIPO_BROCA ?? '',
      descripcionBroca: modelo.DESCRIPCION_BROCA ?? '',
      tamanoBroca: this.formatearNumero(modelo.TAMANIO_BROCA),
      matrixBroca: modelo.MATRIX_BROCA ?? '',
      marcaBroca: modelo.MARCA_BROCA ?? ''
    };
  }

  private mapBrocaDesdeApi(broca: BrocaInstanciadaModel): BrocaInstanciadaViewModel {
    return {
      idBrocaInstanciada: String(broca.ID_BROCA_INSTANCIADA ?? ''),
      idModeloBroca: String(broca.ID_BROCA ?? ''),
      nombreModeloBroca: broca.NOM_BROCA ?? '',
      tipoModeloBroca: this.obtenerTipoModeloPorId(String(broca.ID_BROCA ?? '')),
      estadoBroca: this.normalizarEstadoBroca(broca.ESTADO_BROCA ?? ''),
      disponibilidadBroca: this.normalizarDisponibilidadBroca(broca.DISPONIBILIDAD_BROCA ?? ''),
      fechaRegistroBroca: this.formatearFecha(broca.FECHA_REGISTRO_BROCA),
      fechaUltimoUsoBroca: this.formatearFecha(broca.FECHA_ULTIMO_USO_BROCA)
    };
  }

  private mapProyectoPrestamo(proyecto: ProyectoListaModel): ProyectoPrestamoViewModel {
    return {
      idProyecto: Number(proyecto.ID_PROYECTO ?? 0),
      nombreProyecto: proyecto.NOM_PROYECTO ?? `Proyecto ${proyecto.ID_PROYECTO ?? ''}`,
      estadoProyecto: proyecto.ESTADO_PROYECTO ?? ''
    };
  }

  private mapPrestamoDesdeApi(prestamo: ModeloBrcoaPrestadaActivos): BrocaPrestadaActivaViewModel {
    return {
      idPrestamo: Number(prestamo.ID_PRESTAMO ?? 0),
      idBrocaInstanciada: String(prestamo.ID_BROCA_INSTANCIADA ?? ''),
      idProyecto: Number(prestamo.ID_PROYECTO ?? 0),
      nombreProyecto: prestamo.NOMBRE_PROYECTO ?? `Proyecto ${prestamo.ID_PROYECTO ?? ''}`,
      nombreBroca: prestamo.NOMBRE_BROCA ?? 'Sin nombre',
      fechaPrestamo: this.formatearFecha(prestamo.FECHA_PRESTAMO),
      fechaDevolucion: this.formatearFecha(prestamo.FECHA_DEVOLUCION),
      estadoPrestamo: (prestamo.ESTADO_PRESTAMO ?? '').trim() || 'ACTIVO'
    };
  }

  private mapHistorialDesdeApi(historial: ModeloHistorialBrocaInstanciada): HistorialPrestamoBrocaViewModel[] {
    const estadoNormalizado = this.normalizarEstadoHistorial(historial.ESTADO_PRESTAMO ?? '');
    const idPrestamo = Number(historial.ID_PRESTAMO ?? 0);
    const idProyecto = Number(historial.ID_PROYECTO ?? 0);
    const nombreProyecto = historial.NOMBRE_PROYECTO ?? `Proyecto ${historial.ID_PROYECTO ?? ''}`;

    const eventos: HistorialPrestamoBrocaViewModel[] = [];

    if (historial.FECHA_PRESTAMO) {
      const tieneDevolucion = !!historial.FECHA_DEVOLUCION;
      eventos.push({
        idEvento: `${idPrestamo}-prestamo`,
        idPrestamo,
        idProyecto,
        nombreProyecto,
        tipoEvento: 'PRESTAMO',
        fechaEvento: this.formatearFechaHora(historial.FECHA_PRESTAMO),
        estadoPrestamo: tieneDevolucion ? 'USADO' : 'EN_USO',
        fechaOrden: this.obtenerFechaOrden(historial.FECHA_PRESTAMO, undefined, historial.ID_PRESTAMO)
      });
    }

    if (this.normalizarTexto(estadoNormalizado) === 'devuelto' && historial.FECHA_DEVOLUCION) {
      eventos.push({
        idEvento: `${idPrestamo}-devolucion`,
        idPrestamo,
        idProyecto,
        nombreProyecto,
        tipoEvento: 'DEVOLUCION',
        fechaEvento: this.formatearFechaHora(historial.FECHA_DEVOLUCION),
        estadoPrestamo: 'DEVUELTO',
        fechaOrden: this.obtenerFechaOrden(historial.FECHA_DEVOLUCION, undefined, (historial.ID_PRESTAMO ?? 0) + 0.5)
      });
    }

    if (eventos.length === 0) {
      eventos.push({
        idEvento: `${idPrestamo}-fallback`,
        idPrestamo,
        idProyecto,
        nombreProyecto,
        tipoEvento: 'PRESTAMO',
        fechaEvento: this.formatearFechaHora(historial.FECHA_PRESTAMO) || this.formatearFechaHora(historial.FECHA_DEVOLUCION),
        estadoPrestamo: estadoNormalizado,
        fechaOrden: this.obtenerFechaOrden(historial.FECHA_PRESTAMO, historial.FECHA_DEVOLUCION, historial.ID_PRESTAMO)
      });
    }

    return eventos;
  }

  private normalizarEstadoHistorial(estado: string): string {
    const valor = this.normalizarTexto(estado);

    if (valor === 'disponible') return 'EN_USO';
    return estado.trim().toUpperCase();
  }

  private obtenerFechaOrden(
    fechaPrestamo: Date | string | undefined,
    fechaDevolucion: Date | string | undefined,
    idPrestamo: number | undefined
  ): number {
    const fechaPrincipal = fechaPrestamo ?? fechaDevolucion;
    if (fechaPrincipal) {
      const timestamp = new Date(fechaPrincipal).getTime();
      if (!Number.isNaN(timestamp)) {
        return timestamp;
      }
    }

    return Number(idPrestamo ?? 0);
  }

  private esProyectoFinalizado(estadoProyecto: string | undefined): boolean {
    const estado = this.normalizarTexto(estadoProyecto);
    return estado === 'finalizado';
  }

  private obtenerTipoModeloPorId(idModeloBroca: string): string {
    const modelo = this.modelosBroca.find(item => item.idModeloBroca === idModeloBroca);
    return modelo?.tipoBroca ?? '';
  }

  private refrescarTiposDeBrocas(): void {
    this.brocasRegistradas = this.brocasRegistradas.map(broca => ({
      ...broca,
      tipoModeloBroca: this.obtenerTipoModeloPorId(broca.idModeloBroca)
    }));
  }

  private normalizarEstadoBroca(estado: string): string {
    const valor = this.normalizarTexto(estado).replace(/\s+/g, '_');

    if (valor.includes('nueva')) return 'NUEVA';
    if (valor.includes('en_uso') || valor.includes('enuso')) return 'EN_USO';
    if (valor.includes('usada')) return 'USADA';
    if (valor.includes('desgastada') || valor.includes('desgaste')) return 'DESGASTADA';

    return estado.trim().toUpperCase();
  }

  private normalizarDisponibilidadBroca(disponibilidad: string): string {
    const valor = this.normalizarTexto(disponibilidad).replace(/\s+/g, '_');

    if (valor.includes('no_dispon')) return 'NO_DISPONIBLE';
    if (valor.includes('dispon')) return 'DISPONIBLE';

    return disponibilidad.trim().toUpperCase();
  }

  private obtenerTamanioComoNumero(valor: string): number | null {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
  }

  private formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) {
      return '';
    }

    const fechaNormalizada = new Date(fecha);
    if (Number.isNaN(fechaNormalizada.getTime())) {
      return '';
    }

    return fechaNormalizada.toLocaleDateString('es-CO');
  }

  private formatearFechaHora(fecha: Date | string | undefined): string {
    if (!fecha) {
      return '';
    }

    const fechaNormalizada = new Date(fecha);
    if (Number.isNaN(fechaNormalizada.getTime())) {
      return '';
    }

    return fechaNormalizada.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  private formatearNumero(valor: number | undefined): string {
    return valor === undefined || valor === null ? '' : String(valor);
  }

  private obtenerUsuarioSesion(): string {
    return this.seguridadService.ObtenerDatosUsuarioIdentificadoSESION()?.usuario?.nombre || 'admin';
  }

  private normalizarTexto(valor: string | undefined | null): string {
    return (valor ?? '').trim().toLowerCase();
  }

  private esDisponible(broca: BrocaInstanciadaViewModel): boolean {
    return this.normalizarTexto(broca.disponibilidadBroca) === 'disponible';
  }

  private esEnUso(broca: BrocaInstanciadaViewModel): boolean {
    return this.normalizarTexto(broca.estadoBroca) === 'en_uso';
  }

  private esNueva(broca: BrocaInstanciadaViewModel): boolean {
    return this.normalizarTexto(broca.estadoBroca) === 'nueva';
  }

  private esEnUsoEstado(broca: BrocaInstanciadaViewModel): boolean {
    return this.normalizarTexto(broca.estadoBroca) === 'en_uso';
  }

  private esUsada(broca: BrocaInstanciadaViewModel): boolean {
    return this.normalizarTexto(broca.estadoBroca) === 'usada';
  }

  private esDesgastada(broca: BrocaInstanciadaViewModel): boolean {
    return this.normalizarTexto(broca.estadoBroca) === 'desgastada';
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
