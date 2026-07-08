import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProyectoModel } from '../../../../../Modelos/proyecto.model';

interface DepartamentoMunicipio {
  nombre: string;
  municipios: string[];
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

  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<ProyectoModel>();

  readonly departamentos: DepartamentoMunicipio[] = [
    { nombre: 'Antioquia', municipios: ['Medellín', 'Envigado', 'Bello', 'Rionegro'] },
    { nombre: 'Cundinamarca', municipios: ['Bogotá', 'Soacha', 'Zipaquirá'] },
    { nombre: 'Valle del Cauca', municipios: ['Cali', 'Palmira', 'Buenaventura'] },
    { nombre: 'Atlántico', municipios: ['Barranquilla', 'Soledad', 'Malambo'] },
    { nombre: 'Bolívar', municipios: ['Cartagena', 'Magangué', 'Turbaco'] },
    { nombre: 'Risaralda', municipios: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'] }
  ];

  formProyecto: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formProyecto = this.fb.group({
      idProyecto: [{ value: '', disabled: true }],
      nombreSupervisor: ['', Validators.required],
      nombreProyecto: ['', Validators.required],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      descripcionProyecto: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      color: ['blue', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proyecto'] && this.proyecto && this.showModal) {
      this.formProyecto.patchValue({
        idProyecto: this.proyecto.idProyecto,
        nombreSupervisor: this.proyecto.nombreSupervisor,
        nombreProyecto: this.proyecto.nombreProyecto,
        departamento: this.proyecto.departamento,
        municipio: this.proyecto.municipio,
        descripcionProyecto: this.proyecto.descripcionProyecto,
        fechaCreacion: this.proyecto.fechaCreacion,
        status: this.proyecto.status,
        priority: this.proyecto.priority,
        color: this.proyecto.color
      });
    }

    if (changes['showModal'] && this.showModal && this.proyecto) {
      this.formProyecto.patchValue({
        idProyecto: this.proyecto.idProyecto,
        nombreSupervisor: this.proyecto.nombreSupervisor,
        nombreProyecto: this.proyecto.nombreProyecto,
        departamento: this.proyecto.departamento,
        municipio: this.proyecto.municipio,
        descripcionProyecto: this.proyecto.descripcionProyecto,
        fechaCreacion: this.proyecto.fechaCreacion,
        status: this.proyecto.status,
        priority: this.proyecto.priority,
        color: this.proyecto.color
      });
    }
  }

  get municipiosDisponibles(): string[] {
    const departamento = this.formProyecto.get('departamento')?.value;
    const encontrado = this.departamentos.find(item => item.nombre === departamento);
    return encontrado?.municipios ?? [];
  }

  onDepartamentoChange(): void {
    const municipioActual = this.formProyecto.get('municipio')?.value;

    if (!this.municipiosDisponibles.includes(municipioActual)) {
      this.formProyecto.get('municipio')?.setValue('');
    }
  }

  actualizarProyecto(): void {
    if (this.formProyecto.invalid || !this.proyecto) {
      this.formProyecto.markAllAsTouched();
      return;
    }

    const rawValue = this.formProyecto.getRawValue();

    this.actualizado.emit({
      ...this.proyecto,
      ...rawValue
    });

    this.cerrar.emit();
  }
}
