import React from "react";
import { connect } from "react-redux";
import { Radio } from "antd";
import "intersection-observer"; // polyfill
import Observer from "@researchgate/react-intersection-observer";
import {
  fetchProducts,
  loadMoreProducts,
  setProductCategoryFilter
} from "../../redux/reducers/products";
import { productsSelector } from "../../redux/selectors/products";
import { productsByCategory } from "../../redux/selectors/productsByCategory";

import Product from "./Product";

class ProductsList extends React.Component {
  componentDidMount() {
    this.props.fetchProducts();
  }

  handleIntersection = event => {
    if (event.isIntersecting) {
      this.props.loadMoreProducts();
    }
  };

  render() {
    const {
      products,
      categories,
      loading,
      infiniteLoading,
      hasMoreProducts
    } = this.props.products;
    const options = {
      onChange: this.handleIntersection
    };
    return (
      <div>
        <h1>Products</h1>
        <div id={"productsFilterContainer"}>
          <Radio.Group
            onChange={e => this.props.setProductCategoryFilter(e.target.value)}
            defaultValue={"all"}
          >
            <Radio value={"all"}>All Categories</Radio>
            {this.props.productCategories.map(category => (
              <Radio value={category.name} key={category.name}>
                {category.name}
              </Radio>
            ))}
          </Radio.Group>
        </div>
        {this.props.processedProducts.map(day => {
          return (
            <div className={"productListForDay"} key={day[0]}>
              <h3>{day[1].displayLabel}</h3>
              <div className={"productItemsListForDay"}>
                {day[1].products.map(product => (
                  <Product product={product} key={product.id} />
                ))}
              </div>
            </div>
          );
        })}
        {hasMoreProducts && !infiniteLoading && !loading && (
          <Observer {...options} threshold={[0.75, 1]}>
            <div id={"productsInfiniteScrollContainer"} />
          </Observer>
        )}
        {infiniteLoading && (
          <div id={"loadingProductsContainer"}>
            <h2>-Loading-</h2>
          </div>
        )}
        {!hasMoreProducts && (
          <div id={"endOfProductsList"}>
            <h2>-End Of List-</h2>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    products: state.products,
    processedProducts: productsSelector(state.products),
    productCategories: state.products.categories
  }),
  { fetchProducts, loadMoreProducts, setProductCategoryFilter }
)(ProductsList);
