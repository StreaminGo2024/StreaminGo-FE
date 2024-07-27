import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICasting, IGenre, IMovie } from '../../../interfaces';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './movie-form.component.html',
  styleUrl: './movie-form.component.scss'
})
export class MovieFormComponent {
  @Input() movie: IMovie =  {};
  @Input() genreList: IGenre[] = [];
  @Input() castingList: ICasting[] = [];
  @Input() action = '';
  @Output() callParentEvent: EventEmitter<IMovie> = new EventEmitter<IMovie>()

  callEvent() {
    this.callParentEvent.emit(this.movie);
  }

}
