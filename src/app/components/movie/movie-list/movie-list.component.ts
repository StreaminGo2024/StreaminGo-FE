import { CommonModule } from '@angular/common';
import { Component, effect, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IMovie } from '../../../interfaces';
import { MovieService } from '../../../services/movie.service';
import { MovieFormComponent } from '../movie-form/movie-form.component';
import { GenreService } from '../../../services/genre.service';
import { CastingService } from '../../../services/casting.service';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule, 
    ModalComponent,
    MovieFormComponent,
 
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent implements OnChanges, OnInit{

  @Input() itemList: IMovie[] = [];
  @Input() areActionsAvailable: boolean = false;
  public selectedItem: IMovie = {};
  public movieService: MovieService = inject(MovieService);
  public genreService: GenreService = inject(GenreService);
  public castingService: CastingService = inject(CastingService);

  ngOnInit(): void {
    this.genreService.getAll();
    this.castingService.getAll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['areActionsAvailable']) {
      console.log('areActionsAvailable', this.areActionsAvailable);
    }
  }
  
  showDetailModal(item: IMovie, modal: any) {
    this.selectedItem = {...item}
    modal.show();
  }

  handleFormAction(item: IMovie) {

    this.movieService.update(item);
  }

  deleteMovie(item: IMovie) {
    this.movieService.delete(item);
  }

  statusMovieUpdate(item: IMovie) {
    item.status = item.status === 'active' ? 'disabled' : 'active';
    this.movieService.update(item);
  }


}
