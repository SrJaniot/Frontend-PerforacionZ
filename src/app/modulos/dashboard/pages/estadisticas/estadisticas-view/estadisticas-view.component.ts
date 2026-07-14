import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { EstadisticaMetrosvsBrocaPorProyecto } from '../../../../../Modelos/EstadisticaMetrosvsBrocaPorProyecto';
import { EstadisticaMetrosvsMarcaBroca } from '../../../../../Modelos/EstadisticaMetrosvsMarcaBroca';
import { EstadisticaMetrosvsModeloBroca } from '../../../../../Modelos/EstadisticaMetrosvsModeloBroca';
import { Estadisticas } from '../../../../../servicios/estadisticas';

type EstadisticasTab = 'proyectos' | 'marcas' | 'modelos';

interface ProyectoAgrupado {
  idProyecto: number;
  nombreProyecto: string;
  metrosPerforados: number;
  totalMovimientos: number;
  brocasUsadas: number;
}

@Component({
  selector: 'app-estadisticas-view',
  templateUrl: './estadisticas-view.component.html',
  styleUrls: ['./estadisticas-view.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstadisticasViewComponent implements OnInit {
  activeTab: EstadisticasTab = 'proyectos';
  cargando = false;
  errorCarga = '';

  estadisticasProyecto: EstadisticaMetrosvsBrocaPorProyecto[] = [];
  estadisticasMarca: EstadisticaMetrosvsMarcaBroca[] = [];
  estadisticasModelo: EstadisticaMetrosvsModeloBroca[] = [];

  constructor(
    private readonly estadisticasService: Estadisticas,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cambiarTab(tab: EstadisticasTab): void {
    this.activeTab = tab;
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.errorCarga = '';

    forkJoin({
      proyectos: this.estadisticasService.ObtenerEstadisticaMetrosvsBrocaPorProyecto(),
      marcas: this.estadisticasService.ObtenerEstadisticaMetrosvsMarcaBroca(),
      modelos: this.estadisticasService.ObtenerEstadisticaMetrosvsModeloBroca()
    })
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ proyectos, marcas, modelos }) => {
          this.estadisticasProyecto = (proyectos.DATOS ?? []).map((item) => ({
            ...item,
            NOM_PROYECTO: (item.NOM_PROYECTO ?? 'Sin nombre').trim() || 'Sin nombre',
            NOM_BROCA: (item.NOM_BROCA ?? 'Sin broca').trim() || 'Sin broca',
            MARCA_BROCA: (item.MARCA_BROCA ?? 'Sin marca').trim() || 'Sin marca',
            METROS_PERFORADOS: this.numeroSeguro(item.METROS_PERFORADOS),
            TOTAL_MOVIMIENTOS: this.numeroSeguro(item.TOTAL_MOVIMIENTOS)
          }));

          this.estadisticasMarca = (marcas.DATOS ?? []).map((item) => ({
            ...item,
            MARCA_BROCA: (item.MARCA_BROCA ?? 'Sin marca').trim() || 'Sin marca',
            METROS_PERFORADOS: this.numeroSeguro(item.METROS_PERFORADOS),
            TOTAL_MOVIMIENTOS: this.numeroSeguro(item.TOTAL_MOVIMIENTOS),
            MODELOS_DE_BROCA: this.numeroSeguro(item.MODELOS_DE_BROCA),
            INSTANCIAS_USADAS: this.numeroSeguro(item.INSTANCIAS_USADAS)
          }));

          this.estadisticasModelo = (modelos.DATOS ?? []).map((item) => ({
            ...item,
            NOM_BROCA: (item.NOM_BROCA ?? 'Sin modelo').trim() || 'Sin modelo',
            TIPO_BROCA: (item.TIPO_BROCA ?? 'Sin tipo').trim() || 'Sin tipo',
            MATRIX_BROCA: (item.MATRIX_BROCA ?? 'Sin matrix').trim() || 'Sin matrix',
            MARCA_BROCA: (item.MARCA_BROCA ?? 'Sin marca').trim() || 'Sin marca',
            TAMANIO_BROCA: this.numeroSeguro(item.TAMANIO_BROCA),
            METROS_PERFORADOS: this.numeroSeguro(item.METROS_PERFORADOS),
            TOTAL_MOVIMIENTOS: this.numeroSeguro(item.TOTAL_MOVIMIENTOS),
            INSTANCIAS_USADAS: this.numeroSeguro(item.INSTANCIAS_USADAS)
          }));
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorCarga = 'No se pudieron cargar las estadisticas. Intenta nuevamente.';
          this.cdr.markForCheck();
        }
      });
  }

  get resumenProyectos(): ProyectoAgrupado[] {
    const agrupado = new Map<number, { nombreProyecto: string; metros: number; movimientos: number; brocas: Set<string> }>();

    for (const item of this.estadisticasProyecto) {
      const idProyecto = item.ID_PROYECTO ?? 0;
      const nombreProyecto = item.NOM_PROYECTO ?? 'Sin nombre';
      const metros = this.numeroSeguro(item.METROS_PERFORADOS);
      const movimientos = this.numeroSeguro(item.TOTAL_MOVIMIENTOS);
      const broca = `${item.ID_BROCA ?? 0}-${item.NOM_BROCA ?? ''}`;

      if (!agrupado.has(idProyecto)) {
        agrupado.set(idProyecto, {
          nombreProyecto,
          metros: 0,
          movimientos: 0,
          brocas: new Set<string>()
        });
      }

      const registro = agrupado.get(idProyecto);
      if (!registro) {
        continue;
      }

      registro.metros += metros;
      registro.movimientos += movimientos;
      registro.brocas.add(broca);
    }

    return Array.from(agrupado.entries())
      .map(([idProyecto, valor]) => ({
        idProyecto,
        nombreProyecto: valor.nombreProyecto,
        metrosPerforados: valor.metros,
        totalMovimientos: valor.movimientos,
        brocasUsadas: valor.brocas.size
      }))
      .sort((a, b) => b.metrosPerforados - a.metrosPerforados);
  }

  get topProyectos(): ProyectoAgrupado[] {
    return this.resumenProyectos.slice(0, 8);
  }

  get topMarcas(): EstadisticaMetrosvsMarcaBroca[] {
    return [...this.estadisticasMarca]
      .sort((a, b) => this.numeroSeguro(b.METROS_PERFORADOS) - this.numeroSeguro(a.METROS_PERFORADOS))
      .slice(0, 8);
  }

  get topModelos(): EstadisticaMetrosvsModeloBroca[] {
    return [...this.estadisticasModelo]
      .sort((a, b) => this.numeroSeguro(b.METROS_PERFORADOS) - this.numeroSeguro(a.METROS_PERFORADOS))
      .slice(0, 10);
  }

  get totalMetrosProyecto(): number {
    return this.resumenProyectos.reduce((acumulado, item) => acumulado + item.metrosPerforados, 0);
  }

  get totalMetrosMarca(): number {
    return this.estadisticasMarca.reduce((acumulado, item) => acumulado + this.numeroSeguro(item.METROS_PERFORADOS), 0);
  }

  get totalMetrosModelo(): number {
    return this.estadisticasModelo.reduce((acumulado, item) => acumulado + this.numeroSeguro(item.METROS_PERFORADOS), 0);
  }

  get totalMovimientosProyecto(): number {
    return this.resumenProyectos.reduce((acumulado, item) => acumulado + item.totalMovimientos, 0);
  }

  get totalMovimientosMarca(): number {
    return this.estadisticasMarca.reduce((acumulado, item) => acumulado + this.numeroSeguro(item.TOTAL_MOVIMIENTOS), 0);
  }

  get totalMovimientosModelo(): number {
    return this.estadisticasModelo.reduce((acumulado, item) => acumulado + this.numeroSeguro(item.TOTAL_MOVIMIENTOS), 0);
  }

  get totalInstanciasMarca(): number {
    return this.estadisticasMarca.reduce((acumulado, item) => acumulado + this.numeroSeguro(item.INSTANCIAS_USADAS), 0);
  }

  get totalInstanciasModelo(): number {
    return this.estadisticasModelo.reduce((acumulado, item) => acumulado + this.numeroSeguro(item.INSTANCIAS_USADAS), 0);
  }

  porcentajeBarra(valor: number, maximo: number): number {
    if (maximo <= 0) {
      return 0;
    }

    return (valor / maximo) * 100;
  }

  maximoMetrosProyectos(): number {
    return this.topProyectos.length > 0
      ? Math.max(...this.topProyectos.map((item) => item.metrosPerforados))
      : 0;
  }

  maximoMetrosMarcas(): number {
    return this.topMarcas.length > 0
      ? Math.max(...this.topMarcas.map((item) => this.numeroSeguro(item.METROS_PERFORADOS)))
      : 0;
  }

  maximoMetrosModelos(): number {
    return this.topModelos.length > 0
      ? Math.max(...this.topModelos.map((item) => this.numeroSeguro(item.METROS_PERFORADOS)))
      : 0;
  }

  formatoNumero(valor: number): string {
    return new Intl.NumberFormat('es-CO').format(valor);
  }

  private numeroSeguro(valor: number | undefined): number {
    if (typeof valor !== 'number' || Number.isNaN(valor)) {
      return 0;
    }

    return valor;
  }
}
