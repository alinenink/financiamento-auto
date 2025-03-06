import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router) {}

  onSubmit() {
    this.router.navigate(['/home']);
  }

  onForgotPassword() {
    alert(
      'Link para recuperação de senha enviado para: ' +
        (this.email || 'seu email cadastrado.')
    );
  }
}
