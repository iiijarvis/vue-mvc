function Compile(el, vm) {
    this.$vm = vm;
    // 获取el节点元素
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);

    if(this.$el) {
        // 将el中节点转化成fragment节点
        this.$fragment = this.node2Fragment(this.$el);
        // init
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    node2Fragment: function(el) {
        var fragment = document.createDocumentFragment();
        var child;

        while(child = el.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    },
    init: function() {
        this.compileElement(this.$fragment);
    },
    compileElement: function(el) {
        var childNodes = el.childNodes;
        var me = this;

        [].slice.call(childNodes).forEach(function(node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/g;

            if(me.isElementNode(node)) {
                // 解析DOM元素节点中的所有属性
                me.compile(node);
            } else if(me.isTextNode(node) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }

            if(node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        });
    },
    compile: function(node) {
        var nodeAttrs = node.attributes;
        var me = this;

        [].slice.call(nodeAttrs).forEach(function(attr) {
            var attrName = attr.name;
            if(me.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2);
                // 事件指令
                if(me.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                } else {
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
                }

                node.removeAttribute(attrName);
            }
        });
    },
    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },
    isDirective: function(attr) {
        return attr.indexOf("v-") == 0;
    },
    isEventDirective: function(dir) {
        return dir.indexOf("on") == 0;
    },
    isElementNode: function(node) {
        return node.nodeType == 1;
    },
    isTextNode: function(node) {
        return node.nodeType == 3;
    }
};

// 指令处理合集
var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, "text");
    },
    model: function(node, vm, exp) {
        this.bind(node, vm, exp, "model");
        var me = this;
        var value = this._getValue(vm, exp);
        node.addEventListener("input", function(e) {
            var newValue = e.target.value;
            if(value === newValue) {
                return ;
            }

            me._setValue(vm, exp, newValue);
            value = newValue;
        });
    },
    bind: function(node, vm, exp, dir) {
        var updaterFn = updater[dir + "Updater"];
        updaterFn && updaterFn(node, this._getValue(vm, exp));
        // 监听data中数据更新
        // 每个绑定的bind对应一个new Watcher
        new Watcher(vm, exp, function(value, oldValue) {
            // 数据更新时回调函数,更新视图
            updaterFn && updaterFn(node, value, oldValue);
        });
    },
    // 事件处理
    eventHandler: function(node, vm, exp, dir) {
        var eventType = dir.split(":")[1];
        var fn = vm.$options.methods && vm.$options.methods[exp];
        if(eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    _getValue: function(vm, exp) {
        // 调用defineProperty中的get方法
        var val = vm;
        // 获取形式：a.b.c、 a.b、 a
        exp = exp.split(".");
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },
    _setValue: function(vm, exp, value) {
        var val = vm;
        exp = exp.split(".");
        exp.forEach(function(k, i) {
            if(i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};

var updater = {
    textUpdater: function(node, value) {
        node.textContent = typeof value == "undefined" ? "" : value;
    },
    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == "undefined" ? "" : value;
    }
};