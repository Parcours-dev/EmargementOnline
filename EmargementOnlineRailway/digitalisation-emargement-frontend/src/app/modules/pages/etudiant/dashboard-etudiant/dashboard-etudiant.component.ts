import { Component, OnInit, inject } from "@angular/core";
import { HeaderComponent } from "../../../core/header/header.component";
import { FooterComponent } from "../../../core/footer/footer.component";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { formatDate } from "@angular/common";
import { UbtWalletWidgetComponent}  from '../../../core/ubt-wallet-widget/ubt-wallet-widget.component';


@Component({
  selector: "app-dashboard-etudiant",
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule, UbtWalletWidgetComponent],
  templateUrl: "./dashboard-etudiant.component.html",
  styleUrls: ['./dashboard-etudiant.component.css']
})
export class DashBoardEtudiantComponent implements OnInit {

  // 📅 Liste des cours du jour
  coursDuJour: any[] = [];

  // 📌 Cours actuellement en train d’avoir lieu
  coursEnCours: any | null = null;

  // 📲 Cours sélectionné dans la dropdown (pour voir statut)
  coursSelectionne: any = null;

  // ✅ ou ❌ selon présence validée
  statutEmargement: boolean | null = null;

  // 🧾 Historique des présences regroupées par jour
  historique: { jour: string, cours: any[] }[] = [];

  // ➕ Nouveau champ pour filtrer l'historique
  jourFiltre: string = '';

  qrCodeActif: { token: string, scan_url: string, expires_in: number } | null = null;


  private readonly BASE_URL = "http://localhost:3000/api";
  private http = inject(HttpClient);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
      if (tokenStorage) {
        const token = JSON.parse(tokenStorage);
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);

        this.chargerCours(headers);
        this.chargerHistorique(headers);


      } else {
        console.warn("⚠️ Aucun token dans le localStorage");
      }
    }
  }


  /**
   * 🔄 Charge les cours du jour depuis l'API
   */
  chargerCours(headers: HttpHeaders) {
    const aujourdHui = formatDate(new Date(), 'yyyy-MM-dd', 'fr');
    const url = `${this.BASE_URL}/etudiants/mes-presences?date=${aujourdHui}`;

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        this.coursDuJour = data;
        this.detecterCoursEnCours();
      },
      error: () => {
        console.error("❌ Erreur chargement cours du jour");
      }
    });
  }

  /**
   * 📅 Récupère l’historique complet de présence
   */
  chargerHistorique(headers: HttpHeaders) {
    const url = `${this.BASE_URL}/etudiants/mes-presences`;

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (cours) => {
        const regroupement: { [jour: string]: any[] } = {};

        cours.forEach((c) => {
          const jour = new Date(c.date_heure_debut).toLocaleDateString("fr-FR", { weekday: "long" });
          if (!regroupement[jour]) regroupement[jour] = [];
          regroupement[jour].push(c);
        });

        this.historique = Object.entries(regroupement).map(([jour, cours]) => ({
          jour,
          cours,
        }));
      },
      error: () => {
        console.error("❌ Erreur chargement historique");
      }
    });
  }

  /**
   * ✅ Vérifie si l’étudiant a émargé au cours sélectionné
   */
  verifierStatutPresence() {
    if (!this.coursSelectionne) {
      this.statutEmargement = null;
      return;
    }

    this.statutEmargement = !!this.coursSelectionne.present;
  }

  /**
   * 🕐 Compare l’heure actuelle avec les cours pour savoir s’il y en a un en cours
   */
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

    if (cours.present === true) {
      return 'border-success'; // ✅ Présent
    }
    if (cours.present === false && now > fin) {
      return 'border-danger'; // ❌ Absent si le cours est terminé
    }
    if (cours.present === null && now < debut) {
      return 'border-info'; // ⏳ À venir
    }

    if (now >= debut && now <= fin && cours.present !== true) {
      return 'border-warning'; // 🟠 En cours mais pas encore émargé
    }

    return 'border-secondary'; // fallback
  }

  estCoursAvenir(cours: any): boolean {
    const now = new Date().getTime();
    const debut = new Date(cours.date_heure_debut).getTime();
    return now < debut && cours.present === null;
  }



}


