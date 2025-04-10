// src/app/shared/constantes/api.const.ts
import { environment } from '../../../environments/environment.prod';

export const API_BACKEND = environment.apiUrl;

export class ApiConstantes {
  readonly URL_EXPRESS = API_BACKEND;
  readonly LOGIN = 'login';
}
