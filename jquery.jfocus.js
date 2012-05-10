(function ($) {

    KEY_CODES = {
        ENTER:13,
        SPACE:32,
        LEFT:37,
        UP:38,
        RIGHT:39,
        DOWN:40
    }

    var items = 0;

    function jfocus(root, options) {
        items++;

        if(!options) options = {};
        var defaults = {
            next: ['RIGHT','TAB'],
            prev: ['LEFT'],
            select: ['SPACE','ENTER'],
            cirular: false,
            css: 'focused',
            onfocus: function(elem) {},
            onselect: function(elem) {}
        };
        var options = $.extend(defaults, options);

        this._eventNamespace =  'jfocus_' + items;
        
        var self = this;
        this._root = root;
        this._root.attr('jfocus_group', 'jfocus_group');
        
        this._curr;
        this._matrix;
        this._triggers;
        this._callback;
        this._defaultItem;
        this._focusedItem;
        
        $(document).bind('keydown.' + this._eventNamespace, function (e) {
            e.preventDefault();
            self._onKeyDown(e);
        });
        
        if (options) {
            this._matrix = options.matrix;
            this._triggers = options.triggers;
            this._callback = options.callback;
            this._defaultItem = $('[order][default]', this._root);
            
            if (this._defaultItem.length == 1) {
                this._focus(this._defaultItem);
            }
        }
        
        return this;
    }
    
    jfocus.prototype = {
        
        disableItem:function () {
            this._curr.attr('disabled', 'disabled');
            
            if (this._focusedItem[0] == this._curr[0]) {
                
                if ( this._isEnabled(this._defaultItem)) {
                    this._focus(this._defaultItem);
                }
                else {
                    var nextItem = this._getNextItem(KEY_CODES.RIGHT) || this._getNextItem(KEY_CODES.DOWN);
                    
                    if (nextItem) {
                        this._focus(nextItem);
                    }
                }
                
                this._unfocus(this._curr);
            }
        },
        
        enableItem:function () {
            this._curr.removeAttr('disabled');
            
            if (!this._focusedItem) {
                this._focus(this._curr);
            }
        },
        
        disableGroup: function() {
            $(document).unbind('keydown.' + this._eventNamespace);
        },
        
        enableGroup: function() {
            var self = this;
            $(document).bind('keydown.' + this._eventNamespace, function (e) {
                e.preventDefault();
                self._onKeyDown(e);
            });
        },
        
        set_callback: function(callback) {
          this._callback = callback;
        },
        
        _isEnabled: function(elem) {
            return elem.attr('disabled') ? false : true;
        },
        
        _focus:function (elem) {
            this._unfocus(this._focusedItem);
            this._focusedItem = elem.addClass('focused');
        },
        
        _unfocus:function (elem) {
            if (elem) {
                elem.removeClass('focused');
                
                if (elem[0] == this._focusedItem[0]) {
                    this._focusedItem = null;
                }
            }
        },
        
        _getItems:function () {
            var items = $('[order]', this._root).sort(function(a,b) {
                return parseInt($(a).attr('order')) - parseInt($(b).attr('order'));
            });
            
            var head, curr;
            
            if (items.length > 0) {
                head = curr = null;
                
                var self = this;
                
                items.each(function(index, elem) {
                    if (!head) {
                        head = curr = {elem: $(elem), next: null, prev: null, order: self._getOrder($(elem))};
                    }
                    else {
                        curr.next = {elem: $(elem), next: null, prev: curr, order: self._getOrder($(elem))};
                        curr = curr.next;
                    }
                });
                
                if (items.length > 1) {
                    curr.next = head;
                    head.prev = curr;
                }
            }
            
            return head;
        },
        
        _onKeyDown:function (e) {
            
            if ($.inArray(e.keyCode, this._triggers) != -1 && this._callback) {
                this._callback.call(this, e, this._focusedItem);
            }
            
            var nextItem = this._getNextItem(e.keyCode);
            if (nextItem) {
                this._focus(nextItem);
            }
        },
        
        _getNextItem: function(keyCode) {
            
            var currentOrder = this._getOrder(this._focusedItem);
            var head = this._getItems();
            
            if (!currentOrder || !head.next)
                return this._defaultItem;
            
            switch (keyCode) {
                case KEY_CODES.UP:
                    if ( this._matrix[0] > 1 ) {
                        var curr = head;
                        
                        while(curr.order != currentOrder) {
                            curr = curr.next;
                        }
                        
                        var items_count = this._matrix[1];
                        
                        while (items_count > 0) {
                            curr = curr.prev;
                            items_count--;
                        }
                        
                        var remainingItems = this._matrix[0] * this._matrix[1] - items_count;
                        
                        while ((!this._isEnabled(curr.elem) || ! curr.elem.is(':visible')) && remainingItems-- > 1) {
                            curr = curr.prev;
                        }
                        
                        return this._isEnabled(curr.elem) ? curr.elem : null;
                    }                    
                    break;
                
                case KEY_CODES.DOWN:
                    if ( this._matrix[0] > 1 ) {
                        var curr = head;
                        
                        while(curr.order != currentOrder) {
                            curr = curr.next;
                        }
                        
                        var items_count = this._matrix[1];
                        
                        while (items_count > 0) {
                            curr = curr.next;
                            items_count--;
                        }
                        
                        var remainingItems = this._matrix[0] * this._matrix[1] - items_count;
                        
                        while ((!this._isEnabled(curr.elem) || ! curr.elem.is(':visible')) && remainingItems-- > 1) {
                            curr = curr.next;
                        }
                        
                        return this._isEnabled(curr.elem) ? curr.elem : null;
                    }                    
                    break;
                
                case KEY_CODES.LEFT:
                    if ( this._matrix[1] > 1 ) {
                        var curr = head;
                        
                        while(curr.order != currentOrder) {
                            curr = curr.next;
                        }
                        
                        curr = curr.prev;
                        
                        var remainingItems = this._matrix[0] * this._matrix[1] - 1;
                        
                        while ((!this._isEnabled(curr.elem) || ! curr.elem.is(':visible')) && remainingItems-- > 1) {
                            curr = curr.prev;
                        }
                        
                        return this._isEnabled(curr.elem) ? curr.elem : null;
                    }
                    break;
                
                case KEY_CODES.RIGHT:
                    if ( this._matrix[1] > 1 ) {
                        var curr = head;
                        
                        while(curr.order != currentOrder) {
                            curr = curr.next;
                        }
                        
                        curr = curr.next;
                        
                        var remainingItems = this._matrix[0] * this._matrix[1] - 1;
                        
                        while ((!this._isEnabled(curr.elem) || ! curr.elem.is(':visible')) && remainingItems-- > 1) {
                            curr = curr.next;
                        }
                        
                        return this._isEnabled(curr.elem) ? curr.elem : null;
                    }
                    break;
            }
        },
        
        _getOrder: function(elem) {
            return parseInt(elem.attr('order'));
        }
    }

    $.fn.jfocus = function () {
        var jf;
        if (arguments.length == 1) {
            
            var currInstance = this.data('jfocus');
            
            if (currInstance) {
                currInstance.disableGroup();
            }
            
            jf = new jfocus(this, arguments[0]);
            this.data('jfocus', jf);
        }
        else {
            jf = this.closest('[jfocus_group]').data('jfocus');
            
            if (jf) {
                jf._curr = this;
            }
        }
        return jf;
    }

})(jQuery);