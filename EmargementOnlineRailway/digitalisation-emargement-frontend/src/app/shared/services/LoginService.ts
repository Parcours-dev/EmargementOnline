import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RetourLogin } from '../modeles/RetourLogin';
import { ParametresLogin } from '../modeles/ParametresLogin';
import { HttpClient } from '@angular/common/http';
import { ApiConstantes } from '../constantes/api.const';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly API_CONSTANTES = new ApiConstantes();
  private readonly httpClient = inject(HttpClient);

  connecterUtilisateur(parametresLogin: ParametresLogin): Observable<RetourLogin> {
    const url = `${this.API_CONSTANTES.URL_EXPRESS}/${this.API_CONSTANTES.LOGIN}`;
    return this.httpClient.post<RetourLogin>(url, parametresLogin);
  }
}
