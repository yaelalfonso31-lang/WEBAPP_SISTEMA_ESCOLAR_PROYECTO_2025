import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit {

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public idEvento: number = 0;
  public minDate: Date; // Para restringir fechas pasadas

  // Listas para los Selects
  public tipos_evento: any[] = [
    { value: 'Conferencia', viewValue: 'Conferencia' },
    { value: 'Taller', viewValue: 'Taller' },
    { value: 'Seminario', viewValue: 'Seminario' },
    { value: 'Concurso', viewValue: 'Concurso' },
  ];

  // Opciones de Checkbox
  public lista_publico: any[] = [
    { value: 'Estudiantes', nombre: 'Estudiantes' },
    { value: 'Profesores', nombre: 'Profesores' },
    { value: 'Público general', nombre: 'Público general' },
  ];

  public programas_educativos: any[] = [
    { value: 'Ingeniería en Ciencias de la Computación', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'Licenciatura en Ciencias de la Computación', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'Ingeniería en Tecnologías de la Información', viewValue: 'Ingeniería en Tecnologías de la Información' },
  ];

  public lista_responsables: any[] = []; //Lista combinada de Maestros y Administradores

  constructor(
    private location: Location,
    private router: Router,
    private facadeService: FacadeService,
    private eventosService: EventosService,
    private maestrosService: MaestrosService,
    private administradoresService: AdministradoresService,
    public activatedRoute: ActivatedRoute,
  ) {
    // Inicializar fecha mínima como el día de hoy
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.evento = this.eventosService.esquemaEvento();
    this.evento.publico = [];
    this.obtenerResponsables();
    //// Validar si es edición
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);
      this.obtenerEvento();
    }
  }

  public obtenerEvento(){
    this.eventosService.obtenerEventoPorId(this.idEvento).subscribe(
      (response)=>{
        this.evento = response;
        console.log("Datos evento: ", this.evento);
      }, (error)=>{
        alert("No se pudo obtener la información del evento");
      }
    );
  }

  // función para obtener lista de Maestros y Administradores
  public obtenerResponsables() {
    // Obtener Maestros
    this.maestrosService.obtenerListaMaestros().subscribe(
      (maestros) => {
        const listaMaestros = maestros.map((m: any) => ({
          id: 'M-' + m.id, // Prefijo para diferenciar
          nombre: `${m.user.first_name} ${m.user.last_name} (Maestro)`
        }));
        this.lista_responsables.push(...listaMaestros);
      },
      (error) => { console.error("Error obteniendo maestros", error); }
    );
    //Obtener Administradores
    this.administradoresService.obtenerListaAdmins().subscribe(
      (admins) => {
        const listaAdmins = admins.map((a: any) => ({
          id: 'A-' + a.id,
          nombre: `${a.user.first_name} ${a.user.last_name} (Administrador)`
        }));
        this.lista_responsables.push(...listaAdmins);
      },
      (error) => { console.error("Error obteniendo admins", error); }
    );
  }

  public regresar() {
    this.location.back();
  }

  //función para el manejo de Checkboxes para el público objetivo
  public checkboxChange(event: any) {
    const value = event.source.value;
    if (event.checked) {
      // Agregar al array
      if (!this.evento.publico.includes(value)) {
        this.evento.publico.push(value);
      }
    } else {
      // Remover del array
      const index = this.evento.publico.indexOf(value);
      if (index > -1) {
        this.evento.publico.splice(index, 1);
      }
      // Si se desmarca "Estudiantes", limpiar programa educativo
      if (value === 'Estudiantes') {
        this.evento.programa = '';
      }
    }
  }

  // Revisar si un checkbox está seleccionado (para edición futura)
  public isPublicoSelected(value: string): boolean {
    return this.evento.publico.includes(value);
  }

  // Validar fecha
  public changeFecha(event: any) {
    if (event.value) {
      this.evento.fecha = event.value.toISOString().split("T")[0];
    }
  }

  public registrar() {
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) {
      alert("Favor de verificar los campos marcados con error.");
      return;
    }
    this.eventosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado correctamente");
        this.router.navigate(["eventos-academicos"]);
      },
      (error) => {
        alert("Error al registrar el evento");
        console.error(error);
      }
    );
  }

  public actualizar(){
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if(Object.keys(this.errors).length > 0){
      alert("Favor de verificar los campos marcados con error.");
      return;
    }
    this.eventosService.actualizarEvento(this.evento).subscribe(
      (response)=>{
        alert("Evento actualizado correctamente");
        this.router.navigate(["eventos-academicos"]);
      }, (error)=>{
        alert("No se pudo actualizar el evento");
      }
    );
  }

// Función para los campos solo de datos alfabeticos
  public soloAlfanumerico(event: any) {
    const pattern = /^[a-zA-Z0-9\sÑñÁáÉéÍíÓóÚúÜü]*$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public soloNumeros(event: any) {
    const pattern = /^[0-9]*$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
