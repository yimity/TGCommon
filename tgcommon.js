(function (window, output) {
    //supported format: #id || tag.cls || tag || .cls || DOMObject || nodeListObject
    var TG = function(s) {
        return new TG.fn.init(s);
    };
    TG.extend = function (o) {
        for (var i in o) {
            (!TG[i]) && (TG[i] = o[i]);
        }
    };
    var rcls = /^(?:([^.]+)|(.+)?\.(.+))$/ ;
    TG.fn = {
        init: function(s) {
            if (!s) {
                return this ;
            }
            //handle #id OR tag.cls OR tag OR .cls 
            if (typeof s == 'string') {
                if (!!document.querySelectorAll) {
                    this.merge(this, document.querySelectorAll(s));
                }else {
                    if (s.indexOf('#') +1) {
                        this[0] = document.getElementById(this.trim(s).replace('#', ''));
                        this.length = 1;
                    //handle tag.class || tag || .class
                    }else {
                        var m = rcls.exec(s);
                        if (!m) {
                            return this ;
                        }
                        if (m[1]) {
                            this.merge(this, document.getElementsByTagName(m[1]))
                        }else if (m[3]){
                            var tag = m[2] || '*' ,
                                el = document.getElementsByTagName(tag),
                                ret = [];
                            for (var i = 0, k ; k = el[i] ; i++ ) {
                                (k.className.indexOf(this.trim(m[3])) > -1) && ret.push(k);
                            }
                            this.merge(this, ret);
                        }
                    }
                }
            //handle nodeListObject
            }else if (s.length) {
                this.merge(this, s);
            //hand DOMObject
            }else if(s.nodeType) {
                this[0] = s ;
                this.length = 1;
            }
            return this;
        }
        ,length:0
        ,splice: [].splice
        ,merge: function (first, second) {
            var i = first.length ,
                j = 0;

            if (typeof second.length === "number") {
                for (var l = second.length; j < l; j++) {
                    first[i++] = second[j];
                }
            } else {
                while (second[j] !== undefined) {
                    first[i++] = second[j++];
                }
            }
            first.length = i;
            return first;
        }
        ,trim: function (v) {
            return v && v.replace(/(^\s+)|(\s+$)/g, '') ;
        }

        ,hasClass:function (v) {
            var s = ' ',
                k ;
            for (var i = 0, l=this.length ; i< l  ; i++ ) {
                k = this[i];
                if (k.nodeType == 1 && ((s + k.className + s).indexOf(s+this.trim(v)+s) + 1)) {
                    return true ;
                }
            }
            return false ;
        }
        ,addClass: function(v) {
            var i, k, l = this.length;
            var classNames = (this.trim(v) || "").split(/\s+/);
            for (i = 0; i < l; i++ ) {
                k = this[i];
                var className = " " + k.className + " ",
                    setClass = k.className;

                for (var c = 0, cl = classNames.length; c < cl; c++) {
                    if (className.indexOf(" " + classNames[c] + " ") < 0) {
                        setClass += " " + classNames[c];
                    }
                }
                k.className = this.trim(setClass);
            }

            return this;
        }
        ,removeClass: function(v) {
            var i, k, l = this.length;
            var classNames = (this.trim(v) || "").split(/\s+/);
            for (i = 0; i < l; i++ ) {
                k = this[i];
                if (k.nodeType === 1 && k.className) {
                    var className = (" " + k.className + " ");
                    for (var c = 0, cl = classNames.length; c < cl; c++) {
                        className = className.replace(" " + classNames[c] + " ", " ");
                    }
                    k.className = this.trim(className);
                }
            }
            return this;
        }
        ,hide: function() {
            for (var i = 0; i < this.length; i++) {
                (this[i].nodeType) && (this[i].style.display = 'none') ; 
            }
            return this;
        }
        ,show: function() {
            for (var i = 0; i < this.length; i++) {
                (this[i].nodeType) && (this[i].style.display = 'block') ; 
            }
            return this;
        }
    };
    TG.fn.init.prototype = TG.fn;

    var _ready = (function () {
        var readyList = null;
        var isFire = false;

        function fireReady(){
            if(!isFire){
                var fn,i=0;
                if(readyList){
                    while(fn = readyList[i++]){
                        fn();
                    }
                    readyList = null;
                }
                isFire = true;
            }
        }

        function doScrollCheck() {
            if (isFire) { return; }
            try {
                document.documentElement.doScroll("left");
            } catch( error ) {
                setTimeout( doScrollCheck, 1 );
                return;
            }
            fireReady();
        }

        function bindReady(){
            if(document.addEventListener){
                document.addEventListener('DOMContentLoaded', function () {
                    document.removeEventListener('DOMContentLoaded',arguments.callee,false);
                    fireReady();
                }, false);
                window.addEventListener('load',fireReady,false);
            }else if(document.attachEvent){
                document.attachEvent('onreadystatechange',function () {
                    if(document.readyState === 'complete'){
                        document.detachEvent('onreadystatechange',arguments.callee);
                        fireReady();
                    }
                });
                window.attachEvent('onload',fireReady);
            }

            var toplevel = false;
            try {
                toplevel = window.frameElement == null;
            } catch(e) {}

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck();
            }
        }

        bindReady();

        return function (fn) {
            if(!readyList) readyList = [];
            if(document.readyState == 'complete'){
                fn();
            }else{
                readyList.push(fn);
            }
        } ;
    })();    

    TG.extend({
        isIE6: !-[1,] && !window.XMLHttpRequest 

        ,addEvent: function (target, eventType, handler) {
            if (target.addEventListener){
                this.addEvent = function(target, eventType, handler){
                    target.addEventListener(eventType, handler, false);
                };
            } else {
                this.addEvent = function(target, eventType, handler){
                    target.attachEvent("on" + eventType, handler);
                };
            }
            this.addEvent(target, eventType, handler);
        }
        ,loadjs: function (url, cb, c) {
            var _head = document.getElementsByTagName("head")[0] || document.documentElement,
                _script = document.createElement("script");
            _script.src = url;	
            c && (_script.charset = c );
            if (cb) {
                if (_script.addEventListener) {
                    _script.addEventListener('load', cb, false);
                } else {
                    _script.onreadystatechange = function() {
                        if (_script.readyState in {loaded: 1, complete: 1}) {
                            _script.onreadystatechange = null;
                            cb();
                        }
                    };
                }
            }
            _head.appendChild( _script );
        }
        ,ready :function (fn) {
            _ready(fn);
        }
    });

    window[output || 'TG'] = TG ;
})(window, '');