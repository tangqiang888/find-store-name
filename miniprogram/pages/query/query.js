const db = wx.cloud.database();
Page({
  data: { list: [] },
  async onSearch(e) {
    const keyword = e.detail.value.trim();
    if (!keyword) { this.setData({ list: [] }); return; }
    wx.showLoading({ title: '搜索中...' });
    const _ = db.command;
    const res = await db.collection('goods_record').where(_.or([
      { supplier: db.RegExp({ regexp: keyword, options: 'i' }) },
      { goods_name: db.RegExp({ regexp: keyword, options: 'i' }) },
      { spec: db.RegExp({ regexp: keyword, options: 'i' }) },
      { order_time: db.RegExp({ regexp: keyword, options: 'i' }) }
    ])).get();
    this.setData({ list: res.data });
    wx.hideLoading();
  },
  viewImage(e) {
    const record = this.data.list.find(r => r._id === e.currentTarget.dataset.id);
    if (record && record.img_path) {
      wx.previewImage({ urls: [record.img_path] });
    }
  }
});