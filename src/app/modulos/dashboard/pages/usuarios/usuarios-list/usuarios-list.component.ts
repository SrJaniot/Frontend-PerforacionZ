import { Component } from '@angular/core';

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss'],
  standalone: false
})
export class UsuariosListComponent {
  searchQuery = '';
  filterRole = 'todos';
  showModal = false;

  users = [
    { id: 1, name: 'Carlos Méndez', email: 'cmendes@empresa.com', role: 'Administrador', status: 'Activo', avatar: 'CM', lastLogin: '05/05/2025', created: '01/01/2024' },
    { id: 2, name: 'Laura Torres', email: 'ltorres@empresa.com', role: 'Gerente', status: 'Activo', avatar: 'LT', lastLogin: '04/05/2025', created: '15/03/2024' },
    { id: 3, name: 'Ana Restrepo', email: 'arestrepo@empresa.com', role: 'Analista', status: 'Activo', avatar: 'AR', lastLogin: '03/05/2025', created: '20/04/2024' },
    { id: 4, name: 'Juan Pablo Ruiz', email: 'jpruiz@empresa.com', role: 'Desarrollador', status: 'Inactivo', avatar: 'JP', lastLogin: '20/04/2025', created: '10/02/2024' },
    { id: 5, name: 'Valentina Gómez', email: 'vgomez@empresa.com', role: 'Diseñadora', status: 'Activo', avatar: 'VG', lastLogin: '05/05/2025', created: '05/06/2024' },
    { id: 6, name: 'Miguel Ángel Cruz', email: 'macruz@empresa.com', role: 'Analista', status: 'Pendiente', avatar: 'MC', lastLogin: 'Nunca', created: '01/05/2025' },
  ];

  get filtered() {
    return this.users.filter(u =>
      (this.filterRole === 'todos' || u.role === this.filterRole) &&
      (u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
       u.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  get activeCount() {
    return this.users.filter(u => u.status === 'Activo').length;
  }

  statusType(s: string) {
    if (s === 'Activo') return 'success';
    if (s === 'Inactivo') return 'danger';
    return 'warning';
  }
}
