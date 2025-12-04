import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  @Input() rol: string = ""; //Obtenemos el rol del admin a registrar
  @Input() datos_user: any = {}; //Obtenemos los datos del admin a editar

  public admin:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;
  public mensaje_exito: string = '';
  public mensaje_error: string = '';
  public loading: boolean = false; // Para mostrar loading

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.idUser = this.activatedRoute.snapshot.params['id'];
      this.editar = true;
      console.log("Editar admin con id: ", this.idUser);
      this.admin = this.datos_user;
    }else{ // Registro nuevo de admin
      this.admin = this.administradoresService.esquemaAdmin();
      this.admin.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log("Admin: ", this.admin);
  }

  //Funciones para password
  public showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(): boolean {
    // Limpiamos mensajes previos
    this.mensaje_exito = '';
    this.mensaje_error = '';
    this.errors = {};

    // Validamos el formulario
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
      if(Object.keys(this.errors).length > 0){
        // Obtenemos el primer mensaje de error del objeto y lo mostramos
        const primerMensajeError = Object.values(this.errors)[0] as string;
        alert(`Error: ${primerMensajeError}`);

        return false; // Detenemos la ejecución
      }

    // Si la validación pasa, llamamos al servicio para registrar
     if(this.admin.password == this.admin.confirmar_password){
    this.administradoresService.registrarAdmin(this.admin).subscribe(
      (response: any) => {
        alert("Administrador registrado exitosamente");
        console.log('Admin registrado con éxito!', response);
        this.mensaje_exito = `Administrador creado correctamente con ID: ${response.admin_created_id}`;
        // Reiniciamos el formulario
        this.admin = this.administradoresService.esquemaAdmin();
        this.admin.rol = this.rol;
        if(this.token && this.token !== ""){
            this.router.navigate(["administrador"]);
          }else{
            this.router.navigate(["/"]);
          }
      },
      (error: any) => {
        console.error('Error al registrar Administrador:', error);
         alert("Error al registrar administrador");
        // Mostramos el mensaje de error que viene del backend
        this.mensaje_error = error.error.message || 'Ocurrió un error desconocido. Intente de nuevo.';
      }
    );
  }else{
      alert("Las contraseñas no coinciden");
      this.admin.password="";
      this.admin.confirmar_password="";
    }
    return true;
  }

  public actualizar(){
    // Lógica para actualizar los datos de un administrador existente
    this.errors= {};
    this.errors= this.administradoresService.validarAdmin(this.admin, this.editar);
    this.mensaje_exito = '';
    this.mensaje_error = '';

    if(Object.keys(this.errors).length > 0){
      return;   // Detenemos la ejecución si hay errores
    }

    // Llamamos al servicio para actualizar
    this.administradoresService.actualizarAdmin(this.admin).subscribe(
      (response: any) => {
        console.log('Administrador actualizado con éxito!', response);
        alert("Administrador actualizado exitosamente");
        this.mensaje_exito = 'Administrador actualizado correctamente.';
        this.router.navigate(["administrador"]);
      },
      (error: any) => {
        console.error('Error al actualizar Administrador:', error);
        alert("Error al actualizar administrador");
        this.mensaje_error = error.error.message || 'Ocurrió un error desconocido. Intente de nuevo.';
      }
    );
  }

  // Función para los campos solo de datos alfabeticos
  public soloLetras(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/; // Permite letras, acentos, ñ, ü y espacios
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public soloAlfanumerico(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]$/; // Expresión regular que permite letras, números, acentos, ñ, ü y espacios
    const inputChar = event.key;
    if (!pattern.test(inputChar)) {
      // Si la tecla presionada no cumple con el patrón, se previene la acción.
      event.preventDefault();
    }
  }
}
