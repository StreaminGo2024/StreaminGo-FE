import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IActor } from '../../../interfaces';
import { ActorService } from '../../../services/actor.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../modal/modal.component';
import { ActorFormComponent } from '../actor-form/actor-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm/confirm-dialog.component';

@Component({
  selector: 'app-actor-list',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ActorFormComponent
  ],
  templateUrl: './actor-list.component.html',
  styleUrl: './actor-list.component.scss'
})
export class ActorListComponent implements OnChanges, OnInit {
  @Input() itemList: IActor[] = [];
  @Input() areActionsAvailable: boolean = false;
  private dialog = inject(MatDialog);
  public selectedItem: IActor = {};
  public actorService: ActorService = inject(ActorService);


  ngOnChanges(changes: SimpleChanges): void {
    if(changes['areActionsAvailable']) {
      console.log('areActionsAvailable', this.areActionsAvailable);
    }
  }

  ngOnInit() {
    this.itemList = this.itemList.map(item => {
      return {
        ...item,
        birth: item.birth ? new Date(item.birth) : undefined
      };
    });
  }
  
  showDetailModal(item: IActor, modal: any) {
    this.selectedItem = {...item}
    modal.show();
  }

  handleFormAction(item: IActor) {

    this.actorService.update(item);
  }

  deleteActor(item: IActor) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.actorService.delete(item);
      }
    });
  }

  statusActorUpdate(item: IActor) {
    item.status = item.status === 'active' ? 'disabled' : 'active';
    this.actorService.update(item);
  }

}
