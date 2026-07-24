const cloud = require('wx-server-sdk');
cloud.init({ env: 'cloud1-d1go8ubeu3419757e' });
const db = cloud.database();

exports.main = async (event) => {
  const { ids } = event;
  if (!ids || ids.length === 0) {
    return { ok: false, msg: '没有要删除的ID' };
  }

  const results = [];
  for (let id of ids) {
    try {
      await db.collection('goods_record').doc(id).remove();
      results.push({ id, success: true });
    } catch (e) {
      results.push({ id, success: false, msg: e.message });
    }
  }
  const failCount = results.filter(r => !r.success).length;
  return { ok: failCount === 0, failCount, results };
};
