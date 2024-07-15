import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [
    MoviesComponent,
    // LoaderComponent,
    CommonModule,
    ModalComponent,
    // GameFormComponent
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent {

}
