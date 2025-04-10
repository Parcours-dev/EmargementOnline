
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/accueil",
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-4KTC5UZ4.js",
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
    'index.csr.html': {size: 1217, hash: '071815a5f6c6a5236b55837f629a9e9e56feb5a4b21f0ef8920e97b693fc61d0', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1619, hash: 'ce0b21105ab16c658ece4caa7d759e8effe3ac7bcef964b48005a3f28a39f2b2', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'dashboard-professeur/index.html': {size: 2880, hash: '91ec7927d2ec4e14add9fb025f6dbd402691e32147bc6036597c913496b66840', text: () => import('./assets-chunks/dashboard-professeur_index_html.mjs').then(m => m.default)},
    'dashboard-etudiant/index.html': {size: 7937, hash: '053634ff2a022cff9eb8c2cea07f2ebe62fb3c6b0080a3aa39da1985e2f31fae', text: () => import('./assets-chunks/dashboard-etudiant_index_html.mjs').then(m => m.default)},
    'dashboard-cfa/index.html': {size: 5868, hash: '2d2f6d52c8b2a4275c565845c1034240f63b4c3862f989f56e44745a5169626a', text: () => import('./assets-chunks/dashboard-cfa_index_html.mjs').then(m => m.default)},
    'rapport-absence/index.html': {size: 6596, hash: 'c36f717be70a9f884eb35b72745f9fdd214306ee5ab5d29f105a7df9c023354d', text: () => import('./assets-chunks/rapport-absence_index_html.mjs').then(m => m.default)},
    'generation-qr/index.html': {size: 2199, hash: 'e5633178691855e6ae54f9cae8021f0b225158d8179eb3f15a08f9e6ed3c3464', text: () => import('./assets-chunks/generation-qr_index_html.mjs').then(m => m.default)},
    'accueil/index.html': {size: 5049, hash: 'c45ae7f54847ef172a0f5f9703abea9d0004bf7d166e8a2bedecf60b98dd0ba5', text: () => import('./assets-chunks/accueil_index_html.mjs').then(m => m.default)},
    'styles-G57PP5LY.css': {size: 2596, hash: 'Q+8m3Bsw1iQ', text: () => import('./assets-chunks/styles-G57PP5LY_css.mjs').then(m => m.default)}
  },
};
