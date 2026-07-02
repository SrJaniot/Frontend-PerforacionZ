import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../../../../servicios/usuarios';
import { NgToastService } from 'ng-angular-popup';
import { SeguridadService } from '../../../../../servicios/seguridad';
import { RespuestaServerObtenerUsuario } from '../../../../../Modelos/RespuestaServerObtenerUsuario.model';
import { LoadingService } from '../../../../../servicios/loading-service';
import { RespuestaServerSinDATA } from '../../../../../Modelos/RespuestaServerSinDATA.model';

@Component({
  selector: 'app-formulario-actualizar-usuario',
  standalone: false,
  templateUrl: './formulario-actualizar-usuario.html',
  styleUrl: './formulario-actualizar-usuario.css',
})
export class FormularioActualizarUsuario {
  @Input() showModal = false;
  @Input() idSupervisor!: String;

  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<void>();

  formSupervisor!: FormGroup;



   constructor(
    private fb: FormBuilder,
    private supervisorService: UsuariosService,
    private toast: NgToastService ,
    private seguridadService: SeguridadService,
    private loadingService: LoadingService,



  ) {


    this.formSupervisor = this.fb.group({

      id_supervisor: [{ value: '', disabled: true }],

      nom_supervisor: [
        '',
        Validators.required
      ],

      correo_supervisor: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      num_cel_supervisor: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/),
          Validators.minLength(10),
          Validators.maxLength(10)
        ]

      ],
      activo: [
        true,
        Validators.required
      ],
      rol: [
        'Supervisor',
        Validators.required
      ]

    });

  }


  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['idSupervisor'] &&
      this.idSupervisor &&
      this.showModal
    ) {

      this.obtenerSupervisor();

    }

  }

  obtenerSupervisor(): void {

    this.loadingService.show();

    this.supervisorService
      .ObtenerUsuarioPorId(this.idSupervisor)
      .subscribe({
        next: (RespuestaServerObtenerUsuario: RespuestaServerObtenerUsuario) => {

          if (RespuestaServerObtenerUsuario.CODIGO !== 200) {
            this.toast.danger(
              RespuestaServerObtenerUsuario.MENSAJE || 'Error al obtener el supervisor',
              'Error',
              5000,
              true,
              true,
              true
            );
            this.loadingService.hide();
            return;

          }

          const resp = RespuestaServerObtenerUsuario.DATOS!;

          this.formSupervisor.patchValue({

            id_supervisor: resp.id_usuario,
            nom_supervisor: resp.nombre,
            correo_supervisor: resp.correo,
            num_cel_supervisor: resp.celular,
            activo: resp.aceptado,
            rol: resp.rolid === 1 ? 'Administrador' : 'Supervisor'

          });

          this.loadingService.hide();

        },

        error: () => {

          this.loadingService.hide();

        }

      });

  }

  actualizarSupervisor(): void {

    if (this.formSupervisor.invalid) {
      this.toast.warning('Por favor, complete todos los campos requeridos correctamente.', 'Advertencia', 5000, true, true, true);

      this.formSupervisor.markAllAsTouched();
      return;

    }
    const nombre_supervisor = this.formSupervisor.get('nom_supervisor')?.value;
    const correo_supervisor = this.formSupervisor.get('correo_supervisor')?.value;
    const numero_celular = this.formSupervisor.get('num_cel_supervisor')?.value;
    const usuario_creacion = this.seguridadService.ObtenerDatosUsuarioIdentificadoSESION()?.usuario?.nombre || 'admin';
    const activo = this.formSupervisor.get('activo')?.value;



    this.supervisorService
      .ActualizarSupervisor(
        this.idSupervisor,
        nombre_supervisor,
        correo_supervisor,
        numero_celular,
        usuario_creacion,
        activo

      )
      .subscribe({
        next: (data: RespuestaServerSinDATA) => {

          if (data.CODIGO === 200) {
            this.toast.success(data.MENSAJE || 'Supervisor actualizado correctamente', 'Éxito', 5000, true, true, true);
            this.actualizado.emit();
            this.cerrar.emit();

          } else {
            this.toast.danger(data.MENSAJE || 'Error al actualizar el supervisor', 'Error', 5000, true, true, true);

          }

        },

        error: () => {

          this.toast.danger('Error al actualizar el supervisor', 'Error', 5000, true, true, true);

        }

      });


  }








}
