import { CommonModule } from '@angular/common';
import { Component, inject, INJECTOR, input, Input, OnInit } from '@angular/core';
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
export class MovieCardComponent implements OnInit {
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

  public movieService = inject(MovieService);
  public authService = inject (AuthService);

  constructor(private likeService: LikeService) {
    
  }

  ngOnInit(): void {
    console.log(this.authService.getUser()?.id);
    console.log('Movie ID:', this.movieId);
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
