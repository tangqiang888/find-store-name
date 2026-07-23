const db = wx.cloud.database();
Page({
  data: {
    list: [],
    supplier: '',
    order_time: '',
    imagePath: '',
    cloudImgId: ''
  },
  async chooseImage() {
    const res = await wx.chooseImage({ count: 1 });
    const tempPath = res.tempFilePaths[0];
    wx.showLoading({ title: '上传中...' });
    const cloudPath = `ocr/${Date.now()}.jpg`;
    const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: tempPath });
    wx.hideLoading();
    this.setData({ imagePath: tempPath, cloudImgId: uploadRes.fileID });

    wx.showLoading({ title: '识别中...' });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'ocr',
        data: { fileID: uploadRes.fileID }
      });
      if (result && result.words) {
        this.parseOCR(result.words);
      } else {
        wx.showToast({ title: '未识别到文字', icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '识别失败', icon: 'none' });
    }
    wx.hideLoading();
  },
  parseOCR(wordsArr) {
    const rows = wordsArr.map(line => {
      const cols = line.split(/[\s,，]+/).filter(c => c);
      return {
        goods_name: cols[0] || '',
        spec: cols[1] || '',
        quantity: cols[2] || '',
        ext1: cols[3] || '',
        ext2: cols[4] || '',
        ext3: cols[5] || '',
        ext4: cols[6] || ''
      };
    });
    this.setData({ list: rows });
    wx.showToast({ title: `识别到${rows.length}行` });
  },
  onCellInput(e) {
    const { index, field } = e.currentTarget.dataset;
    this.data.list[index][field] = e.detail.value;
    this.setData({ list: this.data.list });
  },
  addRow() {
    this.data.list.push({});
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
      wx.showToast({ title: '请填供应商和日期', icon: 'none' }); return;
    }
    wx.showLoading({ title: '保存中...' });
    for (let item of list) {
      await db.collection('goods_record').add({
        data: {
          supplier,
          order_time,
          goods_name: item.goods_name || '',
          spec: item.spec || '',
          quantity: item.quantity || '',
          ext1: item.ext1 || '',
          ext2: item.ext2 || '',
          ext3: item.ext3 || '',
          ext4: item.ext4 || '',
          img_path: cloudImgId,
          create_time: db.serverDate()
        }
      });
    }
    wx.hideLoading();
    wx.showToast({ title: '保存成功' });
    this._saved = true;
  },
  onUnload() {
    if (this.data.list.length > 0 && !this._saved) {
      wx.showModal({
        title: '提示',
        content: '有未保存的数据，确定离开吗？',
      });
    }
  }
});