const routes = [
  {
    path: "/carrusel",
    meta: { label: "Carrusel" },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/DashboardSlides.vue"),
      },
      {
        path: "anadir-diapositiva",
        meta: {
          label: "Anadir diapositiva",
          hideBreadcrumb: true,
          noPadding: true,
        },
        component: () => import("pages/DashboardSlideForm.vue"),
      },
    ],
  },
  {
    path: "/login",
    meta: { label: "Candidatos y Evaluaciones" },
    component: () => import("pages/LoginPage.vue"),
  },
  {
    path: "/recuperar-contrasena",
    meta: { label: "Recuperar contrasena" },
    component: () => import("pages/ForgotPassword.vue"),
  },
  {
    path: "/restablecer-contrasena",
    meta: { label: "Restablecer contrasena" },
    component: () => import("pages/ResetPassword.vue"),
  },
  {
    path: "",
    meta: { label: "Home", icon: "home" },
    redirect: "/home",
    component: () => import("layouts/MainLayout.vue"),

    children: [
      {
        path: "/home",
        name: "index",
        meta: { label: "", hideBreadcrumb: true },
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "/notificaciones",
        meta: { label: "Notificaciones" },
        component: () => import("pages/NotificationsPage.vue"),
      },
      {
        path: "/usuarios",
        meta: { label: "Administracion de usuario" },
        component: () => import("pages/UsersPage.vue"),
      },
      {
        path: "/areas-de-trabajo",
        meta: { label: "Áreas de Trabajo" },
        component: () => import("pages/WorkAreasPage.vue"),
      },
      {
        path: "/puestos",
        meta: { label: "Puestos" },
        component: () => import("pages/RolesPage.vue"),
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
            meta: { label: "Evaluación", layout: "main" },
            component: () => import("pages/EvaluationForm.vue"),
            props: true,
          },
          {
            path: ":candidateId/entrevistar",
            meta: { label: "Entrevistar", layout: "main" },
            component: () => import("pages/InterviewForm.vue"),
            props: true,
          },
          {
            path: ":candidateId/kardexes",
            meta: { label: "Kardexes", layout: "main" },
            component: () => import("pages/KardexesPage.vue"),
            props: true,
          },
        ],
      },
      {
        path: "/beneficiarios",
        meta: { label: "Beneficiarios" },
        component: () => import("pages/BeneficiariesPage.vue"),
        children: [
          {
            path: ":candidateId/cuotas",
            meta: { label: "Configuracion de Cuotas", layout: "main" },
            component: () => import("pages/BeneficiariesCuotas.vue"),
            props: true,
          },
          {
            path: ":candidateId/cuotas/registrar",
            meta: { label: "Configuracion de Aporte", layout: "main" },
            component: () => import("pages/BeneficiariesCuota.vue"),
            props: true,
          },
          {
            path: ":candidateId/kardex",
            meta: { label: "Kardex", layout: "main" },
            component: () => import("pages/KardexPage.vue"),
            props: true,
          },
        ],
      },
      {
        path: "/padrinos",
        meta: { label: "Padrinos" },
        component: () => import("pages/SponsorsPage.vue"),
        children: [
          {
            path: "registrar",
            meta: { label: "Formato de Padrino / Madrina", layout: "main" },
            component: () => import("components/SponsorForm.vue"),
            props: true,
          },
          {
            path: ":sponsorId/ahijados",
            meta: { label: "Ahijados", layout: "main" },
            component: () => import("pages/PaymentConfigs.vue"),
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
