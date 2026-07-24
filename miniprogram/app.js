App({
  onLaunch() {
    wx.cloud.init({ env: '你的云开发环境ID' }); // 替换为你的环境 ID
    this.addTestDataIfEmpty();
  },

  async addTestDataIfEmpty() {
    const db = wx.cloud.database();
    try {
      const res = await db.collection('goods_record').count();
      if (res.total === 0) {
        await db.collection('goods_record').add({
          data: {
            goods_name: '596ml娃哈哈矿泉水',
            supplier: '测试供应商A',
            order_time: '2026-07-24',
            img_path: '',
            create_time: db.serverDate()
          }
        });
        console.log('初始测试数据已添加');
      }
    } catch (e) {
      console.error('初始化数据失败', e);
    }
  }
});
