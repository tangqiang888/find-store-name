Page({
  data: {
    list: [],
    checkedCount: 0
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('goods_record').limit(100).get();
      const list = res.data.map(item => ({ ...item, checked: false }));
      this.setData({ list, checkedCount: 0 });
    } catch (e) {
      wx.showToast({ title: '加载数据失败', icon: 'none' });
    }
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

    wx.showLoading({ title: '删除中...' });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'deleteRecords',
        data: { ids }
      });

      wx.hideLoading();

      if (result.ok) {
        // 直接从列表中移除已删记录
        const newList = this.data.list.filter(item => !ids.includes(item._id));
        this.setData({
          list: newList,
          checkedCount: 0
        });
        wx.showToast({ title: `已删除 ${ids.length} 条` });
      } else {
        wx.showToast({ title: `部分失败：${result.failCount} 条未删除`, icon: 'none' });
        this.loadData(); // 重新加载保证数据准确
      }
    } catch (e) {
      wx.hideLoading();
      wx.showModal({
        title: '删除异常',
        content: e.message || '未知错误',
        showCancel: false
      });
    }
  }
});
