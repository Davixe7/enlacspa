import { useAuthStore } from 'src/stores/user-store'

/* {
  path: 'reportes',
  meta: { label: 'Reportes de Beneficiarios' },
  component: () => import('src/pages/beneficiaries/BeneficiariesReports.vue'),
  name: 'beneficiaries.reports'
}, */

export default {
  path: 'beneficiarios/:candidateId',
  name: 'beneficiaries.layout',
  component: () => import('src/layouts/BeneficiaryLayout.vue'),
  meta: { label: 'Admisiones y Beneficiarios', name: 'beneficiaries.index' },
  props: true,
  children: [
    {
      path: 'reportes',
      name: 'beneficiary.reports',
      component: () => import('src/pages/reports/BeneficiaryReports.vue'),
      meta: { label: 'Reportes de programas del beneficiario' },
      props: true
    },
    {
      path: 'perfil',
      name: 'beneficiaries.profile',
      component: () => import('src/pages/candidates/CandidateForm.vue'),
      meta: { label: 'Perfil' },
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
      name: 'beneficiaries.evaluate',
      component: () => import('src/pages/candidates/EvaluationForm.vue'),
      meta: { label: 'Evaluación' },
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
      meta: { label: 'Gestionar pagos' },
      name: 'beneficiaries.balances.control',
      component: () => import('src/pages/beneficiaries/PaymentConfigControl.vue'),
      props: true
    },
    {
      path: 'padrinos/crear',
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
          component: () => import('src/pages/PlanForm.vue')
        },
        {
          path: ':planId',
          name: 'programs.show',
          meta: { label: 'Detalles del Programa Individual' },
          props: true,
          component: () => import('pages/PlanPage.vue')
        },
        {
          path: ':planId/editar',
          name: 'programs.edit',
          meta: { label: 'Actualizar el Programa Individual' },
          props: true,
          component: () => import('pages/PlanForm.vue')
        }
      ]
    }
  ]
}
