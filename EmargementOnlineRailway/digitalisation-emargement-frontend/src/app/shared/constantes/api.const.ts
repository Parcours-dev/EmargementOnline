// src/app/shared/constantes/api.const.ts

// ✅ Version constante (recommandée)
export const API_BACKEND = 'http://localhost:3000/api'; // ou ton URL ngrok en prod

// ✅ Classe uniquement si tu veux instancier (pas nécessaire ici)
export class ApiConstantes {
  readonly URL_EXPRESS = API_BACKEND;
  readonly LOGIN = 'login';
}
