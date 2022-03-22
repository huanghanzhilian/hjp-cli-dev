'use strict';
const axios = require('axios');

const request = axios.create({
  baseURL: process.env.IMOOC_CLI_BASE_URL ? process.env.IMOOC_CLI_BASE_URL : 'http://localhost:7002',
  timeout: 5000,
})

request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    return Promise.reject(error);
  }
);


module.exports = request;
