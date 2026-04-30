import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },

  // Geradores
  { path: 'cnpj',      loadComponent: () => import('./pages/cnpj-generator/cnpj-generator.component').then(m => m.CnpjGeneratorComponent) },
  { path: 'cpf',       loadComponent: () => import('./pages/cpf-generator/cpf-generator.component').then(m => m.CpfGeneratorComponent) },
  { path: 'uuid',      loadComponent: () => import('./pages/uuid-generator/uuid-generator.component').then(m => m.UuidGeneratorComponent) },
  { path: 'password',  loadComponent: () => import('./pages/password-generator/password-generator.component').then(m => m.PasswordGeneratorComponent) },
  { path: 'fake-data', loadComponent: () => import('./pages/fake-data/fake-data.component').then(m => m.FakeDataComponent) },
  { path: 'cep',       loadComponent: () => import('./pages/cep-lookup/cep-lookup.component').then(m => m.CepLookupComponent) },

  // Formatadores
  { path: 'xml',           loadComponent: () => import('./pages/xml-formatter/xml-formatter.component').then(m => m.XmlFormatterComponent) },
  { path: 'json-formatter',loadComponent: () => import('./pages/json-formatter/json-formatter.component').then(m => m.JsonFormatterComponent) },
  { path: 'sql-formatter', loadComponent: () => import('./pages/sql-formatter/sql-formatter.component').then(m => m.SqlFormatterComponent) },
  { path: 'minifier',      loadComponent: () => import('./pages/minifier/minifier.component').then(m => m.MinifierComponent) },
  { path: 'markdown',      loadComponent: () => import('./pages/markdown-viewer/markdown-viewer.component').then(m => m.MarkdownViewerComponent) },
  { path: 'text',          loadComponent: () => import('./pages/text-formatter/text-formatter.component').then(m => m.TextFormatterComponent) },

  // Conversores
  { path: 'json-xml', loadComponent: () => import('./pages/json-xml/json-xml.component').then(m => m.JsonXmlComponent) },
  { path: 'json-csv', loadComponent: () => import('./pages/json-csv/json-csv.component').then(m => m.JsonCsvComponent) },
  { path: 'base64',   loadComponent: () => import('./pages/base64/base64.component').then(m => m.Base64Component) },
  { path: 'units',    loadComponent: () => import('./pages/unit-converter/unit-converter.component').then(m => m.UnitConverterComponent) },

  // Codificação
  { path: 'url-encode',     loadComponent: () => import('./pages/url-encode/url-encode.component').then(m => m.UrlEncodeComponent) },
  { path: 'html-entities',  loadComponent: () => import('./pages/html-entities/html-entities.component').then(m => m.HtmlEntitiesComponent) },
  { path: 'hash',           loadComponent: () => import('./pages/hash/hash.component').then(m => m.HashComponent) },

  // Dev Tools
  { path: 'validator', loadComponent: () => import('./pages/validator/validator.component').then(m => m.ValidatorComponent) },
  { path: 'jwt',       loadComponent: () => import('./pages/jwt-decoder/jwt-decoder.component').then(m => m.JwtDecoderComponent) },
  { path: 'curl',      loadComponent: () => import('./pages/curl-converter/curl-converter.component').then(m => m.CurlConverterComponent) },

  { path: '**', redirectTo: '' }
];
