
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "preload": [
      "chunk-BEO6CGW4.js",
      "chunk-KZQKWR6U.js",
      "chunk-L2QAGXGE.js"
    ],
    "route": "/accueil"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-PHNFS6ER.js",
      "chunk-KZQKWR6U.js",
      "chunk-L2QAGXGE.js"
    ],
    "route": "/dashboard-etudiant"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-2P4FREL2.js",
      "chunk-L2QAGXGE.js"
    ],
    "route": "/dashboard-professeur"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-ZDUXIMBU.js",
      "chunk-KZQKWR6U.js",
      "chunk-L2QAGXGE.js"
    ],
    "route": "/dashboard-cfa"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-62RN35XT.js",
      "chunk-KZQKWR6U.js",
      "chunk-L2QAGXGE.js"
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
    'index.csr.html': {size: 1268, hash: 'f5f646ea7f51748864515caff5948a8b48ec2cb355c21f4952dd0cf016a0f2b8', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1670, hash: '91837fa95f73740b108c33b9bcef1a0598c04e83a5951b704f1678796cca3f8c', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'dashboard-professeur/index.html': {size: 2931, hash: '98f55d988ad8eea524edbcb538ff15c31389e008448facaf0cf78b286c0b8e52', text: () => import('./assets-chunks/dashboard-professeur_index_html.mjs').then(m => m.default)},
    'dashboard-etudiant/index.html': {size: 7988, hash: '0e00ba407b01cef96f8711cfc945ddd657037155db3f908e14854462dc2cf8ae', text: () => import('./assets-chunks/dashboard-etudiant_index_html.mjs').then(m => m.default)},
    'rapport-absence/index.html': {size: 6647, hash: 'e4bed35809a90923ba2c0e3f70cc684f70a88acb7985cfd0f1e100432a91b5bb', text: () => import('./assets-chunks/rapport-absence_index_html.mjs').then(m => m.default)},
    'accueil/index.html': {size: 5100, hash: 'c73e8c4d8e3da35b3cacc58f4953a9647cab057816a818b84e459e6870fd3260', text: () => import('./assets-chunks/accueil_index_html.mjs').then(m => m.default)},
    'generation-qr/index.html': {size: 2250, hash: '956ca7d99f85bb1de412434c3a2befc9e7689b1a296b42fffb150409589f9384', text: () => import('./assets-chunks/generation-qr_index_html.mjs').then(m => m.default)},
    'dashboard-cfa/index.html': {size: 5919, hash: '216f9135145b3e68b0b883512388473e7e1fb5fb71e17334db700b94da41c9c8', text: () => import('./assets-chunks/dashboard-cfa_index_html.mjs').then(m => m.default)},
    'styles-G57PP5LY.css': {size: 2596, hash: 'Q+8m3Bsw1iQ', text: () => import('./assets-chunks/styles-G57PP5LY_css.mjs').then(m => m.default)}
  },
};
