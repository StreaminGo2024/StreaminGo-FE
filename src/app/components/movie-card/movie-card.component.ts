import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent {
  @Input() title = "";
  @Input() year = 0;
  @Input() category = "";
  @Input() url = "";
  @Input() image = "";
  @Input() video = ""; 
  @Input() description = ""; 
  @Input() casting = ""; 
  @Input() time = 0; 
  isHovered: boolean = false;

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }


}
