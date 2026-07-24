const db = wx.cloud.database();
Page({
  data: {
    list: [],
    supplier: '',
    order_time: '',
    imagePath: '',
    cloudImgId: '',
    _saved: false
  },

  async chooseImage() {
    const res = await wx.chooseImage({ count: 1 });
    const tempPath = res.tempFilePaths[0];
    wx.showLoading({ title: '上传图片中...' });
    const cloudPath = `ocr/${Date.now()}.jpg`;
    const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: tempPath });
    wx.hideLoading();
    this.setData({ imagePath: tempPath, cloudImgId: uploadRes.fileID });

    wx.showLoading({ title: '测试token获取...' });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'ocr',
        data: { fileID: uploadRes.fileID }
      });
      wx.hideLoading();
      // 直接弹窗显示云函数返回的完整结果
      wx.showModal({
        title: 'Token测试结果',
        content: JSON.stringify(result, null, 2),
        showCancel: false
      });
    } catch (e) {
      wx.hideLoading();
      wx.showModal({
        title: '云函数调用失败',
        content: e.message || '未知错误',
        showCancel: false
      });
    }
  },

  parseOCR(wordsArr) {
    const rows = wordsArr.map(line => {
      const cols = line.split(/[\s,，]+/).filter(c => c);
      return { goods_name: cols.join(' ') };
    });
    this.setData({ list: rows });
    wx.showToast({ title: `识别到 ${rows.length} 行` });
  },

  onNameInput(e) {
    const index = e.currentTarget.dataset.index;
    this.data.list[index].goods_name = e.detail.value;
    this.setData({ list: this.data.list });
  },

  addRow() {
    this.data.list.push({ goods_name: '' });
    this.setData({ list: this.data.list });
  },

  deleteRow(e) {
    this.data.list.splice(e.currentTarget.dataset.index, 1);
    this.setData({ list: this.data.list });
  },

  onSupplierInput(e) { this.setData({ supplier: e.detail.value }); },
  onDateChange(e) { this.setData({ order_time: e.detail.value }); },

  async saveAll() {
    const { list, supplier, order_time, cloudImgId } = this.data;
    if (!supplier || !order_time) {
      wx.showToast({ title: '请填写供应商和日期', icon: 'none' });
      return;
    }
    if (list.length === 0) {
      wx.showToast({ title: '没有可保存的数据', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '保存中...' });
    try {
      const records = list.map(item => ({
        goods_name: item.goods_name || '',
        supplier,
        order_time,
        img_path: cloudImgId
      }));
      const res = await wx.cloud.callFunction({
        name: 'addRecords',
        data: { records }
      });
      wx.hideLoading();
      if (res.result && res.result.ok) {
        wx.showToast({ title: `成功保存 ${res.result.count} 条` });
        this.setData({ list: [], _saved: true });
      } else {
        wx.showToast({ title: '保存失败：' + (res.result.msg || '未知'), icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '调用云函数失败，请重试', icon: 'none' });
    }
  },

  onUnload() {
    if (this.data.list.length > 0 && !this._saved) {
      wx.showModal({ title: '提示', content: '有未保存的数据，确定离开吗？' });
    }
  }
});
