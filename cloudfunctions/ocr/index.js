const cloud = require('wx-server-sdk');
cloud.init({ env: 'cloud1-d1go8ubeu3419757e' });
const axios = require('axios');

const API_KEY = 'uCgOixmiwJfUAPfAHuaSu78A';
const SECRET_KEY = 'dCPpatyxsSOMF8juqohDwPFbK9BqBZyB';

exports.main = async (event) => {
  const { fileID } = event;
  try {
    // 下载图片
    const res = await cloud.downloadFile({ fileID });
    const imageBase64 = res.fileContent.toString('base64');

    // 获取 token
    const tokenRes = await axios.get(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(API_KEY.trim())}&client_secret=${encodeURIComponent(SECRET_KEY.trim())}`
    );
    const token = tokenRes.data.access_token;

    // 调用通用文字识别
    const ocrRes = await axios.post(
      `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}`,
      { image: imageBase64, language_type: 'CHN_ENG' },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (ocrRes.data.error_code) {
      return { error: '百度识别失败', code: ocrRes.data.error_code, msg: ocrRes.data.error_msg };
    }

    const words = ocrRes.data.words_result.map(item => item.words);
    return { words };

  } catch (e) {
    return { error: '云函数执行异常', message: e.message };
  }
};
