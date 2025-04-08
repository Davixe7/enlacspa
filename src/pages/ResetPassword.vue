<script setup>
import { ref } from "vue";
import { Notify } from "quasar";
import { useRoute } from "vue-router";
import { api } from "src/boot/axios";

const baseUrl = new URL(api.defaults.baseURL).origin;
const route = useRoute()
var { token, email } = route.query;
const newPassword = ref("");
const confirmPassword = ref("");

const loading = ref(false)

const submitForm = async () => {
  if (!newPassword.value || !confirmPassword.value || !token || !email) return
  let data = {
    token,
    email,
    password: newPassword.value,
    password_confirmation: confirmPassword.value
  }
  try {
    loading.value = true
    await api.post(`${baseUrl}/reset-password`, data)
    Notify.create({ type: "positive", message: "Contraseña restablecida correctamente", });
    newPassword.value = "";
    confirmPassword.value = "";
    token = "";
    email = "";
  }
  catch (error) {
    console.log(error)
  }
  loading.value = false
};
</script>

<template>
  <div class="row login-row">
    <div class="col-12 col-md-6 login-brand-column">
      <img
        src="./../assets/logo_white.png"
        alt=""
      />
    </div>

    <div class="col-12 col-md-6 flex items-center login-form-column">
      <q-card flat>
        <q-card-section>
          <router-link to="/login">
            <q-icon
              name="arrow_back"
              size="32px"
            ></q-icon>
          </router-link>
          <h1 class="title">ENLAC</h1>
          <div class="subtitle">Restablecer Contraseña</div>
        </q-card-section>

        <q-card-section>
          <q-form
            @submit="submitForm"
            class="q-gutter-y-md"
          >
            <!-- Nueva contraseña -->
            <q-input
              v-model="newPassword"
              label="Nueva Contraseña"
              stack-label
              outlined
              type="password"
              :rules="[val => val.length >= 8 || 'Debe tener al menos 8 caracteres']"
              clearable
              hide-bottom-space
            />

            <!-- Confirmación de contraseña -->
            <q-input
              v-model="confirmPassword"
              label="Confirmar Contraseña"
              stack-label
              outlined
              type="password"
              :rules="[val => val === newPassword || 'Las contraseñas deben coincidir']"
              clearable
              hide-bottom-space
            />

            <!-- Botón para enviar -->
            <q-btn
              label="Restablecer Contraseña"
              color="primary"
              class="full-width q-mt-md"
              type="submit"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss">
.login-form-column>div {
  flex: 1 1 auto;
}

.login-brand-column {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(30vh) !important;
  background: radial-gradient(rgb(1, 119, 193), rgba(0, 43, 106));
}

.login-brand-column img {
  height: 75%;
}

.title {
  color: #001f6d;
  font-size: 38px;
  font-weight: 700;
  line-height: 1.3rem;
  letter-spacing: 0;
}

.subtitle {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3rem;
  color: #111827;
}

a {
  font-size: 14px;
  text-decoration: none;
  color: rgba(0, 31, 109, 1);
}

.q-checkbox__inner {
  width: 32px !important;
  min-width: 32px;
  height: 32px !important;
}

@media (min-width: 1024px) {
  .login-row {
    height: 100vh;
  }

  .login-form-column {
    order: 1;
    padding-left: 100px;

    >div {
      max-width: 370px;
    }
  }

  .row .login-brand-column {
    order: 2;
    height: 100% !important;
  }

  .row .login-brand-column img {
    height: auto;
  }

}
</style>
