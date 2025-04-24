import { Component, OnInit, inject } from "@angular/core";
import { HeaderComponent } from "../../../core/header/header.component";
import { FooterComponent } from "../../../core/footer/footer.component";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { formatDate } from "@angular/common";
import { UbtWalletWidgetComponent } from '../../../core/ubt-wallet-widget/ubt-wallet-widget.component';

@Component({
  selector: "app-dashboard-etudiant",
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: "./dashboard-etudiant.component.html",
  styleUrls: ['./dashboard-etudiant.component.css']
})
export class DashBoardEtudiantComponent implements OnInit {

  coursDuJour: any[] = [];
  coursEnCours: any | null = null;
  coursSelectionne: any = null;
  statutEmargement: boolean | null = null;
  historique: { jour: string, cours: any[] }[] = [];
  jourFiltre: string = '';
  dateDebut: string = '';
  dateFin: string = '';
  justificatifs: any[] = [];
  headers: HttpHeaders | null = null;

  qrCodeActif: { token: string, scan_url: string, expires_in: number } | null = null;

  private readonly BASE_URL = " https://emargementonline-production.up.railway.app/api";
  private http = inject(HttpClient);

  ngOnInit(): void {
    const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
    if (tokenStorage) {
      const token = JSON.parse(tokenStorage);
      this.headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);
      this.chargerCours();
      this.chargerHistorique();
      this.chargerJustificatifs();
    } else {
      console.warn("⚠️ Aucun token dans le localStorage");
    }
  }

  chargerCours() {
    if (!this.headers) return;
    const aujourdHui = formatDate(new Date(), 'yyyy-MM-dd', 'fr');
    const url = `${this.BASE_URL}/etudiants/mes-presences?date=${aujourdHui}`;

    this.http.get<any[]>(url, { headers: this.headers }).subscribe({
      next: (data) => {
        this.coursDuJour = data;
        this.detecterCoursEnCours();
      },
      error: () => console.error("❌ Erreur chargement cours du jour")
    });
  }

  chargerHistorique() {
    if (!this.headers) return;
    const url = `${this.BASE_URL}/etudiants/mes-presences`;

    this.http.get<any[]>(url, { headers: this.headers }).subscribe({
      next: (cours) => {
        const regroupement: { [jour: string]: any[] } = {};

        cours.forEach((c: any) => {
          const jour = new Date(c.date_heure_debut).toLocaleDateString("fr-FR", { weekday: "long" });
          if (!regroupement[jour]) regroupement[jour] = [];

          c.commentaire = '';
          c.fichier = null;
          c.depotOk = false;
          c.depotErreur = false;
          c.toggleJustif = false;

          regroupement[jour].push(c);
        });

        this.historique = Object.entries(regroupement).map(([jour, cours]) => ({ jour, cours }));
      },
      error: () => console.error("❌ Erreur chargement historique")
    });
  }

  chargerJustificatifs() {
    if (!this.headers) return;
    const url = `${this.BASE_URL}/etudiants/justificatifs`;

    this.http.get<any[]>(url, { headers: this.headers }).subscribe({
      next: (data) => this.justificatifs = data,
      error: () => console.error("❌ Erreur chargement justificatifs")
    });
  }

  appliquerFiltreDate() {
    if (!this.dateDebut && !this.dateFin) return;

    this.historique.forEach(bloc => {
      bloc.cours = bloc.cours.filter(cours => {
        const date = new Date(cours.date_heure_debut);
        const dateDebutVal = this.dateDebut ? new Date(this.dateDebut) : null;
        const dateFinVal = this.dateFin ? new Date(this.dateFin) : null;
        return (!dateDebutVal || date >= dateDebutVal) && (!dateFinVal || date <= dateFinVal);
      });
    });
  }

  resetFiltreDate() {
    this.dateDebut = '';
    this.dateFin = '';
    this.chargerHistorique();
  }

  verifierStatutPresence() {
    if (!this.coursSelectionne) {
      this.statutEmargement = null;
      return;
    }
    this.statutEmargement = !!this.coursSelectionne.present;
  }

  detecterCoursEnCours() {
    const now = new Date().getTime();
    this.coursEnCours = this.coursDuJour.find((cours) => {
      const debut = new Date(cours.date_heure_debut).getTime();
      const fin = new Date(cours.date_heure_fin).getTime();
      return now >= debut && now <= fin;
    }) || null;
  }

  getColorClasse(cours: any): string {
    const now = new Date().getTime();
    const debut = new Date(cours.date_heure_debut).getTime();
    const fin = new Date(cours.date_heure_fin).getTime();

    if (cours.present === true) return 'border-success';
    if (cours.present === false && now > fin) return 'border-danger';
    if (cours.present === null && now < debut) return 'border-info';
    if (now >= debut && now <= fin && cours.present !== true) return 'border-warning';
    return 'border-secondary';
  }

  estCoursAvenir(cours: any): boolean {
    const now = new Date().getTime();
    const debut = new Date(cours.date_heure_debut).getTime();
    return now < debut && cours.present === null;
  }

  onFileSelected(event: any, cours: any) {
    const file = event.target.files[0];
    cours.fichier = file;
    cours.depotOk = false;
    cours.depotErreur = false;
  }

  deposerJustificatif(cours: any) {
    if (!this.headers) return;

    if (!cours.fichier) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    if (!cours.id_groupe || isNaN(cours.id_groupe)) {
      alert("Le groupe du cours est manquant ou invalide.");
      return;
    }

    const formData = new FormData();
    formData.append("id_cours", cours.id_cours);
    formData.append("id_groupe", cours.id_groupe.toString());
    formData.append("date_heure_debut", cours.date_heure_debut);
    formData.append("fichier", cours.fichier);
    formData.append("commentaire", cours.commentaire || '');

    this.http.post(`${this.BASE_URL}/etudiants/justificatifs`, formData, { headers: this.headers }).subscribe({
      next: () => {
        cours.commentaire = '';
        cours.fichier = null;
        cours.depotOk = true;
        cours.depotErreur = false;

        setTimeout(() => {
          cours.depotOk = false;
        }, 5000);

        this.chargerHistorique();
      },
      error: (err) => {
        console.error("❌ Erreur lors de l’envoi du justificatif", err);
        cours.depotErreur = true;

        setTimeout(() => {
          cours.depotErreur = false;
        }, 5000);
      }
    });
  }

}
