function Vue(options) {
    this.$options = options || {};
    var data = this._data = this.$options;
    var me = this;

    // 监听data中数据
    observe(data, this);
    // 模板解析函数
    this.$compile = new Compile(options.el || document.body, this);

}
