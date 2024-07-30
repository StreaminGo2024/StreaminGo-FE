import { AuthService } from './../../services/auth.service';
import { Component, NgModule, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from '../../app.component';
import { CommonModule, NgClass } from '@angular/common';
import { UsersComponent } from '../users/users.component';
import { timeout } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import videojs from 'video.js';
import { InviteModalComponent } from '../../components/invite-modal/invite-modal.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [CommonModule, FormsModule, UsersComponent, NgClass,InviteModalComponent, ModalComponent],
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss'],
})
export class StreamComponent implements OnInit, OnDestroy {
  mostrarChat = false;
  usuarioLogeado: any;
  nuevoMensaje: string = '';
  mensajes: any = [];
  
  videoSrc: string = '';
  videoId: string = '';
  player: any | undefined;

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    // Inicializar autenticación de usuario
    this.authService.getUserLogged().subscribe(usuario => {
      this.usuarioLogeado = usuario;
    });

    // Inicializar video
    this.route.paramMap.subscribe(params => {
      const videoId = params.get('video');
      if (videoId) {
        this.videoId = videoId;
        this.videoSrc = `http://localhost:8080/stream/video?title=${videoId}`;
        this.initializePlayer();
      }
    });
  }

  enviarMensaje() {
    if (this.nuevoMensaje === '') return;

    console.log(this.nuevoMensaje);
    let mensaje = {
      emisor: this.usuarioLogeado.id,
      texto: this.nuevoMensaje
    };
    this.mensajes.push(mensaje);

    this.nuevoMensaje = '';

    setTimeout(() => {
      this.scrollToTheLastElementByClassName();
    }, 10);
  }

  scrollToTheLastElementByClassName() {
    let elements = document.getElementsByClassName('msj');
    let ultimo: any = elements[(elements.length - 1)];
    let toppos = ultimo.offsetTop;

    const contenedorDeMensajes = document.getElementById('contenedorDeMensajes');
    if (contenedorDeMensajes) {
      contenedorDeMensajes.scrollTop = toppos;
    }
  }

  initializePlayer(): void {
    this.player = videojs('video', {
      sources: [{
        src: this.videoSrc,
        type: 'video/mp4'
      }],
      tracks: [] // Inicializar con un array vacío
    }, () => {
      console.log('Player is ready');
      // Cargar subtítulos después de que el reproductor esté listo
      this.loadSubtitles('en'); // Cargar subtítulos en inglés por defecto
      this.loadSubtitles('es'); // Cargar subtítulos en español
    });
  }

  loadSubtitles(lang: string): void {
    const body = { title: this.videoId, lang: lang };
    fetch('http://localhost:8080/stream/subtitles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(response => response.text())
    .then(subtitleText => {
      const blob = new Blob([subtitleText], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);

      // Eliminar subtítulos anteriores de este idioma
      const tracks = this.player.remoteTextTracks();
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === 'subtitles' && track.language === lang) {
          this.player.removeRemoteTextTrack(track);
        }
      }

      // Agregar nuevos subtítulos
      this.player.addRemoteTextTrack({
        kind: 'subtitles',
        src: url,
        srclang: lang,
        label: lang === 'en' ? 'English' : 'Español',
        default: lang === 'en'
      }, true);
    });
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}
