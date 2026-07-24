const db = wx.cloud.database();
Page({
  data: {
    list: [],
    checkedCount: 0
  },
  onShow() { this.loadData(); },
  async loadData() {
    const res = await db.collection('goods_record').limit(100).get();
    const list = res.data.map(item => ({ ...item, checked: false }));
    this.setData({ list, checkedCount: 0 });
  },
  toggle(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.list[index];
    item.checked = !item.checked;
    this.setData({
      list: this.data.list,
      checkedCount: this.data.list.filter(i => i.checked).length
    });
  },
  async deleteSelected() {
    const ids = this.data.list.filter(i => i.checked).map(i => i._id);
    if (ids.length === 0) {
      wx.showToast({ title: '请勾选要删除的记录', icon: 'none' });
      return;
    }
    const res = await wx.showModal({
      title: '确认删除',
      content: `确定删除 ${ids.length} 条记录吗？`
    });
    if (!res.confirm) return;
    for (let id of ids) {
      await db.collection('goods_record').doc(id).remove();
    }
    wx.showToast({ title: '已删除' });
    this.loadData();
  }
});
