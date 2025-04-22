import { Component, inject } from "@angular/core";
import { HeaderComponent } from "../../core/header/header.component";
import { FooterComponent } from "../../core/footer/footer.component";
import { Router } from "@angular/router";
import { ACCUEIL } from "../../../shared/constantes/liens.const";

@Component({
  selector: "app-page-erreur",
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: "./page-erreur.component.html",
})
export class PageErreurComponent {

    private readonly router = inject(Router);

      redirigeUtilisateurVersAccueilEtDeconnecte() {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('_TOKEN_UTILISATEUR');
          localStorage.removeItem('_INFOS_UTILISATEUR');
          localStorage.clear();
        }
        this.router.navigateByUrl(`${ACCUEIL}`);
      }

}
