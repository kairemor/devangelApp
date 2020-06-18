import React from "react";
import { connect } from "react-redux";
import { Tag } from "antd";
import { withRouter } from "react-router";

import UpvoteIcon from "./UpvoteIcon";
import CommentsIcon from "./CommentsIcon";
import { upvoteProduct } from "../../redux/reducers/products";
import { showLoginRequiredModal } from "../../redux/reducers/users";
import { imgixBaseUrl } from "../../utils/imgixBaseUrl";

class Product extends React.Component {
  constructor(props) {
    super(props);
  }

  onUpvoteClick = e => {
    e.stopPropagation();
    if (!this.props.user.loggedIn) {
      this.props.showLoginRequiredModal(true);
    }
    this.props.upvoteProduct(this.props.product.id);
  };

  render() {
    const {
      name,
      highlight,
      id,
      upvotes_count,
      comments_count,
      categories,
      thumbnail_key,
      images,
      has_upvoted
    } = this.props.product;

    let thumbnailUrl =
      "https://firebasestorage.googleapis.com/v0/b/devangel-dev.appspot.com/o/download%20(14).png?alt=media&token=fa7aeea2-0ef7-4189-b32d-58d066b85174";
    if (thumbnail_key) {
      // thumbnailUrl = `${imgixBaseUrl}/${thumbnail_key}?w=80&h=80&fit=crop`;
      thumbnailUrl = `${images[0].imageUrl}?w=80&h=80&fit=crop`;
    }

    return (
      <React.Fragment>
        <div
          className={"productItem"}
          onClick={() => this.props.history.push(`/products/${id}`)}
        >
          <div className={"productImage"}>
            <img src={thumbnailUrl} />
          </div>
          <div className={"productDescriptionContainer"}>
            <h3 className={"productTitle"}>{name}</h3>
            <p className={"productDescriptionBody"}>{highlight}</p>
            <div className={"productCategories"}>
              {categories.map(category => (
                <Tag color="blue" key={category.id}>
                  {category.name}
                </Tag>
              ))}
            </div>
            <div className={"productCommentsLine"}>
              <div className={"productCommentsBox"}>
                <CommentsIcon />
                <span>{comments_count || 0}</span>
              </div>
            </div>
          </div>
          <div
            className={`productUpvoteContainer ${
              has_upvoted ? "hasUpvoted" : ""
              }`}
          >
            <button onClick={this.onUpvoteClick}>
              <span className={"productUpvoteButtonText"}>
                <UpvoteIcon className={"upvoteIcon"} />
                <span>{upvotes_count}</span>
              </span>
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({ user: state.user }),
  { upvoteProduct, showLoginRequiredModal }
)(withRouter(Product));
