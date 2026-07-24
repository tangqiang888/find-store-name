const cloud = require('wx-server-sdk');
cloud.init({ env: 'cloud1-d1go8ubeu3419757e' });
const axios = require('axios');

const API_KEY = 'uCgOixmiwJfUAPfAHuaSu78A';
const SECRET_KEY = 'dCPpatyxsSOMF8juqohDwPFbK9BqBZyB';

exports.main = async (event) => {
  try {
    const tokenRes = await axios.get(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(API_KEY.trim())}&client_secret=${encodeURIComponent(SECRET_KEY.trim())}`
    );
    // 直接返回 token 获取的原始响应
    return {
      token_response: tokenRes.data
    };
  } catch (e) {
    return {
      error: '请求token失败',
      message: e.message
    };
  }
};
