import { Routes } from '@angular/router';

export const routes = [
  {
    path: 'accueil',
    loadComponent: () => import('./modules/pages/accueil/accueil.component').then(m => m.AccueilComponent)
  },
  {
    path: 'dashboard-etudiant',
    loadComponent: () => import('./modules/pages/etudiant/dashboard-etudiant/dashboard-etudiant.component').then(m => m.DashBoardEtudiantComponent)
  },
  {
    path: 'dashboard-professeur',
    loadComponent: () => import('./modules/pages/professeur/dashboard-professeur/dashboard-professeur.component').then(m => m.DashBoardProfesseurComponent)
  },
  {
    path: 'dashboard-cfa',
    loadComponent: () => import('./modules/pages/cfa/dashboard-cfa/dashboard-cfa.component').then(m => m.DashBoardCfaComponent)
  },
  {
    path: 'rapport-absence',
    loadComponent: () => import('./modules/pages/cfa/rapport-absence/rapport-absence.component').then(m => m.RapportAbsenceComponent)
  },
  {
    path: 'generation-qr',
    loadComponent: () => import('./modules/pages/professeur/dashboard-professeur/generation-qr.component').then(m => m.GenerationQrComponent)
  },
  {
    path: '**',
    redirectTo: 'accueil',
    pathMatch: 'full'
  }
] as Routes; // 👈 force le typage ici
