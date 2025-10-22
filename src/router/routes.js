import admin from './admin'
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
    name: 'candidates',
    redirect: { name: 'candidates.index' },
    children: [
      {
        path: '',
        component: () => import('src/pages/candidates/CandidatesPage.vue'),
        meta: { hideBreadcrumbEl: true },
        name: 'candidates.index'
      },
      {
        path: 'reportes',
        meta: { label: 'Reportes de candidatos' },
        component: () => import('src/pages/candidates/CandidateReports.vue'),
        name: 'candidates.reports'
      },
      {
        path: 'registrar',
        meta: { label: 'Nuevo Candidato' },
        component: () => import('src/pages/candidates/CandidateForm.vue'),
        name: 'candidates.create'
      },
      {
        path: ':candidateId/editar',
        meta: { label: 'Editar Candidato' },
        component: () => import('src/pages/candidates/CandidateForm.vue'),
        props: true,
        name: 'candidates.edit'
      },
      {
        path: ':candidateId/evaluar',
        meta: { label: 'Evaluación' },
        component: () => import('src/pages/candidates/EvaluationForm.vue'),
        props: true,
        name: 'candidates.evaluate'
      },
      {
        path: ':candidateId/entrevistar',
        meta: { label: 'Entrevistar' },
        component: () => import('src/pages/candidates/InterviewForm.vue'),
        props: true,
        name: 'candidates.interview'
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
        meta: { label: 'Formato de Padrino / Madrina' },
        component: () => import('components/SponsorForm.vue'),
        props: true
      },
      {
        name: 'sponsors.edit',
        path: ':sponsorId/editar',
        meta: { label: 'Editar padrino' },
        component: () => import('components/SponsorForm.vue'),
        props: true
      },
      {
        path: ':sponsorId',
        meta: { label: 'Ahijados' },
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
    name: 'home.home',
    redirect: '/home',
    component: () => import('layouts/MainLayout.vue'),

    children: [
      {
        path: '/home',
        name: 'index',
        meta: { label: '', hideBreadcrumb: true },
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: '/tesoreria',
        name: 'financial',
        meta: { label: 'Tesoreria', hideBreadcrumb: false },
        component: () => import('pages/FinancialPage.vue')
      },
      {
        path: '/tesoreria/:candidateId',
        name: 'financial.control',
        meta: { label: 'Tesoreria / Control de Cuotas', hideBreadcrumb: false },
        component: () => import('pages/FinancialControl.vue'),
        props: true
      },
      {
        path: '/tesoreria/:candidateId/historial',
        name: 'financial.history',
        meta: { label: 'Tesoreria / Historial de pagos', hideBreadcrumb: false },
        component: () => import('pages/FinancialHistory.vue'),
        props: true
      },
      ...admin,
      ...candidates,
      ...padrinos,
      ...beneficiary,
      {
        path: 'actividades',
        name: 'actividades.index',
        meta: { label: 'Actividades' },
        component: () => import('pages/ActivitiesPage.vue')
      },
      {
        path: '/grupos',
        meta: { label: 'Grupos' },
        name: 'groups',
        redirect: { name: 'groups.index' },
        children: [
          {
            path: 'catalogo',
            name: 'groups.index',
            meta: { hideBreadcrumbEl: true },
            component: () => import('pages/GroupsPage.vue')
          },
          {
            path: 'crear',
            name: 'groups.create',
            meta: { label: 'Crear grupo' },
            props: true,
            component: () => import('pages/GroupsForm.vue')
          },
          {
            path: ':groupId',
            name: 'groups.show',
            meta: { label: 'Detalles del grupo' },
            props: true,
            component: () => import('src/pages/GroupProgramsPage.vue')
          },
          {
            path: ':groupId/editar',
            name: 'groups.edit',
            meta: { label: 'Editar grupo' },
            props: true,
            component: () => import('pages/GroupsForm.vue')
          },
          // PLANES GRUPALES
          {
            path: ':groupId/planes/crear',
            meta: { label: 'Agregar plan al grupo' },
            props: true,
            component: () => import('pages/ProgramForm.vue')
          },
          {
            path: ':groupId/planes/:planId',
            meta: { label: 'Detalles del plan grupal' },
            props: true,
            component: () => import('pages/ProgramPage.vue')
          },
          {
            path: ':groupId/planes/:planId/editar',
            meta: { label: 'Actualizar plan grupal' },
            props: true,
            component: () => import('pages/ProgramForm.vue')
          }
        ]
      }
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
