import { Component, OnInit, ViewChild } from '@angular/core'; // Quitamos AfterViewInit
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MatSort } from '@angular/material/sort';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  public userID: number = 0;

  // Controla si mostramos el mensaje de error
  public mensajeNoEncontrado: boolean = false;

  //Para la tabla
  displayedColumns: string[] = ['matricula','first_name','last_name','email','fecha_nacimiento','telefono','curp','rfc','ocupacion','editar','eliminar'];
  dataSource = new MatTableDataSource<DatosUsuarioAlumno>([]); // Inicializamos vacío

  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  @ViewChild(MatSort) sort: MatSort = {} as MatSort;

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener alumnos
    this.obtenerAlumnos();
    this.userID = Number(this.facadeService.getUserId())
  }

  //Obtener la lista de alumnos
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach(usuario => {
            //Agregar datos del nombre e email
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });

          this.dataSource.data = this.lista_alumnos as DatosUsuarioAlumno[];

          // Aquí hacemos la configuración para el Sorting
          this.dataSource.sortingDataAccessor = (item: DatosUsuarioAlumno, property: string) => {
            switch (property) {
              case 'matricula': return item.matricula;
              case 'first_name': return item.first_name.toLowerCase();
              case 'last_name': return item.last_name.toLowerCase();
              default: return (item as any)[property];
            }
          };

          // y aquí la configuración del Filtro para buscar por nombre completo
          this.dataSource.filterPredicate = (data: DatosUsuarioAlumno, filter: string) => {
            const nombreCompleto = (data.first_name + ' ' + data.last_name).toLowerCase();
            return nombreCompleto.includes(filter);
          };

          setTimeout(() => {// Esto es para evitar el error de ExpressionChangedAfterItHasBeenCheckedError el cual ocurre porque el paginator y sort se asignan después de la inicialización
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 0);
        }
      }, (error) => {
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  //Función para el filtro de búsqueda
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    // Si se sigue escribiendo, ocultamos el mensaje
    this.mensajeNoEncontrado = false;
    if (this.dataSource.paginator) { // Verificamos si el paginador está definido
      this.dataSource.paginator.firstPage();
    }
  }

  // botón de búsqueda
  public buscar() {
    if (this.dataSource.filter.length > 0 && this.dataSource.filteredData.length === 0) {
      this.mensajeNoEncontrado = true;
    } else {
      this.mensajeNoEncontrado = false;
    }
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumno/" + idUser]);
  }

  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
    const userIdSession = Number(this.facadeService.getUserId());
    // Lógica de permisos, el Alumno se borra solo a sí mismo
    if (this.rol === 'administrador' || this.rol === 'maestro' || (this.rol === 'alumno' && userIdSession === idUser)) {
      //Alumno puede eliminar su propio registro
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'alumno'},
        height: '288px',
        width: '328px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          alert("Alumno eliminado correctamente.");
          window.location.reload();
        } else {
          alert("Alumno no se ha podido eliminar.");
        }
      });

    } else {
      alert("No tienes permisos para eliminar este Alumno.");
    }
  }

  public canEditOrDelete(idAlumno: number): boolean {
    if (this.rol === 'administrador' || this.rol === 'maestro') {
      return true; // El administrador y maestro pueden editar/borrar a todos
    }
    if (this.rol === 'alumno') {
      return this.userID === idAlumno; // El alumno solo puede consigo mismo
    }
    return false; // Otros roles no ven nada
  }




}

export interface DatosUsuarioAlumno {
  id: number,
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  curp: string,
  rfc: string,
  ocupacion: string,
}
