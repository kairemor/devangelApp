import React from "react";
import { withRouter } from "react-router";
import { imgixBaseUrl } from "../../utils/imgixBaseUrl";

class RelatedProduct extends React.Component {
  render() {
    const { product } = this.props;
    let thumbnailUrl;
    if (product.thumbnail_key) {
      thumbnailUrl = `${imgixBaseUrl}/${product.thumbnail_key}?w=60&h=60&fit=crop`;
    }
    return (
      <div
        className={"relatedProductItem"}
        onClick={() => this.props.history.push(`/products/${product.id}`)}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} />
        ) : (
          <div className={"imgPlaceholder"}>&nbsp;</div>
        )}
        <div className={"relatedProductTextContainer"}>
          <h2>{product.name}</h2>
          <p>{product.highlight}</p>
        </div>
      </div>
    );
  }
}

export default withRouter(RelatedProduct);
