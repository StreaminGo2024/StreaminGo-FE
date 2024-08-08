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
  mostrarChat = false;
  usuarioLogeado: any;
  nuevoMensaje: string = '';
  mensajes: any = [];

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

  constructor(private route: ActivatedRoute, private authService: AuthService, private gifService: GifService) { }

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

    this.messages = [
      { sender: 'User 1', text: 'Hello there!', isGif: false },
      { sender: 'me', text: 'Hi! How are you?', isGif: false }
    ];

  }



  sendMessage(): void {
    const messageText = this.newMessage.trim();

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






  // enviarMensaje() {
  //   if (this.nuevoMensaje === '') return;

  //   console.log(this.nuevoMensaje);
  //   let mensaje = {
  //     emisor: this.usuarioLogeado.id,
  //     texto: this.nuevoMensaje
  //   };
  //   this.mensajes.push(mensaje);

  //   this.nuevoMensaje = '';

  //   setTimeout(() => {
  //     this.scrollToTheLastElementByClassName();
  //   }, 10);
  // }

  // scrollToTheLastElementByClassName() {
  //   let elements = document.getElementsByClassName('msj');
  //   let ultimo: any = elements[(elements.length - 1)];
  //   let toppos = ultimo.offsetTop;

  //   const contenedorDeMensajes = document.getElementById('contenedorDeMensajes');
  //   if (contenedorDeMensajes) {
  //     contenedorDeMensajes.scrollTop = toppos;
  //   }
  // }

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
