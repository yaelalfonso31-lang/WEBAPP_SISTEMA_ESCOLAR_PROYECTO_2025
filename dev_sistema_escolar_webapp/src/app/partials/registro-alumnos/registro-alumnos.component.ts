import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public alumno:any = {};
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
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private alumnosService: AlumnosService
  ) { }

  ngOnInit(): void {
    //El primer if valida si existe un parametrol en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.idUser = this.activatedRoute.snapshot.params['id'];
      this.editar = true;
      this.alumno = this.datos_user;
      console.log("Editar Alumno con id: ", this.idUser);
    } else {
      this.alumno = this.alumnosService.esquemaAlumno();
      this.alumno.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log("Alumno: ", this.alumno);
  }

  //Funciones para password
  public showPassword(){
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar(){
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    // Limpiamos mensajes previos
    this.mensaje_exito = '';
    this.mensaje_error = '';
    this.errors = {};
    this.loading = true;

    // Validamos el formulario
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
        if(Object.keys(this.errors).length > 0){
      // Obtenemos el primer mensaje de error del objeto y lo mostramos
      const primerMensajeError = Object.values(this.errors)[0] as string;
      alert(`Error: ${primerMensajeError}`);

      return; // Detenemos la ejecución
    }
    // Si la validación pasa, llamamos al servicio para registrar
    if(this.alumno.password == this.alumno.confirmar_password){
    this.alumnosService.registrarAlumno(this.alumno).subscribe(
      (response) => {
        console.log('Alumno registrado con éxito!', response);
        this.mensaje_exito = `Alumno creado correctamente con matrícula: ${this.alumno.matricula}`;
        // Reiniciamos el formulario
        this.alumno = this.alumnosService.esquemaAlumno();
        this.alumno.rol = this.rol;
         alert("Alumno registrado exitosamente");
          console.log("Alumno registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["alumnos"]);
          }else{
            this.router.navigate(["/"]);
          }
      },
      (error) => {
        this.loading = false;
        alert("Error al registrar alumno");
        console.error('Error al registrar Alumno:', error);
        // Mostramos el mensaje de error que viene del backend
        this.mensaje_error = error.message || 'Ocurrió un error desconocido. Intente de nuevo.';
      }
    );
  }else{
      alert("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }
  }


  public actualizar(){
    // Validamos (pasamos 'true' porque es edición, así no pide password)
    this.errors= {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    this.mensaje_exito = '';
    this.mensaje_error = '';

    if(Object.keys(this.errors).length > 0){
      return;
    }

    this.alumnosService.actualizarAlumno(this.alumno).subscribe(
      (response: any) => {
        console.log('Alumno actualizado con éxito!', response);
        alert("Alumno actualizado correctamente");
        this.mensaje_exito = 'Alumno actualizado correctamente.';
        this.router.navigate(["alumnos"]);
      },
      (error) => {
        console.error('Error al actualizar Alumno:', error);
        alert("No se pudo actualizar el alumno");
        console.log("Error: ", error);
        this.mensaje_error = error.error.message || 'Ocurrió un error desconocido. Intente de nuevo.';
      }
    );
  }


 // Función para detectar el cambio de fecha y calcular la edad
  public changeFecha(event: any) {
    if (event.value) {
      this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
      console.log("Fecha seleccionada: ", this.alumno.fecha_nacimiento);

      const fechaNacimiento = new Date(event.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();

      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }
      this.alumno.edad = edad;
      console.log("Edad calculada: ", this.alumno.edad);
    }
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
      event.preventDefault();
    }
  }
}
