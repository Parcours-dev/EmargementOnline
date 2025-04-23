import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FaceScanComponent } from '../face-scan/face-scan.component';

@Component({
  selector: 'app-scan-qr',
  standalone: true,
  imports: [CommonModule, FaceScanComponent],
  templateUrl: './scan-qr.component.html',
})
export class ScanQrComponent implements OnInit {
  tokenQr = '';
  message = '📷 Scan facial en cours...';
  hasReference: boolean | null = null;

  private readonly BASE_URL = 'https://emargementonline-production.up.railway.app/api';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.tokenQr = this.route.snapshot.paramMap.get('token') || '';
  }

  async ngOnInit() {
    const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
    if (!tokenStorage) return;

    const token = JSON.parse(tokenStorage).token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    try {
      const existsResponse = await this.http
        .get<{ exists: boolean }>(`${this.BASE_URL}/etudiants/photo-reference`, { headers })
        .toPromise();

      this.hasReference = existsResponse?.exists ?? false;
    } catch (err) {
      console.warn('Erreur récupération photo de référence :', err);
      this.hasReference = null;
    }
  }

  async onFaceVerified(descriptor: number[]) {
    this.message = '🧠 Visage capturé, vérification en cours...';

    const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
    if (!tokenStorage) {
      this.message = '❌ Non connecté';
      return;
    }

    const token = JSON.parse(tokenStorage).token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    try {
      if (!this.hasReference) {
        this.message = '📸 Enregistrement photo de référence...';

        await this.http
          .post(`${this.BASE_URL}/etudiants/face-reference`, { descriptor }, { headers })
          .toPromise();

        this.message = '✅ Référence enregistrée. Validation de présence...';
      } else {
        const matchResponse = await this.http
          .post<{ match: boolean }>(
            `${this.BASE_URL}/etudiants/face-verify`,
            { descriptor },
            { headers }
          )
          .toPromise();

        const match = matchResponse?.match ?? false;

        if (!match) {
          this.message = '❌ Reconnaissance faciale échouée';
          return;
        }

        this.message = '✅ Visage reconnu. Validation de présence...';
      }

      await this.http
        .post(`${this.BASE_URL}/qrcode/${this.tokenQr}/scan`, { empreinte_device: "fallback-device", descriptor }, { headers })
        .toPromise();

      this.message = '✅ Présence validée avec succès !';
    } catch (err) {
      console.error(err);
      this.message = '❌ Erreur pendant le processus';
    }
  }

  goBack() {
    this.router.navigate(['/dashboard-etudiant']);
  }
}
