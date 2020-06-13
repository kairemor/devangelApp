import React from "react";
import { connect } from "react-redux";
import { Form, Input, Button, Select, Upload, message } from "antd";
import axios from "axios";

import {
  createProduct,
  fetchProducts,
  createImageUploadPostResource
} from "../../redux/reducers/products";

const { Option } = Select;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
};

class ProductCreate extends React.Component {
  constructor(props) {
    super(props);
    this.productImageKeys = [];
    this.productImages = [];
    this.state = {
      thumbnail: null,
      submitting: false,
      uploadedImages: []
    };
  }

  componentDidMount() {
    this.props.fetchProducts();
    this.props.createImageUploadPostResource();
  }

  handleImageUpload = file => {
    return new Promise((resolve, reject) => {
      try {
        const awsData = this.props.products.imageUploadResource;
        const awsFormData = awsData.fields;
        const formData = new FormData();
        Object.keys(awsFormData).forEach(key => {
          formData.append(key, awsFormData[key]);
        });
        formData.append("Content-Type", file.type);
        formData.append("file", file);

        const config = {
          method: "POST",
          headers: new Headers({
            Accept: "application/xml"
          }),
          body: formData
        };

        fetch(awsData.url, config)
          .then(response => response.text())
          .then(xml => {
            const imageKey = `${awsFormData.key.replace(
              "${filename}",
              file.name
            )}`;
            const imageUrl = `${awsData.url}${imageKey}`;
            return resolve({ imageKey, imageUrl, fileName: file.name });
          })
          .catch(err => console.error(err));
      } catch (err) {
        return reject(err);
      }
    });
  };

  onThumbnailRemove = () => {
    this.setState({ thumbnail: null });
  };

  _isFileValid = file => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
      return false;
    }
    return true;
  };

  uploadThumbnail = async file => {
    const isFileValid = this._isFileValid(file);
    if (isFileValid) {
      const uploadedThumbnail = await this.handleImageUpload(file);
      this.setState({ thumbnail: uploadedThumbnail.imageKey });
    }
  };

  beforeUploadThumbnail = file => {
    this.uploadThumbnail(file);
    return false;
  };

  beforeUploadProductImage = file => {
    const isFileValid = this._isFileValid(file);
    if (isFileValid) {
      return true;
    } else {
      return Promise.reject();
    }
  };

  onProductImageProgressUpdate = ({ file, fileList, event }) => {
    this.setState({ uploadedImages: fileList });
  };

  productImageUploadCustomRequest = async options => {
    const { onSuccess, onError, file, onProgress } = options;
    const awsData = this.props.products.imageUploadResource;
    const awsFormData = awsData.fields;
    const formData = new FormData();
    Object.keys(awsFormData).forEach(key => {
      formData.append(key, awsFormData[key]);
    });
    formData.append("Content-Type", file.type);
    formData.append("file", file);
    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: event => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        onProgress({ percent: percent });
      }
    };
    try {
      const res = await axios.post(awsData.url, formData, config);
      const imageKey = `${awsFormData.key.replace("${filename}", file.name)}`;
      const imageUrl = `${awsData.url}${imageKey}`;
      const fileName = file.name;
      this.productImageKeys.push(file.name);
      this.productImages.push({ imageKey, imageUrl, fileName });
      onSuccess("Ok");
    } catch (err) {
      console.log("error: ", err);
      const error = new Error("File upload failed!");
      onError({ err: error });
    }
  };

  onProductImageRemove = file => {
    this.productImageKeys = this.productImageKeys.filter(
      key => key !== file.name
    );
    this.productImages = this.productImages.filter(
      image => image.fileName !== file.name
    );
  };

  onFinish = values => {
    this.setState({ submitting: true });
    this.props.createProduct({
      ...values,
      thumbnail: undefined,
      product_images: this.productImages,
      thumbnail_key: this.state.thumbnail
    });
  };

  onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  render() {
    const allImagesUploaded = this.state.uploadedImages.every(
      image => image.percent === 100
    );

    if (!this.props.user || !this.props.user.loggedIn) {
      return <h1>Loading...</h1>;
    }

    if (this.props.user.userDetails.roles.indexOf("admin") === -1) {
      return <h1>Access Denied</h1>;
    }

    const categories = [];

    this.props.products.categories.map(category => {
      categories.push(<Option key={category.name}>{category.name}</Option>);
    });

    return (
      <div className={"createProductContainer"}>
        <h1>Create Product</h1>
        <Form
          {...layout}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the Product name" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Highlight"
            name="highlight"
            rules={[
              { required: true, message: "Please enter the Product highlight" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Link"
            name="link"
            rules={[
              { required: true, message: "Please enter the Product link" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please enter the Product description"
              }
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Categories" name="categories">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select Product Categories"
            >
              {categories}
            </Select>
          </Form.Item>

          <h4>Recommended Size: 240x240px</h4>
          <Form.Item
            label="Thumbnail"
            name="thumbnail"
            rules={[
              {
                required: true,
                message: "Please upload a thumbnail"
              }
            ]}
          >
            <Upload
              beforeUpload={this.beforeUploadThumbnail}
              onRemove={this.onThumbnailRemove}
            >
              <Button>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <h4>Recommended Size: 1270x760px</h4>
          <Form.Item
            label="Product Images"
            name="product_images"
            rules={[
              {
                required: true,
                message: "Please upload product images"
              }
            ]}
            validator={(a, b, c) => {
              console.log(a, b, c);
            }}
          >
            <Upload
              beforeUpload={this.beforeUploadProductImage}
              onRemove={this.onProductImageRemove}
              multiple={true}
              customRequest={this.productImageUploadCustomRequest}
              onChange={this.onProductImageProgressUpdate}
              listType="picture-card"
              accept="image/*"
              defaultFileList={this.state.uploadedImages}
            >
              <Button>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button
              type="primary"
              htmlType="submit"
              loading={this.state.submitting}
              disabled={
                this.state.submitting ||
                !this.state.thumbnail ||
                this.state.uploadedImages.length === 0 ||
                !allImagesUploaded
              }
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default connect(
  state => ({ products: state.products, user: state.user }),
  { createProduct, fetchProducts, createImageUploadPostResource }
)(ProductCreate);
