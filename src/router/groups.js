export default {
  path: 'grupos',
  name: 'groups',
  meta: { label: 'Grupos' },
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
      component: () => import('pages/PlanForm.vue')
    },
    {
      path: ':groupId/planes/:planId',
      meta: { label: 'Detalles del plan grupal' },
      props: true,
      component: () => import('pages/PlanPage.vue')
    },
    {
      path: ':groupId/planes/:planId/editar',
      meta: { label: 'Actualizar plan grupal' },
      props: true,
      component: () => import('pages/PlanForm.vue')
    }
  ]
}
