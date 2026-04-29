import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'cnpj', loadComponent: () => import('./pages/cnpj-generator/cnpj-generator.component').then(m => m.CnpjGeneratorComponent) },
  { path: 'cpf', loadComponent: () => import('./pages/cpf-generator/cpf-generator.component').then(m => m.CpfGeneratorComponent) },
  { path: 'xml', loadComponent: () => import('./pages/xml-formatter/xml-formatter.component').then(m => m.XmlFormatterComponent) },
  { path: 'markdown', loadComponent: () => import('./pages/markdown-viewer/markdown-viewer.component').then(m => m.MarkdownViewerComponent) },
  { path: 'text', loadComponent: () => import('./pages/text-formatter/text-formatter.component').then(m => m.TextFormatterComponent) },
  { path: '**', redirectTo: '' }
];
