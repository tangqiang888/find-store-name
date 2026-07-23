const cloud = require('wx-server-sdk');
const axios = require('axios');
cloud.init();

const API_KEY = '7aQzTbewid4at1yeSchOYbgR';
const SECRET_KEY = 'EyOz1sgwUbsyXfJ56WQ7dvTap0uhwaIg';

exports.main = async (event) => {
  const { fileID } = event;
  const res = await cloud.downloadFile({ fileID });
  const imageBase64 = res.fileContent.toString('base64');

  const tokenRes = await axios.get(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`);
  const token = tokenRes.data.access_token;

  const ocrRes = await axios.post(`https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}`, {
    image: imageBase64,
    language_type: 'CHN_ENG'
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const words = ocrRes.data.words_result.map(item => item.words);
  return { words };
};
