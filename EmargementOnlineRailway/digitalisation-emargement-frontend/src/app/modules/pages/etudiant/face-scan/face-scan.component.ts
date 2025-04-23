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
  modelsLoaded = false;

  ngOnInit() {
    this.loadModels();
  }

  async loadModels() {
    this.message = '📦 Chargement des modèles...';
    const MODEL_URL = '/assets/models';

    console.log('⏳ Début du chargement des modèles depuis :', MODEL_URL);

    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL).then(() => console.log('✅ ssdMobilenetv1 chargé')),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL).then(() => console.log('✅ faceLandmark68Net chargé')),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL).then(() => console.log('✅ faceRecognitionNet chargé')),
      ]);
      this.modelsLoaded = true;
      this.message = '📸 Modèles chargés. Initialisation caméra...';
      console.log('✅ Tous les modèles sont chargés !');
    } catch (e) {
      this.message = '❌ Erreur chargement modèles';
      console.error('❌ Erreur lors du chargement des modèles :', e);
    }
  }

  ngAfterViewInit(): void {
    this.initCamera();
  }

  async initCamera() {
    console.log('🎥 Initialisation de la caméra...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoRef.nativeElement.srcObject = stream;
      this.message = '🎥 Caméra active. Appuyez pour capturer.';
      console.log('✅ Caméra initialisée avec succès');
    } catch (err) {
      this.message = '❌ Impossible d’accéder à la caméra';
      console.error('❌ Erreur accès caméra :', err);
    }
  }

  async captureAndEmit() {
    if (!this.modelsLoaded) {
      this.message = '⏳ Patientez, chargement des modèles...';
      console.warn('⛔️ Tentative de scan avant chargement des modèles.');
      return;
    }

    const video = this.videoRef.nativeElement;
    console.log('📸 Bouton cliqué, capture en cours...');

    const result = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result || !result.descriptor) {
      this.message = '😕 Visage non détecté. Réessayez.';
      console.warn('😕 Aucun visage détecté.');
      return;
    }

    const descriptorArray = Array.from(result.descriptor);
    this.message = '✅ Visage capturé. Envoi au parent...';
    console.log('📤 Descripteur envoyé au parent :', descriptorArray);

    this.faceVerified.emit(descriptorArray);
  }
}
