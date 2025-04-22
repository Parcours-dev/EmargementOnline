import { environment } from '../../../environments/environment';

//export const API_BACKEND = environment.apiUrl;

export const API_BACKEND = 'https://emargementonline-production.up.railway.app/api'; // Remplacez par l'URL de votre API

export class ApiConstantes {
  readonly URL_EXPRESS = API_BACKEND;
  readonly LOGIN = 'login';
}
