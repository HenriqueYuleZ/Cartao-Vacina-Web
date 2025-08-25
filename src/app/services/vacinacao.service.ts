import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Vacinacao } from '../models/vacinacao.model';

@Injectable({
  providedIn: 'root'
})
export class VacinacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';
  private vacinacoes: Vacinacao[] = [];
  private vacinacoesSubject = new BehaviorSubject<Vacinacao[]>(this.vacinacoes);

  constructor() {
    this.carregarVacinacoes();
  }

  getVacinacoes(): Observable<Vacinacao[]> {
    return this.vacinacoesSubject.asObservable();
  }

  getVacinacoesByPessoa(pessoaId: string): Observable<Vacinacao[]> {
    return this.http.get<Vacinacao[]>(`${this.baseUrl}/Vacinacao/cartao-vacinacao`, {
      params: { pessoaId }
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  getVacinacaoById(id: string): Observable<Vacinacao> {
    return this.http.get<Vacinacao>(`${this.baseUrl}/Vacinacao/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  adicionarVacinacao(vacinacao: Omit<Vacinacao, 'id'>): Observable<Vacinacao> {
    return this.http.post<Vacinacao>(`${this.baseUrl}/Vacinacao`, vacinacao)
      .pipe(
        tap(novaVacinacao => {
          this.vacinacoes.push(novaVacinacao);
          this.vacinacoesSubject.next([...this.vacinacoes]);
        }),
        catchError(this.handleError)
      );
  }

  atualizarVacinacao(id: string, vacinacao: Partial<Vacinacao>): Observable<Vacinacao> {
    return this.http.put<Vacinacao>(`${this.baseUrl}/Vacinacao/${id}`, vacinacao)
      .pipe(
        tap(vacinacaoAtualizada => {
          const index = this.vacinacoes.findIndex(v => v.id === id);
          if (index !== -1) {
            this.vacinacoes[index] = vacinacaoAtualizada;
            this.vacinacoesSubject.next([...this.vacinacoes]);
          }
        }),
        catchError(this.handleError)
      );
  }

  excluirVacinacao(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/Vacinacao/${id}`)
      .pipe(
        tap(() => {
          const index = this.vacinacoes.findIndex(vacinacao => vacinacao.id === id);
          if (index !== -1) {
            this.vacinacoes.splice(index, 1);
            this.vacinacoesSubject.next([...this.vacinacoes]);
          }
        }),
        map(() => true),
        catchError(this.handleError)
      );
  }

  excluirVacinacoesPorPessoa(pessoaId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/Vacinacao/cartao-vacinacao/${pessoaId}`)
      .pipe(
        tap(() => {
          this.vacinacoes = this.vacinacoes.filter(vacinacao => vacinacao.pessoaId !== pessoaId);
          this.vacinacoesSubject.next([...this.vacinacoes]);
        }),
        map(() => true),
        catchError(this.handleError)
      );
  }

  buscarVacinacoesPorVacina(vacinaId: string): Observable<Vacinacao[]> {
    return this.http.get<Vacinacao[]>(`${this.baseUrl}/Vacinacao/vacina/${vacinaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  buscarVacinacoesPorPeriodo(dataInicio: Date, dataFim: Date): Observable<Vacinacao[]> {
    const params = {
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0]
    };
    
    return this.http.get<Vacinacao[]>(`${this.baseUrl}/Vacinacao/periodo`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  private carregarVacinacoes(): void {
    this.http.get<Vacinacao[]>(`${this.baseUrl}/Vacinacao`)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: (vacinacoes) => {
          this.vacinacoes = vacinacoes;
          this.vacinacoesSubject.next([...this.vacinacoes]);
        },
        error: (error) => {
          console.error('Erro ao carregar vacinações:', error);
          // Em caso de erro, mantém a lista vazia
          this.vacinacoesSubject.next([]);
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
          errorMessage = 'Vacinação não encontrada';
          break;
        case 409:
          errorMessage = 'Esta dose da vacina já foi registrada para esta pessoa';
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

