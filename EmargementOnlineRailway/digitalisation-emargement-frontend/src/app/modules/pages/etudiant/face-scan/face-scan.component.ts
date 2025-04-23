import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  Input
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

  @Input() statusMessage: string = '';
  @Input() messageType: 'info' | 'success' | 'error' = 'info';

  modelsLoaded = false;
  isScanning = false;

  ngOnInit() {
    this.loadModels();
  }

  async loadModels() {
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models/ssd_mobilenetv1'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models/face_landmark_68'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models/face_recognition'),
      ]);
      this.modelsLoaded = true;
      console.log("✅ Tous les modèles ont bien été chargés !");
    } catch (e) {
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
      console.log('✅ Caméra initialisée avec succès');
    } catch (err) {
      console.error('❌ Erreur accès caméra :', err);
    }
  }

  async captureAndEmit() {
    if (!this.modelsLoaded || this.isScanning) return;

    this.isScanning = true;

    const video = this.videoRef.nativeElement;
    try {
      const result = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result || !result.descriptor) {
        console.warn('😕 Aucun visage détecté.');
        this.faceVerified.emit([]); // On peut éventuellement signaler une erreur
        return;
      }

      const descriptorArray = Array.from(result.descriptor);
      this.faceVerified.emit(descriptorArray);

    } catch (e) {
      console.error('❌ Erreur pendant la capture.', e);
      this.faceVerified.emit([]); // Emit vide pour indiquer l’échec
    } finally {
      this.isScanning = false;
    }
  }
}
