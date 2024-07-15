import { CommonModule } from '@angular/common';
import { Component, effect, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IMovie } from '../../../interfaces';
import { MovieService } from '../../../services/movie.service';
import { MovieFormComponent } from '../movie-form/movie-form.component';

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
export class MovieListComponent implements OnChanges{

  @Input() itemList: IMovie[] = [];
  @Input() areActionsAvailable: boolean = false;
  public selectedItem: IMovie = {};
  public movieService: MovieService = inject(MovieService);

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


}
