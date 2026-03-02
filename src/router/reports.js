export default {
  path: '/reportes',
  meta: { label: 'Reportes', name: 'reports.index' },
  name: 'reports',
  redirect: { name: 'reports.index' },
  children: [
    {
      path: '',
      name: 'reports.index',
      meta: { label: 'Menu', name: 'reports.index' },
      component: () => import('pages/reports/ReportsIndex.vue')
    },
    {
      path: 'traslados/rubio',
      name: 'reports.rides.rubio',
      meta: { label: 'Traslados Cuauhtemoc - Rubio' },
      component: () => import('pages/reports/RidesReport.vue')
    },
    {
      path: 'individual',
      name: 'reports.individual',
      meta: { label: 'Bitácora Individual del Beneficiario' },
      component: () => import('pages/reports/IndividualReport.vue')
    },
    {
      path: 'incidencias',
      name: 'reports.issues',
      meta: { label: 'Reporte de Incidencias' },
      component: () => import('pages/reports/IssuesReport.vue')
    },
    {
      path: 'ejecutivo',
      name: 'reports.executive',
      meta: { label: 'Reporte Ejecutivo' },
      component: () => import('pages/reports/ExcecutiveReport.vue')
    },
    {
      path: 'operativo',
      name: 'reports.operative',
      meta: { label: 'Tablero de indicadores operativos' },
      component: () => import('pages/reports/GeneralReport.vue')
    },
    {
      path: 'asistencias',
      name: 'reports.attendances',
      meta: { label: 'Reporte de Asistencias & Faltas Diarias' },
      component: () => import('pages/reports/AttendanceReport.vue')
    }
  ]
}
