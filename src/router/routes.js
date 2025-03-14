const routes = [
  {
    path: "/login",
    meta: { label: "Candidatos y Evaluaciones" },
    component: () => import("pages/LoginPage.vue"),
  },
  {
    path: "/",
    meta: { label: "Home", icon: "home" },
    component: () => import("layouts/MainLayout.vue"),

    children: [
      {
        path: "/home",
        meta: { label: "" },
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "/candidatos",
        meta: { label: "Candidatos y Evaluaciones" },
        component: () => import("pages/CandidatosPage.vue"),
        children: [
          {
            path: "reportes",
            meta: { label: "Reportes de candidatos", layout: "main" },
            component: () => import("pages/CandidateReports.vue"),
          },
          {
            path: "registrar",
            meta: { label: "Nuevo Candidato", layout: "main" },
            component: () => import("pages/CandidateForm.vue"),
          },
          {
            path: ":candidateId/editar",
            meta: { label: "Editar Candidato", layout: "main" },
            component: () => import("pages/CandidateForm.vue"),
            props: true,
          },
          {
            path: ":candidateId/evaluar",
            meta: { label: "Evaluacion", layout: "main" },
            component: () => import("pages/EvaluationForm.vue"),
            props: true,
          },
          {
            path: ":candidateId/entrevistar",
            meta: { label: "Entrevistar", layout: "main" },
            component: () => import("pages/InterviewForm.vue"),
            props: true,
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
