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
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models/ssd_mobilenetv1'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models/face_landmark_68'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models/face_recognition'),
      ]);
      this.modelsLoaded = true; // ✅ Active le bouton
      this.message = '📸 Modèles chargés. Initialisation caméra...';
      console.log("✅ Tous les modèles ont bien été chargés !");
    } catch (e) {
      this.message = '❌ Erreur lors du chargement des modèles';
      console.error('❌ Erreur face-api model:', e);
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
