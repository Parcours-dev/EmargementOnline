import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare const QRious: any;

@Component({
  selector: 'app-generation-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generation-qr.component.html',
})
export class GenerationQrComponent implements OnInit, OnDestroy {
  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef;

  qrMessage = 'Initialisation...';
  qr: any = null;
  intervalId: any = null;
  compteur: number = 90;

  private readonly BASE_URL = 'https://emargementonline-production.up.railway.app/api';
  private creneauId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.creneauId = params['creneau_id'];

    const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
    if (!tokenStorage) {
      console.warn("🚫 Token manquant — redirection vers l'accueil");
      this.router.navigate(['/accueil']); // ⬅️ redirection immédiate
      return;
    }

    const token = JSON.parse(tokenStorage).token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.demarrerGeneration(headers);
  }

  demarrerGeneration(headers: HttpHeaders) {
    this.refreshQr(headers);
    this.intervalId = setInterval(() => {
      this.refreshQr(headers);
    }, 5000);
  }

  refreshQr(headers: HttpHeaders) {
    this.http
      .post<any>(`${this.BASE_URL}/creneaux/${this.creneauId}/generate-qr`, {}, { headers })
      .subscribe({
        next: (data) => {
          const scanUrl = `https://emargementonline-production.up.railway.app/scan/${data.token}`;
          this.qrMessage = `QR actif → ${scanUrl}`;
          this.compteur = 90;
          this.dessinerQR(scanUrl);
        },
        error: (err) => {
          console.error(err);
          this.qrMessage = '❌ Erreur génération';
        },
      });
  }

  dessinerQR(scanUrl: string) {
    if (!this.qr) {
      this.qr = new QRious({
        element: this.qrCanvas.nativeElement,
        size: 200,
        value: scanUrl
      });
    } else {
      this.qr.value = scanUrl;
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
