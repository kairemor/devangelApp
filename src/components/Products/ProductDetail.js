import React from "react";
import { Modal, Tag, Form, Button, Input, Comment, List } from "antd";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import format from "date-fns/format";

import RelatedProduct from "./RelatedProduct";
import {
  addProductComment,
  fetchProductDetails
} from "../../redux/reducers/products";
import { LoginRequiredText } from "../Login/LoginRequired";
import { imgixBaseUrl } from "../../utils/imgixBaseUrl";

const { TextArea } = Input;

class ProductDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: "",
      prevPath: ""
    };
  }

  componentDidMount() {
    this.props.fetchProductDetails(parseInt(this.props.match.params.id));
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.props.fetchProductDetails(parseInt(nextProps.match.params.id));
    }
  }

  onCloseModal = () => {
    if (!window.history.state) {
      this.props.history.push("/products");
    } else {
      this.props.history.goBack();
    }
  };

  render() {
    const productId = parseInt(this.props.match.params.id);
    const product = this.props.products.find(
      product => product.id === productId
    );
    const thumbnail_key = product && product.thumbnail_key;
    const relativeDate = product
      ? formatDistanceToNow(new Date(product.created_at), {
          addSuffix: true
        })
      : "";
    const formattedDate = product
      ? format(new Date(product.created_at), "EEEE, LLLL do yyyy, h:mm a")
      : "";
    let thumbnailUrl =
      "https://firebasestorage.googleapis.com/v0/b/devangel-dev.appspot.com/o/download%20(14).png?alt=media&token=fa7aeea2-0ef7-4189-b32d-58d066b85174";
    if (thumbnail_key) {
      thumbnailUrl = `${imgixBaseUrl}/${thumbnail_key}?w=80&h=80&fit=crop`;
    }

    let productLink = product && product.link;

    if (product && productLink.indexOf("http") !== 0) {
      productLink = "http://" + product.link;
    }

    return (
      <div className={"productDetailsModal"}>
        <Modal
          visible={this.props.visible}
          footer={[]}
          className={"productDetailsModal"}
          onCancel={this.onCloseModal}
        >
          {product && (
            <React.Fragment>
              <div className={"productDetailsHeader"}>
                <div className={"productDetailsHeaderLeft"}>
                  <img src={thumbnailUrl} />
                  <div className={"productNameContainer"}>
                    <h2 className={"productDetailsName"}>{product.name}</h2>
                    <h4 className={"productDetailsDescription"}>
                      {product.description || product.highlight}
                    </h4>
                    <div className={"productDetailsTagsContainer"}>
                      {product.categories.map(category => (
                        <Tag key={category.id}>{category.name}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={"productDetailsHeaderRight"}>
                  <a href={productLink} target={"_blank"}>
                    <span>
                      <svg
                        width="24"
                        height="24"
                        xmlns="http://www.w3.org/2000/svg"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      >
                        <path d="M14.851 11.923c-.179-.641-.521-1.246-1.025-1.749-1.562-1.562-4.095-1.563-5.657 0l-4.998 4.998c-1.562 1.563-1.563 4.095 0 5.657 1.562 1.563 4.096 1.561 5.656 0l3.842-3.841.333.009c.404 0 .802-.04 1.189-.117l-4.657 4.656c-.975.976-2.255 1.464-3.535 1.464-1.28 0-2.56-.488-3.535-1.464-1.952-1.951-1.952-5.12 0-7.071l4.998-4.998c.975-.976 2.256-1.464 3.536-1.464 1.279 0 2.56.488 3.535 1.464.493.493.861 1.063 1.105 1.672l-.787.784zm-5.703.147c.178.643.521 1.25 1.026 1.756 1.562 1.563 4.096 1.561 5.656 0l4.999-4.998c1.563-1.562 1.563-4.095 0-5.657-1.562-1.562-4.095-1.563-5.657 0l-3.841 3.841-.333-.009c-.404 0-.802.04-1.189.117l4.656-4.656c.975-.976 2.256-1.464 3.536-1.464 1.279 0 2.56.488 3.535 1.464 1.951 1.951 1.951 5.119 0 7.071l-4.999 4.998c-.975.976-2.255 1.464-3.535 1.464-1.28 0-2.56-.488-3.535-1.464-.494-.495-.863-1.067-1.107-1.678l.788-.785z" />
                      </svg>
                    </span>
                    <span>Open Website</span>
                  </a>
                </div>
              </div>
              <div id={"productDetailsBodyContainer"}>
                <div className={"productDetailsBody"}>
                  {product.images && product.images.length > 0 && (
                    <div className={"productDetailsImagesContainer"}>
                      {product.images &&
                        product.images.map(image => (
                          <img
                            src={`${imgixBaseUrl}/${image.imageKey}?h=380&fit=crop`}
                          />
                        ))}
                    </div>
                  )}
                  <div className={"productDetailsDateContainer"}>
                    <span>
                      Featured{" "}
                      <time dateTime={product.created_at} title={formattedDate}>
                        {relativeDate}
                      </time>
                    </span>
                  </div>
                  <div className={"productDetailsCommentsContainer"}>
                    {!this.props.user.loading && this.props.user.loggedIn && (
                      <div className={"productDetailsAddCommentContainer"}>
                        <Form.Item>
                          <TextArea
                            rows={4}
                            onChange={e =>
                              this.setState({ commentText: e.target.value })
                            }
                            value={this.state.commentText}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            htmlType="submit"
                            loading={false}
                            onClick={() => {
                              this.props.addProductComment(
                                product.id,
                                this.state.commentText
                              );
                              this.setState({ commentText: "" });
                            }}
                            type="primary"
                          >
                            Add Comment
                          </Button>
                        </Form.Item>
                      </div>
                    )}
                    {!this.props.user.loading && !this.props.user.loggedIn && (
                      <div
                        className={
                          "productDetailsCommentLoginRequiredContainer"
                        }
                      >
                        <LoginRequiredText heading={"Sign up to Comment"} />
                      </div>
                    )}
                    <div>
                      <List
                        className="comment-list"
                        header={`${product.comments.length} comments`}
                        itemLayout="horizontal"
                        dataSource={product.comments}
                        renderItem={item => {
                          const userAvatar = `https://ui-avatars.com/api/?name=${item.user.username}`;
                          const formattedDate = formatDistanceToNow(
                            new Date(item.created_at),
                            {
                              addSuffix: true
                            }
                          );
                          return (
                            <li>
                              <Comment
                                actions={item.actions}
                                author={item.user.username}
                                avatar={userAvatar}
                                content={item.text}
                                datetime={formattedDate}
                              />
                            </li>
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div id={"relatedProductsContainer"}>
                  {product &&
                    product.related_products &&
                    product.related_products.length > 0 && (
                      <React.Fragment>
                        <h4>Related Products</h4>
                        {product.related_products.map(relatedProduct => (
                          <RelatedProduct product={relatedProduct} />
                        ))}
                      </React.Fragment>
                    )}
                </div>
              </div>
            </React.Fragment>
          )}
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => ({ products: state.products.products, user: state.user }),
  { addProductComment, fetchProductDetails }
)(withRouter(ProductDetail));
