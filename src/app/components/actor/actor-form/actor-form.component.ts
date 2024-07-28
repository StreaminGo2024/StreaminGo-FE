import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { IActor } from '../../../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-actor-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './actor-form.component.html',
  styleUrl: './actor-form.component.scss'
})
export class ActorFormComponent {
  @Input() actor: IActor = {};

  @Input() action = '';
  @Output() callParentEvent: EventEmitter<IActor> = new EventEmitter<IActor>()
  private snackBar = inject(MatSnackBar);

  callEvent(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(controlName => {
        form.controls[controlName].markAsTouched();
      });
      return;
    }
    else{
      this.callParentEvent.emit(this.actor);
    }
  }
}
