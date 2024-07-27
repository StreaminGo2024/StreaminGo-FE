import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IGenre } from '../../../interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-genre-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './genre-form.component.html',
  styleUrl: './genre-form.component.scss'
})
export class GenreFormComponent {
  @Input() genre: IGenre = {};

  @Input() action = '';
  @Output() callParentEvent: EventEmitter<IGenre> = new EventEmitter<IGenre>()

  callEvent() {
    this.callParentEvent.emit(this.genre);
  }
  

}
