import { Component, effect, inject } from '@angular/core';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { DashboardService } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IMovieDashboard } from '../../interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public search: String = '';
  public movieList: IMovieDashboard[] = [];
  private service = inject(DashboardService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.service.getAllSignal();
    effect(() => {      
      this.movieList = this.service.movies$();
    });
  }

}
