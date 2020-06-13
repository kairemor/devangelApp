import { combineReducers } from "redux";

import grantsReducer from "./grants";
import userReducer from "./users";
import productsReducer from "./products";

export default combineReducers({
  grants: grantsReducer,
  user: userReducer,
  products: productsReducer
});
