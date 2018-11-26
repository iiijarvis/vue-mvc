function Vue(options) {
    this.$options = options || {};
    var data = this._data = this.$options.data;
    var me = this;

    Object.keys(data).forEach(function(key) {
        me._proxyData(key);
    });
    
    this.initComputed();
    
    // 监听data中数据
    observe(data, this);
    
    // 模板解析函数
    this.$compile = new Compile(options.el || document.body, this);

    
}

Vue.prototype = {
    _proxyData: function(key, setter, getter) {
        // 实现 vm.xxx -> vm._data.xxx
        var me = this;
        setter = setter ||
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function() {
                return me._data[key];
            },
            set: function(newVal) {
                me._data[key] = newVal;
            }
        });
    },
    initComputed: function() {
        var me = this;
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    get: computed[key],
                    set: function() {}
                });
            });
        }
    }

};
