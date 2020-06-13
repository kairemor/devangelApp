import React from "react";
import { Modal, Button } from "antd";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import {
  showLoginRequiredModal,
  showLoginModal,
  showRegisterModal
} from "../../redux/reducers/users";

class _LoginRequiredText extends React.Component {
  render() {
    return (
      <div id={"loginRequiredContainer"}>
        <h2>{this.props.heading || "Sign up to Upvote"}</h2>
        <p>
          Join our community to upvote, participate in discussions, and stay up
          to date with the latest in Crypto
        </p>
        <div id={"loginRequiredButtonsContainer"}>
          <Button
            onClick={() => {
              this.props.showLoginRequiredModal(false);
              this.props.showLoginModal(true);
            }}
            type="primary"
          >
            Log In
          </Button>
          <Button
            onClick={() => {
              this.props.showLoginRequiredModal(false);
              this.props.showRegisterModal(true);
            }}
            type="primary"
          >
            Register
          </Button>
        </div>
      </div>
    );
  }
}

export const LoginRequiredText = connect(
  state => ({}),
  { showLoginModal, showRegisterModal, showLoginRequiredModal }
)(withRouter(_LoginRequiredText));

class LoginRequired extends React.Component {
  render() {
    return (
      <Modal
        visible={this.props.user.loginRequiredModalOpen}
        footer={null}
        onCancel={() => this.props.showLoginRequiredModal(false)}
      >
        <LoginRequiredText />
      </Modal>
    );
  }
}

export default connect(
  state => ({ user: state.user }),
  { showLoginRequiredModal }
)(withRouter(LoginRequired));
