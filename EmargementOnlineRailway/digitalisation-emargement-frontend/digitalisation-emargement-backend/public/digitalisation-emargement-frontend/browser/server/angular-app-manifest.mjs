
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "preload": [
      "chunk-Q76KGTZT.js",
      "chunk-KZQKWR6U.js",
      "chunk-5GFQN4PI.js"
    ],
    "route": "/accueil"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-G7BZWQ6S.js",
      "chunk-KZQKWR6U.js",
      "chunk-5GFQN4PI.js"
    ],
    "route": "/dashboard-etudiant"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-D7TEGXIZ.js",
      "chunk-5GFQN4PI.js"
    ],
    "route": "/dashboard-professeur"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-IUOYFIDV.js",
      "chunk-KZQKWR6U.js",
      "chunk-5GFQN4PI.js"
    ],
    "route": "/dashboard-cfa"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-B2MYTHCB.js",
      "chunk-KZQKWR6U.js",
      "chunk-5GFQN4PI.js"
    ],
    "route": "/rapport-absence"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-E6N7PMQ5.js"
    ],
    "route": "/generation-qr"
  },
  {
    "renderMode": 2,
    "redirectTo": "/accueil",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1217, hash: 'c7a6fa6fbb380143bf59d0e8d178144e6bb63bc25154fba9f7b2bfa6c719c380', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1619, hash: '6267d576735eca1bc1cc920ebe310253b0405bc2cd4e8b19e38ccb7d2fb6aebe', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'dashboard-professeur/index.html': {size: 2880, hash: '10a90225ae16a4f60c2948d39c547e76ed09ee0eb2ef4db17100cdc9946e8162', text: () => import('./assets-chunks/dashboard-professeur_index_html.mjs').then(m => m.default)},
    'dashboard-etudiant/index.html': {size: 7937, hash: '5a42bb7c1c12ccde6f8c7a631564af9d52de16ffb04354334a15514d14ef15b6', text: () => import('./assets-chunks/dashboard-etudiant_index_html.mjs').then(m => m.default)},
    'accueil/index.html': {size: 5049, hash: '2a284064680d5133b0a902a9fba4633a2e1606837d114f5131dd255d993f70c3', text: () => import('./assets-chunks/accueil_index_html.mjs').then(m => m.default)},
    'dashboard-cfa/index.html': {size: 5868, hash: 'f9bde6fa1e5fa345f0c1c18a4900710e786de096a386a69a5cf5c27ce7fabdc4', text: () => import('./assets-chunks/dashboard-cfa_index_html.mjs').then(m => m.default)},
    'generation-qr/index.html': {size: 2199, hash: 'd010b0fd40df09f93c89d33e8073cc4d99e621c471f25e4e5675d10a0fbef833', text: () => import('./assets-chunks/generation-qr_index_html.mjs').then(m => m.default)},
    'rapport-absence/index.html': {size: 6596, hash: 'fe0ba1e6fe30ecb779dbd87e7f9ccaa1c174c68119c9f643c754fb9dd034e6e9', text: () => import('./assets-chunks/rapport-absence_index_html.mjs').then(m => m.default)},
    'styles-G57PP5LY.css': {size: 2596, hash: 'Q+8m3Bsw1iQ', text: () => import('./assets-chunks/styles-G57PP5LY_css.mjs').then(m => m.default)}
  },
};
