export default [
  {
    path: '/beneficiarios',
    meta: { label: 'Admisiones y Beneficiarios' },
    component: () => import('src/layouts/BeneficiaryLayout.vue'),
    props: true,
    children: [
      {
        path: '',
        component: () => import('src/pages/beneficiaries/BeneficiariesPage.vue'),
        meta: { layout: 'main' }
      },
      {
        path: ':candidateId/perfil',
        meta: { label: 'Perfil', layout: 'main' },
        component: () => import('src/pages/candidates/CandidateForm.vue'),
        props: (route) => ({
          candidateId: route.params.candidateId,
          notifications: false,
          evaluations: false,
          redirectTo: '/beneficiarios'
        })
      },
      {
        path: ':candidateId/cuotas',
        meta: { label: 'Configuración de Cuotas' },
        component: () => import('src/pages/beneficiaries/PaymentConfigDashboard.vue'),
        props: true
      },
      {
        path: ':candidateId/configs',
        meta: { label: 'Gestionar pagos' },
        component: () => import('src/pages/beneficiaries/PaymentConfigControl.vue'),
        props: true
      },
      {
        path: ':candidateId/registrar-padrino',
        meta: { label: 'Registrar Padrino' },
        component: () => import('components/SponsorForm.vue'),
        props: true
      },
      {
        path: ':candidateId/padrinos/:sponsorId',
        meta: { label: 'Configurar Padrino' },
        component: () => import('src/pages/beneficiaries/PaymentConfigSetup.vue'),
        props: true
      },
      {
        path: ':candidateId/kardex',
        meta: { label: 'Kardex' },
        component: () => import('src/pages/beneficiaries/KardexPage.vue'),
        props: true
      },
      {
        path: ':candidateId/citas',
        meta: { label: 'Citas' },
        component: () => import('src/pages/candidates/AppointmentsPage.vue'),
        props: true
      }
    ]
  }
]
