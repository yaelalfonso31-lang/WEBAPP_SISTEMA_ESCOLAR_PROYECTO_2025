import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  private labels: string[] = ["Administradores", "Maestros", "Alumnos"];
  private colors: string[] = ['#007bf6ff', '#006179', '#79bdedff'];
  public total_user: any = {};
  private datalabelsConfig = {
    color: '#ffffffff',
    font: {
      size: 16,
      weight: 'bold',
      family: 'Nexa-Bold'
    },
  };

 //Histograma
  lineChartData = {
    labels: this.labels,
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: '#79bdedff',
        borderColor: '#79bdedff',
        pointBackgroundColor: ['#900afdff', '#0048ffff', '#e73131ff']
      }
    ]
  }
  lineChartOption = { responsive: false,  };
  lineChartPlugins = [ DatalabelsPlugin ]; //Para mostrar etiquetas de datos en la gráfica

  //Barras
public barChartData: any = {
    labels: this.labels,
    datasets: [{
      data: [0, 0, 0],
      label: 'Registro de usuarios',
      backgroundColor: this.colors
    }]
  };
  public barChartOption: ChartOptions | any = {
    responsive: true,
    plugins: {
      datalabels: this.datalabelsConfig
    }
  };
  public barChartPlugins = [ DatalabelsPlugin ];


  // Circular
 public pieChartData: any = {
    labels: this.labels,
    datasets: [{
      data: [0, 0, 0],
      label: 'Registro de usuarios',
      backgroundColor: this.colors
    }]
  };
  public pieChartOption: ChartOptions | any = {
    responsive: true,
    plugins: {
      datalabels: {
        ...this.datalabelsConfig,
        color: '#ffffff',
        backgroundColor: null
      }
    }
  };
  public pieChartPlugins = [ DatalabelsPlugin ];

  // Dona
public doughnutChartData: any = {
    labels: this.labels,
    datasets: [{
      data: [0, 0, 0],
      label: 'Registro de usuarios',
      backgroundColor: this.colors
    }]
  };
  public doughnutChartOption: ChartOptions | any = {
    responsive: true,
    plugins: {
      datalabels: {
        ...this.datalabelsConfig,
        color: '#ffffff',
        backgroundColor: null
      }
    }
  };
  public doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);
        this.actualizarGraficas();
      }, (error)=>{
        console.error("Error al obtener total de usuarios ", error);
      }
    );
  }

  public actualizarGraficas() {
    // Orden: Admins, Maestros, Alumnos
    const datos = [
      this.total_user.admins,
      this.total_user.maestros,
      this.total_user.alumnos
    ];
    //Se actualizan todas las gráficas
    // Line Chart
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [{ ...this.lineChartData.datasets[0], data: datos }]
    };
    // Bar Chart
    this.barChartData = {
      ...this.barChartData,
      datasets: [{ ...this.barChartData.datasets[0], data: datos }]
    };
    // Pie Chart
    this.pieChartData = {
      ...this.pieChartData,
      datasets: [{ ...this.pieChartData.datasets[0], data: datos }]
    };
    // Doughnut Chart
    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [{ ...this.doughnutChartData.datasets[0], data: datos }]
    };
  }
}
