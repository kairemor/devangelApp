import React from "react";
import { Form, Input, Button, Modal } from "antd";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { registerUser, showRegisterModal } from "../../redux/reducers/users";

class UserLogin extends React.Component {
  onFinish = values => {
    const { username, email, password } = values;
    this.props.registerUser(username, email, password);
    console.log("Success:", values);
  };

  onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  render() {
    let usernameErrors = null;
    let emailErrors = null;

    if (this.props.user.duplicateUsernameError) {
      usernameErrors = {
        validateStatus: "error",
        help: "This username is taken"
      };
    }

    if (this.props.user.duplicateEmailError) {
      emailErrors = {
        validateStatus: "error",
        help: "This email is taken"
      };
    }

    return (
      <Modal
        visible={this.props.user.registerModalOpen}
        onCancel={() => this.props.showRegisterModal(false)}
        footer={null}
      >
        <h2>Sign Up</h2>
        <Form
          layout={"vertical"}
          name="basic"
          initialValues={{ remember: true }}
          className={"loginForm"}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
        >
          <Form.Item
            label="Username"
            name="username"
            {...usernameErrors}
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            {...emailErrors}
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => ({ user: state.user }),
  { registerUser, showRegisterModal }
)(UserLogin);
