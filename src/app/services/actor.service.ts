import { inject, Injectable, signal } from '@angular/core';
import { IActor } from '../interfaces';
import { BaseService } from './base-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ActorService extends BaseService<IActor>{

  protected override  source: string = 'actors';
  private itemListSignal = signal<IActor[]>([]);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  
  get items$ () {
    return this.itemListSignal;
  }

  public getAll() {
    this.findAll().subscribe({
      next: (response: any) => {
        response.reverse();
        this.itemListSignal.set(response);
      },
      error: (error: any) => {
        console.error('Error in get all genres request', error);
        this.snackBar.open(error.error.description, 'Close' , {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    })
  }

  public save(item: IActor) {
    item.status = 'active';
    this.add(item).subscribe({
      next: (response: any) => {
        this.itemListSignal.update((actors: IActor[]) => [response, ...actors]);
      },
      error: (error: any) => {
        console.error('response', error.description);
        this.snackBar.open(error.error.description, 'Close' , {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    })
  }

  public update(item: IActor) {
    this.add(item).subscribe({
      next: () => {
        const updatedItems = this.itemListSignal().map(actor => actor.id === item.id ? item: actor);
        this.itemListSignal.set(updatedItems);
      },
      error: (error: any) => {
        console.error('response', error.description);
        this.snackBar.open(error.error.description, 'Close' , {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    })
  }
  
  public delete(item: IActor) {
    this.del(item.id).subscribe({
      next: () => {
        this.itemListSignal.set(this.itemListSignal().filter(actor => actor.id != item.id));
      },
      error: (error: any) => {
        console.error('response', error.description);
        this.snackBar.open(error.error.description, 'Close' , {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    })
  }
}
