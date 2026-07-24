App({
  onLaunch() {
    wx.cloud.init({ env: 'cloud1-d1go8ubeu3419757e' });
    this.addTestDataIfEmpty();
  },

  async addTestDataIfEmpty() {
    const db = wx.cloud.database();
    try {
      const res = await db.collection('goods_record').count();
      if (res.total === 0) {
        await db.collection('goods_record').add({
          data: {
            goods_name: '娃哈哈矿泉水596ml',
            supplier: '测试1',
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
