import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { UsersComponent } from '../users/users.component';
import { ActivatedRoute } from '@angular/router';
import videojs from 'video.js';
import { InviteModalComponent } from '../../components/invite-modal/invite-modal.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { WebSocketSubject } from 'rxjs/webSocket';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [CommonModule, FormsModule, UsersComponent, NgClass, InviteModalComponent, ModalComponent],
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss'],
})
export class StreamComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;

  mostrarChat = false;
  usuarioLogeado: any;
  nuevoMensaje: string = '';
  mensajes: any = [];

  nuevoMensajeRecibido = false;
  mensajesNuevos = 0

  videoSrc: string = '';
  videoId: string = '';
  player: any | undefined;

  private socket$: WebSocketSubject<any> | undefined;

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.connect();
    this.authService.getUserLogged().subscribe(usuario => {
      this.usuarioLogeado = usuario;
    });

    this.route.paramMap.subscribe(params => {
      const videoId = params.get('video');
      if (videoId) {
        this.videoId = videoId;
        this.videoSrc = `http://localhost:8080/stream/video?title=${videoId}`;
        this.initializePlayer();
      }
    });
  }

  ngAfterViewInit(): void {
    // Subscribe to play and pause events
    this.videoElement.nativeElement.addEventListener('play', this.onPlay.bind(this));
    this.videoElement.nativeElement.addEventListener('pause', this.onPause.bind(this));
  }

  private onPlay(event: Event): void {
    this.sendSocketMessage('videoControl',"PLAY")
  }

  private onPause(event: Event): void {
    this.sendSocketMessage('videoControl',"PAUSE")
  }

  private connect() {
    this.socket$ = new WebSocketSubject('ws://localhost:8080/ws');
  
    this.socket$.subscribe(
      message => this.handleMessage(message),
      err => {
        console.error('WebSocket Error:', err);
        this.reconnect(); // Intentar reconectar en caso de error
      },
      () => console.warn('WebSocket Completed!')
    );
  }

  private reconnect() {
    // Destruir la instancia actual y crear una nueva
    this.socket$?.complete();
    setTimeout(() => this.connect(), 5000); // Intentar reconectar después de 5 segundos
  }

  private handleMessage(message: any) {
    let parsedMessage: any;

    if (typeof message === 'string') {
      try {
        parsedMessage = JSON.parse(message);
      } catch (error) {
        console.error('Error al parsear el mensaje:', error);
        return;
      }
    } else {
      parsedMessage = message;
    }

    console.log('Mensaje recibido:', parsedMessage);

    if (parsedMessage.type === 'videoControl') {
      this.handleStatusChange(parsedMessage.status);
    } else if (parsedMessage.type === 'chat') {
      this.handleChatMessage(parsedMessage.status);
    } else if (parsedMessage.type === 'reaction') {
      this.handleReaction(parsedMessage.status);
    } else {
      console.error('Tipo de mensaje no reconocido:', parsedMessage);
    }
  }

  private handleStatusChange(status: string) {
    console.log('Video status changed: ' + status);
    if (status === 'PLAY') {
      this.player.play();
    } else if (status === 'PAUSE') {
      this.player.pause();
    }
  }

  private handleChatMessage(message: string) {
    console.log('Mensaje de chat recibido:', message);
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.emisor !== this.usuarioLogeado.name) {
      this.mensajes.push({
        emisor: parsedMessage.emisor,
        texto: parsedMessage.texto
      });
      this.mensajesNuevos++;
  this.nuevoMensajeRecibido = true;
    }
  }

  private handleReaction(reaction: string) {
    console.log('Reacción recibida:', reaction);
  }

  public sendSocketMessage(typeMessage: string, command: string) {
    if (this.socket$) {
      const message = { type: typeMessage, status: command };
      this.socket$.next(message);
    }
  }

  reiniciarContador() {
    this.mensajesNuevos = 0;
    this.nuevoMensajeRecibido = false;
  }

  enviarMensaje() {
    if (this.nuevoMensaje === '') return;

    console.log(this.nuevoMensaje);
    const mensaje = {
      emisor: this.usuarioLogeado.name,
      texto: this.nuevoMensaje
    };

    this.sendSocketMessage('chat', JSON.stringify(mensaje))

    this.mensajes.push({
      emisor: this.usuarioLogeado.name,
      texto: this.nuevoMensaje
    });

    this.nuevoMensaje = '';

    this.mensajesNuevos = 0;
    this.nuevoMensajeRecibido = false;

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
      tracks: []
    }, () => {
      console.log('Player is ready');
      this.loadSubtitles('en');
      this.loadSubtitles('es');
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

      const tracks = this.player.remoteTextTracks();
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === 'subtitles' && track.language === lang) {
          this.player.removeRemoteTextTrack(track);
        }
      }

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
  
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
