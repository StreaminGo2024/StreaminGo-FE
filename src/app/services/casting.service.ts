import { inject, Injectable, signal } from '@angular/core';
import { ICasting } from '../interfaces';
import { BaseService } from './base-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CastingService extends BaseService<ICasting>{

  protected override source: string = 'casting';
  private itemListSignal = signal<ICasting[]>([]);
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
        console.error('Error in get all casting request', error);
        this.snackBar.open(error.error.description, 'Close' , {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    })
  }

  public save(item: ICasting,actor : []) {
    item.status = 'active';
    this.add(item).subscribe({
      next: (response: any) => {
        this.itemListSignal.update((casting: ICasting[]) => [response, ...casting]);
        this.addActors(response.id, actor);
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

  public update(item: ICasting) {
    this.add(item).subscribe({
      next: () => {
        const updatedItems = this.itemListSignal().map(casting => casting.id === item.id ? item: casting);
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

  public addActors(item : number,actor : []) {
    this.addActorsToCasting(item, actor).subscribe({
      next: (response) => {
      const updatedCasting = response.data;
      
      const updatedItems = this.itemListSignal().map(casting =>
        casting.id === item ? updatedCasting : casting
      );

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
  
  public delete(item: ICasting) {
    this.del(item.id).subscribe({
      next: () => {
        this.itemListSignal.set(this.itemListSignal().filter(casting => casting.id != item.id));
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
