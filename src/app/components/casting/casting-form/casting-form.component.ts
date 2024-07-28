import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IActor, ICasting, ICastingActor } from '../../../interfaces';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-casting-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './casting-form.component.html',
  styleUrls: ['./casting-form.component.scss']
})
export class CastingFormComponent implements OnInit {
  @Input() casting: ICasting = {};
  @Input() actorList: IActor[] = [];
  @Input() action = '';
  @Output() callParentEvent: EventEmitter<ICastingActor> = new EventEmitter<ICastingActor>();

  public castingForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.castingForm = this.fb.group({
      name: [this.casting.name || '', Validators.required],
      selectedActors: [[], Validators.required]
    });
  }

  callEvent() {
    if (this.castingForm.invalid) {
      this.castingForm.markAllAsTouched();
      return;
    }

    const eventPayload: ICastingActor = {
      casting: {
        ...this.casting,
        name: this.castingForm.get('name')?.value
      },
      selectedActors: this.castingForm.get('selectedActors')?.value
    };

    this.callParentEvent.emit(eventPayload);
  }
}
