import { defineBoot } from "#q-app/wrappers";
import axios from "axios";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    common: { Accept: "application/json" },
  },
});

export default defineBoot(({ app, router }) => {
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.status == 401) {
        router.push("/login");
      }
      if (error.status == 422) {
        Object.keys(error.response.data.errors).forEach((key) => {
          error.response.data.errors[key] = error.response.data.errors[key][0];
        });
        let formatted = error.response.data.errors;
        error.formatted = formatted;
      }
      return Promise.reject(error);
    },
  );

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
