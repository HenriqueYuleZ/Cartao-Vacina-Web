import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-criar-conta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './criar-conta.html',
})
export class CriarContaComponent {
  contaForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.contaForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    })
  }

  get email() { return this.contaForm.get('email'); }
  get senha() { return this.contaForm.get('senha'); }

  criarConta() {
    if (this.contaForm.valid) {
      try {
        // auth service
        this.router.navigate(['/login'])
      } catch (error: any) {
        alert(error.message || 'Erro ao criar conta');
      }
    } else {
      alert('Preencha os campos obrigatórios')
    }

  }
}
