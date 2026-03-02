export default {
  path: '/candidatos',
  meta: { label: 'Candidatos y Evaluaciones' },
  name: 'candidates',
  redirect: { name: 'candidates.index' },
  children: [
    {
      path: '',
      component: () => import('src/pages/candidates/CandidatesPage.vue'),
      meta: { hideBreadcrumbEl: true },
      name: 'candidates.index'
    },
    {
      path: 'reportes',
      meta: { label: 'Reportes de candidatos' },
      component: () => import('src/pages/candidates/CandidateReports.vue'),
      name: 'candidates.reports'
    },
    {
      path: 'registrar',
      meta: { label: 'Nuevo Candidato' },
      component: () => import('src/pages/candidates/CandidateForm.vue'),
      name: 'candidates.create'
    },
    {
      path: ':candidateId/editar',
      meta: { label: 'Editar Candidato' },
      component: () => import('src/pages/candidates/CandidateForm.vue'),
      props: true,
      name: 'candidates.edit'
    },
    {
      path: ':candidateId/evaluar',
      meta: { label: 'Evaluación' },
      component: () => import('src/pages/candidates/EvaluationForm.vue'),
      props: true,
      name: 'candidates.evaluate'
    },
    {
      path: ':candidateId/entrevistar',
      meta: { label: 'Entrevistar' },
      component: () => import('src/pages/candidates/InterviewForm.vue'),
      props: true,
      name: 'candidates.interview'
    }
  ]
}
