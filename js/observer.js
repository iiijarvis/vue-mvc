function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    walk: function(data) {
        var me = this;
        Object.keys(data).forEach(function (key) {
            me.convert(key, data[key]);
        });
    },
    convert: function(key, val) {
        this.defineReactive(this.data, key, val);
    },
    defineReactive: function(data, key, val) {
        // 创建Dep get方法在Compile模板解析函数时调用
        // 每个data数据对应一个new Dep
        var dep = new Dep();
        var childObj = observe(val);

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                if(Dep.target) {
                    // 第一次Compile函数模板解析时会调用 在Watcher的get方法中
                    // 一个new Dep中有一个id,subs中多个Watcher
                    // 即一个data数据(msg)对应多个视图({{msg}}、v-text="msg")
                    dep.depend();
                }
                return val;
            },
            set: function(newValue) {
                if(newValue === val) {
                    return ;
                }
                val = newValue;
                childObj = observe(newValue);
                // 通知订阅者,更新这个dep下所有Watcher
                dep.notify();
            }
        });
    }
};

function observe(val, vm) {
    if(!val || typeof val !== "object") {
        return ;
    }
    // 递归调用 defineProperty 方法,循环data中所有数据
    return new Observer(val);
}

var uid = 0;

function Dep() {
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    depend: function() {
        Dep.target.addDep(this);
    },
    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if(index != -1) {
            this.subs.splice(index, 1);
        }
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }
};

Dep.target = null;