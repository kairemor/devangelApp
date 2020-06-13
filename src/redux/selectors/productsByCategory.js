import { createSelector } from "@reduxjs/toolkit";

const _productsSelector = state => state.products;
const _productsCategorySelector = state => state.categoryFilter;

export const productsByCategory = createSelector(
  [_productsSelector, _productsCategorySelector],
  (products, categoryFilter) => {
    if (categoryFilter === "all") {
      return products;
    }
    const filteredProducts = [];
    products.map(product => {
      console.log(product);
      const productIndex = product.categories.findIndex(
        category => category.name === categoryFilter
      );
      if (productIndex !== -1) {
        filteredProducts.push(product);
      }
    });
    return filteredProducts;
  }
);
