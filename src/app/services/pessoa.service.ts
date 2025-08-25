import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pessoa } from '../models/pessoa.model';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private pessoas: Pessoa[] = [];
  private pessoasSubject = new BehaviorSubject<Pessoa[]>(this.pessoas);

  constructor() { }

  getPessoas(): Observable<Pessoa[]> {
    return this.pessoasSubject.asObservable();
  }

  getPessoaById(id: string): Pessoa | undefined {
    return this.pessoas.find(pessoa => pessoa.id === id);
  }

  adicionarPessoa(pessoa: Omit<Pessoa, 'id'>): Pessoa {
    const pessoaExistente = this.pessoas.find(p => p.documento === pessoa.documento);
    if (pessoaExistente) {
      throw new Error('Já existe uma pessoa cadastrada com este número de identificação');
    }

    const novaPessoa: Pessoa = {
      ...pessoa,
      id: this.generateId()
    };
    this.pessoas.push(novaPessoa);
    this.pessoasSubject.next([...this.pessoas]);
    return novaPessoa;
  }

  removerPessoa(id: string): boolean {
    const index = this.pessoas.findIndex(pessoa => pessoa.id === id);
    if (index !== -1) {
      this.pessoas.splice(index, 1);
      this.pessoasSubject.next([...this.pessoas]);
      return true;
    }
    return false;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

