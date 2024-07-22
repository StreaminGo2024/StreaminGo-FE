import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IUser } from '../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService<IUser>{
  protected override source: string = 'users/me';
  private userSignal = signal<IUser>({});
  private snackBar: MatSnackBar = inject(MatSnackBar);

  get user$ (){
    return this.userSignal;
  }

  getUserProfileInfo(){
    this.findAll().subscribe({
      next: (response: any) => {
        this.userSignal.set(response);
      }
    });
  }

  public update(user: IUser){

    this.add(user).subscribe({
      next: (response: any) => {
        this.userSignal.update((user: IUser) => response)
      },error: (error: any) => {
        console.error('response', error.description);
        this.snackBar.open(error.error.description, 'Close' , {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    })
  }

  public updatePassword (user: IUser){
    const url = `${this.source}`;
    return this.http.put<IUser>(url, user).subscribe({
      next: (response: IUser) => {
        this.userSignal.update((user: IUser) => response);
        this.snackBar.open('Password updated successfully', 'Close', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      },
      error: (error: any) => {
        console.error('response', error);
        this.snackBar.open(error.error?.description || 'An error occurred', 'Close', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}

