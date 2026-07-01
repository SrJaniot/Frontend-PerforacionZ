import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { SeguridadService } from '../../../servicios/seguridad';
import { UsuarioValidadoModel } from '../../../Modelos/UsuarioValidado.model';
import { forkJoin } from 'rxjs';
import { ItemMenuModel } from '../../../Modelos/item.menu.model';
import { LoadingService } from '../../../servicios/loading-service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  standalone: false
})
export class DashboardLayoutComponent {
  //variables
  sidebarOpen = true;
  sesionActiva= false;
  cargando=true;
  private loadingService = inject(LoadingService);
  loading$ = this.loadingService.loading$;





  //constructor
  constructor(
    private seguridadService: SeguridadService,
    private cd: ChangeDetectorRef,


  ) {}





  ngOnInit() {
    this.ValidarSesionActiva();
    // esperar 5 segundos para quitar el loading
    setTimeout(() => {
      this.cargando = false;
      this.cd.detectChanges();
    }, 2000);
  }




  ValidarSesionActiva() {
  this.seguridadService.ObteberDatosSesion().subscribe({
    next: (datos:UsuarioValidadoModel) => {
      //console.log(datos);
      if (datos.token!= "") {
        this.sesionActiva = true;
      }else{
        this.sesionActiva = false;
      }
      //console.log(datos);
    },
    error: (error:any) => {
      //console.log(error);
      this.sesionActiva = false;
    }
    });

  }






  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
