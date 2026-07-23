App({
  onLaunch() {
    wx.cloud.init({ env: '你的云开发环境ID' }); // 改成你的环境ID，例如 'find-store-xxxx'
  }
});