import { Component, AfterViewInit, QueryList, ViewChildren, ElementRef, inject, effect } from '@angular/core';
import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { DashboardService } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IMovieDashboard } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from '../../components/chart/chart.component';
import { provideEcharts } from 'ngx-echarts';
import { RouterModule } from '@angular/router';
import { SwiperOptions } from 'swiper/types';

// Registra los módulos de Swiper
Swiper.use([EffectCoverflow, Navigation, Pagination]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    MovieCardComponent,
    CommonModule,
    FormsModule,
    ChartComponent,
  ],
  providers: [provideEcharts()],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  public search: string = '';
  public movieList: IMovieDashboard[] = [];
  public filteredMovieList: IMovieDashboard[] = [];
  private service = inject(DashboardService);
  private snackBar = inject(MatSnackBar);

  videoSrc: string = '';
  videoId: string = '';
  player: any | undefined;

  @ViewChildren('playOnHover') playOnHoverElements!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChildren('swiperContainer') swiperContainer!: QueryList<ElementRef>;

  constructor() {
    this.service.getAllSignal();
    effect(() => {      
      this.movieList = this.service.movies$();
      this.filteredMovieList = this.service.movies$();
    });
  }

  ngAfterViewInit(): void {
    this.playOnHoverElements.forEach((element) => {
      const video = element.nativeElement;
      video.addEventListener('mouseover', () => {
        video.play();
      });
    
      video.addEventListener('mouseout', () => {
        video.pause();
        video.currentTime = 0; 
      });
    });

    // Inicializa Swiper
    this.swiperContainer.forEach(container => {
      new Swiper(container.nativeElement, {
        modules: [EffectCoverflow, Navigation, Pagination],
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
          rotate: 15,
          stretch: 0,
          depth: 300,
          modifier: 1,
          slideShadows: true,
        },
        loop: true,
        navigation: true,
        pagination: { clickable: true },
      } as SwiperOptions);
    });
  }
}
