import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";

import { HeaderComponent } from "../../core/header/header.component";
import { FooterComponent } from "../../core/footer/footer.component";
import { LoginService } from "../../../shared/services/LoginService";

import { ParametresLoginFactory } from "../../../shared/modeles/ParametresLogin";
import { RetourLogin, RetourLoginFactory } from "../../../shared/modeles/RetourLogin";
import {
  DASHBOARD_CFA,
  DASHBOARD_ETUDIANT,
  DASHBOARD_PROFESSEUR
} from "../../../shared/constantes/liens.const";

@Component({
  selector: "app-accueil",
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, ReactiveFormsModule],
  templateUrl: "./accueil.component.html",
})
export class AccueilComponent {
  private readonly CHAMP_EMAIL = 'email';
  private readonly CHAMP_MDP = 'password';
  private readonly ROLE_PROFESSEUR = 'professeur';
  private readonly ROLE_ETUDIANT = 'etudiant';
  private readonly ROLE_CFA = 'cfa';

  retourLogin: RetourLogin = RetourLoginFactory();

  private readonly serviceLogin = inject(LoginService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  formulaireConnexionUtilisateur: FormGroup = this.formBuilder.group({
    email: [''],
    password: ['']
  });

  get emailControl(): FormControl {
    return this.formulaireConnexionUtilisateur.get(this.CHAMP_EMAIL) as FormControl;
  }

  get motDePasseControl(): FormControl {
    return this.formulaireConnexionUtilisateur.get(this.CHAMP_MDP) as FormControl;
  }

  connecterUtilisateur(): void {
    const parametresLogin = ParametresLoginFactory({
      email: this.emailControl.value,
      mot_de_passe: this.motDePasseControl.value,
    });

    this.serviceLogin.connecterUtilisateur(parametresLogin).subscribe({
      next: retourLogin => {
        localStorage.setItem('_TOKEN_UTILISATEUR', JSON.stringify({ token: retourLogin.token }));
        localStorage.setItem('_INFOS_UTILISATEUR', JSON.stringify(retourLogin));
        this.gererCasSucces(retourLogin);
      },
      error: err => {
        console.error('❌ Erreur de connexion :', err);
      },
    });
  }

  private gererCasSucces(retourLogin: RetourLogin): void {
    // ✅ Redirection spéciale si l'étudiant venait d'un scan QR
    const scanToken = localStorage.getItem('_SCAN_TOKEN');
    if (scanToken && retourLogin.role === this.ROLE_ETUDIANT) {
      localStorage.removeItem('_SCAN_TOKEN');
      this.router.navigateByUrl(`/scan/${scanToken}`);
      return;
    }

    // 🔁 Redirection selon le rôle
    switch (retourLogin.role) {
      case this.ROLE_ETUDIANT:
        this.router.navigateByUrl(DASHBOARD_ETUDIANT);
        break;
      case this.ROLE_CFA:
        this.router.navigateByUrl(DASHBOARD_CFA);
        break;
      case this.ROLE_PROFESSEUR:
        this.router.navigateByUrl(DASHBOARD_PROFESSEUR);
        break;
      default:
        console.warn("⚠️ Rôle inconnu :", retourLogin.role);
        break;
    }
  }
}
