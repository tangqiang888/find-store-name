const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { records } = event;
  if (!records || records.length === 0) {
    return { ok: false, msg: '没有数据' };
  }

  const tasks = records.map(r => {
    return db.collection('goods_record').add({
      data: {
        goods_name: r.goods_name || '',
        supplier: r.supplier || '',
        order_time: r.order_time || '',
        img_path: r.img_path || '',
        create_time: db.serverDate()
      }
    });
  });

  try {
    await Promise.all(tasks);
    return { ok: true, count: records.length };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
};
