import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-scan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './face-scan.component.html',
})
export class FaceScanComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @Output() faceVerified = new EventEmitter<number[]>();

  message = 'Chargement...';

  ngOnInit() {
    this.loadModels();
  }

  async loadModels() {
    this.message = '📦 Chargement des modèles...';
    const MODEL_URL = '/assets/models'; // ✅ chemin correct

    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),      // ✅ détection du visage
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),   // ✅ points du visage
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),  // ✅ signature faciale
      ]);
      this.message = '📸 Modèles chargés. Initialisation caméra...';
    } catch (e) {
      this.message = '❌ Erreur chargement modèles';
      console.error(e);
    }

    console.log("📦 Tous les modèles chargés avec succès !");
  }

  ngAfterViewInit(): void {
    this.initCamera();
  }

  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoRef.nativeElement.srcObject = stream;
      this.message = '🎥 Caméra active. Appuyez pour capturer.';
    } catch (err) {
      this.message = '❌ Impossible d’accéder à la caméra';
      console.error(err);
    }
  }

  async captureAndEmit() {
    const video = this.videoRef.nativeElement;
    console.log('📸 Bouton cliqué, capture en cours...');

    const result = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options()) // ✅ bon détecteur
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result || !result.descriptor) {
      this.message = '😕 Visage non détecté. Réessayez.';
      return;
    }

    const descriptorArray = Array.from(result.descriptor);
    this.message = '✅ Visage capturé. Envoi au parent...';

    this.faceVerified.emit(descriptorArray);
  }
}
