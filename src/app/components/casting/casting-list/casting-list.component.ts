import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ICasting, ICastingActor } from '../../../interfaces';
import { CastingService } from '../../../services/casting.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../modal/modal.component';
import { CastingFormComponent } from '../casting-form/casting-form.component';
import { ActorService } from '../../../services/actor.service';

@Component({
  selector: 'app-casting-list',
  standalone: true,
  imports: [    
    CommonModule,
    ModalComponent,
    CastingFormComponent],
  templateUrl: './casting-list.component.html',
  styleUrl: './casting-list.component.scss'
})
export class CastingListComponent implements OnChanges, OnInit{
  @Input() itemList: ICasting[] = [];
  @Input() areActionsAvailable: boolean = false;
  public selectedItem: ICasting = {};
  public castingService: CastingService = inject(CastingService);
  public actorService: ActorService = inject(ActorService);

  ngOnInit(): void {
    this.actorService.getAll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['areActionsAvailable']) {
      console.log('areActionsAvailable', this.areActionsAvailable);
    }
  }
  
  showDetailModal(item: ICasting, modal: any) {
    this.selectedItem = {...item}
    modal.show();
  }

  handleFormAction(item: ICastingActor) {

    this.castingService.update(item.casting);
  }

  deleteCasting(item: ICasting) {
    this.castingService.delete(item);
  }

  statusCastingUpdate(item: ICasting) {
    item.status = item.status === 'active' ? 'disabled' : 'active';
    this.castingService.update(item);
  }

}
