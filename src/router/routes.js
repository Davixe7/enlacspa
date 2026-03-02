import admin from './admin'
import candidates from './candidates'
import beneficiary from './beneficiary'
import financial from './financial'
import sponsors from './sponsors'
import groups from './groups'
import reports from './reports'
import employee from './employee'

export default [
  {
    path: '',
    meta: { label: 'Home', icon: 'home' },
    name: 'home.home',
    redirect: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/home',
        name: 'index',
        meta: { label: '' },
        component: () => import('pages/BaseHome.vue')
      },
      {
        path: 'beneficiarios',
        name: 'beneficiaries.index',
        component: () => import('src/pages/beneficiaries/BeneficiariesPage.vue'),
        meta: { label: 'Admisiones y Beneficiarios' }
      },
      ...admin,
      candidates,
      beneficiary,
      financial,
      sponsors,
      groups,
      reports,
      ...employee
    ]
  },
  {
    path: '/login',
    meta: { label: 'Candidatos y Evaluaciones' },
    component: () => import('src/pages/auth/LoginPage.vue')
  },
  {
    path: '/empleados/login',
    meta: { label: 'Acceso de Empleados' },
    component: () => import('src/pages/auth/LoginTwo.vue')
  },
  {
    path: '/recuperar-contrasena',
    meta: { label: 'Recuperar contrasena' },
    component: () => import('src/pages/auth/ForgotPassword.vue')
  },
  {
    path: '/restablecer-contrasena',
    meta: { label: 'Restablecer contrasena' },
    component: () => import('src/pages/auth/ResetPassword.vue')
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]
