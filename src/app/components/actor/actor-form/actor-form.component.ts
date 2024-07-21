import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IActor } from '../../../interfaces';

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

  callEvent() {
    this.callParentEvent.emit(this.actor);
  }
}
