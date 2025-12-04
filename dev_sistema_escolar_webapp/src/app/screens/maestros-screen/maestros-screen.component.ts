import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  //Para controlar si el usuario es maestro y solo pueda editar/ eliminar su propio registro
  public userID: number = 0;

  //Bandera que controla el mensaje de error
  public mensajeNoEncontrado: boolean = false;

  //Para la tabla
  displayedColumns: string[] = ['id_trabajador','first_name','last_name','email','fecha_nacimiento','telefono','rfc','cubiculo','area_investigacion','editar','eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  @ViewChild(MatSort) sort: MatSort = {} as MatSort;

  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog

  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener maestros
    this.obtenerMaestros();
    //Obtener ID del usuario en sesión
    this.userID = Number(this.facadeService.getUserId());
  }

  //Obtener la lista de maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        if (this.lista_maestros.length > 0) {
          this.lista_maestros.forEach(usuario => {
            //Agregar datos del nombre e email
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          this.dataSource.data = this.lista_maestros as DatosUsuario[];

          // Aquí hacemos la configuración para el Sorting
          this.dataSource.sortingDataAccessor = (item: any, property) => {
            switch (property) {
              case 'first_name': return item.first_name.toLowerCase();
              case 'last_name': return item.last_name.toLowerCase();
              case 'id_trabajador': return item.id_trabajador;
              default: return item[property];
            }
          };

          // y aquí la configuración del Filtro para buscar por nombre completo
          this.dataSource.filterPredicate = (data: DatosUsuario, filter: string) => {
            const nombreCompleto = (data.first_name + ' ' + data.last_name).toLowerCase();
            return nombreCompleto.includes(filter);
          };

          setTimeout(() => { // Esto es para evitar el error de ExpressionChangedAfterItHasBeenCheckedError el cual ocurre porque el paginator y sort se asignan después de la inicialización
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 0);
        }
      }, (error) => {
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  //Función para el filtro de búsqueda
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    // Si el usuario sigue escribiendo, ocultamos el mensaje
    this.mensajeNoEncontrado = false;
    if (this.dataSource.paginator) { // Reiniciamos a la primera página al filtrar
      this.dataSource.paginator.firstPage();
    }
  }

  //Esto es para el botón de búsqueda
  public buscar() {
    // Si hay un filtro activo Y no hay resultados en la tabla filtrada
    if (this.dataSource.filter.length > 0 && this.dataSource.filteredData.length === 0) {
      this.mensajeNoEncontrado = true;
    } else {
      this.mensajeNoEncontrado = false;
    }
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/maestro/" + idUser]);
  }

  public delete(idUser: number) {
       // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
    const userIdSession = Number(this.facadeService.getUserId());
    // --------- Pero el parametro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    if (this.rol === 'administrador' || (this.rol === 'maestro' && userIdSession === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'maestro'}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Maestro eliminado");
        alert("Maestro eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Maestro no se ha podido eliminar.");
        console.log("No se eliminó el maestro");
      }
    });
    }else{
      alert("No tienes permisos para eliminar este maestro.");
    }
  }


  //Esta función es para controlar que se vean los botones de editar y eliminar
  public canEditOrDelete(idMaestro: number): boolean {
    if (this.rol === 'administrador') {
      return true; // El administrador puede editar/borrar a todos
    }
    if (this.rol === 'maestro') {
      return this.userID === idMaestro; // El maestro solo puede consigo mismo
    }
    return false; // Alumnos u otros no ven nada
  }


}

export interface DatosUsuario {
  id: number,
  id_trabajador: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  cubiculo: string,
  area_investigacion: number,
}
