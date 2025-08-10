import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      cookie_analytics: [false],
      cookie_marketing: [false],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const payload = {
        ...this.registerForm.value,
        cookie_essential: true, // siempre aceptado
      };

      // TODO: Llamar API POST /api/auth/register
      console.log('Registro enviado:', payload);
    }
  }
}