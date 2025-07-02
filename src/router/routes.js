import beneficiary from './beneficiary'

const auth = [
  {
    path: '/login',
    meta: { label: 'Candidatos y Evaluaciones' },
    component: () => import('src/pages/auth/LoginPage.vue')
  },
  {
    path: '/recuperar-contrasena',
    meta: { label: 'Recuperar contrasena' },
    component: () => import('src/pages/auth/ForgotPassword.vue')
  },
  {
    path: '/restablecer-contrasena',
    meta: { label: 'Restablecer contrasena' },
    component: () => import('src/pages/auth/ResetPassword.vue')
  }
]

const candidates = [
  {
    path: '/candidatos',
    meta: { label: 'Candidatos y Evaluaciones' },
    component: () => import('src/pages/candidates/CandidatesPage.vue'),
    children: [
      {
        path: 'reportes',
        meta: { label: 'Reportes de candidatos', layout: 'main' },
        component: () => import('src/pages/candidates/CandidateReports.vue')
      },
      {
        path: 'registrar',
        meta: { label: 'Nuevo Candidato', layout: 'main' },
        component: () => import('src/pages/candidates/CandidateForm.vue')
      },
      {
        path: ':candidateId/editar',
        meta: { label: 'Editar Candidato', layout: 'main' },
        component: () => import('src/pages/candidates/CandidateForm.vue'),
        props: true
      },
      {
        path: ':candidateId/evaluar',
        meta: { label: 'Evaluación', layout: 'main' },
        component: () => import('src/pages/candidates/EvaluationForm.vue'),
        props: true
      },
      {
        path: ':candidateId/entrevistar',
        meta: { label: 'Entrevistar', layout: 'main' },
        component: () => import('src/pages/candidates/InterviewForm.vue'),
        props: true
      }
    ]
  }
]

const padrinos = [
  {
    path: '/padrinos',
    meta: { label: 'Padrinos' },
    name: 'sponsors.index',
    component: () => import('src/pages/sponsors/SponsorsPage.vue'),
    children: [
      {
        name: 'sponsors.create',
        path: 'registrar',
        meta: { label: 'Formato de Padrino / Madrina', layout: 'main' },
        component: () => import('components/SponsorForm.vue'),
        props: true
      },
      {
        name: 'sponsors.edit',
        path: ':sponsorId/editar',
        meta: { label: 'Editar padrino', layout: 'main' },
        component: () => import('components/SponsorForm.vue'),
        props: true
      },
      {
        path: ':sponsorId',
        meta: { label: 'Ahijados', layout: 'main' },
        component: () => import('src/pages/sponsors/SponsorPage.vue'),
        props: true
      }
    ]
  }
]

const routes = [
  ...auth,
  {
    path: '',
    meta: { label: 'Home', icon: 'home' },
    redirect: '/home',
    component: () => import('layouts/MainLayout.vue'),

    children: [
      {
        path: '/home',
        name: 'index',
        meta: { label: '', hideBreadcrumb: true },
        component: () => import('pages/IndexPage.vue')
      },
      ...candidates,
      ...padrinos,
      ...beneficiary
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
