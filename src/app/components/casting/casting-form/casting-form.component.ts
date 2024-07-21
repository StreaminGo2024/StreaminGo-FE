import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IActor, ICasting, ICastingActor } from '../../../interfaces';
import { MatSelectModule } from '@angular/material/select'

@Component({
  selector: 'app-casting-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule
  ],
  templateUrl: './casting-form.component.html',
  styleUrl: './casting-form.component.scss'
})
export class CastingFormComponent{

  @Input() casting: ICasting = {};
  @Input() actorList: IActor[] = []; 
  public selectedActors: [] = [];

  @Input() action = '';
  @Output() callParentEvent: EventEmitter<ICastingActor> = new EventEmitter<ICastingActor>();


  callEvent() {

    const eventPayload: ICastingActor = {
      casting: this.casting,
      selectedActors: this.selectedActors
    };
    
    this.callParentEvent.emit(eventPayload);
  }
}

