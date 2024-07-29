import { Component, effect, inject } from '@angular/core';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { DashboardService } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IMovieDashboard, IUserCountStats } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from '../../components/chart/chart.component';
import { provideEcharts } from 'ngx-echarts';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MovieCardComponent, CommonModule, FormsModule,ChartComponent],
  providers: [provideEcharts()], 
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  public search: string = '';
  public movieList: IMovieDashboard[] = [];
  public filteredMovieList: IMovieDashboard[] = [];
  public service = inject(DashboardService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.service.getAllSignal();
    effect(() => {      
      this.movieList = this.service.movies$();
      this.filteredMovieList = this.service.movies$();
    });
  }

  public filterMovies() {
    console.log(this.search)
    if (this.search == "") {
      this.filteredMovieList = this.movieList;
    }
    this.search = this.search.toLowerCase();
    this.filteredMovieList = this.movieList.filter(movie =>
      movie.name?.toLowerCase().includes(this.search) ||
      movie.genre?.name?.toLowerCase().includes(this.search)
    );
  }

}
