import { Routes } from '@angular/router';
import {
  ACCUEIL,
  DASHBOARD_CFA,
  DASHBOARD_ETUDIANT,
  DASHBOARD_PROFESSEUR,
  PAGE_ERREUR,
  RAPPORT_ABSENCE
} from './shared/constantes/liens.const';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: ACCUEIL,
    loadComponent: () =>
      import('./modules/pages/accueil/accueil.component').then(
        (mod) => mod.AccueilComponent,
      ),
  },
  {
    path: DASHBOARD_ETUDIANT,
    loadComponent: () =>
      import('./modules/pages/etudiant/dashboard-etudiant/dashboard-etudiant.component').then(
        (mod) => mod.DashBoardEtudiantComponent,
      ),
    canActivate: [AuthGuard]
  },
  {
    path: DASHBOARD_PROFESSEUR,
    loadComponent: () =>
      import('./modules/pages/professeur/dashboard-professeur/dashboard-professeur.component').then(
        (mod) => mod.DashBoardProfesseurComponent,
      ),
    canActivate: [AuthGuard]
  },
  {
    path: DASHBOARD_CFA,
    loadComponent: () =>
      import('./modules/pages/cfa/dashboard-cfa/dashboard-cfa.component').then(
        (mod) => mod.DashBoardCfaComponent,
      ),
    canActivate: [AuthGuard]
  },
  {
    path: RAPPORT_ABSENCE,
    loadComponent: () =>
      import('./modules/pages/cfa/rapport-absence/rapport-absence.component').then(
        (mod) => mod.RapportAbsenceComponent,
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'generation-qr',
    loadComponent: () =>
      import('./modules/pages/professeur/dashboard-professeur/generation-qr.component').then(
        m => m.GenerationQrComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'scan/:token',
    loadComponent: () =>
      import('./modules/pages/etudiant/scan-qr/scan-qr.component').then(
        m => m.ScanQrComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: PAGE_ERREUR,
    loadComponent: () =>
      import('./modules/pages/page-erreur/page-erreur.component').then(
        (mod) => mod.PageErreurComponent,
      ),
  },
  {
    path: '**',
    redirectTo: ACCUEIL,
    pathMatch: 'full'
  }
];
