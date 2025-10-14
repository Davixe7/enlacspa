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
      {
        path: '/notificaciones',
        name: 'notifications',
        meta: { label: 'Notificaciones', hideBreadcrumb: true },
        component: () => import('pages/admin/NotificationsPage.vue')
      },
      {
        path: '/usuarios',
        name: 'users',
        meta: { label: 'Usuarios', hideBreadcrumb: true },
        component: () => import('pages/admin/UsersPage.vue')
      },
      {
        path: '/puestos',
        name: 'places',
        meta: { label: 'Puestos', hideBreadcrumb: true },
        component: () => import('pages/admin/RolesPage.vue')
      },
      {
        path: '/areas-de-trabajo',
        name: 'workareas',
        meta: { label: 'Areas de trabajo', hideBreadcrumb: true },
        component: () => import('pages/admin/WorkAreasPage.vue')
      },
      {
        path: '/carrusel',
        name: 'carrusel',
        meta: { label: 'Carrusel', hideBreadcrumb: true },
        component: () => import('pages/admin/DashboardSlides.vue')
      },
      {
        path: '/anadir-diapositiva',
        name: 'carrusel.addSlide',
        meta: { label: 'Agregar diapositiva', hideBreadcrumb: true },
        component: () => import('pages/admin/DashboardSlideForm.vue')
      },
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
        path: 'beneficiarios/:candidateId/programas',
        name: 'programs.index',
        meta: { label: 'Programas' },
        props: true,
        component: () => import('src/pages/BeneficiaryProgramsPage.vue')
      },
      {
        path: 'beneficiarios/:candidateId/grupos/:groupId/planes/crear',
        name: 'programs.create',
        meta: { label: 'Elaborar Programa' },
        props: true,
        component: () => import('pages/ProgramForm.vue')
      },
      {
        path: 'planes/:programId',
        name: 'programs.show',
        meta: { label: 'Detalles del Programa' },
        props: true,
        component: () => import('pages/ProgramPage.vue')
      },
      {
        path: 'planes/crear',
        name: 'plans.create',
        meta: { label: 'Crear programa' },
        props: true,
        component: () => import('pages/ProgramForm.vue')
      },
      {
        path: 'planes/:planId/editar',
        name: 'plans.edit',
        meta: { label: 'Editar plan' },
        props: true,
        component: () => import('pages/ProgramForm.vue')
      },
      {
        path: '/grupos',
        meta: { label: 'Grupos' },
        component: () => import('pages/GroupsPage.vue'),
        children: [
          {
            path: 'catalogo',
            meta: { label: 'Catalogo', layout: 'main' },
            component: () => import('pages/GroupsPage.vue')
          },
          {
            path: 'crear',
            meta: { label: 'Crear grupo', layout: 'main' },
            props: true,
            component: () => import('pages/GroupsForm.vue')
          },
          {
            path: ':groupId',
            meta: { label: 'Detalles del grupo', layout: 'main' },
            props: true,
            component: () => import('src/pages/GroupProgramsPage.vue')
          },
          {
            path: ':groupId/editar',
            meta: { label: 'Editar grupo', layout: 'main' },
            props: true,
            component: () => import('pages/GroupsForm.vue')
          },
          {
            path: ':groupId/planes/crear',
            meta: { label: 'Agregar plan al grupo', layout: 'main' },
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
