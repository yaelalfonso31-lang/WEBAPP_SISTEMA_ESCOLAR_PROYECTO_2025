import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FacadeService } from './facade.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaEvento() {
    return {
      'nombre': '',
      'tipo': '',
      'fecha': '',
      'hora_inicio': '',
      'hora_fin': '',
      'lugar': '',
      'publico': [],
      'programa': '',
      'responsable': '',
      'descripcion': '',
      'cupo': ''
    }
  }

  // Validación para el formulario
  public validarEvento(data: any, editar: boolean) {
    console.log("Validando evento... ", data);
    let error: any = {};

    // Nombre
    if (!this.validatorService.required(data["nombre"])) {
      error["nombre"] = this.errorService.required;
    } else if (!/^[a-zA-Z0-9\sÑñÁáÉéÍíÓóÚúÜü]+$/.test(data["nombre"])) {
      error["nombre"] = "Solo se permiten letras, números y espacios.";
      alert("Nombre inválido");
    }
    //Tipo de evento
    if (!this.validatorService.required(data["tipo"])) {
      error["tipo"] = "Selecciona el tipo de evento";
      alert("Tipo de evento inválido");
    }
    // Fecha
    if (!this.validatorService.required(data["fecha"])) {
      error["fecha"] = this.errorService.required;
      alert("Fecha inválida: debe ser fecha de hoy o posterior");
    }
    //Horario
    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }
    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }

    if (data["hora_inicio"] && data["hora_fin"]) {
      // Convertimos a 24h temporalmente solo para comparar
      const inicio24 = this.convertTo24Hour(data["hora_inicio"]);
      const fin24 = this.convertTo24Hour(data["hora_fin"]);

      if (inicio24 >= fin24) {
        error["hora_fin"] = "La hora final debe ser mayor a la inicial";
        alert("Error en el horario: La hora final debe ser mayor a la inicial");
      }
    }

    //Lugar
    if (!this.validatorService.required(data["lugar"])) {
      error["lugar"] = this.errorService.required;
    } else if (!/^[a-zA-Z0-9\sÑñÁáÉéÍíÓóÚúÜü]+$/.test(data["lugar"])) {
      error["lugar"] = "Solo caracteres alfanuméricos y espacios.";
      alert("Lugar inválido: solo caracteres alfanuméricos y espacios.");
    }

    // Público objetivo (Checkbox array)
    if (!data["publico"] || data["publico"].length === 0) {
      error["publico"] = "Selecciona al menos un público objetivo";
      alert("Público objetivo inválido: selecciona al menos uno.");
    }

    // Programa educativo Si Estudiantes está seleccionado
    if (data["publico"] && data["publico"].includes('Estudiantes')) {
      if (!this.validatorService.required(data["programa"])) {
        error["programa"] = "Selecciona el programa educativo";
        alert("Programa educativo inválido: selecciona un programa.");
      }
    }

    //Responsable
    if (!this.validatorService.required(data["responsable"])) {
      error["responsable"] = this.errorService.required;
      alert("Responsable inválido: selecciona un responsable.");
    }

    // 1Descripción: Max 300 chars, letras, números, signos básicos
    if (!this.validatorService.required(data["descripcion"])) {
      error["descripcion"] = this.errorService.required;
    } else if (data["descripcion"].length > 300) {
      error["descripcion"] = "Máximo 300 caracteres.";
      alert("Descripción inválida: máximo 300 caracteres.");
    } else if (!/^[a-zA-Z0-9\s.,;:?!ÑñÁáÉéÍíÓóÚúÜü]+$/.test(data["descripcion"])) {
      error["descripcion"] = "Caracteres inválidos en la descripción.";
      alert("Descripción inválida: caracteres no permitidos.");
    }

    // Cupo: Enteros positivos, max 3 dígitos
    if (!this.validatorService.required(data["cupo"])) {
      error["cupo"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["cupo"])) {
      error["cupo"] = "Solo números enteros.";
      alert("Cupo inválido: solo números enteros.");
    } else if (parseInt(data["cupo"]) <= 0) {
      error["cupo"] = "Debe ser mayor a 0.";
      alert("Cupo inválido: debe ser mayor a 0.");
    } else if (data["cupo"].toString().length > 3) {
      error["cupo"] = "Máximo 3 dígitos.";
      alert("Cupo inválido: máximo 3 dígitos.");
    }
  return error;
}

// Convierte hora en formato 12h (AM/PM) a 24h para comparación
private convertTo24Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return `${hours.padStart(2, '0')}:${minutes}`;
}


  // --- Servicios HTTP (CRUD) ---
  // Registrar evento
  public registrarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.post<any>(`${environment.url_api}/api/registro/evento/`, data, { headers });
  }


  // Obtener lista de eventos
  public obtenerEventos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/api/lista-eventos/`, { headers });
  }

  // Obtener un evento por ID para edición
  public obtenerEventoPorId(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/api/registro/evento/?id=${idEvento}`, { headers });
  }

  // Actualizar evento
  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/api/registro/evento/`, data, { headers });
  }

  // Eliminar evento
  public eliminarEvento(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/api/registro/evento/?id=${idEvento}`, { headers });
  }
}
