let baseUrl = "";

if (process.env.NODE_ENV === "production") {
  baseUrl = process.env.REACT_APP_API_BASE_URL;
}

export default baseUrl;
