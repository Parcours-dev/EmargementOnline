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
  styleUrls: ['./scan-qr.component.css'],
})
export class ScanQrComponent implements OnInit {
  tokenQr = '';
  message = '📷 Scan facial en cours...';
  messageType: 'info' | 'success' | 'error' = 'info';
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
    this.messageType = 'info';

    const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
    if (!tokenStorage) {
      this.message = '❌ Non connecté';
      this.messageType = 'error';
      return;
    }

    const token = JSON.parse(tokenStorage).token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    try {
      if (!this.hasReference) {
        this.message = '📸 Enregistrement photo de référence...';
        this.messageType = 'info';

        await this.http
          .post(`${this.BASE_URL}/etudiants/face-reference`, { descriptor }, { headers })
          .toPromise();

        this.message = '✅ Référence enregistrée. Validation de présence...';
        this.messageType = 'success';
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
          this.message = '❌ Reconnaissance faciale échouée. Veuillez réessayer.';
          this.messageType = 'error';
          return;
        }

        this.message = '✅ Visage reconnu. Validation de présence...';
        this.messageType = 'success';
      }

      const res: any = await this.http
        .post(`${this.BASE_URL}/qrcode/${this.tokenQr}/scan`, { empreinte_device: "fallback-device", descriptor }, { headers })
        .toPromise();

      this.message = res.message || '✅ Présence validée avec succès !';
      this.messageType = 'success';

      setTimeout(() => {
        this.router.navigate(['/dashboard-etudiant']);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.error?.message || '❌ Erreur pendant le processus';
      this.message = errorMessage;
      this.messageType = 'error';
    }
  }

  goBack() {
    this.router.navigate(['/dashboard-etudiant']);
  }
}
