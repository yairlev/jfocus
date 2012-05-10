(function ($) {
    var _jfocus;

    //define default options values
    var defaults = {
        next: [39, 9],
        prev: [37],
        select: [13, 32],
        cirular: false,
        css: 'focused',
        onfocus: null,
        onselect: null
    }

    function jfocus(selector, options) {
        this.init(selector, options);
        return this;
    }
    
    jfocus.prototype = {

        init: function(selector, options) {
            if(!options) options = {};
            this._options = $.extend(defaults, options);

            var self = this;
            this._selector = selector;

            $(document).bind('keydown.jfocus', function (e) {
                if (e.keyCode == KEY_CODES.TAB)
                    e.preventDefault();

                self._onKeyDown(e);
            });

            //remove focused css class from all items
            this._selector.removeClass(this._options.css);

            //get first item (DOM) and focus it
            this._focusedItem = this._selector.first();
            this._focusedItem.addClass(this._options.css);
        },

        destroy: function() {
            $(document).unbind('keydown.jfocus');
        },

        disableItem:function () {
            /*
            this._curr.attr('jfocus_disabled', 'jfocus_disabled');
            
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
            */
        },
        
        enableItem:function () {
            /*
            this._curr.removeAttr('jfocus_disabled');
            
            if (!this._focusedItem) {
                this._focus(this._curr);
            }
            */
        },

        enableGroup: function() {
            /*
            var self = this;
            $(document).bind('keydown.jfocus', function (e) {
                e.preventDefault();
                self._onKeyDown(e);
            });
            */
        },
        
        _isEnabled: function(elem) {
            /*
            return elem.attr('jfocus_disabled') ? false : true;
            */
        },
        
        _focus:function (elem) {
            /*
            this._unfocus(this._focusedItem);
            this._focusedItem = elem.addClass('focused');
            */
        },
        
        _unfocus:function (elem) {
            /*
            if (elem) {
                elem.removeClass('focused');
                
                if (elem[0] == this._focusedItem[0]) {
                    this._focusedItem = null;
                }
            }
            */
        },
        
        _onKeyDown:function (e) {
            var last = this._focusedItem;

            if ($.inArray(e.keyCode, this._options.next) != -1) {
                this._focusedItem.removeClass(this._options.css);
                this._focusedItem = this._focusedItem.next();

                if (this._focusedItem.length == 0) {
                    if (this._options.cirular) {
                        this._focusedItem = this._selector.first();
                    } else {
                        this._focusedItem = last;
                    }
                }
                this._focusedItem.addClass(this._options.css);
            }

            if ($.inArray(e.keyCode, this._options.prev) != -1) {
                this._focusedItem.removeClass(this._options.css);
                this._focusedItem = this._focusedItem.prev();

                if (this._focusedItem.length == 0) {
                    if (this._options.cirular) {
                        this._focusedItem = this._selector.last();
                    } else {
                        this._focusedItem = last;
                    }
                }
                this._focusedItem.addClass(this._options.css);
            }

            if (this._focusedItem != last && this._options.onfocus) {
                this._options.onfocus.call(this, this._focusedItem);
            }

            if ($.inArray(e.keyCode, this._options.select) != -1 && this._options.onselect) {
                this._options.onselect.call(this, this._focusedItem);
            }
        }
    }

    $.fn.jfocus = function () {
        if (arguments.length == 1) {
            if (_jfocus) {
                _jfocus.destroy();
            }
            _jfocus = new jfocus(this, arguments[0]);
        } else {
            _jfocus._selectedItems = this;
        }

        return _jfocus;
    }

})(jQuery);