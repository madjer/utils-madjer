import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';

const NOMES = ['Ana','Carlos','Beatriz','Diego','Fernanda','Gabriel','Helena','Igor','Juliana','Lucas','Mariana','Nicolas','Olivia','Pedro','Rafaela','Samuel','Tatiana','Victor','Yasmin','Zeca'];
const SOBRENOMES = ['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Ferreira','Rodrigues','Almeida','Nascimento','Carvalho','Freitas','Barbosa','Ribeiro','Martins','Rocha','Gomes','Castro','Araujo'];
const CIDADES = [['São Paulo','SP'],['Rio de Janeiro','RJ'],['Belo Horizonte','MG'],['Salvador','BA'],['Curitiba','PR'],['Fortaleza','CE'],['Manaus','AM'],['Recife','PE'],['Porto Alegre','RS'],['Goiânia','GO']];
const RUAS = ['Rua das Flores','Av. Paulista','Rua XV de Novembro','Av. Brasil','Rua do Comércio','Alameda Santos','Rua das Acácias','Av. Getúlio Vargas'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function genCpf(): string {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const d1r = (n.reduce((a, v, i) => a + v * (10 - i), 0) * 10) % 11; n.push(d1r >= 10 ? 0 : d1r);
  const d2r = (n.reduce((a, v, i) => a + v * (11 - i), 0) * 10) % 11; n.push(d2r >= 10 ? 0 : d2r);
  const r = n.join(''); return `${r.slice(0,3)}.${r.slice(3,6)}.${r.slice(6,9)}-${r.slice(9)}`;
}

@Component({
  selector: 'app-fake-data',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatCheckboxModule,
            MatFormFieldModule, MatInputModule, MatIconModule, MatDividerModule,
            MatTooltipModule, MatTableModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Dados Fictícios</h1>
    <p class="page-subtitle">Gera dados fictícios brasileiros para testes e desenvolvimento.</p>

    <mat-card>
      <mat-card-content>
        <div class="checkbox-grid">
          <mat-checkbox [checked]="fields.name"    (change)="fields.name=$event.checked">Nome completo</mat-checkbox>
          <mat-checkbox [checked]="fields.email"   (change)="fields.email=$event.checked">E-mail</mat-checkbox>
          <mat-checkbox [checked]="fields.cpf"     (change)="fields.cpf=$event.checked">CPF</mat-checkbox>
          <mat-checkbox [checked]="fields.phone"   (change)="fields.phone=$event.checked">Telefone</mat-checkbox>
          <mat-checkbox [checked]="fields.address" (change)="fields.address=$event.checked">Endereço</mat-checkbox>
          <mat-checkbox [checked]="fields.birth"   (change)="fields.birth=$event.checked">Data de nascimento</mat-checkbox>
        </div>

        <mat-divider style="margin:16px 0"></mat-divider>

        <div class="generate-row">
          <mat-form-field appearance="outline" style="width:120px">
            <mat-label>Quantidade</mat-label>
            <input matInput type="number" [(ngModel)]="quantity" min="1" max="50">
          </mat-form-field>
          <button mat-flat-button (click)="generate()">
            <mat-icon>refresh</mat-icon> Gerar
          </button>
          @if (results().length > 0) {
            <button mat-stroked-button (click)="copyJson()">
              <mat-icon>content_copy</mat-icon> Copiar JSON
            </button>
          }
        </div>
      </mat-card-content>
    </mat-card>

    @if (results().length > 0) {
      <div class="table-wrap">
        <table mat-table [dataSource]="results()" class="data-table">
          @for (col of activeColumns(); track col) {
            <ng-container [matColumnDef]="col">
              <th mat-header-cell *matHeaderCellDef>{{ colLabel(col) }}</th>
              <td mat-cell *matCellDef="let row">{{ row[col] }}</td>
            </ng-container>
          }
          <tr mat-header-row *matHeaderRowDef="activeColumns()"></tr>
          <tr mat-row *matRowDef="let row; columns: activeColumns()"></tr>
        </table>
      </div>
    }
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .checkbox-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 4px; }
    .generate-row { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
    .table-wrap { overflow-x: auto; margin-top: 16px; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); }
    .data-table { width: 100%; }
    td, th { font-size: 13px !important; white-space: nowrap; }
  `]
})
export class FakeDataComponent {
  fields = { name: true, email: true, cpf: true, phone: true, address: false, birth: false };
  quantity = 5;
  results = signal<Record<string, string>[]>([]);

  private labels: Record<string, string> = {
    name: 'Nome', email: 'E-mail', cpf: 'CPF',
    phone: 'Telefone', address: 'Endereço', birth: 'Nascimento'
  };

  constructor(private snackBar: MatSnackBar) {}

  activeColumns() {
    return (Object.keys(this.fields) as (keyof typeof this.fields)[]).filter(k => this.fields[k]);
  }
  colLabel(col: string) { return this.labels[col] ?? col; }

  generate(): void {
    const rows = Array.from({ length: Math.min(this.quantity, 50) }, () => {
      const nome = pick(NOMES), sobrenome = pick(SOBRENOMES);
      const [cidade, estado] = pick(CIDADES);
      const row: Record<string, string> = {};
      if (this.fields.name)    row['name']    = `${nome} ${sobrenome}`;
      if (this.fields.email)   row['email']   = `${nome.toLowerCase()}.${sobrenome.toLowerCase()}${rand(1,99)}@email.com`;
      if (this.fields.cpf)     row['cpf']     = genCpf();
      if (this.fields.phone)   row['phone']   = `(${rand(11,99)}) 9${rand(1000,9999)}-${rand(1000,9999)}`;
      if (this.fields.address) row['address'] = `${pick(RUAS)}, ${rand(1,999)} - ${cidade}/${estado}`;
      if (this.fields.birth)   row['birth']   = `${String(rand(1,28)).padStart(2,'0')}/${String(rand(1,12)).padStart(2,'0')}/${rand(1960,2005)}`;
      return row;
    });
    this.results.set(rows);
  }

  copyJson(): void {
    navigator.clipboard.writeText(JSON.stringify(this.results(), null, 2));
    this.snackBar.open('JSON copiado!', '', { duration: 2000 });
  }
}
