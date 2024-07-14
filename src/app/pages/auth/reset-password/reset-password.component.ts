import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  public resetError!: string;
  private code: string = '';
  @ViewChild('password') passwordModel!: NgModel;
  @ViewChild('passwordConfirm') passwordConfirmModel!:NgModel;

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code') || '';
  }

  public resetForm: {password : string; passwordConfirm: string} = {
    password: '',
    passwordConfirm: '',
  }

  constructor(
    private router: Router, 
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  public handleResetPassword(event: Event) {
    event.preventDefault();

    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }

    if (!this.passwordConfirmModel.valid) {
      this.passwordConfirmModel.control.markAsTouched();
    }
    if(this.passwordModel.model != this.passwordConfirmModel.model){

    }

    if (this.passwordModel.valid && this.passwordConfirmModel.valid && (this.passwordModel.model == this.passwordConfirmModel.model)) {
      this.authService.resetPassword({password : this.resetForm.password}, this.code).subscribe({
        next: () => this.router.navigateByUrl('/login'),
        error: (err: any) => (this.resetForm = err.error.description),
      });
    }
  }

}
