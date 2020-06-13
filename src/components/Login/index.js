import React from "react";
import { Form, Input, Button, Modal, Typography } from "antd";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router";
import { loginUser, showLoginModal } from "../../redux/reducers/users";

const { Text } = Typography;

class UserLogin extends React.Component {
  onFinish = values => {
    console.log("Success:", values);
    const { email, password } = values;
    this.props.loginUser(email, password);
  };

  onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  render() {
    return (
      <Modal
        visible={this.props.user.loginModalOpen}
        onCancel={() => this.props.showLoginModal(false)}
        footer={null}
      >
        <h2>Sign In</h2>
        <Form
          layout={"vertical"}
          name="basic"
          initialValues={{ remember: true }}
          className={"loginForm"}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>
          {this.props.user.loginError && (
            <Text type={"danger"} className={"loginErrorText"}>
              Please check your email and/or password and try again.
            </Text>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => ({ user: state.user }),
  { loginUser, showLoginModal }
)(withRouter(UserLogin));
