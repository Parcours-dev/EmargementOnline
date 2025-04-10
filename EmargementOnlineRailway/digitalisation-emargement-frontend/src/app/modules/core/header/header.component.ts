import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ACCUEIL } from "../../../shared/constantes/liens.const";

@Component({
  selector: "app-header",
  standalone: true,
  templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit{

  private readonly router = inject(Router);

  doitAfficherHeaderEtudiant: boolean = false;
  doitAfficherHeaderProfesseur: boolean = false;
  doitAfficherHeaderCfa: boolean = false;
  estUtilisateurConnecte: boolean = false;
  nomUtilisateur: string = '';

  private readonly ROLE_PROFESSEUR = 'professeur';
  private readonly ROLE_ETUDIANT = 'etudiant';
  private readonly ROLE_CFA = 'cfa';

  ngOnInit(): void {
    this.affichageHeader();
  }

  deconnecterUtilisateur() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('_TOKEN_UTILISATEUR');
      localStorage.removeItem('_INFOS_UTILISATEUR');
      localStorage.clear();
    }
    this.router.navigateByUrl(`${ACCUEIL}`);
  }


  private affichageHeader() {
    if (typeof window === 'undefined') return;

    const infosBrutes = localStorage.getItem('_INFOS_UTILISATEUR');
    const tokenBrut = localStorage.getItem('_TOKEN_UTILISATEUR');

    if (!infosBrutes || !tokenBrut) {
      this.estUtilisateurConnecte = false;
      return;
    }

    const infosUtilisateur = JSON.parse(infosBrutes);
    const tokenUtilisateur = JSON.parse(tokenBrut);

    this.nomUtilisateur = infosUtilisateur.nom + " " + infosUtilisateur.prenom;

    if (infosUtilisateur.role === this.ROLE_ETUDIANT) {
      this.doitAfficherHeaderEtudiant = true;
    }

    if (infosUtilisateur.role === this.ROLE_CFA) {
      this.doitAfficherHeaderCfa = true;
    }

    if (infosUtilisateur.role === this.ROLE_PROFESSEUR) {
      this.doitAfficherHeaderProfesseur = true;
    }

    if (tokenUtilisateur?.token !== null) {
      this.estUtilisateurConnecte = true;
    }
  }



}
