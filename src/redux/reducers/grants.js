import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import baseUrl from "../../utils/apiBaseUrl";

const grantsSlice = createSlice({
  name: "grants",
  initialState: {
    loading: false,
    grants: [],
    totalGrantsCount: 0,
    categories: []
  },
  reducers: {
    grantsLoading(state, action) {
      state.loading = true;
    },
    grantsReceived(state, action) {
      state.grants = action.payload.grants;
      state.categories = action.payload.categories;
      state.loading = false;
      state.totalGrantsCount = action.payload.total_grants;
    }
  }
});

export const { grantsLoading, grantsReceived } = grantsSlice.actions;

export const fetchGrants = (info, category = "all") => async dispatch => {
  let page = 1;
  if (info && info.current) {
    page = info.current;
  }
  dispatch(grantsLoading());
  const response = await axios.get(
    baseUrl + `/api/grants?page=${page}&category=${category}`
  );
  dispatch(grantsReceived(response.data));
};

export default grantsSlice.reducer;
