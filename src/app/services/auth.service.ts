import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  ativo: boolean;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CriarContaRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Verificar se o token ainda é válido ao inicializar
    this.verificarTokenValido();
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null && this.hasValidToken();
  }

  get currentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, loginData)
      .pipe(
        tap(response => {
          this.setAuthData(response);
        }),
        catchError(this.handleError)
      );
  }

  criarConta(contaData: CriarContaRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, contaData)
      .pipe(
        tap(response => {
          this.setAuthData(response);
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<boolean> {
    const token = this.getToken();
    
    // Fazer logout no servidor se houver token
    if (token) {
      return this.http.post<void>(`${this.baseUrl}/auth/logout`, {})
        .pipe(
          tap(() => this.clearAuthData()),
          map(() => true),
          catchError(() => {
            // Mesmo se der erro no servidor, limpa os dados locais
            this.clearAuthData();
            return throwError(() => true);
          })
        );
    } else {
      this.clearAuthData();
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }
  }

  verificarEmail(email: string): Observable<boolean> {
    return this.http.post<{ existe: boolean }>(`${this.baseUrl}/auth/verificar-email`, { email })
      .pipe(
        map(response => response.existe),
        catchError(this.handleError)
      );
  }

  atualizarPerfil(dados: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/auth/perfil`, dados)
      .pipe(
        tap(usuario => {
          this.currentUserSubject.next(usuario);
          localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
        }),
        catchError(this.handleError)
      );
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<boolean> {
    return this.http.put<void>(`${this.baseUrl}/auth/alterar-senha`, {
      senhaAtual,
      novaSenha
    })
      .pipe(
        map(() => true),
        catchError(this.handleError)
      );
  }

  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.usuario));
    this.currentUserSubject.next(authResponse.usuario);

    // Configurar logout automático quando o token expirar
    if (authResponse.expiresIn) {
      setTimeout(() => {
        this.logout().subscribe();
      }, authResponse.expiresIn * 1000);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private getUserFromStorage(): Usuario | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decodificar o JWT para verificar a expiração
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  private verificarTokenValido(): void {
    if (!this.hasValidToken()) {
      this.clearAuthData();
    }
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
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
          errorMessage = error.error?.message || 'Dados inválidos';
          break;
        case 401:
          errorMessage = 'Email ou senha incorretos';
          this.clearAuthData(); // Limpar dados de auth em caso de não autorizado
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Usuário não encontrado';
          break;
        case 409:
          errorMessage = 'Email já está em uso';
          break;
        case 422:
          errorMessage = error.error?.message || 'Dados de entrada inválidos';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Erro na autenticação:', error);
    return throwError(() => new Error(errorMessage));
  }
}
