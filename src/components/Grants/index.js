import React from "react";
import { Table, Button, Tag, Tabs } from "antd";
import { connect } from "react-redux";
import { fetchGrants } from "../../redux/reducers/grants";

const { TabPane } = Tabs;

const columns = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "Type",
    dataIndex: "category",
    key: "category",
    render: category => {
      return category.name;
    }
  },
  {
    title: "Highlight",
    dataIndex: "highlight",
    key: "highlight",
    className: "grantsHighlightsColumn"
  },
  {
    title: "Deadline",
    dataIndex: "deadline",
    key: "deadline",
    className: "grantsDeadlineColumn",
    render: deadline => {
      return deadline || "Ongoing";
    }
  },
  {
    title: "Funds",
    dataIndex: "funds",
    key: "funds",
    render: funds => {
      return funds || "Undisclosed";
    }
  },
  {
    title: "Focus Area",
    dataIndex: "tags",
    key: "focus_area",
    className: "grantsFocusAreaColumn",
    render: tags => {
      return (
        <span>
          {tags.map(tag => (
            <Tag color="blue" key={tag.id}>
              {tag.text}
            </Tag>
          ))}
        </span>
      );
    }
  },
  {
    title: "Apply",
    dataIndex: "application_link",
    key: "application_link",
    render: link => {
      return (
        <Button type="primary" href={link} target={"_blank"}>
          Apply
        </Button>
      );
    }
  }
];

class GrantsTable extends React.Component {
  componentDidMount() {
    this.props.fetchGrants();
  }

  render() {
    const { loading, grants, categories, totalGrantsCount } = this.props.grants;

    const pagination = {
      total: totalGrantsCount,
      showSizeChanger: false,
      pageSize: 2
    };

    const grantsByCategory = {};

    categories.map(category => {
      return (grantsByCategory[category.name] = []);
    });

    grants.map(grant => {
      try {
        grantsByCategory[grant.category.name].push(grant);
      } catch (err) {}
    });

    return (
      <Tabs
        defaultActiveKey="all"
        onChange={(a, b) => {
          this.props.fetchGrants(null, a);
        }}
        className={"grantsContainer"}
      >
        <TabPane tab="All" key="all">
          <Table
            columns={columns}
            dataSource={grants}
            loading={loading}
            rowKey={"id"}
            showSizeChanger={false}
            pagination={pagination}
            onChange={this.props.fetchGrants}
          />
        </TabPane>
        {categories.map(category => (
          <TabPane tab={category.name} key={category.id}>
            <Table
              columns={columns}
              dataSource={grantsByCategory[category.name]}
              loading={loading}
              rowKey={"id"}
              pagination={pagination}
              onChange={info => this.props.fetchGrants(info, category.id)}
            />
          </TabPane>
        ))}
      </Tabs>
    );
  }
}

export default connect(
  state => ({ grants: state.grants }),
  { fetchGrants }
)(GrantsTable);
