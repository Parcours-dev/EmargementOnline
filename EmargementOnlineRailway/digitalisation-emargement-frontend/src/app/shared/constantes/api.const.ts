import { environment } from '../../../environments/environment';

export const API_BACKEND = environment.apiUrl;

export class ApiConstantes {
  readonly URL_EXPRESS = API_BACKEND;
  readonly LOGIN = 'login';
}
