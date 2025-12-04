import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';


@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {

  public rol: string = "";
  public name_user: string = "";
  public lista_admins: any[] = [];  // Lista que se muestra en la tabla la cual se modifica al filtrar/ordenar
  //esto es para hacer copia de respaldo con los datos originales
  public lista_admins_original: any[] = [];
  // aquí son variables para el control del ordenamiento
  public sortColumn: string = '';
  public sortDirection: 'asc' | 'desc' = 'asc';

  public mensajeNoEncontrado: boolean = false; //para el mensaje de no encontrado

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    //Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();

    //Obtener la lista de administradores
    this.obtenerAdmins();
  }

  //Obtener la lista de usuarios
  public obtenerAdmins(){
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response)=>{
        this.lista_admins = response;
        this.lista_admins_original = [...response];//Se hace una copia de respaldo
        console.log("Lista users: ", this.lista_admins);
      }, (error)=>{
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  // Función para filtrar la lista de administradores por nombre o apellido
  public filtrar(event: any) {
    this.mensajeNoEncontrado = false; // Bandera que se reinicia para mensaje de no encontrado al iniciar un nuevo filtro
    const texto = event.target.value.toLowerCase();
    if (texto === '') { // Si no hay texto restauramos la lista original
      this.lista_admins = [...this.lista_admins_original];
    } else {
      // Filtramos buscando en Nombre O Apellido
      this.lista_admins = this.lista_admins_original.filter(admin => {
        const nombre = admin.user.first_name.toLowerCase();
        const apellido = admin.user.last_name.toLowerCase();
        const nombreCompleto = `${nombre} ${apellido}`;
        return nombre.includes(texto) || apellido.includes(texto) || nombreCompleto.includes(texto);
      });
    }
  }

  // Función que se llama al presionar el botón de buscar
  public buscar() {
    if (this.lista_admins.length === 0 && this.lista_admins_original.length > 0) { // Al presionar el botón, verificamos si el filtrado dejó la lista vacía
      this.mensajeNoEncontrado = true;
    } else {
      this.mensajeNoEncontrado = false;
    }
  }

  // Función que funciona como SORT
  public ordenar(columna: string) {  // Si ya estamos ordenando por esta columna, invertimos la dirección
    if (this.sortColumn === columna) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columna;
      this.sortDirection = 'asc';
    }
    this.lista_admins.sort((a, b) => { // Función de comparación para ordenar
      let valorA: any;
      let valorB: any;
      // Extraemos los valores según la columna seleccionada
      switch (columna) {
        case 'clave_admin':
          valorA = a.clave_admin;
          valorB = b.clave_admin;
          break;
        case 'first_name':
          valorA = a.user.first_name.toLowerCase();
          valorB = b.user.first_name.toLowerCase();
          break;
        case 'last_name':
          valorA = a.user.last_name.toLowerCase();
          valorB = b.user.last_name.toLowerCase();
          break;
        default:
          return 0;
      }
      if (valorA < valorB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Método auxiliar para mostrar la flecha correcta en el HTML
  public getSortIcon(columna: string): string {
    if (this.sortColumn !== columna) {
      return 'bi-arrow-down-up text-muted'; // Icono neutral
    }
    return this.sortDirection === 'asc' ? 'bi-arrow-up text-primary' : 'bi-arrow-down text-primary';
  }


  public goEditar(idUser: number){
    this.router.navigate(["registro-usuarios/administrador/"+idUser]); //
  }


  public delete(idUser: number){
    // Administrador puede eliminar cualquier maestro
    const dialogRef = this.dialog.open(EliminarUserModalComponent,{
      data: {id: idUser, rol: 'administrador'},
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Administrador eliminado");
        alert("Administrador eliminado correctamente.");
        //Recargar página
        window.location.reload();
      } else {
        console.log("No se eliminó el maestro");
        alert("No se eliminó el administrador");
      }
    });
  }
}

