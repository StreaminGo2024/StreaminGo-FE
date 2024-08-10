import { AuthService } from './../../services/auth.service';
import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, ElementRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { UsersComponent } from '../users/users.component';
import { ActivatedRoute } from '@angular/router';
import videojs from 'video.js';
import { InviteModalComponent } from '../../components/invite-modal/invite-modal.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { GifService } from '../../services/gif.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
interface Message {
  sender: string;
  text: string;
  isGif: boolean;
  gifUrl?: string | any;
  reactions?: string[];
  timestamp?: Date;
}
@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [CommonModule, FormsModule, UsersComponent, NgClass, InviteModalComponent, ModalComponent, PickerModule],
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss'],
  encapsulation: ViewEncapsulation.None
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
  isPaused = true;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: Message[] = [];
  newMessage: string = '';
  /**Reacciones */
  showReactionPicker: boolean = false;
  customReactions = [
    { name: 'Sparkling Heart', icon: '💖' },
    { name: 'Thumbs Up', icon: '👍' },
    { name: 'Tada', icon: '🎉' },
    { name: 'Clapping', icon: '👏' },
    { name: 'Laughing', icon: '😂' },
    { name: 'Surprised', icon: '😲' },
    { name: 'Crying', icon: '😢' },
    { name: 'Thinking Face', icon: '🤔' },
    { name: 'Thumbs Down', icon: '👎' }
  ];
  // Floating emojis logic
  floatingEmojis: { icon: string, left: string, top: string }[] = [];
  animationDuration = 2000; // Duration of the animation in milliseconds
  /** Emoji variables */
  isEmojiPickerVisible: boolean = false;
  /** GIF variables */
  public gifQuery: string = '';
  public gifs: any[] = [];
  public showGifPicker: boolean = false;

  private socket$: WebSocketSubject<any> | undefined;

  constructor(private route: ActivatedRoute, private authService: AuthService, private gifService: GifService) {}

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

    this.messages = [
      { sender: 'User 1', text: 'Hello there!', isGif: false },
      { sender: 'me', text: 'Hi! How are you?', isGif: false }
    ];

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
      () => {
        console.warn('WebSocket Completed!');
        this.reconnect();
      }
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
    try {
      if (status === 'PLAY') {
        this.player.play().catch((error: any) => {
          console.error('Error trying to play the video:', error);
          this.reconnect(); 
        });
      } else if (status === 'PAUSE') {
        this.player.pause();
      }
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
    }
  }

  private handleChatMessage(message: string) {
    console.log('Mensaje de chat recibido:', message);
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.emisor !== this.usuarioLogeado.name) {

      // Check if the message is a GIF 
      const isGif = parsedMessage.texto.includes('giphy');

      // Push the message to the messages array
      this.messages.push({
        sender: parsedMessage.emisor,
        text: isGif ? '' : parsedMessage.texto,
        isGif: isGif,
        gifUrl: isGif ? parsedMessage.texto : '',
        timestamp: new Date()
      });

      this.scrollToBottom();

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
  }

  sendMessage(): void {
    const messageText = this.newMessage.trim();

    this.mensajesNuevos = 0;
    this.nuevoMensajeRecibido = false;

    if (messageText) {
      // Check if the message is a GIF 
      const isGif = messageText.includes('giphy');
      console.log('Is GIF:', isGif);

      // Push the message to the messages array
      this.messages.push({
        sender: 'me',
        text: isGif ? '' : messageText, 
        isGif: isGif,                 
        gifUrl: isGif ? messageText : '',
        timestamp: new Date() 
      });

      const mensaje = {
        emisor: this.usuarioLogeado.name,
        texto: messageText
      };

      this.sendSocketMessage('chat', JSON.stringify(mensaje))
      console.log(this.messages)
      
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  addReaction(reaction: string): void {
    console.log(reaction);
    this.newMessage += reaction;
    this.triggerFloatingEmoji(reaction);
  }

  triggerFloatingEmoji(icon: string) {
    // Calculate random position for the emoji
    const left = `${Math.random() * 80 + 10}%`; // Random horizontal position (10% to 90%)
    const top = `${Math.random() * 70 + 10}%`;  // Random vertical position (10% to 80%)

    const floatingEmoji = {
      icon: icon,
      left: left,
      top: top
    };

    this.floatingEmojis.push(floatingEmoji);

    // Remove the emoji after animation
    setTimeout(() => {
      this.floatingEmojis.shift();
    }, this.animationDuration);
  }
  /** EMOJIS LOGIC */

  onEmojiSelected(event: any): void {

    const emoji = event.emoji.native;
    this.newMessage += emoji; 
    this.toggleEmojiPicker(); 
  }

  toggleEmojiPicker(): void {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  /** EMOJIS LOGIC */

  /** START GIF LOGIC */
  toggleGifPicker() {
    this.showGifPicker = !this.showGifPicker; 
  }

  searchGifs(query: string) {
    this.gifService.searchGifs(query).then((response: any) => {
      this.gifs = response.data;
    }).catch((error: any) => {
      console.error('Error fetching GIFs:', error);
    });
  }

  selectGif(gif: any) {

    this.newMessage = gif.images.fixed_height.url;
    this.showGifPicker = false;
  }
  /** END GIF LOGIC */

  scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }, 100);
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

    // Add event listeners to the player
    this.player.on('play', () => {
      this.isPaused = false;
      console.log(this.isPaused)

    });

    this.player.on('pause', () => {
      this.isPaused = true;
      console.log(this.isPaused)

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
