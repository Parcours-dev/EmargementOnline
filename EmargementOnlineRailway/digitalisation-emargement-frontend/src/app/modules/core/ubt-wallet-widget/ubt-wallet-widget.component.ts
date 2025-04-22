import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ethers } from 'ethers';
import { UB_TOKEN_ADDRESS, UB_TOKEN_ABI, UB_TOKEN_LOGO } from '../../../shared/constantes/ubtoken.const';
import {NgIf} from '@angular/common';

declare let window: any;


@Component({
  selector: 'app-ubt-wallet-widget',
  templateUrl: './ubt-wallet-widget.component.html',
  styleUrls: ['./ubt-wallet-widget.component.css'],
  imports: [
    NgIf
  ],
  standalone: true
})
export class UbtWalletWidgetComponent implements OnInit {
  adresseEth: string | null = null;
  shortAdresse: string = '';
  soldeUBT: string = '...';
  tokenLogo: string = UB_TOKEN_LOGO;
  isClient: boolean = false;

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.isClient = typeof window !== 'undefined';

    if (!this.isClient || !window.localStorage) {
      console.warn('localStorage inaccessible côté serveur');
      return;
    }

    await this.chargerAdresseEtSolde();
  }

  async chargerAdresseEtSolde() {
    try {
      const tokenStorage = localStorage.getItem('_TOKEN_UTILISATEUR');
      if (!tokenStorage) {
        console.warn('🔐 Aucun token trouvé dans le localStorage');
        return;
      }

      const token = JSON.parse(tokenStorage);
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token.token}`);

      // 🔍 Récupération de l'utilisateur connecté
      const user = await this.http
        .get<any>('http://localhost:3000/api/etudiants/me', { headers })
        .toPromise();

      this.adresseEth = user.adresse_eth;

      if (!this.adresseEth) {
        console.warn('⛔ Adresse ETH absente');
        return;
      }

      this.shortAdresse = `${this.adresseEth.slice(0, 6)}...${this.adresseEth.slice(-4)}`;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(UB_TOKEN_ADDRESS, UB_TOKEN_ABI, provider);
      const balance = await contract['balanceOf'](this.adresseEth);
      this.soldeUBT = ethers.formatUnits(balance, 18);
    } catch (err) {
      console.error('Erreur chargement adresse ou solde UBT :', err);
    }
  }

  copied: boolean = false;
  copierAdresse() {
    if (!this.adresseEth) return;

    navigator.clipboard.writeText(this.adresseEth).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
