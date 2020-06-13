import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import cookie from "cookie-machine";
import AuthAxios from "../../utils/AuthAxios";
import baseUrl from "../../utils/apiBaseUrl";

const usersSlice = createSlice({
  name: "users",
  initialState: {
    loading: false,
    loggedIn: false,
    userDetails: null,
    loginRequiredModalOpen: false,
    loginModalOpen: false,
    registerModalOpen: false,
    loginError: false,
    duplicateUsernameError: false,
    duplicateEmailError: false,
    registerError: false
  },
  reducers: {
    userLoading(state, action) {
      state.loading = true;
      state.loginError = false;
      state.registerError = false;
      state.duplicateEmailError = false;
      state.duplicateUsernameError = false;
    },
    userLogin(state, action) {
      state.userDetails = action.payload.user_details;
      state.loading = false;
      state.loggedIn = true;
      state.loginModalOpen = false;
      state.registerModalOpen = false;
      state.loginRequiredModalOpen = false;
    },
    userLogout(state, action) {
      state.userDetails = null;
      state.loggedIn = false;
    },
    showLoginRequiredModal(state, action) {
      state.loginRequiredModalOpen = action.payload;
    },
    showLoginModal(state, action) {
      state.loginModalOpen = action.payload;
    },
    showRegisterModal(state, action) {
      state.registerModalOpen = action.payload;
    },
    setLoginError(state, action) {
      state.loginError = action.payload;
    },
    setRegisterError(state, action) {
      state.registerError = action.payload.error;
      if (action.payload.message.indexOf("DuplicateUsernameError") !== -1) {
        state.duplicateUsernameError = true;
      }
      if (action.payload.message.indexOf("DuplicateEmailError") !== -1) {
        state.duplicateEmailError = true;
      }
    }
  }
});

export const {
  userLoading,
  userLogin,
  userLogout,
  showLoginRequiredModal,
  showLoginModal,
  showRegisterModal,
  setLoginError,
  setRegisterError
} = usersSlice.actions;

export const loginUser = (email, password) => async dispatch => {
  dispatch(userLoading());
  setLoginError(false);
  try {
    const response = await axios.post(baseUrl + "/api/users/login", {
      email,
      password
    });
    cookie.set("jwt_access_token", response.data.access_token, { path: "/" });
    dispatch(userLogin(response.data));
  } catch (err) {
    dispatch(setLoginError(true));
  }
};

export const registerUser = (username, email, password) => async dispatch => {
  dispatch(userLoading());
  try {
    const response = await axios.post(baseUrl + "/api/users/register", {
      username,
      email,
      password
    });
    cookie.set("jwt_access_token", response.data.access_token, { path: "/" });
    dispatch(userLogin(response.data));
  } catch (err) {
    console.log("err: ", err.response);
    // if (err.response.data.error) {
    dispatch(
      setRegisterError({ error: true, message: err.response.data.error })
    );
    // }
  }
};

export const getUserProfile = () => async dispatch => {
  const token = cookie.get("jwt_access_token");
  if (!token) {
    return;
  }
  dispatch(userLoading());
  try {
    const response = await AuthAxios.post(baseUrl + "/api/users/profile");
    dispatch(userLogin(response.data));
  } catch (err) {}
};

export const logoutUser = () => async dispatch => {
  cookie.remove("jwt_access_token", { path: "/" });
  dispatch(userLogout());
};

export default usersSlice.reducer;
