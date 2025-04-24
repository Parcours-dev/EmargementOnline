import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/header/header.component';
import { FooterComponent } from '../../../core/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-cfa',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './dashboard-cfa.component.html',
  styleUrls: ['./dashboard-cfa.component.css']
})
export class DashBoardCfaComponent implements OnInit {
  private readonly API = 'http://localhost:3000/api';
  private http = inject(HttpClient);

  activePanel: null | "promotions" | "groupes" | "etudiants" | "justificatifs" = null;

  // 🔹 Promotions
  promotions: any[] = [];
  promoEnEdition = false;
  formPromo = {
    id_promotion: null,
    nom: '',
    debut_annee_scolaire: '',
    fin_annee_scolaire: ''
  };

  // 🔸 Groupes
  groupes: any[] = [];
  groupeEnEdition = false;
  formGroupe = {
    id_groupe: null,
    nom: '',
    id_promotion: ''
  };

  // 🔹 Étudiants
  etudiants: any[] = [];
  etudiantEnEdition = false;
  formEtudiant = {
    NEtudiant: '',
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    id_groupe_TD: '',
    id_groupe_Anglais: ''
  };

  // 🔸 Justificatifs
  justificatifs: any[] = [];
  filtreJustif: { [key: string]: string } = {
    id_promotion: '',
    id_etudiant: '',
    statut: '',
    date_min: '',
    date_max: ''
  };
  headers: HttpHeaders | null = null;


  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
      if (tokenStorage) {
        const token = JSON.parse(tokenStorage);
        this.headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);
        this.chargerPromotions(this.headers);
        this.chargerGroupes(this.headers);
        this.chargerEtudiants(this.headers);
        this.chargerJustificatifs(this.headers); // chargement initial complet
        this.activePanel = 'justificatifs';
      }
    }
  }

  togglePanel(panel: 'promotions' | 'groupes' | 'etudiants' | 'justificatifs') {
    this.activePanel = this.activePanel === panel ? null : panel;
  }

  // 📚 PROMOTIONS
  chargerPromotions(headers: HttpHeaders) {
    this.http.get<any[]>(`${this.API}/cfa/promotions`, { headers }).subscribe({
      next: (data) => this.promotions = data,
      error: () => console.error('❌ Erreur chargement promotions')
    });
  }

  remplirForm(promo: any) {
    this.formPromo = { ...promo };
    this.promoEnEdition = true;
  }

  soumettreForm() {
    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!);
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token.token}`)
      .set('Content-Type', 'application/json');

    const method = this.formPromo.id_promotion ? 'PUT' : 'POST';
    const url = this.formPromo.id_promotion
      ? `${this.API}/cfa/promotions/${this.formPromo.id_promotion}`
      : `${this.API}/cfa/promotions`;

    this.http.request(method, url, {
      body: this.formPromo,
      headers
    }).subscribe({
      next: () => {
        this.chargerPromotions(headers);
        this.resetFormPromo();
      },
      error: () => console.error('❌ Erreur enregistrement promotion')
    });
  }

  supprimerPromotion(id: number) {
    if (!confirm('Supprimer cette promotion ?')) return;

    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);

    this.http.delete(`${this.API}/cfa/promotions/${id}`, { headers }).subscribe({
      next: () => this.chargerPromotions(headers),
      error: () => console.error('❌ Erreur suppression promotion')
    });
  }

  resetFormPromo() {
    this.formPromo = { id_promotion: null, nom: '', debut_annee_scolaire: '', fin_annee_scolaire: '' };
    this.promoEnEdition = false;
  }

  // 📘 GROUPES
  chargerGroupes(headers: HttpHeaders) {
    this.http.get<any[]>(`${this.API}/cfa/groupes`, { headers }).subscribe({
      next: (data) => this.groupes = data,
      error: () => console.error('❌ Erreur chargement groupes')
    });
  }

  remplirFormGroupe(groupe: any) {
    this.formGroupe = { ...groupe };
    this.groupeEnEdition = true;
  }

  soumettreFormGroupe() {
    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!);
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token.token}`)
      .set('Content-Type', 'application/json');

    const method = this.formGroupe.id_groupe ? 'PUT' : 'POST';
    const url = this.formGroupe.id_groupe
      ? `${this.API}/cfa/groupes/${this.formGroupe.id_groupe}`
      : `${this.API}/cfa/groupes`;

    this.http.request(method, url, {
      body: {
        nom: this.formGroupe.nom,
        id_promotion: this.formGroupe.id_promotion
      },
      headers
    }).subscribe({
      next: () => {
        this.chargerGroupes(headers);
        this.resetFormGroupe();
      },
      error: () => console.error('❌ Erreur enregistrement groupe')
    });
  }

  supprimerGroupe(id: number) {
    const confirmation = confirm('Supprimer ce groupe ?');
    if (!confirmation) return;

    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);

    this.http.delete(`${this.API}/cfa/groupes/${id}`, { headers }).subscribe({
      next: () => this.chargerGroupes(headers),
      error: () => console.error('❌ Erreur suppression groupe')
    });
  }

  resetFormGroupe() {
    this.formGroupe = { id_groupe: null, nom: '', id_promotion: '' };
    this.groupeEnEdition = false;
  }

  getNomPromotion(id: number): string {
    const promo = this.promotions.find((p: any) => p.id_promotion === id);
    return promo ? promo.nom : '?';
  }

  chargerEtudiants(headers: HttpHeaders) {
    this.http.get<any[]>(`${this.API}/cfa/etudiants`, { headers }).subscribe({
      next: (data) => this.etudiants = data,
      error: () => console.error('❌ Erreur chargement étudiants')
    });
  }

  remplirFormEtudiant(etu: any) {
    this.formEtudiant = {
      ...etu,
      mot_de_passe: ''
    };
    this.etudiantEnEdition = true;
  }

  soumettreFormEtudiant() {
    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!);
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token.token}`)
      .set('Content-Type', 'application/json');

    const isEdition = !!this.formEtudiant.NEtudiant && this.etudiantEnEdition;
    const url = isEdition
      ? `${this.API}/cfa/etudiants/${this.formEtudiant.NEtudiant}`
      : `${this.API}/cfa/etudiants`;

    const method = isEdition ? 'PUT' : 'POST';
    const body = {
      ...this.formEtudiant
    };

    this.http.request(method, url, { body, headers }).subscribe({
      next: () => {
        this.chargerEtudiants(headers);
        this.resetFormEtudiant();
      },
      error: () => console.error('❌ Erreur enregistrement étudiant')
    });
  }

  supprimerEtudiant(id: number) {
    const confirmation = confirm("Supprimer cet étudiant ?");
    if (!confirmation) return;

    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);

    this.http.delete(`${this.API}/cfa/etudiants/${id}`, { headers }).subscribe({
      next: () => this.chargerEtudiants(headers),
      error: () => console.error('❌ Erreur suppression étudiant')
    });
  }

  resetFormEtudiant() {
    this.formEtudiant = {
      NEtudiant: '',
      nom: '',
      prenom: '',
      email: '',
      mot_de_passe: '',
      id_groupe_TD: '',
      id_groupe_Anglais: ''
    };
    this.etudiantEnEdition = false;
  }

  chargerJustificatifs(headers: HttpHeaders) {
    const params: any = {};

    for (const [key, value] of Object.entries(this.filtreJustif)) {
      if (value) params[key] = value;
    }

    this.http.get<any[]>(`${this.API}/cfa/justificatifs`, { headers, params }).subscribe({
      next: (data) => this.justificatifs = data,
      error: () => console.error('❌ Erreur chargement justificatifs')
    });
  }

  traiterJustificatif(justif: any, statut: 'accepte' | 'refuse') {
    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!);
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token.token}`)
      .set('Content-Type', 'application/json');

    this.http.patch(`${this.API}/cfa/justificatifs/${justif.id}`, {
      statut,
      commentaire_admin: justif.commentaire_admin
    }, { headers }).subscribe({
      next: () => this.chargerJustificatifs(headers),
      error: () => console.error(`❌ Erreur traitement justificatif : ${justif.id}`)
    });
  }


  chargerJustificatifsDepuisFiltres() {
    const token = JSON.parse(localStorage.getItem('_TOKEN_UTILISATEUR')!);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);

    const params: any = {};

    for (const key in this.filtreJustif) {
      if (this.filtreJustif[key]) {
        params[key] = this.filtreJustif[key];
      }
    }

    this.http.get<any[]>(`${this.API}/cfa/justificatifs`, { headers, params }).subscribe({
      next: (data) => this.justificatifs = data,
      error: () => console.error('❌ Erreur chargement justificatifs')
    });
  }
}
