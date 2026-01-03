import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import ruRU from "antd/locale/ru_RU";
import App from "./App";
import "./styles/App.css";

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgBase: "#1a1a1a",
    colorBgContainer: "#1f1f1f",
    colorBgElevated: "#262626",
    colorTextBase: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#d9d9d9",
    colorPrimary: "#4a9eff",
    borderRadius: 8,
    colorBorder: "#434343",
    colorBorderSecondary: "#303030",
  },
  components: {
    Card: {
      colorBgContainer: "#1f1f1f",
      colorBorderSecondary: "#303030",
    },
    Input: {
      colorBgContainer: "#1f1f1f",
      colorText: "#ffffff",
      colorBorder: "#434343",
    },
    Select: {
      colorBgContainer: "#1f1f1f",
      colorText: "#ffffff",
      colorBorder: "#434343",
    },
    Button: {
      colorBgContainer: "#1f1f1f",
      colorText: "#ffffff",
      colorBorder: "#434343",
    },
    Checkbox: {
      colorText: "#ffffff",
    },
    List: {
      colorBgContainer: "#1f1f1f",
      colorText: "#ffffff",
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider locale={ruRU} theme={darkTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
