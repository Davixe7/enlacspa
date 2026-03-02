export default [
  {
    path: '/traslados/rubio',
    name: 'rides.rubio',
    meta: { label: 'Traslados Cuauhtémoc - Rubio', name: 'rides.rubio' },
    component: () => import('src/pages/RidesRubio.vue')
  },
  {
    path: '/traslados/equinoterapia',
    name: 'rides.equine',
    meta: { label: 'Traslados Equinoterapia', name: 'rides.equine' },
    component: () => import('src/pages/RidesEquinetherapy.vue')
  },
  {
    path: 'area/:categoryName/calificar',
    name: 'scores.create',
    props: true,
    meta: { label: 'Buscar beneficiario(s)' },
    component: () => import('pages/ScoreFormPage.vue')
  },
  {
    path: 'area/:categoryName/asistencias',
    name: 'attendance.index',
    meta: { label: 'Control de asistencias' },
    props: true,
    component: () => import('pages/AttendancePage.vue')
  },
  {
    path: 'logs',
    name: 'logs',
    component: () => import('pages/StatusHistory.vue')
  }
]
