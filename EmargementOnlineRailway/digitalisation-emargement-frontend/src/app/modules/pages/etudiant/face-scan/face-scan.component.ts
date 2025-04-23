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
    const MODEL_URL = '/models';

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        // ❌ pas de TinyYolov2 ici !
      ]);
      this.message = '📸 Modèles chargés. Initialisation caméra...';
    } catch (e) {
      this.message = '❌ Erreur chargement modèles';
      console.error(e);
    }
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
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()) // ✅ c'est bon
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
