function Watcher(vm, expOrFn, cb) {
    this.cb = cb;
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.depIds = {};

    if(typeof expOrFn === 'function') {
        this.getter = expOrFn;
    } else {
        this.getter = this.parseGetter(expOrFn);
    }

    this.value = this.get();
}

Watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        var value = this.get();
        var oldValue = this.value;
        if(value !== oldValue) {
            this.value = value;
            this.cb.call(this.vm, value, oldValue);
        }
    },
    addDep: function(dep) {
        if(!this.depIds.hasOwnProperty(dep.id)) {
            // 一个Dep对应多个Watcher 如：一个中包含多个{{msg}} {{msg}}
            // 一个Watcher对应多个Dep 如：data数据 a.b.c
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    get: function() {
        Dep.target = this;
        var value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    },
    getValue: function() {
        // 调用defineProperty中的get方法
        var exp = this.exp.split('.');
        var val = this.vm._data.data;
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },
    parseGetter: function(exp) {
        if (/[^\w.$]/.test(exp)) return;
        var exps = exp.split('.');
        return function(obj) {
            for (var i = 0, len = exps.length; i < len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }
            return obj;
        };
    }
};