import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

interface ModeloBrocaModel {
  idModeloBroca: string;
  nombreBroca: string;
  tipoBroca: string;
  descripcionBroca: string;
  tamanoBroca: string;
  matrixBroca: string;
  marcaBroca: string;
}

interface BrocaRegistroModel {
  idSerialBroca: string;
  idModeloBroca: string;
  estado: string;
  fechaRegistro: string;
  observacion: string;
}

type InventarioTab = 'modelos' | 'brocas';

@Component({
  selector: 'app-inventario-list',
  templateUrl: './inventario-list.component.html',
  styleUrls: ['./inventario-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class InventarioListComponent {
  activeTab: InventarioTab = 'modelos';

  searchModelos = '';
  searchBrocas = '';

  showModeloModal = false;
  showModeloEditModal = false;
  showBrocaModal = false;
  showBrocaEditModal = false;

  modeloSeleccionado: ModeloBrocaModel | null = null;
  brocaSeleccionada: BrocaRegistroModel | null = null;

  readonly tiposBroca = ['PDC', 'Tricónica', 'Diamante', 'Híbrida', 'Cono de rodillos'];
  readonly matricesBroca = ['M-1', 'M-2', 'M-3', 'M-4'];
  readonly marcasBroca = ['Smith', 'Baker Hughes', 'Halliburton', 'Schlumberger', 'National Oilwell'];
  readonly estadosBroca = ['Disponible', 'En uso', 'Mantenimiento', 'Retirada'];
  readonly estadosModelo = ['Activo', 'Obsoleto'];

  modelosBroca: ModeloBrocaModel[] = [
    {
      idModeloBroca: 'MOD-001',
      nombreBroca: 'Turbo Drill X12',
      tipoBroca: 'PDC',
      descripcionBroca: 'Modelo de alto rendimiento para formación dura y media.',
      tamanoBroca: '12 1/4"',
      matrixBroca: 'M-3',
      marcaBroca: 'Smith'
    },
    {
      idModeloBroca: 'MOD-002',
      nombreBroca: 'Rock Force 9',
      tipoBroca: 'Tricónica',
      descripcionBroca: 'Diseñada para perforación estable en roca compacta.',
      tamanoBroca: '9 7/8"',
      matrixBroca: 'M-2',
      marcaBroca: 'Baker Hughes'
    },
    {
      idModeloBroca: 'MOD-003',
      nombreBroca: 'Diamond Pro 8',
      tipoBroca: 'Diamante',
      descripcionBroca: 'Ideal para zonas de alta abrasividad y precisión.',
      tamanoBroca: '8 1/2"',
      matrixBroca: 'M-4',
      marcaBroca: 'Halliburton'
    }
  ];

  brocasRegistradas: BrocaRegistroModel[] = [
    {
      idSerialBroca: 'BR-1001',
      idModeloBroca: 'MOD-001',
      estado: 'Disponible',
      fechaRegistro: '2026-07-01',
      observacion: 'Broca nueva para campo norte'
    },
    {
      idSerialBroca: 'BR-1002',
      idModeloBroca: 'MOD-002',
      estado: 'En uso',
      fechaRegistro: '2026-07-02',
      observacion: 'Asignada a perforación PERF-001'
    },
    {
      idSerialBroca: 'BR-1003',
      idModeloBroca: 'MOD-003',
      estado: 'Mantenimiento',
      fechaRegistro: '2026-07-03',
      observacion: 'En revisión por desgaste'
    }
  ];

  formModelo: FormGroup;
  formModeloEdit: FormGroup;
  formBroca: FormGroup;
  formBrocaEdit: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formModelo = this.fb.group({
      nombreBroca: ['', Validators.required],
      tipoBroca: ['', Validators.required],
      descripcionBroca: ['', Validators.required],
      tamanoBroca: ['', Validators.required],
      matrixBroca: ['', Validators.required],
      marcaBroca: ['', Validators.required]
    });

    this.formModeloEdit = this.fb.group({
      idModeloBroca: [{ value: '', disabled: true }],
      nombreBroca: ['', Validators.required],
      tipoBroca: ['', Validators.required],
      descripcionBroca: ['', Validators.required],
      tamanoBroca: ['', Validators.required],
      matrixBroca: ['', Validators.required],
      marcaBroca: ['', Validators.required]
    });

    this.formBroca = this.fb.group({
      idSerialBroca: ['', Validators.required],
      idModeloBroca: ['', Validators.required],
      estado: ['', Validators.required],
      fechaRegistro: ['', Validators.required],
      observacion: ['']
    });

    this.formBrocaEdit = this.fb.group({
      idSerialBroca: [{ value: '', disabled: true }],
      idModeloBroca: ['', Validators.required],
      estado: ['', Validators.required],
      fechaRegistro: ['', Validators.required],
      observacion: ['']
    });
  }

  get modelosFiltrados(): ModeloBrocaModel[] {
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

  get brocasFiltradas(): BrocaRegistroModel[] {
    const query = this.searchBrocas.trim().toLowerCase();

    if (!query) {
      return this.brocasRegistradas;
    }

    return this.brocasRegistradas.filter(broca =>
      [
        broca.idSerialBroca,
        broca.idModeloBroca,
        this.obtenerNombreModelo(broca.idModeloBroca),
        this.obtenerTipoModelo(broca.idModeloBroca),
        this.obtenerMarcaModelo(broca.idModeloBroca),
        broca.estado,
        broca.fechaRegistro,
        broca.observacion
      ]
        .filter(Boolean)
        .some(valor => String(valor).toLowerCase().includes(query))
    );
  }

  get totalModelos(): number {
    return this.modelosFiltrados.length;
  }

  get totalBrocas(): number {
    return this.brocasFiltradas.length;
  }

  get brocasDisponibles(): number {
    return this.brocasRegistradas.filter(item => item.estado === 'Disponible').length;
  }

  get brocasEnUso(): number {
    return this.brocasRegistradas.filter(item => item.estado === 'En uso').length;
  }

  get brocasEnMantenimiento(): number {
    return this.brocasRegistradas.filter(item => item.estado === 'Mantenimiento').length;
  }

  get brocasRetiradas(): number {
    return this.brocasRegistradas.filter(item => item.estado === 'Retirada').length;
  }

  get modeloDisponibleParaBroca(): ModeloBrocaModel[] {
    return this.modelosBroca;
  }

  cambiarTab(tab: InventarioTab): void {
    this.activeTab = tab;
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

  badgeEstadoModelo(modelo: ModeloBrocaModel): string {
    return modelo.tipoBroca === 'PDC' ? 'badge-success' : 'badge-neutral';
  }

  badgeEstadoBroca(estado: string): string {
    if (estado === 'Disponible') return 'badge-success';
    if (estado === 'En uso') return 'badge-info';
    if (estado === 'Mantenimiento') return 'badge-warning';
    return 'badge-danger';
  }

  abrirCrearModelo(): void {
    this.formModelo.reset();
    this.showModeloModal = true;
  }

  abrirEditarModelo(modelo: ModeloBrocaModel): void {
    this.modeloSeleccionado = modelo;
    this.formModeloEdit.patchValue({
      idModeloBroca: modelo.idModeloBroca,
      nombreBroca: modelo.nombreBroca,
      tipoBroca: modelo.tipoBroca,
      descripcionBroca: modelo.descripcionBroca,
      tamanoBroca: modelo.tamanoBroca,
      matrixBroca: modelo.matrixBroca,
      marcaBroca: modelo.marcaBroca
    });
    this.showModeloEditModal = true;
  }

  abrirCrearBroca(): void {
    this.formBroca.reset();
    this.showBrocaModal = true;
  }

  abrirEditarBroca(broca: BrocaRegistroModel): void {
    this.brocaSeleccionada = broca;
    this.formBrocaEdit.patchValue({
      idSerialBroca: broca.idSerialBroca,
      idModeloBroca: broca.idModeloBroca,
      estado: broca.estado,
      fechaRegistro: broca.fechaRegistro,
      observacion: broca.observacion
    });
    this.showBrocaEditModal = true;
  }

  cerrarModales(): void {
    this.showModeloModal = false;
    this.showModeloEditModal = false;
    this.showBrocaModal = false;
    this.showBrocaEditModal = false;
    this.modeloSeleccionado = null;
    this.brocaSeleccionada = null;
  }

  guardarModelo(): void {
    if (this.formModelo.invalid) {
      this.formModelo.markAllAsTouched();
      return;
    }

    const value = this.formModelo.getRawValue();
    const nuevoModelo: ModeloBrocaModel = {
      idModeloBroca: `MOD-${String(this.modelosBroca.length + 1).padStart(3, '0')}`,
      nombreBroca: value.nombreBroca,
      tipoBroca: value.tipoBroca,
      descripcionBroca: value.descripcionBroca,
      tamanoBroca: value.tamanoBroca,
      matrixBroca: value.matrixBroca,
      marcaBroca: value.marcaBroca
    };

    this.modelosBroca = [nuevoModelo, ...this.modelosBroca];
    this.showModeloModal = false;
    this.formModelo.reset();
  }

  actualizarModelo(): void {
    if (this.formModeloEdit.invalid || !this.modeloSeleccionado) {
      this.formModeloEdit.markAllAsTouched();
      return;
    }

    const value = this.formModeloEdit.getRawValue();
    const idModeloBroca = this.modeloSeleccionado.idModeloBroca;

    this.modelosBroca = this.modelosBroca.map(modelo =>
      modelo.idModeloBroca === idModeloBroca
        ? { ...modelo, ...value, idModeloBroca }
        : modelo
    );

    this.showModeloEditModal = false;
    this.modeloSeleccionado = null;
  }

  eliminarModelo(modelo: ModeloBrocaModel): void {
    const tieneBrocas = this.brocasRegistradas.some(broca => broca.idModeloBroca === modelo.idModeloBroca);

    if (tieneBrocas) {
      window.alert('No puedes eliminar este modelo porque tiene brocas asociadas.');
      return;
    }

    this.modelosBroca = this.modelosBroca.filter(item => item.idModeloBroca !== modelo.idModeloBroca);
  }

  guardarBroca(): void {
    if (this.formBroca.invalid) {
      this.formBroca.markAllAsTouched();
      return;
    }

    const value = this.formBroca.getRawValue();
    const nuevaBroca: BrocaRegistroModel = {
      idSerialBroca: value.idSerialBroca,
      idModeloBroca: value.idModeloBroca,
      estado: value.estado,
      fechaRegistro: value.fechaRegistro,
      observacion: value.observacion ?? ''
    };

    const existe = this.brocasRegistradas.some(broca => broca.idSerialBroca === nuevaBroca.idSerialBroca);
    if (existe) {
      window.alert('Ya existe una broca con ese serial.');
      return;
    }

    this.brocasRegistradas = [nuevaBroca, ...this.brocasRegistradas];
    this.showBrocaModal = false;
    this.formBroca.reset();
  }

  actualizarBroca(): void {
    if (this.formBrocaEdit.invalid || !this.brocaSeleccionada) {
      this.formBrocaEdit.markAllAsTouched();
      return;
    }

    const value = this.formBrocaEdit.getRawValue();
    const idSerialBroca = this.brocaSeleccionada.idSerialBroca;

    this.brocasRegistradas = this.brocasRegistradas.map(broca =>
      broca.idSerialBroca === idSerialBroca
        ? { ...broca, ...value, idSerialBroca }
        : broca
    );

    this.showBrocaEditModal = false;
    this.brocaSeleccionada = null;
  }

  eliminarBroca(broca: BrocaRegistroModel): void {
    const confirmar = window.confirm(`¿Eliminar la broca ${broca.idSerialBroca}?`);
    if (!confirmar) {
      return;
    }

    this.brocasRegistradas = this.brocasRegistradas.filter(item => item.idSerialBroca !== broca.idSerialBroca);
  }
}
