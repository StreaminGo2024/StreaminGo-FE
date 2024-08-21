import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, INJECTOR, input, Input, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LikeService } from '../../services/like.service';
import { ProfileService } from '../../services/profile.service';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent implements OnInit, AfterViewInit {
  @Input() title = "";
  @Input() year = 0;
  @Input() category = "";
  @Input() url = "";
  @Input() image = "";
  @Input() video = "";
  @Input() description = ""; 
  @Input() casting = ""; 
  @Input() time = 0; 
  @Input() movieId = 0;
  @Input() userId = 0;
  
  likeCount: number = 0;
  isHovered: boolean = false;
  isLiked: boolean = false;

  videoSrc: string = '';
  //videoPlayer: any = '';

  public movieService = inject(MovieService);
  public authService = inject (AuthService);
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(private likeService: LikeService) {
    
  }
  ngAfterViewInit(): void {
    // if (this.videoPlayer) {
    //   const videoElement = this.videoPlayer.nativeElement;
    //   videoElement.muted = true;  // Ensure the video is muted programmatically
    //   videoElement.autoplay = true; // Ensure the video autoplay is enabled
    //   videoElement.play(); // Start playing the video programmatically
    // }

    const video = this.videoPlayer.nativeElement;
    video.muted = true; // Asegura que el video esté muteado al cargar

    // Escucha eventos para mantener el video muteado
    video.addEventListener('volumechange', () => {
      if (!video.muted) {
        video.muted = true; // Re-mutea el video si se cambia el volumen
      }
    });
  }

  ngOnInit(): void {
    console.log(this.authService.getUser()?.id);
    console.log('Movie ID:', this.movieId);
    this.videoSrc = `http://localhost:8080/stream/video?title=${this.video}`;
    this.verificarSiLikeado();
    this.obtenerNumeroDeLikes();
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  toggleLike(): void {
    if (this.isLiked) {
      this.quitarLike();
    } else {
      this.darLike();
    }
  }

  darLike(): void {
      this.likeService.darLike(this.authService.getUser()?.id, this.movieId).subscribe(() => {
      this.isLiked = true;
      this.obtenerNumeroDeLikes();
    });
  }

  quitarLike(): void {
    this.likeService.quitarLike(this.authService.getUser()?.id, this.movieId).subscribe(() => {
      this.isLiked = false;
      this.obtenerNumeroDeLikes()
    });
  }

  verificarSiLikeado(): void {
    this.likeService.verificarLike(this.authService.getUser()?.id, this.movieId).subscribe((response: boolean) => {
      this.isLiked = response;
    });
  }

  obtenerNumeroDeLikes(): void {
    this.likeService.obtenerNumeroDeLikes(this.movieId).subscribe((count: number) => {
      this.likeCount = count;
    });
  }

}
