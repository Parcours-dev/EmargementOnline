import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiConstantes } from '../constantes/api.const';

@Injectable({
  providedIn: 'root'
})
export class ProfesseurService {
  private readonly API_CONSTANTES = new ApiConstantes();
  private readonly httpClient = inject(HttpClient);
}
