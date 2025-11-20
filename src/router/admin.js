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
    path: '/horarios-equinoterapia',
    meta: { label: 'Horarios de Equinoterapia' },
    component: () => import('src/pages/HorariosPage.vue')
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
  }
]
