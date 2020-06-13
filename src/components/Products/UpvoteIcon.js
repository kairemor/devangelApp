import React from "react";

export default class UpvoteIcon extends React.Component {
  render() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={this.props.className || ""}
      >
        <polygon points="0,0 12,0 6,12" />
      </svg>
    );
  }
}
