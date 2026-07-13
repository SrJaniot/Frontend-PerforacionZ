import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { DepartamentoModel } from '../../../../../Modelos/DepartamentoModel';
import { MunicipioModel } from '../../../../../Modelos/MunicipioModel';
import { ProyectoModel } from '../../../../../Modelos/proyecto.model';
import { ProyectoService } from '../../../../../servicios/proyecto.service';
import { SeguridadService } from '../../../../../servicios/seguridad';

interface EstadoProyectoOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-formulario-actualizar-proyecto',
  standalone: false,
  templateUrl: './formulario-actualizar-proyecto.html',
  styleUrls: ['./formulario-actualizar-proyecto.scss']
})
export class FormularioActualizarProyectoComponent {
  @Input() showModal = false;
  @Input() proyecto: ProyectoModel | null = null;
  @Input() bloqueado = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<ProyectoModel>();

  readonly estadosProyecto: EstadoProyectoOption[] = [
    { value: 'INICIADO', label: 'Iniciado' },
    { value: 'EN_CURSO', label: 'En curso' }
  ];

  departamentos: DepartamentoModel[] = [];
  municipiosDisponibles: MunicipioModel[] = [];
  cargandoCatalogos = false;
  guardandoCambios = false;

  formProyecto: FormGroup;

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private seguridadService: SeguridadService,
    private toast: NgToastService,
    private cd: ChangeDetectorRef
  ) {
    this.formProyecto = this.fb.group({
      idProyecto: [{ value: '', disabled: true }],
      idSupervisor: [''],
      nombreSupervisor: [{ value: '', disabled: true }, Validators.required],
      nombreProyecto: ['', Validators.required],
      idDepartamento: [{ value: '', disabled: true }, Validators.required],
      idMunicipio: [{ value: '', disabled: true }, Validators.required],
      descripcionProyecto: ['', Validators.required],
      fechaCreacion: [{ value: '', disabled: true }, Validators.required],
      status: ['', Validators.required],
      priority: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['proyecto'] || changes['showModal']) && this.showModal && this.proyecto) {
      this.prepararFormulario();
    }
  }

  private prepararFormulario(): void {
    if (!this.proyecto) {
      return;
    }

    this.formProyecto.reset({
      idProyecto: this.proyecto.idProyecto,
      idSupervisor: this.proyecto.idSupervisor ?? '',
      nombreSupervisor: this.proyecto.nombreSupervisor,
      nombreProyecto: this.proyecto.nombreProyecto,
      idDepartamento: this.proyecto.idDepartamento ?? '',
      idMunicipio: this.proyecto.idMunicipio ?? '',
      descripcionProyecto: this.proyecto.descripcionProyecto,
      fechaCreacion: this.proyecto.fechaCreacion,
      status: this.mapEstadoProyectoParaFormulario(this.proyecto.status),
      priority: this.proyecto.priority
    });

    this.cargarCatalogosProyecto();
  }

  private cargarCatalogosProyecto(): void {
    if (!this.proyecto) {
      return;
    }

    this.cargandoCatalogos = true;
    this.municipiosDisponibles = [];
    this.cd.detectChanges();

    this.proyectoService.ObtenerDepartamentos()
      .pipe(finalize(() => {
        this.cargandoCatalogos = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: respuesta => {
          this.departamentos = (respuesta.DATOS ?? []).map(departamento => ({
            ID_DPTO: departamento.ID_DPTO,
            NOM_DPTO: departamento.NOM_DPTO
          }));

          const idDepartamento = this.resolverIdDepartamento();
          this.formProyecto.patchValue({ idDepartamento });

          if (!idDepartamento) {
            this.toast.warning('No fue posible resolver el departamento del proyecto.', 'Advertencia', 5000, true, true, true);
            return;
          }

          this.cargarMunicipios(idDepartamento);
        },
        error: () => {
          this.departamentos = [];
          this.toast.danger('Error al cargar los departamentos del proyecto.', 'Error', 5000, true, true, true);
          this.cd.detectChanges();
        }
      });
  }

  private cargarMunicipios(idDepartamento: string): void {
    this.proyectoService.ObtenerMunicipiosPorDepartamento(idDepartamento).subscribe({
      next: respuesta => {
        this.municipiosDisponibles = (respuesta.DATOS ?? []).map(municipio => ({
          ID_MUNICIPIO: municipio.ID_MUNICIPIO,
          NOM_MUNICIPIO: municipio.NOM_MUNICIPIO
        }));

        const idMunicipio = this.resolverIdMunicipio();
        this.formProyecto.patchValue({ idMunicipio });
        this.cd.detectChanges();
      },
      error: () => {
        this.municipiosDisponibles = [];
        this.toast.danger('Error al cargar los municipios del proyecto.', 'Error', 5000, true, true, true);
        this.cd.detectChanges();
      }
    });
  }

  private resolverIdDepartamento(): string {
    if (!this.proyecto) {
      return '';
    }

    if (this.proyecto.idDepartamento) {
      return this.proyecto.idDepartamento;
    }

    const departamento = this.departamentos.find(item =>
      this.normalizarTexto(item.NOM_DPTO) === this.normalizarTexto(this.proyecto?.departamento)
    );

    return departamento?.ID_DPTO ?? '';
  }

  private resolverIdMunicipio(): string {
    if (!this.proyecto) {
      return '';
    }

    if (this.proyecto.idMunicipio) {
      return this.proyecto.idMunicipio;
    }

    const municipio = this.municipiosDisponibles.find(item =>
      this.normalizarTexto(item.NOM_MUNICIPIO) === this.normalizarTexto(this.proyecto?.municipio)
    );

    return municipio?.ID_MUNICIPIO ?? '';
  }

  private normalizarTexto(valor: string | undefined | null): string {
    return (valor ?? '').trim().toLowerCase();
  }

  private mapEstadoProyectoParaFormulario(estado: string): string {
    const valor = this.normalizarTexto(estado).replace(/\s+/g, '_');

    if (valor === 'iniciado') return 'INICIADO';
    if (valor === 'en_curso') return 'EN_CURSO';

    return 'INICIADO';
  }

  private mapEstadoProyectoParaVista(estado: string): string {
    if (estado === 'INICIADO') return 'Iniciado';
    if (estado === 'EN_CURSO') return 'En curso';

    return estado;
  }

  actualizarProyecto(): void {
    if (this.bloqueado || this.guardandoCambios || this.cargandoCatalogos) {
      return;
    }

    if (this.formProyecto.invalid || !this.proyecto) {
      this.formProyecto.markAllAsTouched();
      return;
    }

    const rawValue = this.formProyecto.getRawValue();
    const usuarioModificacion = this.seguridadService.ObtenerDatosUsuarioIdentificadoSESION()?.usuario?.nombre || 'admin';
    const id_proyecto = parseInt(rawValue.idProyecto, 10);
    this.guardandoCambios = true;
    this.cd.detectChanges();

    this.proyectoService.ActualizarProyecto(
      id_proyecto,
      rawValue.nombreProyecto,
      rawValue.idMunicipio,
      rawValue.descripcionProyecto,
      usuarioModificacion,
      rawValue.idSupervisor,
      rawValue.status,
      rawValue.priority
    ).pipe(finalize(() => {
      this.guardandoCambios = false;
      this.cd.detectChanges();
    }))
      .subscribe({
        next: respuesta => {
          if (respuesta.CODIGO !== 200) {
            this.toast.danger(respuesta.MENSAJE || 'No fue posible actualizar el proyecto.', 'Error', 5000, true, true, true);
            return;
          }

          const proyectoActual = this.proyecto;

          if (!proyectoActual) {
            this.toast.danger('No fue posible reconstruir la información actualizada del proyecto.', 'Error', 5000, true, true, true);
            return;
          }

          const departamentoSeleccionado = this.departamentos.find(item => item.ID_DPTO === rawValue.idDepartamento);
          const municipioSeleccionado = this.municipiosDisponibles.find(item => item.ID_MUNICIPIO === rawValue.idMunicipio);

          this.actualizado.emit({
            ...proyectoActual,
            idProyecto: rawValue.idProyecto,
            idSupervisor: rawValue.idSupervisor,
            idDepartamento: rawValue.idDepartamento,
            idMunicipio: rawValue.idMunicipio,
            nombreSupervisor: rawValue.nombreSupervisor,
            nombreProyecto: rawValue.nombreProyecto,
            departamento: departamentoSeleccionado?.NOM_DPTO ?? proyectoActual.departamento,
            municipio: municipioSeleccionado?.NOM_MUNICIPIO ?? proyectoActual.municipio,
            descripcionProyecto: rawValue.descripcionProyecto,
            fechaCreacion: rawValue.fechaCreacion,
            status: this.mapEstadoProyectoParaVista(rawValue.status),
            priority: rawValue.priority
          });

          this.toast.success(respuesta.MENSAJE || 'Proyecto actualizado correctamente.', 'Éxito', 5000, true, true, true);
          this.cerrar.emit();
        },
        error: () => {
          this.toast.danger('Error al actualizar el proyecto.', 'Error', 5000, true, true, true);
        }
      });
  }
}
