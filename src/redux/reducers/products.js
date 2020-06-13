import { createSlice } from "@reduxjs/toolkit";
import baseUrl from "../../utils/apiBaseUrl";
import AuthAxios from "../../utils/AuthAxios";
import history from "../../utils/history";
import { message } from "antd";

const productsSlice = createSlice({
  name: "products",
  initialState: {
    loading: false,
    initialLoadComplete: false,
    products: [],
    categories: [],
    loadedProductIds: [],
    imageUploadResource: null,
    infiniteLoading: false,
    currentPage: 1,
    hasMoreProducts: true,
    categoryFilter: "all",
    updatedAt: ""
  },
  reducers: {
    productsLoading(state, action) {
      state.loading = true;
    },
    productsInfiniteLoading(state, action) {
      state.infiniteLoading = true;
    },
    productsReceived(state, action) {
      const productsToAdd = [];
      const productIdsToAdd = [];
      action.payload.products.map(product => {
        if (state.loadedProductIds.indexOf(product.id === -1)) {
          productsToAdd.push(product);
          productIdsToAdd.push(product.id);
        }
      });
      state.products = [...state.products, ...productsToAdd];
      state.loadedProductIds = [...state.loadedProductIds, ...productIdsToAdd];
      state.loading = false;
      state.initialLoadComplete = true;
      state.categories = action.payload.categories;
    },
    addProducts(state, action) {
      const productsToAdd = [];
      const productIdsToAdd = [];
      action.payload.products.map(product => {
        if (state.loadedProductIds.indexOf(product.id === -1)) {
          productsToAdd.push(product);
          productIdsToAdd.push(product.id);
        }
      });
      state.products = [...state.products, ...productsToAdd];
      state.loadedProductIds = [...state.loadedProductIds, ...productIdsToAdd];
      state.loading = false;
      state.infiniteLoading = false;
      state.currentPage += 1;
      state.categories = action.payload.categories;
    },
    addCommentToProduct(state, action) {
      const product = state.products.find(
        product => product.id === action.payload.comment.product_id
      );
      product.comments = [action.payload.comment, ...product.comments];
      product.comments_count += 1;
    },
    setImageUploadResource(state, action) {
      state.imageUploadResource = action.payload;
    },
    changeProductUpvotes(state, action) {
      const product = state.products.find(
        product => product.id === action.payload.productId
      );
      if (product.has_upvoted) {
        product.upvotes_count -= 1;
        product.has_upvoted = false;
      } else {
        product.upvotes_count += 1;
        product.has_upvoted = true;
      }
    },
    endOfProductsList(state, action) {
      state.hasMoreProducts = false;
      state.infiniteLoading = false;
      state.loading = false;
    },
    loadingError(state, action) {
      state.infiniteLoading = false;
      state.loading = false;
    },
    setProductCategoryFilter(state, action) {
      state.categoryFilter = action.payload;
    },
    updateProduct(state, action) {
      const _product = {
        ...action.payload.product,
        related_products: action.payload.related_products
      };
      if (state.loadedProductIds.indexOf(action.payload.product.id) === -1) {
        state.loadedProductIds.push(action.payload.product.id);
        state.products.push(_product);
      } else {
        let productIndex = state.products.findIndex(
          product => product.id === action.payload.product.id
        );
        const updatedProduct = {
          ...state.products[productIndex],
          ..._product
        };
        const updatedList = [...state.products];
        updatedList[productIndex] = updatedProduct;
        state.products = [...updatedList];
      }
      state.updatedAt = action.payload.updatedAt;
    }
  }
});

export const {
  productsLoading,
  productsReceived,
  addCommentToProduct,
  setImageUploadResource,
  changeProductUpvotes,
  productsInfiniteLoading,
  addProducts,
  endOfProductsList,
  loadingError,
  setProductCategoryFilter,
  updateProduct
} = productsSlice.actions;

export const fetchProducts = (page = 1) => async (dispatch, getState) => {
  const state = getState();
  if (state.products.products.length !== 0 && page === 1) {
    return;
  }
  dispatch(productsLoading());
  if (page > 1) {
    dispatch(productsInfiniteLoading());
  }
  let response;
  try {
    response = await AuthAxios.get(baseUrl + `/api/products?page=${page}`);
    if (page > 1) {
      dispatch(addProducts(response.data));
    } else {
      dispatch(productsReceived(response.data));
    }
  } catch (err) {
    if (err.response.status === 404) {
      dispatch(endOfProductsList());
    } else {
      dispatch(loadingError());
    }
  }
};

export const upvoteProduct = productId => async dispatch => {
  try {
    const response = await AuthAxios.post(
      baseUrl + `/api/products/${productId}/upvote`
    );
    dispatch(changeProductUpvotes({ productId }));
  } catch (err) {}
};

export const addProductComment = (productId, text) => async dispatch => {
  try {
    const response = await AuthAxios.post(
      baseUrl + `/api/products/${productId}/comment`,
      {
        product_id: productId,
        text
      }
    );
    dispatch(addCommentToProduct(response.data));
  } catch (err) {}
};

export const createProduct = data => async dispatch => {
  try {
    const response = await AuthAxios.post(baseUrl + `/api/products`, data);
    message.success("New Product Created!");
    history.replace("/products");
  } catch (err) {}
};

export const createImageUploadPostResource = () => async dispatch => {
  try {
    const response = await AuthAxios.post(
      baseUrl + `/api/product-images-upload-request`
    );
    dispatch(setImageUploadResource(response.data.request));
  } catch (err) {}
};

export const loadMoreProducts = () => async (dispatch, getState) => {
  const state = getState();
  if (
    state.products.loading ||
    state.products.infiniteLoading ||
    !state.products.hasMoreProducts
  ) {
    return;
  }
  if (
    !state.products.loading &&
    !state.products.infiniteLoading &&
    state.products.hasMoreProducts
  ) {
    dispatch(fetchProducts(state.products.currentPage + 1));
  }
};

export const fetchProductDetails = productId => async (dispatch, getState) => {
  const addDetailsToState = data => {
    const state = getState();
    if (!state.products.initialLoadComplete) {
      setTimeout(() => addDetailsToState(data), 250);
    } else {
      data = { ...data, updatedAt: new Date().toISOString() };
      dispatch(updateProduct(data));
    }
  };
  try {
    const response = await AuthAxios.get(
      baseUrl + `/api/products/${productId}`
    );
    setTimeout(() => addDetailsToState(response.data), 250);
  } catch (err) {}
};

export default productsSlice.reducer;
