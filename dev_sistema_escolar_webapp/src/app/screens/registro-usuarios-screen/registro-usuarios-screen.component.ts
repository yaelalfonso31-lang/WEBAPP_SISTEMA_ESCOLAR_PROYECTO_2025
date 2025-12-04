import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { MatRadioChange } from '@angular/material/radio';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AlumnosService } from 'src/app/services/alumnos.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo:string = "registro-usuarios";
  public user:any = {};
  public editar:boolean = false;
  public rol:string = "";
  public idUser:number = 0;
  //Banderas para el tipo de usuario
  public isAdmin:boolean = false;
  public isAlumno:boolean = false;
  public isMaestro:boolean = false;

  public tipo_user:string = "";

  public isRoleDisabled: boolean = false; //Esta bandera es para deshabilitar selección de rol en edición

  public isDataLoaded: boolean = false;//Bandera ara controlar la carga de datos en edición

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
  ) { }

  ngOnInit(): void {
    this.user.tipo_usuario = '';
    this.isRoleDisabled = false;
    //Obtener de la URL el rol para saber cual editar
    if (this.activatedRoute.snapshot.params['rol'] != undefined) {
      this.rol = this.activatedRoute.snapshot.params['rol'];
      console.log("Rol detectado en URL: ", this.rol);
      this.user.tipo_usuario = this.rol;
      this.radioChange({value: this.rol} as MatRadioChange);
      this.isRoleDisabled = true;
    } else {
      // Si no hay rol en la URL, iniciamos vacío
      this.user.tipo_usuario = '';
      this.isRoleDisabled = false;
    }
    //El if valida si existe un parámetro ID en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Si es edición, esperamos a que carguen los datos
      this.isDataLoaded = false;
      this.obtenerUserByID();
    } else {
      this.editar = false;
      // Si es registro nuevo, mostramos el formulario de inmediato
      this.isDataLoaded = true;
    }
  }

  public radioChange(event: MatRadioChange) {
    if(event.value == "administrador"){
      this.isAdmin = true;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = "administrador";
    }else if (event.value == "alumno"){
      this.isAdmin = false;
      this.isAlumno = true;
      this.isMaestro = false;
      this.tipo_user = "alumno";
    }else if (event.value == "maestro"){
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = "maestro";
    }
  }

    //Obtener usuario por ID
  public obtenerUserByID() {
    //Lógica para obtener el usuario según su ID y rol
    console.log("Obteniendo usuario de tipo: ", this.rol, " con ID: ", this.idUser);
    //Aquí se haría la llamada al servicio correspondiente según el rol
    if(this.rol == "administrador"){
      this.administradoresService.obtenerAdminPorId(this.idUser).subscribe(
        (response: any) => {
          this.user = response;
          console.log("Usuario original obtenido: ", this.user);
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isAdmin = true;
          this.isDataLoaded = true;
        }, (error: any) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el administrador seleccionado");
        }
      );
    }else if(this.rol == "maestro"){
      //TODO: Implementar lógica para obtener maestro por ID
      this.maestrosService.obtenerMaestroPorId(this.idUser).subscribe(
        (response: any) => {
          this.user = response;
          console.log("Datos maestro a editar: ", this.user);
          // Mapeo de datos anidados
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isMaestro = true;
          this.isDataLoaded = true; // Activamos formulario de Maestro
        }, (error: any) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el maestro seleccionado");
        }
      );
    }else if(this.rol == "alumno"){
      // TODO: Implementar lógica para obtener alumno por ID
      this.alumnosService.obtenerAlumnoPorId(this.idUser).subscribe(
        (response: any) => {
          this.user = response;
          console.log("Datos alumno a editar: ", this.user);

          // Mapeo de datos anidados
         this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isAlumno = true;
          this.isDataLoaded = true;// Activamos formulario de Alumno
        }, (error: any) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el alumno seleccionado");
        }
      );
    }

  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
