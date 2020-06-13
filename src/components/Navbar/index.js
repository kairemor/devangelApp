import { Button, Drawer } from "antd";
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { withRouter } from "react-router";

import {
  logoutUser,
  showLoginModal,
  showRegisterModal
} from "../../redux/reducers/users";

class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = { drawerOpen: false };
  }

  render() {
    return (
      <div id={"navbar-top"}>
        <Drawer
          title="DevAngel"
          placement={"left"}
          closable={true}
          onClose={() => this.setState({ drawerOpen: false })}
          visible={this.state.drawerOpen}
          className={"navDrawer"}
        >
          <div id={"drawerLinksContainer"}>
            <a
              target={"_blank"}
              href={
                "https://docs.google.com/forms/d/e/1FAIpQLSe2Xf_laNJ54lJ1ALUk1gbq2eUYFhPYEVeWgYVtOyRnNbHPmw/viewform"
              }
            >
              Connect with Startups
            </a>
            <a
              target={"_blank"}
              href={
                "https://docs.google.com/forms/d/e/1FAIpQLScIVPmDp3hWkg9d8CW2fw9zQ8Sr8cVE4yQdxh0RhgMPsa5IQw/viewform"
              }
            >
              Connect with Investors
            </a>
            <NavLink
              to={"/products"}
              onClick={() => this.setState({ drawerOpen: false })}
            >
              Crypto Hunt
            </NavLink>
          </div>
          <div id={"drawerUserContainer"}>
            {!this.props.user.loggedIn && (
              <React.Fragment>
                <Button onClick={() => this.props.showLoginModal(true)}>
                  Sign In
                </Button>
                <Button onClick={() => this.props.showRegisterModal(true)}>
                  Sign Up
                </Button>
              </React.Fragment>
            )}
            {this.props.user.loggedIn && (
              <React.Fragment>
                <Button
                  onClick={() => {
                    this.setState({ drawerOpen: false });
                    this.props.logoutUser();
                  }}
                >
                  Logout
                </Button>
              </React.Fragment>
            )}
          </div>
        </Drawer>
        <div id={"navbar-body"}>
          <div id={"navLeftContainer"}>
            <div id={"logoContainer"}>
              <div id={"hamburger"}>
                <Button onClick={() => this.setState({ drawerOpen: true })}>
                  <svg viewBox="0 0 100 80" width="20" height="20">
                    <rect width="100" height="10" rx="8"></rect>
                    <rect y="30" width="100" height="10" rx="8"></rect>
                    <rect y="60" width="100" height="10" rx="8"></rect>
                  </svg>
                </Button>
              </div>
              <Link to={"/"}>
                <h3>DevAngel</h3>
              </Link>
            </div>
            <div id={"navLeftLinks"}>
              <a
                target={"_blank"}
                href={
                  "https://docs.google.com/forms/d/e/1FAIpQLSe2Xf_laNJ54lJ1ALUk1gbq2eUYFhPYEVeWgYVtOyRnNbHPmw/viewform"
                }
              >
                Connect with Startups
              </a>
              <a
                target={"_blank"}
                href={
                  "https://docs.google.com/forms/d/e/1FAIpQLScIVPmDp3hWkg9d8CW2fw9zQ8Sr8cVE4yQdxh0RhgMPsa5IQw/viewform"
                }
              >
                Connect with Investors
              </a>
              <NavLink to={"/products"}>Crypto Hunt</NavLink>
            </div>
          </div>
          <div id={"navRightContainer"}>
            <div id={"navRightLinks"}>
              {!this.props.user.loggedIn && (
                <React.Fragment>
                  <Button onClick={() => this.props.showLoginModal(true)}>
                    Sign In
                  </Button>
                  <Button onClick={() => this.props.showRegisterModal(true)}>
                    Sign Up
                  </Button>
                </React.Fragment>
              )}
              {this.props.user.loggedIn && (
                <React.Fragment>
                  <Button onClick={() => this.props.logoutUser()}>
                    Logout
                  </Button>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({ user: state.user }),
  { logoutUser, showLoginModal, showRegisterModal }
)(withRouter(Navbar));
