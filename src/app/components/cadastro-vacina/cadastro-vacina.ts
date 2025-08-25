import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { VacinaService } from '../../services/vacina.service';

@Component({
  selector: 'app-cadastro-vacina',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro-vacina.html',
})
export class CadastroVacinaComponent {
  vacinaForm: FormGroup;

  constructor(private vacinaService: VacinaService, private fb: FormBuilder) {
    this.vacinaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]]
    })
  }

  get nome() { return this.vacinaForm.get('nome'); }

  cadastrarVacina() {
    if(this.vacinaForm.valid) {
      try {
        this.vacinaService.adicionarVacina({ nome: this.nome?.value.trim() });
        alert('Vacina cadastrada com sucesso!');
        this.vacinaForm.reset();
      } catch (error: any) {
        alert(error.message || 'Erro ao cadastrar vacina');
        Object.keys(this.vacinaForm.controls).forEach(key => {
          this.vacinaForm.get(key)?.markAsTouched();
        });
      }
    } else {
      alert('Preencha os campos obrigatórios')
    }
  }
}
