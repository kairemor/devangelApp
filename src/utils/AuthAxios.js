import axios from "axios";
import cookie from "cookie-machine";
import baseUrl from "./apiBaseUrl";

const AuthAxios = axios.create();

AuthAxios.interceptors.request.use(
  config => {
    const token = cookie.get("jwt_access_token");
    if (token != null) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

// Access token refresh interceptor
AuthAxios.interceptors.response.use(
  response => {
    return response;
  },
  function(error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = cookie.get("jwt_access_token");
      return axios
        .post(
          baseUrl + "/api/users/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          }
        )
        .then(res => {
          console.log("res: ", res);
          if (res.status === 200) {
            const token = res.data.access_token;
            cookie.set("jwt_access_token", token, { path: "/" });
            AuthAxios.defaults.headers.Authorization = `Bearer ${token}`;
            // return originalRequest object with Axios.
            return AuthAxios(originalRequest);
          }
        })
        .catch(err => {
          cookie.remove("jwt_access_token");
          console.log("err: ", err);
          return Promise.reject(err);
        });
    } else {
      return Promise.reject(error);
    }
  }
);

export default AuthAxios;
