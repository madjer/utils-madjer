import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PoMenuModule, PoToolbarModule, PoMenuItem } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PoMenuModule, PoToolbarModule],
  template: `
    <po-toolbar p-title="Utilitários Madjer"></po-toolbar>
    <po-menu [p-menus]="menus" p-logo="logo.svg" p-short-logo="logo.svg"></po-menu>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  menus: PoMenuItem[] = [
    { label: 'Início',              link: '/',         icon: 'ph ph-house',     shortLabel: 'Início'  },
    { label: 'Gerador de CNPJ',     link: '/cnpj',     icon: 'ph ph-buildings', shortLabel: 'CNPJ'    },
    { label: 'Gerador de CPF',      link: '/cpf',      icon: 'ph ph-user',      shortLabel: 'CPF'     },
    { label: 'Formatador de XML',   link: '/xml',      icon: 'ph ph-code',      shortLabel: 'XML'     },
    { label: 'Markdown Viewer',     link: '/markdown', icon: 'ph ph-article',   shortLabel: 'MD'      },
    { label: 'Formatador de Texto', link: '/text',     icon: 'ph ph-text-t',    shortLabel: 'Texto'   },
  ];
}
