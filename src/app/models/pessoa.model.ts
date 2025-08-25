
export type SexoPessoa = 'Masculino' | 'Feminino' | 'Outro';
export interface Pessoa {
  id: string;
  nome: string;
  idade: number;
  sexo: SexoPessoa;
  documento: string;
}

