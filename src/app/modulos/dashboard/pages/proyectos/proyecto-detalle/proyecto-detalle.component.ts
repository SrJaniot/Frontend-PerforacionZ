import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProyectoModel } from '../../../../../Modelos/proyecto.model';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: false,
  templateUrl: './proyecto-detalle.component.html',
  styleUrls: ['./proyecto-detalle.component.scss']
})
export class ProyectoDetalleComponent {
  @Input() showModal = false;
  @Input() proyecto: ProyectoModel | null = null;

  @Output() cerrar = new EventEmitter<void>();

  get colorClass(): string {
    if (!this.proyecto) {
      return 'bg-slate-500';
    }

    if (this.proyecto.color === 'blue') return 'bg-blue-500';
    if (this.proyecto.color === 'emerald') return 'bg-emerald-500';
    if (this.proyecto.color === 'amber') return 'bg-amber-500';
    if (this.proyecto.color === 'cyan') return 'bg-cyan-500';
    if (this.proyecto.color === 'red') return 'bg-red-500';
    if (this.proyecto.color === 'purple') return 'bg-violet-500';

    return 'bg-slate-500';
  }
}
