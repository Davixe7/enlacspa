export default {
  path: '/tesoreria',
  name: 'financial',
  meta: { label: 'Tesorería' },
  redirect: { name: 'financial.index' },
  children: [
    {
      path: '',
      name: 'financial.index',
      component: () => import('pages/FinancialPage.vue'),
      meta: { label: 'Tesoreria' }
    },
    {
      path: '/tesoreria/:candidateId',
      name: 'financial.control',
      meta: { label: 'Tesorería / Control de Cuotas' },
      component: () => import('pages/FinancialControl.vue'),
      props: true
    },
    {
      path: '/tesoreria/:candidateId/historial',
      name: 'financial.history',
      meta: { label: 'Tesorería / Historial de pagos' },
      component: () => import('pages/FinancialHistory.vue'),
      props: true
    }
  ]
}
