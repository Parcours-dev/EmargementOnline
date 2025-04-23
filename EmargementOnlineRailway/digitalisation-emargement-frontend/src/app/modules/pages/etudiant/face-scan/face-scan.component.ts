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
  styleUrls: ['./face-scan.component.css']
})
export class FaceScanComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @Output() faceVerified = new EventEmitter<number[]>();

  message = 'Chargement...';
  hasReference = false;
  modelsLoaded = false;
  isScanning = false;

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
      this.modelsLoaded = true;
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
      this.message = '🎥 Caméra active. Vous pouvez rescanner.';
      console.log('✅ Caméra initialisée avec succès');
    } catch (err) {
      this.message = '❌ Impossible d’accéder à la caméra';
      console.error('❌ Erreur accès caméra :', err);
    }
  }

  async captureAndEmit() {
    if (!this.modelsLoaded || this.isScanning) return;

    this.isScanning = true;
    this.message = '🔍 Analyse du visage en cours...';

    const video = this.videoRef.nativeElement;
    try {
      const result = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result || !result.descriptor) {
        this.message = '😕 Visage non détecté. Vérifiez l’éclairage ou ajustez votre position.';
        console.warn('😕 Aucun visage détecté.');
        return;
      }

      const descriptorArray = Array.from(result.descriptor);
      this.message = '✅ Visage capturé. Vérification en cours...';

      this.faceVerified.emit(descriptorArray);

      setTimeout(() => {
        this.message = '🎥 Caméra active. Vous pouvez rescanner.';
      }, 4000);

    } catch (e) {
      this.message = '❌ Erreur pendant la capture.';
      console.error(e);
    } finally {
      this.isScanning = false;
    }
  }
}
