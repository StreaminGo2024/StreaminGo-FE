import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IGenre } from '../../../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { GenreService } from '../../../services/genre.service';
import { ModalComponent } from '../../modal/modal.component';
import { GenreFormComponent } from '../genre-form/genre-form.component';

@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    GenreFormComponent
  ],
  templateUrl: './genre-list.component.html',
  styleUrl: './genre-list.component.scss'
})
export class GenreListComponent implements OnChanges{

  @Input() itemList: IGenre[] = [];
  @Input() areActionsAvailable: boolean = false;
  public selectedItem: IGenre = {};
  public genreService: GenreService = inject(GenreService);


  ngOnChanges(changes: SimpleChanges): void {
    if(changes['areActionsAvailable']) {
      console.log('areActionsAvailable', this.areActionsAvailable);
    }
  }
  
  showDetailModal(item: IGenre, modal: any) {
    this.selectedItem = {...item}
    modal.show();
  }

  handleFormAction(item: IGenre) {

    this.genreService.update(item);
  }

  deleteGenre(item: IGenre) {
    this.genreService.delete(item);
  }

  statusGenreUpdate(item: IGenre) {
    item.status = item.status === 'active' ? 'disabled' : 'active';
    this.genreService.update(item);
  }

 
}
