import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Pessoa } from '../models/pessoa.model';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';
  private pessoas: Pessoa[] = [];
  private pessoasSubject = new BehaviorSubject<Pessoa[]>(this.pessoas);

  constructor() {
    this.carregarPessoas();
  }

  getPessoas(): Observable<Pessoa[]> {
    return this.pessoasSubject.asObservable();
  }

  getPessoaById(id: string): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${this.baseUrl}/Pessoas/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  adicionarPessoa(pessoa: Omit<Pessoa, 'id'>): Observable<Pessoa> {
    return this.http.post<Pessoa>(`${this.baseUrl}/Pessoas`, pessoa)
      .pipe(
        tap(novaPessoa => {
          this.pessoas.push(novaPessoa);
          this.pessoasSubject.next([...this.pessoas]);
        }),
        catchError(this.handleError)
      );
  }

  atualizarPessoa(id: string, pessoa: Partial<Pessoa>): Observable<Pessoa> {
    return this.http.put<Pessoa>(`${this.baseUrl}/Pessoas/${id}`, pessoa)
      .pipe(
        tap(pessoaAtualizada => {
          const index = this.pessoas.findIndex(p => p.id === id);
          if (index !== -1) {
            this.pessoas[index] = pessoaAtualizada;
            this.pessoasSubject.next([...this.pessoas]);
          }
        }),
        catchError(this.handleError)
      );
  }

  removerPessoa(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/Pessoas/${id}`)
      .pipe(
        tap(() => {
          const index = this.pessoas.findIndex(pessoa => pessoa.id === id);
          if (index !== -1) {
            this.pessoas.splice(index, 1);
            this.pessoasSubject.next([...this.pessoas]);
          }
        }),
        map(() => true),
        catchError(this.handleError)
      );
  }

  buscarPessoaPorDocumento(documento: string): Observable<Pessoa | null> {
    return this.http.get<Pessoa>(`${this.baseUrl}/Pessoas/documento/${documento}`)
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            return throwError(() => null);
          }
          return this.handleError(error);
        })
      );
  }

  private carregarPessoas(): void {
    this.http.get<Pessoa[]>(`${this.baseUrl}/Pessoas`)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: (pessoas) => {
          this.pessoas = pessoas;
          this.pessoasSubject.next([...this.pessoas]);
        },
        error: (error) => {
          console.error('Erro ao carregar pessoas:', error);
          // Em caso de erro, mantém a lista vazia
          this.pessoasSubject.next([]);
        }
      });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos enviados para o servidor';
          break;
        case 401:
          errorMessage = 'Não autorizado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 409:
          errorMessage = 'Já existe uma pessoa cadastrada com este documento';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Erro na requisição:', error);
    return throwError(() => new Error(errorMessage));
  }
}

