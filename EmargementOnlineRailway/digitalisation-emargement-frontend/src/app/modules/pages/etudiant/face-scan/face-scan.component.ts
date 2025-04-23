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
  styleUrls: ['./face-scan.component.css'],
})
export class FaceScanComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @Output() faceVerified = new EventEmitter<number[]>();

  message = 'Chargement...';
  modelsLoaded = false;
  isScanning = false;

  // Pour le style dynamique du message
  messageType: 'info' | 'success' | 'error' = 'info';

  ngOnInit() {
    this.loadModels();
  }

  async loadModels() {
    this.setMessage('📦 Chargement des modèles...', 'info');
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models/ssd_mobilenetv1'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models/face_landmark_68'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models/face_recognition'),
      ]);
      this.modelsLoaded = true;
      this.setMessage('📸 Modèles chargés. Initialisation caméra...', 'success');
      console.log("✅ Tous les modèles ont bien été chargés !");
    } catch (e) {
      this.setMessage('❌ Erreur lors du chargement des modèles', 'error');
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
      this.setMessage('🎥 Caméra active. Appuyez pour capturer.', 'info');
      console.log('✅ Caméra initialisée avec succès');
    } catch (err) {
      this.setMessage('❌ Impossible d’accéder à la caméra', 'error');
      console.error('❌ Erreur accès caméra :', err);
    }
  }

  async captureAndEmit() {
    if (!this.modelsLoaded || this.isScanning) return;

    this.isScanning = true;
    this.setMessage('🔍 Analyse du visage en cours...', 'info');

    const video = this.videoRef.nativeElement;

    try {
      const result = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result || !result.descriptor) {
        this.setMessage('😕 Visage non détecté. Vérifiez l’éclairage ou ajustez votre position.', 'error');
        console.warn('😕 Aucun visage détecté.');
        return;
      }

      const descriptorArray = Array.from(result.descriptor);
      this.setMessage('✅ Visage capturé. Envoi au parent...', 'success');
      console.log('📤 Descripteur envoyé au parent :', descriptorArray);

      this.faceVerified.emit(descriptorArray);

      setTimeout(() => {
        this.setMessage('🎥 Caméra active. Vous pouvez rescanner.', 'info');
      }, 3000);
    } catch (e) {
      this.setMessage('❌ Erreur lors de la capture du visage.', 'error');
      console.error(e);
    } finally {
      this.isScanning = false;
    }
  }

  private setMessage(msg: string, type: 'info' | 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
  }
}
