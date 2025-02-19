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
            path: "registrar",
            meta: { label: "Nuevo Candidato", layout: "main" },
            component: () => import("pages/CandidatoForm.vue"),
          },
          {
            path: ":candidateId/editar",
            meta: { label: "Editar Candidato", layout: "main" },
            component: () => import("pages/CandidatoForm.vue"),
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
