import React, { useState, useEffect } from "react";
import { Router, Switch, Route, Link } from "react-router-dom";

import history from "./utils/history";
import Navbar from "./components/Navbar";
import Grants from "./components/Grants";
import UserLogin from "./components/Login";
import RegisterUser from "./components/Register";
import ProductsList from "./components/Products/ProductsList";
import ProductCreate from "./components/Products/ProductCreate";

import "./App.scss";
import "antd/dist/antd.css";
import { useDispatch } from "react-redux";
import { getUserProfile } from "./redux/reducers/users";
import ProductDetail from "./components/Products/ProductDetail";
import LoginRequired from "./components/Login/LoginRequired";

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserProfile());
    fetch("/api/time")
      .then(res => res.json())
      .then(data => {
        setCurrentTime(data.time);
      });
  }, []);

  return (
    <Router history={history}>
      <Navbar />
      <div className="App">
        <div className="App-body">
          <Switch>
            <Route exact path={"/"}>
              <Grants />
            </Route>
            <Route path={["/products", "/products/:id"]}>
              <ProductsList />
            </Route>
            <Route exact path="/create-product">
              <ProductCreate />
            </Route>
          </Switch>
          <Route path="/products/:id">
            <ProductDetail visible={true} product={{ comments: [] }} />
          </Route>
          <LoginRequired />
          <UserLogin />
          <RegisterUser />
        </div>
      </div>
    </Router>
  );
}

export default App;
