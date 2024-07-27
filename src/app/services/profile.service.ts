import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BaseService } from './base-service';
import { IUser } from '../interfaces';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService<IUser> {
  protected override source: string = 'users/me';
  private userSignal = signal<IUser>({});

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {
    super();
  }
  

  get user$() {
    return this.userSignal;
  }

  getUserProfileInfo() {
    this.findAll().subscribe({
      next: (response: any) => {
        this.userSignal.set(response);
      }
    });
  }

  public update(user: IUser) {
    this.add(user).subscribe({
      next: (response: any) => {
        this.userSignal.update((user: IUser) => response);
      },
      error: (error: any) => {
        console.error('response', error.description);
        this.snackBar.open(error.error.description, 'Close', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  public updatePassword(user: IUser) {
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

  public deleteAccount(id: number) {
    return this.http.delete(`users/${id}`).subscribe({
      next: () => {
        this.snackBar.open('Account deleted successfully. Goodbye!', 'Close', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        // Limpia el estado de autenticación
        this.authService.logout();

        // Redirige al usuario a la página de inicio de sesión
        this.router.navigate(['/login']);
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
