import { Routes } from '@angular/router';
import { ACCUEIL, DASHBOARD_CFA, DASHBOARD_ETUDIANT, DASHBOARD_PROFESSEUR, PAGE_ERREUR, RAPPORT_ABSENCE } from './shared/constantes/liens.const';

export const routes: Routes = [
    {
        path: ACCUEIL,
        loadComponent: () =>
            import("./modules/pages/accueil/accueil.component").then(
                (mod) => mod.AccueilComponent,
            ),
    },
    {
        path: DASHBOARD_ETUDIANT,
        loadComponent: () =>
            import("./modules/pages/etudiant/dashboard-etudiant/dashboard-etudiant.component").then(
                (mod) => mod.DashBoardEtudiantComponent,
            ),
    },
    {
        path: DASHBOARD_PROFESSEUR,
        loadComponent: () =>
            import("./modules/pages/professeur/dashboard-professeur/dashboard-professeur.component").then(
                (mod) => mod.DashBoardProfesseurComponent,
            ),
    },
    {
        path: DASHBOARD_CFA,
        loadComponent: () =>
            import("./modules/pages/cfa/dashboard-cfa/dashboard-cfa.component").then(
                (mod) => mod.DashBoardCfaComponent,
            ),
    },
    {
        path: RAPPORT_ABSENCE,
        loadComponent: () =>
            import("./modules/pages/cfa/rapport-absence/rapport-absence.component").then(
                (mod) => mod.RapportAbsenceComponent,
            ),
    },
  {
    path: 'generation-qr',
    loadComponent: () => import('./modules/pages/professeur/dashboard-professeur/generation-qr.component').then(m => m.GenerationQrComponent)
  },
    {
        path: PAGE_ERREUR,
        loadComponent: () =>
            import("./modules/pages/page-erreur/page-erreur.component").then(
                (mod) => mod.PageErreurComponent,
            ),
    },
    {
        path: "**",
        redirectTo: ACCUEIL,
        pathMatch: "full"
    },

];
