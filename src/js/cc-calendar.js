// 日历控件

;
(function ($) {

    var monthNames = ["01月", "02月", "03月", "04月", "05月", "06月",
            "07月", "08月", "09月", "10月", "11月", "12月"],

        dayNames = ["日", "一", "二", "三", "四", "五", "六"],
        offsetRE = /^(\+|\-)?(\d+)(M|Y)$/i,

    //获取月份天数
        getDaysInMonth = function (year, month) {
            return 32 - new Date(year, month, 32).getDate();
        },

    //获取月份中的第一天是所在星期的第几天
        getFirstDayOfMonth = function (year, month) {
            return new Date(year, month, 1).getDay();
        },

    //格式化数字，不足补零.
        formatNumber = function (val, len) {
            var num = "" + val;
            while (num.length < len) {
                num = "0" + num;
            }
            return num;
        },

    // 解析日期
        parseDate = function (obj) {
            var dateRE = /^(\d{4})(?:\-|\/)(\d{1,2})(?:\-|\/)(\d{1,2})$/;
            return Object.prototype.toString.call(obj) === '[object Date]' ? obj : dateRE.test(obj) ? new Date(parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10) - 1, parseInt(RegExp.$3, 10)) : null;
        },


    // 格式化日期
        formatDate = function (date) {
            return date.getFullYear() + '-' + formatNumber(date.getMonth() + 1, 2) + '-' + formatNumber(date.getDate(), 2);
        },

        getVal = function (elem) {
            return elem.is('select, input') ? elem.val() : elem.data('value');
        },

        prototype;

    // 构造函数
    var Calendar = function (element, options) {
        this.$el = $(element);
        this._options = $.extend({}, Calendar.DEFAULTS, options);
        this._init();
    };

    Calendar.DEFAULTS = {
        date: null, // 初始化日期
        firstDay: 1, // 一周从星期几开始
        minDate: null, // 最小日期
        maxDate: null, // 最大日期
        dateData: null, // 数据
        monthChangeable: false,
        yearChangeable: false,
        onRenderData: null // 渲染数据时的回调
    };

    // 方法
    Calendar.prototype = {

        _init: function () {

            var opts = this._options,
                el = this.$el,
                eventHandler = $.proxy(this._eventHandler, this);

            this.minDate(opts.minDate)
                .maxDate(opts.maxDate)
                .date(opts.date || new Date())
                .refresh();

            el.addClass('cc-calendar')
                .on('click', eventHandler);
        },

        _eventHandler: function (e) {
            var root = this.$el.get(0),
                match,
                target,
                cell,
                date,
                selects;

            switch (e.type) {

                // 年月选择
                case 'change':
                    selects = $('.cc-calendar-header .cc-calendar-year, ' +
                        '.cc-calendar-header .cc-calendar-month', this.root);

                    return this.switchMonthTo(getVal(selects.eq(1)), getVal(selects.eq(0)));

                default:

                    //click
                    target = e.target;
                    //debugger;
                    // 点击某一天
                    if ((match = $(target).closest('.cc-calendar-calendar tbody a', root)) && match.length) {

                        e.preventDefault();
                        cell = match.parent();

                        this._option('selectedDate',
                            date = new Date(cell.attr('data-year'), cell.attr('data-month'), match.find('.cc-print-day').text()));

                        var dateStr = '' + cell.attr('data-year') + formatNumber((parseInt(cell.attr('data-month')) + 1), 2) + formatNumber(match.find('.cc-print-day').text(), 2);

                        // 选择某一天
                        this.$el.trigger('select', [dateStr, cell]);
                        this.refresh();
                    } else if ((match = $(target).closest('.cc-calendar-prev, .cc-calendar-next', root)) && match.length) {
                        // 上下月
                        e.preventDefault();
                        this.switchMonthTo((match.is('.cc-calendar-prev') ? '-' : '+') + '1M');
                    }
            }
        },

        // 设置配置
        _option: function (key, val) {
            var opts = this._options,
                date, minDate, maxDate;

            //如果是setter
            if (val !== undefined) {

                switch (key) {
                    case 'minDate':
                    case 'maxDate':
                        opts[key] = val ? parseDate(val) : null;
                        break;

                    case 'selectedDate':
                        minDate = opts.minDate;
                        maxDate = opts.maxDate;
                        val = parseDate(val);
                        val = minDate && minDate > val ? minDate : maxDate && maxDate < val ? maxDate : val;
                        opts._selectedYear = opts._drawYear = val.getFullYear();
                        opts._selectedMonth = opts._drawMonth = val.getMonth();
                        opts._selectedDay = val.getDate();
                        break;

                    case 'date':
                        this._option('selectedDate', val);
                        opts[key] = this._option('selectedDate');
                        break;

                    default:
                        opts[key] = val;
                }

                //标记为true, 则表示下次refresh的时候要重绘所有内容。
                opts._invalid = true;

                //如果是setter则要返回instance
                return this;
            }

            return key == 'selectedDate' ? new Date(opts._selectedYear, opts._selectedMonth, opts._selectedDay) : opts[key];
        },

        switchToToday: function () {
            var today = new Date();
            return this.switchMonthTo(today.getMonth(), today.getFullYear());
        },

        // 转到某一月份
        switchMonthTo: function (month, year) {

            var opts = this._options,
                minDate = this.minDate(),
                maxDate = this.maxDate(),
                offset,
                period,
                tmpDate;

            if (Object.prototype.toString.call(month) === '[object String]' && offsetRE.test(month)) {
                offset = RegExp.$1 == '-' ? -parseInt(RegExp.$2, 10) : parseInt(RegExp.$2, 10);
                period = RegExp.$3.toLowerCase();
                month = opts._drawMonth + (period == 'm' ? offset : 0);
                year = opts._drawYear + (period == 'y' ? offset : 0);
            } else {
                month = parseInt(month, 10);
                year = parseInt(year, 10);
            }

            //Date有一定的容错能力，如果传入2012年13月，它会变成2013年1月
            tmpDate = new Date(year, month, 1);

            //不能跳到不可选的月份
            tmpDate = minDate && minDate > tmpDate ? minDate : maxDate && maxDate < tmpDate ? maxDate : tmpDate;

            month = tmpDate.getMonth();
            year = tmpDate.getFullYear();

            if (month != opts._drawMonth || year != opts._drawYear) {
                opts._drawMonth = month;
                opts._drawYear = year;
                this.$el.trigger('monthChange', [year, formatNumber(month + 1, 2)]);

                opts._invalid = true;
                // ajax延时操作不会等待，需要手动刷新
                //this.refresh();
            }

            return this;
        },

        // 刷新
        refresh: function () {
            var opts = this._options,
                el = this.$el,
                eventHandler = $.proxy(this._eventHandler, this);

            //如果数据没有变化厕不重绘了
            if (!opts._invalid) {
                return;
            }

            $('.cc-calendar-header select', el).off('change', eventHandler);
            el.empty().append(this._renderHTML());
            $('.cc-calendar-header select', el).on('change', eventHandler);
            opts._invalid = false;
            return this;
        },

        destroy: function () {
            var el = this.$el,
                eventHandler = this._eventHandler;

            $('.cc-calendar-header select', el).off('change', eventHandler);
            el.remove();
            return this;
        },

        _renderHTML: function () {
            var opts = this._options,
                drawYear = opts._drawYear,
                drawMonth = opts._drawMonth,
                tempDate = new Date(),
                today = new Date(tempDate.getFullYear(), tempDate.getMonth(),
                    tempDate.getDate()),

                minDate = this.minDate(),
                maxDate = this.maxDate(),
                selectedDate = this.selectedDate(),
                html = '',
                i,
                j,
                firstDay,
                day,
                leadDays,
                daysInMonth,
                rows,
                printDate,
                data = opts.dateData;

            firstDay = (isNaN(firstDay = parseInt(opts.firstDay, 10)) ? 0 : firstDay);

            html += this._renderHead(opts, drawYear, drawMonth, minDate, maxDate) +
                '<table  class="cc-calendar-calendar"><thead><tr>';

            for (i = 0; i < 7; i++) {
                day = (i + firstDay) % 7;

                html += '<th' + ((i + firstDay + 6) % 7 >= 5 ?

                        //如果是周末则加上cc-calendar-week-end的class给th
                        ' class="cc-calendar-week-end"' : '') + '>' +
                    '<span>' + dayNames[day] + '</span></th>';
            }

            html += '</tr></thead><tbody>';

            daysInMonth = getDaysInMonth(drawYear, drawMonth);
            leadDays = (getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
            rows = Math.ceil((leadDays + daysInMonth) / 7);
            printDate = new Date(drawYear, drawMonth, 1 - leadDays);

            for (i = 0; i < rows; i++) {
                html += '<tr>';

                for (j = 0; j < 7; j++) {
                    html += this._renderDay(j, printDate, firstDay, drawMonth, selectedDate, today, minDate, maxDate, data);
                    printDate.setDate(printDate.getDate() + 1);
                }
                html += '</tr>';
            }
            html += '</tbody></table>';
            return html;
        },

        // 日历头部
        _renderHead: function (data, drawYear, drawMonth, minDate, maxDate) {
            var html = '<div class="cc-calendar-header">',

            //上一个月的最后一天
                lpd = new Date(drawYear, drawMonth, -1),

            //下一个月的第一天
                fnd = new Date(drawYear, drawMonth + 1, 1),
                i,
                max;

            html += '<a class="cc-calendar-prev' + (minDate && minDate > lpd ?
                    ' cc-state-disable' : '') + '" href="javascript:;">&lt;</a><div class="cc-calendar-title">';

            if (data.yearChangeable) {
                html += '<select class="cc-calendar-year">';

                for (i = Math.max(1970, drawYear - 10), max = i + 20; i < max; i++) {
                    html += '<option value="' + i + '" ' + (i == drawYear ?
                            'selected="selected"' : '') + '>' + i + '年</option>';
                }
                html += '</select>';
            } else {
                html += '<span class="cc-calendar-year" data-value="' + drawYear + '">' + drawYear + '年' + '</span>';
            }

            if (data.monthChangeable) {
                html += '<select class="cc-calendar-month">';

                for (i = 0; i < 12; i++) {
                    html += '<option value="' + i + '" ' + (i == drawMonth ?
                            'selected="selected"' : '') + '>' + monthNames[i] + '</option>';
                }
                html += '</select>';
            } else {
                html += '<span class="cc-calendar-month" data-value="' + drawMonth + '">' + monthNames[drawMonth] + '</span>';
            }

            html += '</div><a class="cc-calendar-next' + (maxDate && maxDate < fnd ?
                    ' cc-state-disable' : '') + '" href="javascript:;">&gt;</a></div>';
            return html;
        },

        // 每一天
        _renderDay: function (j, printDate, firstDay, drawMonth, selectedDate, today, minDate, maxDate, data) {

            var otherMonth = (printDate.getMonth() !== drawMonth),
                unSelectable,
                dataDisplay;

            dataDisplay = this._renderData(printDate, data);

            unSelectable = otherMonth || (minDate && printDate < minDate) || (maxDate && printDate > maxDate) || !dataDisplay;

            return "<td class='" + ((j + firstDay + 6) % 7 >= 5 ? "cc-calendar-week-end" : "") + // 标记周末

                (unSelectable ? " cc-calendar-unSelectable cc-state-disabled" : "") + //标记不可点的天

                (otherMonth || unSelectable ? '' : (printDate.getTime() === selectedDate.getTime() ? " cc-calendar-current-day" : "") + //标记当前选择
                    (printDate.getTime() === today.getTime() ? " cc-calendar-today" : "") //标记今天
                ) + "'" +

                (unSelectable ? "" : " data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" +

                (otherMonth ? "&#xa0;" : (unSelectable ? "<span class='cc-state-default'><span class='cc-print-day'>" + printDate.getDate() + "</span></span>" :
                "<a class='cc-state-default" + (printDate.getTime() === today.getTime() ? " cc-state-highlight" : "") + (printDate.getTime() === selectedDate.getTime() ? " cc-state-active" : "") +
                "' href='#'><span class='cc-print-day'>" + printDate.getDate() + "</span>" + dataDisplay + "</a>")) + "</td>";
        },

        // 输出数据
        _renderData: function (printDate, data) {
            var opts = this._options,
                date,
                output = '';

            //重新渲染的回调
            if ($.isFunction(opts.onRenderData)) {
                return opts.onRenderData(data);
            }
            if (data && !$.isEmptyObject(data)) {
                $.each(data, function (k, v) {
                    date = parseDate(v.date);
                    if (printDate.getTime() === date.getTime()) {
                        if (v.price) {
                            output = '<span class="cc-print-price">&yen;' + v.price + '</span>';
                        }
                        if (v.package) {
                            output += '<span class="cc-print-package">套</span>';
                        }
                        if (v.id) {
                            output += '<input type="hidden" value="' + v.id + '">';
                        }
                    }
                });

            }

            return output;
        }

    };

    prototype = Calendar.prototype;

    //添加更直接的option修改接口
    $.each(['maxDate', 'minDate', 'date', 'selectedDate', 'dateData'], function (i, name) {
        prototype[name] = function (val) {
            return this._option(name, val);
        }
    });

    // 插件
    $.fn.calendar = function (option, value) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('calendar');
            var options = typeof option == 'object' && option;

            if (!data) {
                $this.data('calendar', (data = new Calendar(this, options)));
            }

            if (typeof option == 'string') {
                data[option] && data[option](value);
            }

        });
    }


})(jQuery);