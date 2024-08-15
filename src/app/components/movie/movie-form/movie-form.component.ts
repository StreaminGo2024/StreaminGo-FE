import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ICasting, IGenre, IMovie } from '../../../interfaces';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './movie-form.component.html',
  styleUrls: ['./movie-form.component.scss']
})
export class MovieFormComponent {
  @Input() movie: IMovie = {};
  @Input() genreList: IGenre[] = [];
  @Input() castingList: ICasting[] = [];
  @Input() action = '';
  @Output() callParentEvent: EventEmitter<IMovie> = new EventEmitter<IMovie>();
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  callEvent(form: NgForm) {
    if (form.valid && this.movie.imageCover && this.movie.video) {
      this.callParentEvent.emit(this.movie);
      if (this.action === 'Add movie') { 
        this.resetForm(form);
      }
      this.closeModal.emit;
    } else {
      // Marcar todos los controles como tocados para mostrar mensajes de error
      Object.keys(form.controls).forEach(control => {
        form.controls[control].markAsTouched();
      });
    }
  }

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.movie.imageCover = reader.result as string;
        console.log(this.movie.imageCover); 
      };
      reader.readAsDataURL(file);
    }
  }

  onVideoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileName = file.name;
      const baseFileName = fileName.substring(0, fileName.lastIndexOf('.'));
      this.movie.video = baseFileName;
      console.log(this.movie.video); 
    }
  }

  validateYear(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 4) {
      input.value = value.slice(0, 4);
    }
  }

  validateDuration(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 10) {
      input.value = value.slice(0, 10);
    }
  }

  compareCasting(casting1: ICasting, casting2: ICasting): boolean {
    return casting1 && casting2 ? casting1.id === casting2.id : casting1 === casting2;
  }

  compareGenre(genre1: ICasting, genre2: ICasting): boolean {
    return genre1 && genre2 ? genre1.id === genre2.id : genre1 === genre2;
  }

  resetForm(form: NgForm) {
    form.resetForm(this.action === "Add movie");
    this.movie = {}; 
    this.movie.imageCover = '';
    this.movie.video = '';
  
    // Limpia las entradas de archivos
    const imageUploadInput = document.getElementById('imageUpload') as HTMLInputElement;
    const videoUploadInput = document.getElementById('videoUpload') as HTMLInputElement;
  
    if (imageUploadInput) {
      imageUploadInput.value = ''; 
    }
  
    if (videoUploadInput) {
      videoUploadInput.value = ''; 
    }
  }
  
}
