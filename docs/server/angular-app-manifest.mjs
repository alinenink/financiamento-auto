
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/financiamento-auto/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/financiamento-auto"
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
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 32229, hash: '24fcf4c4bd32a3aa85c2d83da4110d251cdcdd760297a345bb3b2b0cca080f3d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 19405, hash: '23852a1ad77dcc3331861b9e8f4e26676d51e4076c970566a3285159d94e4f85', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'home/index.html': {size: 34001, hash: 'c0269b148dd25b4538703e79786f95bd617948de502b422289870f5adc0f9ffe', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'index.html': {size: 48551, hash: 'bb03165f6c6d3684fb6dec0f890de66773cd1a18c0dbe06b21b90b3272f71512', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'quitar-contrato/index.html': {size: 32545, hash: 'd44a2886131b601dee54342a2e938a201907fa52cd8c3855d1fa861ff7367b23', text: () => import('./assets-chunks/quitar-contrato_index_html.mjs').then(m => m.default)},
    'gerar-boleto/index.html': {size: 35527, hash: '95a049c2c43f1c416372be53bb28af99e9c84ac2e16b0959f3a505739b05de92', text: () => import('./assets-chunks/gerar-boleto_index_html.mjs').then(m => m.default)},
    'adiantar-parcelas/index.html': {size: 32545, hash: 'd44a2886131b601dee54342a2e938a201907fa52cd8c3855d1fa861ff7367b23', text: () => import('./assets-chunks/adiantar-parcelas_index_html.mjs').then(m => m.default)},
    'styles-SXQX7HQP.css': {size: 117154, hash: 'L/US38UTgwI', text: () => import('./assets-chunks/styles-SXQX7HQP_css.mjs').then(m => m.default)}
  },
};
