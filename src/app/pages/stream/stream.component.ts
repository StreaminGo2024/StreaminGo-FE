import { Component, OnInit, OnDestroy } from '@angular/core';
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
  mostrarChat = false;
  usuarioLogeado: any;
  nuevoMensaje: string = '';
  mensajes: any = [];

  videoSrc: string = '';
  videoId: string = '';
  player: any | undefined;

  private socket$: WebSocketSubject<any> | undefined;

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.connect();
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

  private connect() {
    this.socket$ = new WebSocketSubject('ws://localhost:8080/ws');

    this.socket$.subscribe(
      message => this.handleMessage(message),
      err => console.error('WebSocket Error:', err),
      () => console.warn('WebSocket Completed!')
    );
  }

  private handleMessage(message: any) {
    // Verifica si el mensaje es una cadena JSON o ya es un objeto
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
      this.handleChatMessage(parsedMessage.content);
    } else if (parsedMessage.type === 'reaction') {
      this.handleReaction(parsedMessage.content);
    } else {
      console.error('Tipo de mensaje no reconocido:', parsedMessage);
    }
  }

  private handleStatusChange(status: string) {
    console.log('Video status changed: ' + status);
    if (status === 'PLAY') {
      // Código para reproducir el video
    } else if (status === 'PAUSE') {
      // Código para pausar el video
    }
  }

  private handleChatMessage(message: string) {
    console.log('Mensaje de chat recibido:', message);
    // Lógica para mostrar el mensaje de chat en la interfaz
  }

  private handleReaction(reaction: string) {
    console.log('Reacción recibida:', reaction);
    // Lógica para manejar las reacciones en la interfaz
  }

  public sendControlMessage(command: string) {
    if (this.socket$) {
      const message = { type: 'videoControl', status: command };
      this.socket$.next(JSON.stringify(message));
    }
  }

  public sendChatMessage(chatMessage: string) {
    if (this.socket$) {
      const message = { type: 'chat', content: chatMessage };
      this.socket$.next(JSON.stringify(message));
    }
  }

  public sendReaction(reaction: string) {
    if (this.socket$) {
      const message = { type: 'reaction', content: reaction };
      this.socket$.next(JSON.stringify(message));
    }
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

    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
