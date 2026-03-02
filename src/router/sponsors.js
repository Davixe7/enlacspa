export default {
  path: '/padrinos',
  meta: { label: 'Padrinos' },
  redirect: { name: 'sponsors.index' },
  children: [
    {
      name: 'sponsors.index',
      path: '',
      meta: { label: 'Padrinos' },
      component: () => import('pages/sponsors/SponsorsPage.vue'),
      props: true
    },
    {
      name: 'sponsors.create',
      path: 'registrar',
      meta: { label: 'Formato de Padrino / Madrina' },
      component: () => import('components/SponsorForm.vue'),
      props: true
    },
    {
      name: 'sponsors.edit',
      path: ':sponsorId/editar',
      meta: { label: 'Editar padrino' },
      component: () => import('components/SponsorForm.vue'),
      props: true
    },
    {
      path: ':sponsorId',
      meta: { label: 'Ahijados' },
      component: () => import('src/pages/sponsors/SponsorPage.vue'),
      props: true
    }
  ]
}
