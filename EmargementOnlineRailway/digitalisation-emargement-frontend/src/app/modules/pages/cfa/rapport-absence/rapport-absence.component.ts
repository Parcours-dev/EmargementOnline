import { Component, OnInit, inject } from "@angular/core";
import { HeaderComponent } from "../../../core/header/header.component";
import { FooterComponent } from "../../../core/footer/footer.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-rapport-absence",
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: "./rapport-absence.component.html",
})
export class RapportAbsenceComponent implements OnInit {
  private readonly API = "https://emargementonline-production.up.railway.app/api";
  private http = inject(HttpClient);

  headers: HttpHeaders | null = null;
  resultats: any[] = [];

  // Champs de filtres
  filtres = {
    promo: '',
    id_groupe_TD: '',
    id_groupe_Anglais: '',
    email: '',
    date: '',
    from: '',
    to: '',
    type: '', // "presents" ou "absents"
    includeDetails: false
  };

  ngOnInit(): void {
    const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
    if (tokenStorage) {
      const token = JSON.parse(tokenStorage);
      this.headers = new HttpHeaders().set("Authorization", `Bearer ${token.token}`);
    }
  }

  appliquerFiltres() {
    if (!this.headers) return;
    const params = new URLSearchParams();

    Object.entries(this.filtres).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) params.append(key, "true");
      } else if (value) {
        params.append(key, value);
      }
    });

    this.http.get<any[]>(`${this.API}/cfa/export?${params.toString()}`, { headers: this.headers })
      .subscribe({
        next: (data) => this.resultats = data,
        error: () => console.error("❌ Erreur chargement des présences")
      });
  }

  exporter() {
    if (!this.headers) return;
    if (this.resultats.length === 0) {
      alert("Aucune donnée à exporter. Appliquez des filtres d'abord.");
      return;
    }

    const params = new URLSearchParams();
    Object.entries(this.filtres).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) params.append(key, "true");
      } else if (value) {
        params.append(key, value);
      }
    });
    params.append("export", "true");

    this.http.get(`${this.API}/cfa/export-file?${params.toString()}`, {
      headers: this.headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const filename = `export_${new Date().toISOString().slice(0,10)}.xlsx`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        console.error("❌ Erreur export fichier");
        alert("Erreur lors de l'export. Vérifiez votre connexion ou token.");
      }
    });
  }
}
