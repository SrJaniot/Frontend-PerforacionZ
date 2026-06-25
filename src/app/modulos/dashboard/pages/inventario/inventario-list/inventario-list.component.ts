import { Component } from '@angular/core';

@Component({
  selector: 'app-inventario-list',
  templateUrl: './inventario-list.component.html',
  styleUrls: ['./inventario-list.component.scss'],
  standalone: false
})
export class InventarioListComponent {
  searchQuery = '';
  filterCategory = 'todas';
  showModal = false;

  items = [
    { id: 'A-001', name: 'Laptop Dell XPS 15', category: 'Tecnología', stock: 5, min: 3, price: 2100000, location: 'Bodega A', status: 'ok' },
    { id: 'A-002', name: 'Monitor LG 27"', category: 'Tecnología', stock: 2, min: 5, price: 850000, location: 'Bodega A', status: 'low' },
    { id: 'A-003', name: 'Teclado Mecánico', category: 'Periféricos', stock: 0, min: 4, price: 180000, location: 'Bodega B', status: 'out' },
    { id: 'B-001', name: 'Silla Ergonómica', category: 'Mobiliario', stock: 8, min: 2, price: 620000, location: 'Bodega B', status: 'ok' },
    { id: 'B-002', name: 'Escritorio Ajustable', category: 'Mobiliario', stock: 3, min: 2, price: 980000, location: 'Bodega B', status: 'ok' },
    { id: 'C-001', name: 'Papel Bond A4 Resma', category: 'Papelería', stock: 12, min: 10, price: 15000, location: 'Bodega C', status: 'ok' },
    { id: 'C-002', name: 'Cartuchos de Tinta', category: 'Papelería', stock: 1, min: 6, price: 95000, location: 'Bodega C', status: 'low' },
    { id: 'D-001', name: 'Servidor HP ProLiant', category: 'Tecnología', stock: 2, min: 1, price: 8500000, location: 'CPD', status: 'ok' },
  ];

  get filtered() {
    return this.items.filter(i =>
      (this.filterCategory === 'todas' || i.category === this.filterCategory) &&
      (i.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
       i.id.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  formatPrice(n: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  }

  statusLabel(s: string) {
    if (s === 'ok') return 'Normal';
    if (s === 'low') return 'Stock Bajo';
    return 'Agotado';
  }
  statusClass(s: string) {
    if (s === 'ok') return 'badge-success';
    if (s === 'low') return 'badge-warning';
    return 'badge-danger';
  }
}
