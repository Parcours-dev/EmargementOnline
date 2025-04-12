import {
  Component,
  OnInit,
  inject
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { formatDate } from "@angular/common";
import { HeaderComponent } from "../../../core/header/header.component";
import { FooterComponent } from "../../../core/footer/footer.component";

@Component({
  selector: "app-dashboard-professeur",
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: "./dashboard-professeur.component.html",
  styleUrls: ["./dashboard-professeur.component.css"]
})
export class DashBoardProfesseurComponent implements OnInit {
  coursDuJour: any[] = [];
  coursEnCours: any | null = null;
  etudiantsCours: any[] = [];

  private readonly BASE_URL = "https://emargementonline-production.up.railway.app/api";
  private http = inject(HttpClient);

  ngOnInit(): void {
    const tokenStorage = localStorage.getItem("_TOKEN_UTILISATEUR");
    if (!tokenStorage) {
      console.error("❌ Aucun token trouvé dans le localStorage");
      return;
    }

    const parsed = JSON.parse(tokenStorage);
    const decoded = this.decodeToken(parsed.token);

    if (!decoded?.id) {
      console.error("❌ Impossible de déterminer l’ID du professeur");
      return;
    }

    const idProf = decoded.id;
    const headers = new HttpHeaders().set("Authorization", `Bearer ${parsed.token}`);

    this.chargerEmploiDuTemps(idProf, headers);
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error("Erreur décodage token :", e);
      return null;
    }
  }

  chargerEmploiDuTemps(idProf: number, headers: HttpHeaders) {
    this.http
      .get<any[]>(`${this.BASE_URL}/enseignants/${idProf}/emplois`, { headers })
      .subscribe({
        next: (data) => {
          const today = new Date().toISOString().split("T")[0];
          this.coursDuJour = data.filter((cours) =>
            new Date(cours.date_heure_debut).toISOString().startsWith(today)
          );
          this.detecterCoursEnCours(headers);
        },
        error: () => {
          console.error("❌ Erreur lors du chargement de l'emploi du temps du jour");
        }
      });
  }

  detecterCoursEnCours(headers: HttpHeaders) {
    const now = Date.now();
    this.coursEnCours =
      this.coursDuJour.find((cours) => {
        const debut = new Date(cours.date_heure_debut).getTime();
        const fin = new Date(cours.date_heure_fin).getTime();
        return now >= debut && now <= fin;
      }) || null;

    if (this.coursEnCours) {
      this.chargerEtudiantsCoursEnCours(headers);
    }
  }

  chargerEtudiantsCoursEnCours(headers: HttpHeaders) {
    if (!this.coursEnCours) return;

    const { id_cours, id_groupe, date_heure_debut } = this.coursEnCours;

    const params = new URLSearchParams({
      id_cours,
      id_groupe,
      date_heure_debut,
    });

    this.http.get<any[]>(`${this.BASE_URL}/presences/controle?${params.toString()}`, { headers })
      .subscribe({
        next: (data) => {
          this.etudiantsCours = data;
        },
        error: () => {
          console.error("❌ Erreur lors du chargement des étudiants du cours");
        }
      });
  }

  validerPresenceManuelle(email: string) {
    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!).token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = {
      email,
      id_cours: this.coursEnCours.id_cours,
      id_groupe: this.coursEnCours.id_groupe,
      date_heure_debut: this.coursEnCours.date_heure_debut
    };

    this.http.patch(`${this.BASE_URL}/presences/valider`, body, { headers }).subscribe({
      next: (res: any) => {
        alert(res.message || 'Présence validée');
        this.chargerEtudiantsCoursEnCours(headers);
      },
      error: () => alert('❌ Erreur lors de la validation')
    });
  }

  lancerGenerationQr(cours: any) {
    const idCours = cours.id_cours;
    const idGroupe = cours.id_groupe;
    const idProf = cours.id_professeur;
    const date = formatDate(cours.date_heure_debut, 'yyyy-MM-dd HH:mm:ss', 'fr-FR');
    const identifiant = `${idCours}-${idGroupe}-${idProf}-${date}`;
    const encodedId = encodeURIComponent(identifiant);

    window.open(
      `https://emargementonline-production.up.railway.app/generation-qr?creneau_id=${encodedId}`,
      "_blank",
      "width=420,height=500"
    );
  }
}
