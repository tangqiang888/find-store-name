const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { records } = event;
  if (!records || records.length === 0) return { ok: false, msg: 'no data' };

  const tasks = records.map(r =>
    db.collection('goods_record').add({ data: r })
  );
  await Promise.all(tasks);
  return { ok: true, count: records.length };
};
