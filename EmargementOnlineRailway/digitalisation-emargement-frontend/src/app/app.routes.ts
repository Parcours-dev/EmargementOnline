import { Routes } from '@angular/router';
import { Type } from '@angular/core';

export const routes = [
  {
    path: '',
    redirectTo: 'accueil',
    pathMatch: 'full'
  },
  {
    path: 'accueil',
    loadComponent: () =>
      import('./modules/pages/accueil/accueil.component').then(
        m => m.AccueilComponent as Type<unknown>
      )
  },
  {
    path: 'dashboard-etudiant',
    loadComponent: () =>
      import('./modules/pages/etudiant/dashboard-etudiant/dashboard-etudiant.component').then(
        m => m.DashBoardEtudiantComponent as Type<unknown>
      )
  },
  {
    path: 'dashboard-professeur',
    loadComponent: () =>
      import('./modules/pages/professeur/dashboard-professeur/dashboard-professeur.component').then(
        m => m.DashBoardProfesseurComponent as Type<unknown>
      )
  },
  {
    path: 'dashboard-cfa',
    loadComponent: () =>
      import('./modules/pages/cfa/dashboard-cfa/dashboard-cfa.component').then(
        m => m.DashBoardCfaComponent as Type<unknown>
      )
  },
  {
    path: 'rapport-absence',
    loadComponent: () =>
      import('./modules/pages/cfa/rapport-absence/rapport-absence.component').then(
        m => m.RapportAbsenceComponent as Type<unknown>
      )
  },
  {
    path: 'generation-qr',
    loadComponent: () =>
      import('./modules/pages/professeur/dashboard-professeur/generation-qr.component').then(
        m => m.GenerationQrComponent as Type<unknown>
      )
  },
  {
    path: '**',
    redirectTo: 'accueil',
    pathMatch: 'full'
  }
] as unknown as Routes;
