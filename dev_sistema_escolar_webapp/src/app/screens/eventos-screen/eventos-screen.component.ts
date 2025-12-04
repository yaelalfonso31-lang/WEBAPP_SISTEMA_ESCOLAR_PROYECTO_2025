import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';


@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];
  public mensajeNoEncontrado: boolean = false;

  // Columnas idénticas a la estructura de la tabla de maestros, pero con datos de eventos
  displayedColumns: string[] = ['nombre', 'tipo', 'fecha', 'publico', 'horario', 'lugar', 'responsable','rol_responsable','cupo', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosEventos>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator = {} as MatPaginator;
  @ViewChild(MatSort) sort: MatSort = {} as MatSort;

  constructor(
    public facadeService: FacadeService,
    public eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    if (this.token == "") {
      this.router.navigate(["/"]);
    }

    //este if es para mostrar las columnas de editar y eliminar solo al administrador
    if (this.rol === 'administrador') {
      this.displayedColumns = ['nombre', 'tipo', 'fecha', 'publico', 'horario', 'lugar', 'responsable', 'rol_responsable', 'cupo', 'editar', 'eliminar'];
    } else {
      this.displayedColumns = ['nombre', 'tipo', 'fecha', 'publico', 'horario', 'lugar', 'responsable', 'rol_responsable', 'cupo'];
    }

    //Obtener eventos
    this.obtenerEventos();
  }


  // Consumimos el servicio para obtener los eventos
  //Obtener eventos
  public obtenerEventos() {
    this.eventosService.obtenerEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        if (this.lista_eventos.length > 0) {
          this.dataSource.data = this.lista_eventos as DatosEventos[];
          // Configuración de ordenamiento
          this.dataSource.sortingDataAccessor = (item: any, property) => {
            switch (property) {
              case 'nombre': return item.nombre.toLowerCase();
              case 'tipo': return item.tipo.toLowerCase();
              case 'fecha': return item.fecha;
              default: return item[property];
            }
          };

          // Configuración del filtro para buscar por nombre de evento
          this.dataSource.filterPredicate = (data: DatosEventos, filter: string) => {
            const nombreEvent = data.nombre.toLowerCase();
            return nombreEvent.includes(filter);
          };


          // Configuración de paginador y sorting
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 0);
        }
      }, (error) => {
        alert("No se pudo obtener la lista de eventos");
        console.error("Error al obtener eventos: ", error);
      }
    );
  }

  //Función para redirigir a la pantalla de edición de evento
  public goEditar(idEvento: number) {
    const dialogRef = this.dialog.open(EditarEventoModalComponent, {
    data: { id: idEvento },
    height: '288px',
    width: '328px',
  });
  dialogRef.afterClosed().subscribe(result => {
    if (result && result.isEdit) {
      // Si confirmó (isEdit: true), entonces sí navegamos
      console.log("Redirigiendo a edición de evento: ", idEvento);
      this.router.navigate(["registro-eventos/" + idEvento]);
    } else {
      console.log("Edición cancelada");
    }
  });
  }



  public delete(idEvento: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idEvento, rol: 'evento' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        alert("Evento eliminado correctamente.");
        this.obtenerEventos(); // Recargamos la lista
      }
    });
  }

  //Función para redirigir a la pantalla de edición de evento
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.mensajeNoEncontrado = false;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  public buscar() {
    if (this.dataSource.filter.length > 0 && this.dataSource.filteredData.length === 0) {
      this.mensajeNoEncontrado = true;
    } else {
      this.mensajeNoEncontrado = false;
    }
  }
}

export interface DatosEventos {
  id_evento: number;
  nombre: string;
  tipo: string;
  fecha: string;
  publico: string;
  horario: string;
  lugar: string;
  responsable: string;
  rol_responsable: string;
  cupo: number;
}

