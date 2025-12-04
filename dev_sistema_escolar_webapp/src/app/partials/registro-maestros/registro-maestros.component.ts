import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public maestro:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;
  public mensaje_exito: string = '';
  public mensaje_error: string = '';
  public loading: boolean = false;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  //Para el select
  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {id: '1', nombre: 'Aplicaciones Web'},
    {id: '2', nombre: 'Programación 1'},
    {id: '3', nombre: 'Bases de datos'},
    {id: '4', nombre: 'Tecnologías Web'},
    {id: '5', nombre: 'Minería de datos'},
    {id: '6', nombre: 'Desarrollo móvil'},
    {id: '7', nombre: 'Estructuras de datos'},
    {id: '8', nombre: 'Administración de redes'},
    {id: '9', nombre: 'Ingeniería de Software'},
    {id: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    // Validar si es edición
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.idUser = this.activatedRoute.snapshot.params['id'];
      this.editar = true;
      this.maestro = this.datos_user;
      console.log("Editar maestro con ID: ", this.idUser);
      //Asegurar que materias_json sea un array para los checkboxes
      if (typeof this.maestro.materias_json === 'string') {
        try {
          this.maestro.materias_json = JSON.parse(this.maestro.materias_json);
        } catch (e) {
          this.maestro.materias_json = [];
        }
      }
    } else {
      this.maestro = this.maestrosService.esquemaMaestro();
      this.maestro.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log("Maestro: ", this.maestro);
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    this.mensaje_exito = '';
    this.mensaje_error = '';
    this.errors = {};
    this.loading = true;

    // Validamos el formulario
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      // Obtenemos el primer mensaje de error del objeto y lo mostramos
      const primerMensajeError = Object.values(this.errors)[0] as string;
      alert(`Error: ${primerMensajeError}`);

      return; // Detenemos la ejecución
    }

    console.log("Datos a enviar:", this.maestro);
    console.log("Materias seleccionadas (nombres):", this.maestro.materias_json);

    if(this.maestro.password == this.maestro.confirmar_password){
      this.maestrosService.registrarMaestro(this.maestro).subscribe(
        (response) => {
          this.loading = false;
          console.log('Maestro registrado con éxito!', response);
          this.mensaje_exito = `Maestro creado correctamente con ID: ${this.maestro.id_trabajador}`;

          this.maestro = this.maestrosService.esquemaMaestro();
          this.maestro.rol = this.rol;
          alert("Maestro registrado exitosamente");
          console.log("Maestro registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["maestros"]);
          }else{
            this.router.navigate(["/"]);
          };
        },
        (error) => {
          this.loading = false;
          console.error('Error al registrar:', error);
          alert("Error al registrar maestro");
          this.mensaje_error = error.message || 'Ocurrió un error desconocido. Intente de nuevo.';
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.maestro.password="";
      this.maestro.confirmar_password="";
    }
  }

  public actualizar(){
    // Lógica para actualizar los datos de un administrador existente
    this.errors= {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, true);
    this.mensaje_exito = '';
    this.mensaje_error = '';

    if(Object.keys(this.errors).length > 0){

      return;
    }

    this.maestrosService.actualizarMaestro(this.maestro).subscribe(
      (response) => {
        console.log('Maestro actualizado con éxito!', response);
        this.mensaje_exito = 'Maestro actualizado correctamente.';
        alert("Maestro actualizado correctamente");
        this.router.navigate(["maestros"]);
      },
      (error) => {
        console.error('Error al actualizar Maestro:', error);
        alert("No se pudo actualizar el maestro");
        console.log("Error: ", error);
        this.mensaje_error = error.error.message || 'Ocurrió un error desconocido. Intente de nuevo.';
      }
    );
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

  //Función para detectar el cambio de fecha
  public changeFecha(event: any){
    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.maestro.fecha_nacimiento);
  }

  // Funciones para los checkbox - USAR NOMBRES CONSISTENTEMENTE
  public checkboxChange(event: any){
    console.log("Evento checkbox: ", event);

    // Asegurarse de que materias_json es un array
    if (!this.maestro.materias_json) {
      this.maestro.materias_json = [];
    }

    // GUARDAR NOMBRE de la materia
    const materiaNombre = event.source.value;
    console.log("Materia seleccionada (nombre):", materiaNombre);

    if(event.checked){
      // Agregar solo si no existe
      if(!this.maestro.materias_json.includes(materiaNombre)) {
        this.maestro.materias_json.push(materiaNombre);
      }
    } else {
      // Remover la materia por nombre
      const index = this.maestro.materias_json.indexOf(materiaNombre);
      if(index > -1) {
        this.maestro.materias_json.splice(index, 1);
      }
    }
    console.log("Array materias actualizado (nombres): ", this.maestro.materias_json);
  }

  // Revisar selección usando nombres
  public revisarSeleccion(materiaNombre: string): boolean {
    if(this.maestro.materias_json){
      return this.maestro.materias_json.includes(materiaNombre);
    } else {
      return false;
    }
  }

  // Función para los campos solo de datos alfabeticos
  public soloLetras(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public soloAlfanumerico(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
