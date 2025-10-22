import { useAuthStore } from 'src/stores/user-store'

export default [
  {
    path: 'beneficiarios',
    name: 'beneficiaries',
    meta: { label: 'Admisiones y Beneficiarios' },
    redirect: { name: 'beneficiaries.index' },
    children: [
      {
        path: '',
        name: 'beneficiaries.index',
        component: () => import('src/pages/beneficiaries/BeneficiariesPage.vue'),
        meta: { label: 'Admisiones y Beneficiarios', hideBreadcrumbEl: true }
      },
      {
        path: ':candidateId',
        component: () => import('src/layouts/BeneficiaryLayout.vue'),
        meta: { hideBreadcrumbEl: true },
        props: true,
        children: [
          {
            path: 'perfil',
            meta: { label: 'Perfil' },
            name: 'beneficiaries.profile',
            component: () => import('src/pages/candidates/CandidateForm.vue'),
            props: (route) => ({
              candidateId: route.params.candidateId,
              notifications: false,
              evaluations: false,
              redirectTo: '/beneficiarios',
              readonly: !useAuthStore().can('beneficiaries.update')
            })
          },
          {
            path: 'evaluar',
            meta: { label: 'Evaluación' },
            name: 'beneficiaries.evaluate',
            component: () => import('src/pages/candidates/EvaluationForm.vue'),
            props: true
          },
          {
            path: 'cuotas',
            meta: { label: 'Configuración de Cuotas' },
            name: 'beneficiaries.balances',
            component: () => import('src/pages/beneficiaries/PaymentConfigDashboard.vue'),
            props: true
          },
          {
            path: 'control-de-cuotas',
            name: 'beneficiaries.balances.control',
            meta: { label: 'Gestionar pagos' },
            component: () => import('src/pages/beneficiaries/PaymentConfigControl.vue'),
            props: true
          },
          {
            path: 'registrar-padrino',
            meta: { label: 'Registrar Padrino' },
            name: 'beneficiaries.sponsors.create',
            component: () => import('components/SponsorForm.vue'),
            props: true
          },
          {
            path: 'padrinos/:sponsorId',
            meta: { label: 'Configurar Padrino' },
            name: 'beneficiaries.sponsors.show',
            component: () => import('src/pages/beneficiaries/PaymentConfigSetup.vue'),
            props: true
          },
          {
            path: 'kardex',
            meta: { label: 'Kardex' },
            name: 'beneficiaries.kardex.index',
            component: () => import('src/pages/beneficiaries/KardexPage.vue'),
            props: true
          },
          {
            path: 'citas',
            meta: { label: 'Citas' },
            name: 'beneficiaries.appointments.index',
            component: () => import('src/pages/candidates/AppointmentsPage.vue'),
            props: (route) => ({
              candidateId: route.params.candidateId,
              readonly: !useAuthStore().can('appointments.update')
            })
          },
          {
            path: 'planes',
            meta: { label: 'Programacion Individual' },
            name: 'programs',
            redirect: { name: 'programs.index' },
            children: [
              {
                path: '',
                name: 'programs.index',
                meta: { hideBreadcrumbEl: true },
                props: true,
                component: () => import('src/pages/BeneficiaryProgramsPage.vue')
              },
              {
                path: 'crear',
                name: 'programs.create',
                meta: { label: 'Elaborar Programa' },
                props: true,
                component: () => import('src/pages/ProgramForm.vue')
              },
              {
                path: ':planId',
                name: 'programs.show',
                meta: { label: 'Detalles del Programa Individual' },
                props: true,
                component: () => import('pages/ProgramPage.vue')
              },
              {
                path: ':planId/editar',
                name: 'programs.edit',
                meta: { label: 'Actualizar el Programa Individual' },
                props: true,
                component: () => import('pages/ProgramForm.vue')
              }
            ]
          }
        ]
      }
    ]
  }
]
