export default [
  {
    path: '/notificaciones',
    meta: { label: 'Notificaciones' },
    component: () => import('src/pages/admin/NotificationsPage.vue')
  },
  {
    path: '/usuarios',
    meta: { label: 'Administracion de usuario' },
    component: () => import('src/pages/admin/UsersPage.vue')
  },
  {
    path: '/calendario',
    meta: { label: 'Calendario' },
    component: () => import('src/pages/admin/CalendarPage.vue')
  },
  {
    path: '/historia-clinica/:candidateId',
    name: 'HistoriaClinica',
    component: () => import('src/pages/MedicalRecordForm.vue'),
    meta: { label: 'Historia Clínica' },
    props: true
  },
  {
    path: '/soap/:candidateId',
    name: 'SOAP',
    meta: { label: 'SOAP' },
    component: () => import('src/pages/SoapForm.vue'),
    props: true
  },
  {
    path: '/horarios-equinoterapia',
    meta: { label: 'Horarios de Equinoterapia' },
    component: () => import('src/pages/admin/EquinetherapySchedule.vue')
  },
  {
    path: '/areas-de-trabajo',
    meta: { label: 'Áreas de Trabajo' },
    component: () => import('src/pages/admin/WorkAreasPage.vue')
  },
  {
    path: '/puestos',
    meta: { label: 'Puestos' },
    component: () => import('src/pages/admin/RolesPage.vue')
  },
  {
    path: '/carrusel',
    meta: { label: 'Carrusel' },
    component: () => import('src/pages/admin/DashboardSlides.vue')
  },
  {
    path: '/carrusel/anadir-diapositiva',
    meta: { label: 'Anadir diapositiva', hideBreadcrumb: true, noPadding: true },
    component: () => import('src/pages/admin/DashboardSlideForm.vue')
  },
  {
    path: '/actividades',
    name: 'actividades.index',
    meta: { label: 'Actividades' },
    component: () => import('src/pages/admin/ActivitiesPage.vue')
  },
  {
    path: '/programas',
    name: 'programas.index',
    meta: { label: 'Programas' },
    component: () => import('src/pages/admin/ProgramsPage.vue')
  },
  {
    path: 'radiomaraton-claves',
    component: () => import('src/pages/RadiomaratonKeys.vue')
  },
  {
    path: 'procuracion-fondos',
    component: () => import('src/pages/ProcurationActivitiesCatalog.vue')
  },
  {
    path: 'donors',
    component: () => import('src/pages/DonorsIndex.vue')
  }
]
