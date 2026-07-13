import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProyectoModel } from '../../../../../Modelos/proyecto.model';
import { MIS_PROYECTOS_MOCK } from '../mis-proyectos-data';

@Component({
  selector: 'app-mis-proyectos-list',
  templateUrl: './mis-proyectos-list.component.html',
  styleUrls: ['./mis-proyectos-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MisProyectosListComponent implements OnInit {
  view: 'cards' | 'list' = 'cards';
  searchQuery = '';
  currentPage = 1;
  readonly pageSize = 6;
  projects: ProyectoModel[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.projects = MIS_PROYECTOS_MOCK.map(proyecto => ({
      ...proyecto,
      perforaciones: proyecto.perforaciones.map(perforacion => ({
        ...perforacion,
        historialMovimientoBrocas: perforacion.historialMovimientoBrocas.map(movimiento => ({ ...movimiento }))
      }))
    }));
  }

  get filteredProjects(): ProyectoModel[] {
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
    if (this.totalPages <= 2) {
      return this.pageNumbers;
    }

    if (this.safeCurrentPage >= this.totalPages) {
      return [this.totalPages - 1, this.totalPages];
    }

    return [this.safeCurrentPage, this.safeCurrentPage + 1];
  }

  get paginatedProjects(): ProyectoModel[] {
    const startIndex = (this.safeCurrentPage - 1) * this.pageSize;
    return this.filteredProjects.slice(startIndex, startIndex + this.pageSize);
  }

  get startProjectIndex(): number {
    return this.totalProjects === 0 ? 0 : (this.safeCurrentPage - 1) * this.pageSize + 1;
  }

  get endProjectIndex(): number {
    return Math.min(this.startProjectIndex + this.pageSize - 1, this.totalProjects);
  }

  abrirDetalle(proyecto: ProyectoModel): void {
    this.router.navigate(['/dashboard/misproyectos/detalle', proyecto.idProyecto]);
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

  onSearchChange(): void {
    this.currentPage = 1;
  }

  priorityClass(p: string): string {
    if (p === 'Alta') return 'badge-danger';
    if (p === 'Media') return 'badge-warning';
    return 'badge-neutral';
  }

  statusClass(s: string): string {
    if (s === 'Completado') return 'badge-success';
    if (s === 'Completando') return 'badge-info';
    if (s === 'En curso') return 'badge-warning';
    return 'badge-neutral';
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

  trackProyecto(index: number, proyecto: ProyectoModel): string {
    return proyecto.idProyecto || String(index);
  }
}
