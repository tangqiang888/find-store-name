App({
  onLaunch() {
    wx.cloud.init({ env: 'find-store-name' }); // 改成你的环境ID，例如 'find-store-xxxx'
  }
});
