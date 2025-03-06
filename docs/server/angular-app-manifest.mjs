
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/financiamento-auto/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/financiamento-auto/login",
    "route": "/financiamento-auto"
  },
  {
    "renderMode": 2,
    "route": "/financiamento-auto/login"
  },
  {
    "renderMode": 2,
    "route": "/financiamento-auto/home"
  },
  {
    "renderMode": 2,
    "route": "/financiamento-auto/gerar-boleto"
  },
  {
    "renderMode": 2,
    "route": "/financiamento-auto/adiantar-parcelas"
  },
  {
    "renderMode": 2,
    "route": "/financiamento-auto/quitar-contrato"
  },
  {
    "renderMode": 2,
    "redirectTo": "/financiamento-auto/Login",
    "route": "/financiamento-auto/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 32229, hash: '38798cb2f0ed31e77fb27484f86b3251608d5cdbe94b2540a908ae5ab3860b1e', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 19405, hash: 'c987f3661cc84b2207f69840e2fdcebe87f9fde25a8db295bd436432cab2691c', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'home/index.html': {size: 34001, hash: '1c5664c035e7f1f4dbc2c2f30d344773b13d17eb335e8d2bb6e0bcbf1c79ceff', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'gerar-boleto/index.html': {size: 35527, hash: 'dd6d2c2e8d8ffa74107b28ca26228b16081599eda1c7a31a708bc1482e79847f', text: () => import('./assets-chunks/gerar-boleto_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 48551, hash: 'f6a5f4c0645e3c512458fb30e589f412c8d4c402327b0ac43b9fa2c0b1e0ab69', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'quitar-contrato/index.html': {size: 32545, hash: '3e82de86bdcf1e4788a561a3011a6e8666a4eb5b47761df3b3faa1219c0a6a36', text: () => import('./assets-chunks/quitar-contrato_index_html.mjs').then(m => m.default)},
    'adiantar-parcelas/index.html': {size: 32545, hash: '3e82de86bdcf1e4788a561a3011a6e8666a4eb5b47761df3b3faa1219c0a6a36', text: () => import('./assets-chunks/adiantar-parcelas_index_html.mjs').then(m => m.default)},
    'styles-SXQX7HQP.css': {size: 117154, hash: 'L/US38UTgwI', text: () => import('./assets-chunks/styles-SXQX7HQP_css.mjs').then(m => m.default)}
  },
};
