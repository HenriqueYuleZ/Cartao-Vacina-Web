import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Vacina } from '../models/vacina.model';

@Injectable({
  providedIn: 'root'
})
export class VacinaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';
  private vacinas: Vacina[] = [];
  private vacinasSubject = new BehaviorSubject<Vacina[]>(this.vacinas);

  constructor() {
    this.carregarVacinas();
  }

  getVacinas(): Observable<Vacina[]> {
    return this.vacinasSubject.asObservable();
  }

  getVacinaById(id: string): Observable<Vacina> {
    return this.http.get<Vacina>(`${this.baseUrl}/Vacinas/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  adicionarVacina(vacina: Omit<Vacina, 'id'>): Observable<Vacina> {
    return this.http.post<Vacina>(`${this.baseUrl}/Vacinas`, vacina)
      .pipe(
        tap(novaVacina => {
          this.vacinas.push(novaVacina);
          this.vacinasSubject.next([...this.vacinas]);
        }),
        catchError(this.handleError)
      );
  }

  atualizarVacina(id: string, vacina: Partial<Vacina>): Observable<Vacina> {
    return this.http.put<Vacina>(`${this.baseUrl}/Vacinas/${id}`, vacina)
      .pipe(
        tap(vacinaAtualizada => {
          const index = this.vacinas.findIndex(v => v.id === id);
          if (index !== -1) {
            this.vacinas[index] = vacinaAtualizada;
            this.vacinasSubject.next([...this.vacinas]);
          }
        }),
        catchError(this.handleError)
      );
  }

  removerVacina(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/Vacinas/${id}`)
      .pipe(
        tap(() => {
          const index = this.vacinas.findIndex(vacina => vacina.id === id);
          if (index !== -1) {
            this.vacinas.splice(index, 1);
            this.vacinasSubject.next([...this.vacinas]);
          }
        }),
        map(() => true),
        catchError(this.handleError)
      );
  }

  buscarVacinaPorNome(nome: string): Observable<Vacina[]> {
    return this.http.get<Vacina[]>(`${this.baseUrl}/Vacinas/buscar?nome=${encodeURIComponent(nome)}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private carregarVacinas(): void {
    this.http.get<Vacina[]>(`${this.baseUrl}/Vacinas`)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: (vacinas) => {
          this.vacinas = vacinas;
          this.vacinasSubject.next([...this.vacinas]);
        },
        error: (error) => {
          console.error('Erro ao carregar vacinas:', error);
          // Em caso de erro, mantém a lista vazia
          this.vacinasSubject.next([]);
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
          errorMessage = 'Vacina não encontrada';
          break;
        case 409:
          errorMessage = 'Já existe uma vacina cadastrada com este nome';
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

