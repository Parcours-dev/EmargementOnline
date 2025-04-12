import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scan-qr',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './scan-qr.component.html',
  styleUrls: ['./scan-qr.component.css']
})
export class ScanQrComponent implements OnInit {
  private readonly BASE_URL = 'https://emargementonline-production.up.railway.app/api';
  message = '⏳ Traitement en cours...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.message = '❌ QR Code invalide.';
      return;
    }

    const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');

    // Si l'utilisateur vient juste d'être redirigé après login,
    // il faut consommer le _SCAN_TOKEN une seule fois
    if (tokenStorage) {
      localStorage.removeItem('_SCAN_TOKEN'); // 👈 Nettoyage propre
      this.enregistrerPresence(token);
    } else {
      localStorage.setItem('_SCAN_TOKEN', token);
      this.router.navigate(['/login']);
    }
  }


  enregistrerPresence(token: string): void {
    const userStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
    if (!userStorage) {
      this.message = '❌ Utilisateur non authentifié.';
      return;
    }

    const tokenParsed = JSON.parse(userStorage).token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${tokenParsed}`);
    const empreinteDevice = window.navigator.userAgent + '_' + window.navigator.platform;

    this.http.post<any>(`${this.BASE_URL}/qrcode/${token}/scan`, { empreinte_device: empreinteDevice }, { headers })
      .subscribe({
        next: (res) => {
          this.message = res.message || '✅ Présence enregistrée !';
        },
        error: (err) => {
          console.error(err);
          this.message = err?.error?.message || '❌ Erreur pendant l’enregistrement de présence.';
        }
      });
  }

  isSuccess(): boolean {
    return this.message.includes('✅');
  }

  isError(): boolean {
    return this.message.includes('❌');
  }

  isLoading(): boolean {
    return this.message.includes('⏳');
  }
}
