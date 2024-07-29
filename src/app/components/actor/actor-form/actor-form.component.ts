import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
export class ActorFormComponent implements OnChanges {
  @Input() actor: IActor = {};
  @Input() action = '';
  @Output() callParentEvent: EventEmitter<IActor> = new EventEmitter<IActor>();
  private snackBar = inject(MatSnackBar);

  birthString: string | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['actor'] && this.actor) {
      this.birthString = this.actor.birth ? this.formatDate(new Date(this.actor.birth)) : undefined;
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onBirthChange(value: string): void {
    this.birthString = value;
    const [year, month, day] = value.split('-').map(Number);
    this.actor.birth = new Date(year, month - 1, day); 
  }

  callEvent(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(controlName => {
        form.controls[controlName].markAsTouched();
      });
      return;
    }
    console.log(this.actor)
    this.callParentEvent.emit(this.actor);
  }
}
