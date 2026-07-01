import { Component } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { UsuariosService } from '../../../../../servicios/usuarios';
import { usuarioModel } from '../../../../../Modelos/usuario.model';
import { LoadingService } from '../../../../../servicios/loading-service';
import { RespuestaServerObtenerUsuarios } from '../../../../../Modelos/RespuestaServerObtenerUsuarios.model';

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

  // Configuración de paginación
  currentPage = 1;
  itemsPerPage = 10;

  ListadeUsuarios: usuarioModel[] = [];

  constructor(
    private usuariosService: UsuariosService,
    private toast: NgToastService ,
    private loadingService: LoadingService,

  ) {}

  ngOnInit() {
    //monstrar loading mientras carga los usuarios
    this.loadingService.show();
    //cargar los usuarios
    this.usuariosService.ObtenerUsuarios().subscribe(
      (data: RespuestaServerObtenerUsuarios) => {
        console.log('Respuesta del servidor al obtener usuarios:', data);
        if (data.CODIGO === 200) {
          this.ListadeUsuarios = data.DATOS || [];
        } else {
          this.toast.danger(data.MENSAJE!,'Error',5000,true,true,true);
        }
        this.loadingService.hide();
      },
      (error) => {
        this.toast.danger('Error al cargar los usuarios','Error',5000,true,true,true);
        this.loadingService.hide();
      }
    );



  }




  users = [
    { id: 1, name: 'Carlos Méndez', email: 'cmendes@empresa.com', role: 'Administrador', status: 'Activo', avatar: 'CM', lastLogin: '05/05/2025', created: '01/01/2024' },
    { id: 2, name: 'Laura Torres', email: 'ltorres@empresa.com', role: 'Gerente', status: 'Activo', avatar: 'LT', lastLogin: '04/05/2025', created: '15/03/2024' },
    { id: 3, name: 'Ana Restrepo', email: 'arestrepo@empresa.com', role: 'Analista', status: 'Activo', avatar: 'AR', lastLogin: '03/05/2025', created: '20/04/2024' },
    { id: 4, name: 'Juan Pablo Ruiz', email: 'jpruiz@empresa.com', role: 'Desarrollador', status: 'Inactivo', avatar: 'JP', lastLogin: '20/04/2025', created: '10/02/2024' },
    { id: 5, name: 'Valentina Gómez', email: 'vgomez@empresa.com', role: 'Diseñadora', status: 'Activo', avatar: 'VG', lastLogin: '05/05/2025', created: '05/06/2024' },
    { id: 6, name: 'Miguel Ángel Cruz', email: 'macruz@empresa.com', role: 'Analista', status: 'Pendiente', avatar: 'MC', lastLogin: 'Nunca', created: '01/05/2025' },
  ];





  get filtered(): usuarioModel[] {
    return this.ListadeUsuarios.filter(u =>
      (
        this.filterRole === 'todos' ||
        Number(u.rolid) === Number(this.filterRole)
      ) &&
      (
        (u.nombre ?? '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (u.correo ?? '').toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  get paginatedUsers(): usuarioModel[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filtered.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.itemsPerPage);
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }



  onSearchChange() {
    this.currentPage = 1;
  }

  onRoleChange() {
    this.currentPage = 1;
  }





  get activeCount() {
    return this.ListadeUsuarios.filter(u => u.aceptado === true).length;
  }

  get inactiveCount() {
    return this.ListadeUsuarios.filter(u => u.aceptado === false).length;
  }



  statusType(s: string) {
    if (s === 'Activo') return 'success';
    if (s === 'Inactivo') return 'danger';
    return 'warning';
  }


  obtenerRol(rol?: number): string {
  switch (rol) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Supervisor';
      default:
        return 'Desconocido';
    }
  }

  obteneractivo(aceptado?: boolean): string {
    if (aceptado === true) {
      return 'Activo';
    } else if (aceptado === false) {
      return 'Inactivo';
    } else {
      return 'Desconocido';
    }
  }
}
