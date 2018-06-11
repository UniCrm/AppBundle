
/**
 * --------------------------------------------------------------------------
 * CUSTOM HELPER UTILS AJAX MODAL MODULE
 */
var AjaxModalBundle = (function ($) {

    // Will be true if bootstrap is loaded, false otherwise
    var bootstrap_enabled = (typeof $().modal == 'function');

    if(!bootstrap_enabled){
        console.error('BOOTSTRAP MODAL COMPONENT IS REQUIRED');
        return false;
    }

    //CONSTANTS
    var MODAL_ID = 'ajax_modal';
    var DATA_KEY = 'ajax.bs.modal';

    var Default = {
        large : false ,
        title : 'Modal Title',
        url : '',
        show : true,
        backdrop : 'static',
        keyboard: true,
        show: true
    }

    var Selector = {
        DATA_TOGGLE : '[data-toggle=ajax-modal]',
        MODAL_ID : 'ajaxModal',
        CONTENT_WRAPPER_ID : '#ajaxModalOriginalContent',
        MODAL_TITLE_ID : 'ajaxModalTitle',
        MODAL_CONTENT_ID : 'ajaxModalContent'
    }

    /**
     * ------------------------------------------------------------------------
     * AJAX MODAL HTML TEMPLATE
     * ------------------------------------------------------------------------
     */

    var tpl = `
                <!-- Modal -->
                <div class="modal" id="${Selector.MODAL_ID}" tabindex="-1">
                    <div class="modal-dialog modal-simple">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                                <h4 class="modal-title" id="${Selector.MODAL_TITLE_ID}" data-title="App Title"></h4>
                            </div>
                
                            <!--CONTENT OF MODAL WILL BE INJECTED HERE-->
                            <div id="${Selector.MODAL_CONTENT_ID}">
                                <!--CONTENT OF MODAL WILL BE INJECTED HERE-->
                            </div>
                
                            <div id='ajaxModalOriginalContent' style="display: none!important;">
                                <div class="original-modal-body">
                                    <div class="h-150 vertical-align text-center">
                                        <div class="loader vertical-align-middle loader-grill"></div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-default" data-dismiss="modal">close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- End Modal -->
    `;


    /**
     * ------------------------------------------------------------------------
     * AJAX MODAL METHODS
     * ------------------------------------------------------------------------
     */

    init = function () {
        renderHtml();
        abortAjaxHandler();
    };

    mask = function () {
        $maskTarget = $('#' + Selector.MODAL_CONTENT_ID);

        var padding = $maskTarget.height() - 80;

        if (padding > 0) {
            padding = Math.floor(padding / 2);
        }

        $maskTarget.append("<div class='modal-mask' style='position: absolute;top: 0;left: 0; background: rgba(255,255,255,.5);z-index: 99999'><div class=\"h-150 vertical-align text-center\">\n" +
            "<div class=\"loader vertical-align-middle loader-grill\"></div>\n" +
            "</div></div>");

        //check scrollbar
        var height =  $maskTarget.outerHeight();

        //console.log($maskTarget.height());
        //console.log($maskTarget.outerHeight());

        $('.modal-mask').css({"width": $maskTarget.width() + "px", "height": height + "px", "padding-top": padding + "px"});

        disableFooterSubmitBtn();
    };

    disableFooterSubmitBtn = function () {
        $modalFooter = $('#' + Selector.MODAL_ID).find('.modal-footer [type="submit"]').each(function () {
            $(this).attr('disabled' , 'disabled');
        });
    }

    unmask = function () {
        var $maskTarget = $(".modal-body");
        $maskTarget.closest('.modal-dialog').find('[type="submit"]').removeAttr('disabled');
        $(".modal-mask").remove();
    };

    renderHtml = function () {
        $('body').append(tpl);
    };

    show = function (config) {
        setTitle(config.title);
        setModalSize(config.large);
        setInitialContent();
        setBackdropCloseHander(config.closeOnBackClick);
        loadContent(config.url, config.data);

        $('#'+Selector.MODAL_ID).modal(config);
    };

    close = function () {
        $('#'+Selector.MODAL_ID).modal('hide');
    }

    setBackdropCloseHander = function (close) {

    }

    setTitle  = function (title) {
        if(title != ''){
            $('#'+Selector.MODAL_TITLE_ID).html(title);
        }
    }

    setModalSize = function (isLargeModal) {
        $("#" + Selector.MODAL_ID).find(".modal-dialog").removeClass("mini-modal");
        if (isLargeModal === "1") {
            $("#" + Selector.MODAL_ID).find(".modal-dialog").addClass("modal-lg");
        }
    }

    setInitialContent = function () {
        $("#"+Selector.MODAL_CONTENT_ID).html($("#ajaxModalOriginalContent").html());//initial content is loader
        $("#"+Selector.MODAL_CONTENT_ID).find(".original-modal-body").removeClass("original-modal-body").addClass("modal-body");
    }

    setModalContentHtml = function (content) {
        $("#"+Selector.MODAL_CONTENT_ID).html(content);
    }

    abortAjaxHandler = function () {
        $('#' + Selector.MODAL_ID).on('hidden.bs.modal', function (e) {
            ajaxModalXhr.abort();
            $("#ajaxModal").find(".modal-dialog").removeClass("modal-lg");
            $("#ajaxModal").find(".modal-dialog").addClass("mini-modal");

            $("#ajaxModalContent").html("");
        });
    }

    loadContent = function (url,data) {
        ajaxModalXhr =$.ajax({
            url: url,
            data: data,
            cache: false,
            type: 'POST',
            success: function (response) {
                if (response.code == 'KO'){
                    toastr.error(response.message);
                    AjaxModalBundle.close();
                    return false;
                }

                setModalContentHtml(response);

                var $scroll = $("#ajaxModalContent").find(".modal-body"),
                    height = $scroll.height(),
                    maxHeight = $(window).height() - 200;
                if (height > maxHeight) {
                    height = maxHeight;
                    if ($.fn.mCustomScrollbar) {
                        $scroll.mCustomScrollbar({setHeight: height, theme: "minimal-dark", autoExpandScrollbar: true});
                    }
                }
            },
            statusCode: {
                404: function () {
                    $("#ajaxModalContent").find('.modal-body').html("");
                    toastr.error('404: Page not found.');
                },
                422 : function (msg) {
                    console.log(msg);
                }
            },
            error: function (msg) {
                $("#ajaxModalContent").find('.modal-body').html("");
                console.error(msg);
            }
        });
    }

    showSuccessAndClose = function(){
        var success_tpl = `
                    <div class='circle-done  btn-primary'><i class="md-check"></i></div>
                    
                    <style>
                        .circle-done {
                            margin:10px auto;
                            width: 120px;
                            height: 120px;
                            border-radius: 60px;
                            -webkit-box-sizing: border-box;
                            box-sizing: border-box;
                            text-align: center;
                            font-size: 65px;
                            padding: 10px;
                            color: #3c8dbc;
                        }
                        .circle-done i{
                            display: inline-block;
                            max-width: 0%;
                            overflow: hidden;
                            color: #FFFFFF;
                    
                        }
                        .circle-done.ok i{
                            max-width: 80%;
                            -webkit-transition:max-width 1000ms ease;
                            -moz-transition:max-width 1000ms ease;
                            -o-transition:max-width 1000ms ease;
                            transition:max-width 1000ms ease;
                        }
                    </style>`;

        $('.modal-mask').html(success_tpl);
        setTimeout(function () {
            $(".modal-mask").find('.circle-done').addClass('ok');

        }, 30);

        setTimeout(function () {
            AjaxModalBundle.close();
        }, 1000);


    }


    getConfig = function (config) {
        return $.extend({} , Default , config);
    };


    /**
     * ------------------------------------------------------------------------
     * ENABLE HTML5 DATA ATTRIBUTES
     * ------------------------------------------------------------------------
     */
    $(document).ready(function () {
        $(document).on('click' , Selector.DATA_TOGGLE , function (event) {

            data = {};

            //get post data
            $(this).each(function () {
                $.each(this.attributes, function () {
                    if (this.specified && this.name.match("^data-post-")) {
                        var dataName = this.name.replace("data-post-", "");
                        data[dataName] = this.value;
                    }
                });
            });

            var config = {
                large : $(this).attr('data-modal-lg'),
                title : $(this).attr('data-title'),
                url : $(this).attr('data-action-url'),
                backdrop : $(this).attr('data-backdrop'),
                keyboard : ($(this).attr('data-keyboard')) ? true : false,
                data : data,
            };

            show(getConfig(config));
        });
    });

    init();

    /**
     * EXPORT THE PUBLIC API
     */
    return {
        show : show,
        close : close,
        mask : mask,
        unmask : unmask,
        showSuccessAndClose : showSuccessAndClose
    }
})(jQuery);

//app table with datatable
(function ($) {
    //appTable using datatable
    $.fn.appTable = function (options) {

        //set default display length
        var displayLength = AppHelper.settings.displayLength * 1;

        if (isNaN(displayLength) || !displayLength) {
            displayLength = 10;
        }

        var defaults = {
            source: "", //data url,
            serverSide : true,
            paging : true,
            xlsColumns: [], // array of excel exportable column numbers
            pdfColumns: [], // array of pdf exportable column numbers
            printColumns: [], // array of printable column numbers
            columns: [], //column title and options
            order: [[0, "desc"]], //default sort value
            hideTools: false, //show/hide tools section
            displayLength: displayLength, //default rows per page
            dateRangeType: "", // type: daily, weekly, monthly, yearly. output params: start_date and end_date
            checkBoxes: [], // [{text: "Caption", name: "status", value: "in_progress", isChecked: true}]
            radioButtons: [], // [{text: "Caption", name: "status", value: "in_progress", isChecked: true}]
            filterDropdown: [], // [{id: 10, text:'Caption', isSelected:true}]
            singleDatepicker: [], // [{name: '', value:'', options:[]}]
            rangeDatepicker: [], // [{startDate:{name:"", value:""},endDate:{name:"", value:""}}]
            stateSave: true, //save user state
            stateDuration: 60 * 60 * 24 * 30, //remember for 30 days
            filterParams: {datatable: true}, //will post this vales on source url
            onDeleteSuccess: function () {
            },
            onUndoSuccess: function () {
            },
            onInitComplete: function () {
            },
            customLanguage: {
                noRecordFoundText: AppLanugage.noRecordFound,
                searchPlaceholder: AppLanugage.search,
                printButtonText: AppLanugage.print,
                excelButtonText: AppLanugage.excel,
                printButtonToolTip: AppLanugage.printButtonTooltip,
                today: AppLanugage.today,
                yesterday: AppLanugage.yesterday,
                tomorrow: AppLanugage.tomorrow
            },
            footerCallback: function (row, data, start, end, display) {
            },
            rowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            },
            summation: "", /* {column: 5, dataType: 'currency'}  dataType:currency, time */
            onRelaodCallback: function () {

            }
        };

        var $instance = $(this);

        //check if this binding with a table or not
        if (!$instance.is("table")) {
            console.log("Element must have to be a table", this);
            return false;
        }

        var settings = $.extend({}, defaults, options);

        // reload
        if (settings.reload) {
            var table = $(this).dataTable();
            var instanceSettings = window.InstanceCollection[$(this).selector];

            if (!instanceSettings) {
                instanceSettings = settings;
            }

            table.fnReloadAjax(instanceSettings.filterParams);

            if ($(this).data("onRelaodCallback")) {
                $(this).data("onRelaodCallback")(table, instanceSettings.filterParams);
            }

            return false;
        }

        // add/edit row
        if (settings.newData) {
            var table = $(this).dataTable();
            if (settings.dataId) {
                //check for existing row; if found, delete the row;
                var $row = $(this).find("[data-post-id='" + settings.dataId + "']");

                if ($row.length) {
                    table.fnDeleteRow($row.closest('tr'));
                } else {
                    var $row2 = $(this).find("[data-index-id='" + settings.dataId + "']");
                    if ($row2.length) {
                        table.fnDeleteRow($row2.closest('tr'));
                    }
                }
            }
            table.fnAddRow(settings.newData);
            return false;
        }

        settings._visible_columns = [];
        $.each(settings.columns, function (index, column) {
            if (column.visible !== false) {
                settings._visible_columns.push(index);
            }
        });

        settings._exportable = settings.xlsColumns.length + settings.pdfColumns.length + settings.printColumns.length;
        settings._firstDayOfWeek = AppHelper.settings.firstDayOfWeek || 0;
        settings._inputDateFormat = "YYYY-MM-DD";


        var getWeekRange = function (date) {
            //set first and last day of week
            if (!date)
                date = moment().format("YYYY-MM-DD");

            var dayOfWeek = moment(date).format("E"),
                diff = dayOfWeek - AppHelper.settings.firstDayOfWeek,
                range = {};

            if (diff < 7) {
                range.firstDateOfWeek = moment(date).subtract(diff, 'days').format("YYYY-MM-DD");
            } else {
                range.firstDateOfWeek = moment(date).format("YYYY-MM-DD");
            }

            if (diff < 0) {
                range.firstDateOfWeek = moment(range.firstDateOfWeek).subtract(7, 'days').format("YYYY-MM-DD");
            }

            range.lastDateOfWeek = moment(range.firstDateOfWeek).add(6, 'days').format("YYYY-MM-DD");
            return range;
        };

        var prepareDefaultDateRangeFilterParams = function () {
            if (settings.dateRangeType === "daily") {
                settings.filterParams.start_date = moment().format(settings._inputDateFormat);
                settings.filterParams.end_date = settings.filterParams.start_date;
            } else if (settings.dateRangeType === "monthly") {
                var daysInMonth = moment().daysInMonth(),
                    yearMonth = moment().format("YYYY-MM");
                settings.filterParams.start_date = yearMonth + "-01";
                settings.filterParams.end_date = yearMonth + "-" + daysInMonth;
            } else if (settings.dateRangeType === "yearly") {
                var year = moment().format("YYYY");
                settings.filterParams.start_date = year + "-01-01";
                settings.filterParams.end_date = year + "-12-31";
            } else if (settings.dateRangeType === "weekly") {
                var range = getWeekRange();
                settings.filterParams.start_date = range.firstDateOfWeek;
                settings.filterParams.end_date = range.lastDateOfWeek;
            }
        };

        var prepareDefaultCheckBoxFilterParams = function () {
            var values = [],
                name = "";
            $.each(settings.checkBoxes, function (index, option) {
                name = option.name;
                if (option.isChecked) {
                    values.push(option.value);
                }
            });
            settings.filterParams[name] = values;
        };

        var prepareDefaultRadioFilterParams = function () {
            $.each(settings.radioButtons, function (index, option) {
                if (option.isChecked) {
                    settings.filterParams[option.name] = option.value;
                }
            });
        };

        var prepareDefaultDropdownFilterParams = function () {
            $.each(settings.filterDropdown || [], function (index, dropdown){
                $.each(dropdown.options, function (index, option) {
                    if (option.isSelected) {
                        settings.filterParams[dropdown.name] = option.id;
                    }
                });
            });
        };

        var prepareDefaultrSingleDatepickerFilterParams = function () {
            $.each(settings.singleDatepicker || [], function (index, datepicker) {
                $.each(datepicker.options || [], function (index, option) {
                    if (option.isSelected) {
                        settings.filterParams[datepicker.name] = option.value;
                    }
                });
            });
        };

        var prepareDefaultrRngeDatepickerFilterParams = function () {
            $.each(settings.rangeDatepicker || [], function (index, datepicker) {

                if (datepicker.startDate && datepicker.startDate.value) {
                    settings.filterParams[datepicker.startDate.name] = datepicker.startDate.value;
                }

                if (datepicker.startDate && datepicker.endDate.value) {
                    settings.filterParams[datepicker.endDate.name] = datepicker.endDate.value;
                }

            });
        };

        prepareDefaultDateRangeFilterParams();
        prepareDefaultCheckBoxFilterParams();
        prepareDefaultRadioFilterParams();
        prepareDefaultDropdownFilterParams();
        prepareDefaultrSingleDatepickerFilterParams();
        prepareDefaultrRngeDatepickerFilterParams();

        var datatableOptions = {
            // sAjaxSource: settings.source,
            ajax: {
                url: settings.source,
                type: "POST",
                data: settings.filterParams
            },
            serverSide : settings.serverSide,
            paging : settings.paging,
            sServerMethod: "POST",
            columns: settings.columns,
            bProcessing: true,
            iDisplayLength: settings.displayLength,
            bAutoWidth: false,
            bSortClasses: false,
            order: settings.order,
            stateSave: settings.stateSave,
            fnStateLoadParams: function (oSettings, oData) {
                //if the stateSave is true, we'll remove the search value after next reload.
                if (oData && oData.search) {
                    oData.search.search = "";
                }

            },
            stateDuration: settings.stateDuration,
            fnInitComplete: function () {
                settings.onInitComplete(this);
            },
            language: {
                lengthMenu: "_MENU_",
                zeroRecords: settings.customLanguage.noRecordFoundText,
                info: "_START_-_END_ / _TOTAL_",
                sInfo: "_START_-_END_ / _TOTAL_",
                infoFiltered: "(_MAX_)",
                search: "",
                searchPlaceholder: settings.customLanguage.searchPlaceholder,
                sInfoEmpty: "0-0 / 0",
                sInfoFiltered: "(_MAX_)",
                sInfoPostFix: "",
                sInfoThousands: ",",
                sProcessing: "<div class='table-loader'> <div class=\"loader vertical-align-middle loader-grill\"></div> </div>",
                "oPaginate": {
                    "sPrevious": "<i class='wb-chevron-left'></i><i class='wb-chevron-left'></i>",
                    "sNext": "<i class='wb-chevron-right'></i><i class='wb-chevron-right'></i>"
                }

            },
            sDom: "",
            footerCallback: function (row, data, start, end, display) {
                var instance = this;
                settings.footerCallback(row, data, start, end, display, instance);
            },
            fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                settings.rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull);
            }
        };

        if (!settings.hideTools) {
            datatableOptions.sDom = "<'datatable-tools'<'col-md-1'l><'col-md-11 custom-toolbar 'f>r>t<'datatable-tools row  clearfix'<'col-md-3'i><'col-md-9'p>>";
        }

        if (settings._exportable) {
            var datatableButtons = [];

            if (settings.xlsColumns.length) {
                //add excel button
                datatableButtons.push({
                    sExtends: "xls",
                    sButtonText: settings.customLanguage.excelButtonText,
                    mColumns: settings.xlsColumns
                });
            }

            if (settings.pdfColumns.length) {
                //add pdf button
                datatableButtons.push({
                    sExtends: "pdf",
                    mColumns: settings.pdfColumns
                });
            }

            if (settings.printColumns.length) {
                //prepear print preview
                var arrayDiff = function (array1, array2) {
                    return array1.filter(function (i) {
                        return array2.indexOf(i) < 0;
                    });
                };
                settings._hiddenColumns = (arrayDiff(settings._visible_columns, settings.printColumns));
                datatableButtons.push({
                    sExtends: "print",
                    sButtonText: settings.customLanguage.printButtonText,
                    sToolTip: settings.customLanguage.printButtonToolTip,
                    sInfo: "",
                    fnClick: function (nButton, oConfig) {
                        //hide columns
                        for (var key in settings._hiddenColumns) {
                            oTable.fnSetColumnVis(settings._hiddenColumns[key], false);
                        }

                        $("html").addClass('print-peview');

                        $(".scrollable-page").addClass("print-peview");
                        this.fnPrint(true, oConfig);
                        //window.print();
                        $(window).keydown(function (e) {
                            //exit print preview;
                            if (e.which === 27) {
                                //show columns which has hidden during print preview
                                for (var key in settings._hiddenColumns) {
                                    oTable.fnSetColumnVis(settings._hiddenColumns[key], true);
                                }
                                $(".print-peview").removeClass("print-peview");
                                setPageScrollable();
                                $(".dataTables_processing").hide();
                            }
                        });
                    }
                });
            }
            if (!settings.hideTools) {
                datatableOptions.sDom = "<'datatable-tools'<'col-md-1'l><'col-md-11 custom-toolbar'f<'datatable-export'T>>r>t<'datatable-tools clearfix'<'col-md-3'i><'col-md-9'p>>";
            }

            datatableOptions.oTableTools = {
                aButtons: datatableButtons
            };
        }
        var oTable = $instance.dataTable(datatableOptions),
            $instanceWrapper = $instance.closest(".dataTables_wrapper");

        $instanceWrapper.find('.DTTT_button_print').tooltip({
            placement: 'bottom',
            container: 'body'
        });
        $instanceWrapper.find("select").select2({
            minimumResultsForSearch: -1
        });

        //set onReloadCallback
        $instance.data("onRelaodCallback", settings.onRelaodCallback);

        //build date wise filter selectors
        if (settings.dateRangeType) {
            var dateRangeFilterDom = '<div class="mr15 DTTT_container">'
                + '<button data-act="prev" class="btn btn-default btn-white date-range-selector"><i class="icon md-chevron-left"></i></button>'
                + '<button data-act="datepicker" class="btn btn-default btn-white" style="margin: -1px"></button>'
                + '<button data-act="next"  class="btn btn-default  btn-white date-range-selector"><i class="icon md-chevron-right"></i></button>'
                + '</div>';
            $instanceWrapper.find(".custom-toolbar").append(dateRangeFilterDom);

            var $datepicker = $instanceWrapper.find("[data-act='datepicker']"),
                $dateRangeSelector = $instanceWrapper.find(".date-range-selector");

            //init single day selector
            if (settings.dateRangeType === "daily") {
                var initSingleDaySelectorText = function ($elector) {
                    if (settings.filterParams.start_date === moment().format(settings._inputDateFormat)) {
                        $elector.html(settings.customLanguage.today);
                    } else if (settings.filterParams.start_date === moment().subtract(1, 'days').format(settings._inputDateFormat)) {
                        $elector.html(settings.customLanguage.yesterday);
                    } else if (settings.filterParams.start_date === moment().add(1, 'days').format(settings._inputDateFormat)) {
                        $elector.html(settings.customLanguage.tomorrow);
                    } else {
                        $elector.html(moment(settings.filterParams.start_date).format("Do, MMMM YYYY"));
                    }
                };
                prepareDefaultDateRangeFilterParams();
                initSingleDaySelectorText($datepicker);

                //bind the click events
                $datepicker.datepicker({
                    format: settings._inputDateFormat,
                    autoclose: true,
                    todayHighlight: true,
                    language: "custom",
                }).on('changeDate', function (e) {
                    var date = moment(e.date).format(settings._inputDateFormat);
                    settings.filterParams.start_date = date;
                    settings.filterParams.end_date = date;
                    initSingleDaySelectorText($datepicker);
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });

                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"), date = "";
                    if (type === "next") {
                        date = moment(settings.filterParams.start_date).add(1, 'days').format(settings._inputDateFormat);
                    } else if (type === "prev") {
                        date = moment(settings.filterParams.start_date).subtract(1, 'days').format(settings._inputDateFormat)
                    }
                    settings.filterParams.start_date = date;
                    settings.filterParams.end_date = date;
                    initSingleDaySelectorText($datepicker);
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });
            }


            //init month selector
            if (settings.dateRangeType === "monthly") {
                var initMonthSelectorText = function ($elector) {
                    $elector.html(moment(settings.filterParams.start_date).format("MMMM YYYY"));
                };

                prepareDefaultDateRangeFilterParams();
                initMonthSelectorText($datepicker);

                //bind the click events
                $datepicker.datepicker({
                    format: "YYYY-MM",
                    viewMode: "months",
                    minViewMode: "months",
                    autoclose: true,
                    language: "custom",
                }).on('changeDate', function (e) {
                    var date = moment(e.date).format(settings._inputDateFormat);
                    var daysInMonth = moment(date).daysInMonth(),
                        yearMonth = moment(date).format("YYYY-MM");
                    settings.filterParams.start_date = yearMonth + "-01";
                    settings.filterParams.end_date = yearMonth + "-" + daysInMonth;
                    initMonthSelectorText($datepicker);
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });

                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"),
                        startDate = moment(settings.filterParams.start_date),
                        endDate = moment(settings.filterParams.end_date);
                    if (type === "next") {
                        var nextMonth = startDate.add(1, 'months'),
                            daysInMonth = nextMonth.daysInMonth(),
                            yearMonth = nextMonth.format("YYYY-MM");

                        startDate = yearMonth + "-01";
                        endDate = yearMonth + "-" + daysInMonth;

                    } else if (type === "prev") {
                        var lastMonth = startDate.subtract(1, 'months'),
                            daysInMonth = lastMonth.daysInMonth(),
                            yearMonth = lastMonth.format("YYYY-MM");

                        startDate = yearMonth + "-01";
                        endDate = yearMonth + "-" + daysInMonth;
                    }

                    settings.filterParams.start_date = startDate;
                    settings.filterParams.end_date = endDate;

                    initMonthSelectorText($datepicker);
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });
            }

            //init year selector
            if (settings.dateRangeType === "yearly") {
                var inityearSelectorText = function ($elector) {
                    $elector.html(moment(settings.filterParams.start_date).format("YYYY"));
                };
                prepareDefaultDateRangeFilterParams();
                inityearSelectorText($datepicker);

                //bind the click events
                $datepicker.datepicker({
                    format: "YYYY-MM",
                    viewMode: "years",
                    minViewMode: "years",
                    autoclose: true,
                    language: "custom",
                }).on('changeDate', function (e) {
                    var date = moment(e.date).format(settings._inputDateFormat),
                        year = moment(date).format("YYYY");
                    settings.filterParams.start_date = year + "-01-01";
                    settings.filterParams.end_date = year + "-12-31";
                    inityearSelectorText($datepicker);
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });

                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"),
                        startDate = moment(settings.filterParams.start_date),
                        endDate = moment(settings.filterParams.end_date);
                    if (type === "next") {
                        startDate = startDate.add(1, 'years').format(settings._inputDateFormat);
                        endDate = endDate.add(1, 'years').format(settings._inputDateFormat);
                    } else if (type === "prev") {
                        startDate = startDate.subtract(1, 'years').format(settings._inputDateFormat);
                        endDate = endDate.subtract(1, 'years').format(settings._inputDateFormat);
                    }
                    settings.filterParams.start_date = startDate;
                    settings.filterParams.end_date = endDate;
                    inityearSelectorText($datepicker);
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });
            }

            //init week selector
            if (settings.dateRangeType === "weekly") {
                var initWeekSelectorText = function ($elector) {
                    var from = moment(settings.filterParams.start_date).format("Do MMM"),
                        to = moment(settings.filterParams.end_date).format("Do MMM, YYYY");
                    $datepicker.datepicker({
                        format: "YYYY-MM-DD",
                        autoclose: true,
                        calendarWeeks: true,
                        language: "custom",
                        weekStart: AppHelper.settings.firstDayOfWeek,
                        clearBtn: true,
                    });
                    $elector.html(from + " - " + to);
                };

                //prepareDefaultDateRangeFilterParams();
                initWeekSelectorText($datepicker);

                //bind the click events
                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"),
                        startDate = moment(settings.filterParams.start_date),
                        endDate = moment(settings.filterParams.end_date);
                    if (type === "next") {
                        startDate = startDate.add(7, 'days').format(settings._inputDateFormat);
                        endDate = endDate.add(7, 'days').format(settings._inputDateFormat);
                    } else if (type === "prev") {
                        startDate = startDate.subtract(7, 'days').format(settings._inputDateFormat);
                        endDate = endDate.subtract(7, 'days').format(settings._inputDateFormat);
                    }
                    settings.filterParams.start_date = startDate;
                    settings.filterParams.end_date = endDate;
                    initWeekSelectorText($datepicker);
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });

                $datepicker.datepicker({
                    format: settings._inputDateFormat,
                    autoclose: true,
                    calendarWeeks: true,
                    language: "custom",
                    weekStart: AppHelper.settings.firstDayOfWeek,
                    clearBtn: true,
                }).on("show", function () {
                    $(".datepicker").addClass("week-view");
                    $(".datepicker-days").find(".active").siblings(".day").addClass("active");
                }).on('changeDate', function (e) {
                    var range = getWeekRange(e.date);
                    settings.filterParams.start_date = range.firstDateOfWeek;
                    settings.filterParams.end_date = range.lastDateOfWeek;
                    initWeekSelectorText($datepicker);
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });
            }
        }

        //build checkbox filter
        if (typeof settings.checkBoxes[0] !== 'undefined') {
            var checkboxes = "", values = [], name = "";
            $.each(settings.checkBoxes, function (index, option) {
                var checked = "", active = "";
                name = option.name;
                if (option.isChecked) {
                    checked = " checked";
                    active = " active";
                    values.push(option.value);
                }
                checkboxes += '<label class="btn btn-default btn-white ' + active + '">';
                checkboxes += '<input type="checkbox" name="' + option.name + '" value="' + option.value + '" autocomplete="off" ' + checked + '>' + option.text;
                checkboxes += '</label>';
            });
            settings.filterParams[name] = values;
            var checkboxDom = '<div class="mr15 DTTT_container">'
                + '<div class="btn-group filter" data-act="checkbox" data-toggle="buttons">'
                + checkboxes
                + '</div>'
                + '</div>';
            $instanceWrapper.find(".custom-toolbar").append(checkboxDom);

            var $checkbox = $instanceWrapper.find("[data-act='checkbox']");
            $checkbox.click(function () {
                var $selector = $(this);
                setTimeout(function () {
                    var values = [],
                        name = "";
                    $selector.parent().find("input:checkbox").each(function () {
                        name = $(this).attr("name");
                        if ($(this).is(":checked")) {
                            values.push($(this).val());
                        }
                    });
                    settings.filterParams[name] = values;
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });
            });
        }


        //build radio button filter
        if (typeof settings.radioButtons[0] !== 'undefined') {
            var radiobuttons = "";
            $.each(settings.radioButtons, function (index, option) {
                var checked = "", active = "";
                if (option.isChecked) {
                    checked = " checked";
                    active = " active";
                    settings.filterParams[option.name] = option.value;
                }
                radiobuttons += '<label class="btn btn-default btn-white ' + active + '">';
                radiobuttons += '<input type="radio" name="' + option.name + '" value="' + option.value + '" autocomplete="off" ' + checked + '>' + option.text;
                radiobuttons += '</label>';
            });
            var radioDom = '<div class="mr15 DTTT_container">'
                + '<div class="btn-group filter" data-act="radio" data-toggle="buttons">'
                + radiobuttons
                + '</div>'
                + '</div>';
            $instanceWrapper.find(".custom-toolbar").append(radioDom);

            var $radioButtons = $instanceWrapper.find("[data-act='radio']");
            $radioButtons.click(function () {
                var $selector = $(this);
                setTimeout(function () {
                    $selector.parent().find("input:radio").each(function () {
                        if ($(this).is(":checked")) {
                            settings.filterParams[$(this).attr("name")] = $(this).val();
                        }
                    });
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });
            });
        }


        //build singleDatepicker filter
        if (typeof settings.singleDatepicker[0] !== 'undefined') {

            $.each(settings.singleDatepicker, function (index, datePicker) {

                var options = " ", value = "", selectedText = "";

                if (!datePicker.options)
                    datePicker.options = [];

                //add custom datepicker selector
                datePicker.options.push({value: "show-date-picker", text: AppLanugage.custom});

                //prepare custom list
                $.each(datePicker.options, function (index, option) {
                    var isSelected = "";
                    if (option.isSelected) {
                        isSelected = "active";
                        value = option.value;
                        selectedText = option.text;
                    }

                    options += '<div class="list-group-item ' + isSelected + '" data-value="' + option.value + '">' + option.text + '</div>';
                });

                if (!selectedText) {
                    selectedText = "- " + datePicker.defaultText + " -";
                    options = '<div class="list-group-item active" data-value="">' + selectedText + '</div>' + options;
                }


                //set filter params
                if (datePicker.name) {
                    settings.filterParams[datePicker.name] = value;
                }

                var reloadDatePickerFilter = function (date) {
                    settings.filterParams[datePicker.name] = date;
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                };

                var getDatePickerText = function (text) {
                    return text + "<i class='ml10 fa fa-caret-down text-off'></i>";
                };



                //prepare DOM
                var customList = '<div class="datepicker-custom-list list-group mb0">'
                    + options
                    + '</div>';

                var selectDom = '<div class="mr15 DTTT_container">'
                    + '<button name="' + datePicker.name + '" class="btn btn-default btn-white datepicker-custom-selector">'
                    + getDatePickerText(selectedText)
                    + '</button>'
                    + '</div>';
                $instanceWrapper.find(".custom-toolbar").append(selectDom);

                var $datePicker = $instanceWrapper.find("[name='" + datePicker.name + "']"),
                    showCustomRange = typeof datePicker.options[1] === 'undefined' ? false : true; //don't show custom range if options not > 1

                //init datepicker
                $datePicker.datepicker({
                    format: settings._inputDateFormat,
                    autoclose: true,
                    todayHighlight: true,
                    language: "custom",
                    weekStart: AppHelper.settings.firstDayOfWeek,
                    orientation: "bottom",
                }).on("show", function () {

                    //has custom dates, show them otherwise show the datepicker
                    if (showCustomRange) {
                        $(".datepicker-days, .datepicker-months, .datepicker-years, .datepicker-decades, .table-condensed").hide();
                        $(".datepicker-custom-list").show();
                        if (!$(".datepicker-custom-list").length) {
                            $(".datepicker").append(customList);

                            //bind click events
                            $(".datepicker .list-group-item").click(function () {
                                $(".datepicker .list-group-item").removeClass("active");
                                $(this).addClass("active");
                                var value = $(this).attr("data-value");
                                //show datepicker for custom date
                                if (value === "show-date-picker") {
                                    $(".datepicker-custom-list, .datepicker-months, .datepicker-years, .datepicker-decades, .table-condensed").hide();
                                    $(".datepicker-days, .table-condensed").show();
                                } else {
                                    $(".datepicker").hide();

                                    if (moment(value, settings._inputDateFormat).isValid()) {
                                        value = moment(value, settings._inputDateFormat).format(settings._inputDateFormat);
                                    }

                                    $datePicker.html(getDatePickerText($(this).html()));
                                    reloadDatePickerFilter(value);
                                }
                            });
                        }
                    }
                }).on('changeDate', function (e) {
                    $datePicker.html(getDatePickerText(moment(e.date, settings._inputDateFormat).format("Do, MMMM YYYY")));
                    reloadDatePickerFilter(moment(e.date, settings._inputDateFormat).format(settings._inputDateFormat));
                });

            });
        }


        //build rangeDatepicker filter
        if (typeof settings.rangeDatepicker[0] !== 'undefined') {

            $.each(settings.rangeDatepicker, function (index, datePicker) {

                var startDate = datePicker.startDate || {},
                    endDate = datePicker.endDate || {},
                    showClearButton = datePicker.showClearButton ? true : false,
                    emptyText = '<i class="fa fa-calendar"></i>',
                    startButtonText = startDate.value ? moment(startDate.value, settings._inputDateFormat).format("Do, MMMM YYYY") : emptyText,
                    endButtonText = endDate.value ? moment(endDate.value, settings._inputDateFormat).format("Do, MMMM YYYY") : emptyText;

                //set filter params
                settings.filterParams[startDate.name] = startDate.value;
                settings.filterParams[endDate.name] = endDate.value;

                var reloadDateRangeFilter = function (name, date) {
                    settings.filterParams[name] = date;
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                };


                //prepare DOM
                var selectDom = '<div class="mr15 DTTT_container">'
                    + '<div class="input-daterange input-group">'
                    + '<button class="btn btn-default btn-white form-control" name="' + startDate.name + '" data-date="' + startDate.value + '">' + startButtonText + '</button>'
                    + '<span class="input-group-addon">-</span>'
                    + '<button class="btn btn-default btn-white form-control" name="' + endDate.name + '" data-date="' + endDate.value + '">' + endButtonText + ''
                    + '</div>'
                    + '</div>';

                $instanceWrapper.find(".custom-toolbar").append(selectDom);

                var $datePicker = $instanceWrapper.find(".input-daterange"),
                    inputs = $datePicker.find('button').toArray();

                //init datepicker
                $datePicker.datepicker({
                    format: "yyyy-mm-dd",
                    autoclose: true,
                    todayHighlight: true,
                    language: "custom",
                    weekStart: AppHelper.settings.firstDayOfWeek,
                    orientation: "bottom",
                    inputs: inputs
                }).on('changeDate', function (e) {
                    var date = moment(e.date, settings._inputDateFormat).format(settings._inputDateFormat);

                    //set save value if anyone is empty
                    if (!settings.filterParams[startDate.name]) {
                        settings.filterParams[startDate.name] = date;
                    }

                    if (!settings.filterParams[endDate.name]) {
                        settings.filterParams[endDate.name] = date;
                    }

                    reloadDateRangeFilter($(e.target).attr("name"), date);

                    //show button text
                    $(inputs[0]).html(moment(settings.filterParams[startDate.name], settings._inputDateFormat).format("Do, MMMM YYYY"));
                    $(inputs[1]).html(moment(settings.filterParams[endDate.name], settings._inputDateFormat).format("Do, MMMM YYYY"));

                }).on("show", function () {

                    //show clear button
                    if (showClearButton) {
                        $(".datepicker-clear-selection").show();
                        if (!$(".datepicker-clear-selection").length) {
                            $(".datepicker").append("<div class='datepicker-clear-selection p5 clickable text-center'>" + AppLanugage.clear + "</div>");

                            //bind click event for clear button
                            $(".datepicker .datepicker-clear-selection").click(function () {
                                settings.filterParams[startDate.name] = "";
                                reloadDateRangeFilter(endDate.name, "");

                                $(inputs[0]).html(emptyText);
                                $(inputs[1]).html(emptyText);
                                $(".datepicker").hide();
                            });
                        }
                    }
                });

            });
        }


        //build dropdown filter
        if (typeof settings.filterDropdown[0] !== 'undefined') {
            var radiobuttons = "";
            $.each(settings.filterDropdown, function (index, dropdown) {
                var optons = "", selectedValue = "";

                $.each(dropdown.options, function (index, option) {
                    var isSelected = "";
                    if (option.isSelected) {
                        isSelected = "selected";
                        selectedValue = option.id;
                    }
                    optons += '<option ' + isSelected + ' value="' + option.id + '">' + option.text + '</option>';
                });

                if (dropdown.name) {
                    settings.filterParams[dropdown.name] = selectedValue;
                }

                var selectDom = '<div class="mr15 DTTT_container">'
                    + '<select class="' + dropdown.class + '" name="' + dropdown.name + '">'
                    + optons
                    + '</select>'
                    + '</div>';

                $instanceWrapper.find(".custom-toolbar").append(selectDom);

                var $dropdown = $instanceWrapper.find("[name='" + dropdown.name + "']");
                if (window.Select2 !== undefined) {
                    $dropdown.select2();
                }


                $dropdown.change(function () {
                    var $selector = $(this);
                    settings.filterParams[$selector.attr("name")] = $selector.val();
                    $instance.appTable({reload: true, filterParams: settings.filterParams});
                });
            });
        }

        var undoHandler = function (eventData) {
            $('<a class="undo-delete" href="javascript:;"><strong>Undo</strong></a>').insertAfter($(eventData.alertSelector).find(".app-alert-message"));
            $(eventData.alertSelector).find(".undo-delete").bind("click", function () {
                $(eventData.alertSelector).remove();
                appLoader.show();
                $.ajax({
                    url: eventData.url,
                    type: 'POST',
                    dataType: 'json',
                    data: {id: eventData.id, undo: true},
                    success: function (result) {
                        appLoader.hide();
                        if (result.success) {
                            $instance.appTable({newData: result.data});
                            //fire success callback
                            settings.onUndoSuccess(result);
                        }
                    }
                });
            });
        };

        var deleteHandler = function (e) {
            var $target = $(e.currentTarget);

            if (e.data && e.data.target) {
                $target = e.data.target;
            }

            var url = $target.attr('data-action-url'),
                id = $target.attr('data-id'),
                undo = $target.attr('data-undo');
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: {id: id},
                success: function (result) {
                    if (result.code == 'OK') {
                        var tr = $target.closest('tr'),
                            table = $instance.DataTable();

                        oTable.fnDeleteRow(table.row(tr)[0]);

                        //fire success callback
                        settings.onDeleteSuccess(result);

                        //bind undo selector
                        if (undo == "1") {
                            undoHandler({
                                alertSelector: alertId,
                                url: url,
                                id: id
                            });
                        }
                    } else {
                        toastr.error(result.message);
                    }
                }
            });
        };

        var deleteConfirmationHandler = function (e) {
            e.preventDefault();

            var $deleteButton = $("#confirmDeleteButton"),
                $target = $(e.currentTarget);

            //copy attributes
            $(this).each(function () {
                $.each(this.attributes, function () {
                    if (this.specified && this.name.match("^data-")) {
                        $deleteButton.attr(this.name, this.value);
                    }

                });
            });

            $target.attr("data-undo", "0"); //don't show undo

            //bind click event
            $deleteButton.unbind("click");
            $deleteButton.on("click", {target: $target}, deleteHandler);

            $("#confirmationModal").modal('show');
        };

        window.InstanceCollection = window.InstanceCollection || {};
        window.InstanceCollection["#" + this.id] = settings;

        $('body').find($instance).on('click', '[data-action=delete]', deleteHandler);
        $('body').find($instance).on('click', '[data-action=delete-confirmation]', deleteConfirmationHandler);
        $('.custom-toolbar').closest('.datatable-tools').addClass('row');

        $.fn.dataTableExt.oApi.getSettings = function (oSettings) {
            return oSettings;
        };

        $.fn.dataTableExt.oApi.fnReloadAjax = function (oSettings, filterParams ) {

            oSettings.ajax.data = filterParams;

            //this.fnDraw(this);

            table = $(this).DataTable();

            table.ajax.reload();

            return false;
        };
        $.fn.dataTableExt.oApi.fnAddRow = function (oSettings, data) {
            this.oApi._fnAddData(oSettings, data);
            this.fnDraw(this);
        };

    };
})(jQuery);

//custom app form controller
(function ($) {
    $.fn.appForm = function (options) {
        var defaults = {
            ajaxSubmit: true,
            isModal: true,
            dataType: "json",
            onModalClose: function () {
            },
            onSuccess: function () {
            },
            onError: function () {
                return true;
            },
            onSubmit: function () {
            },
            onAjaxSuccess: function () {
            },
            beforeAjaxSubmit: function (data, self, options) {
            }
        };
        var settings = $.extend({}, defaults, options);
        this.each(function () {
            if (settings.ajaxSubmit) {
                validateForm($(this), function (form) {
                    settings.onSubmit();
                    if (settings.isModal) {
                        AjaxModalBundle.mask();
                    }
                    $(form).ajaxSubmit({
                        dataType: settings.dataType,
                        beforeSubmit: function (data, self, options) {
                            settings.beforeAjaxSubmit(data, self, options);
                        },
                        success: function (result) {
                            settings.onAjaxSuccess(result);

                            if (result.success) {
                                settings.onSuccess(result);
                                if (settings.isModal) {
                                    AjaxModalBundle.close();
                                }
                            } else {
                                if (settings.onError(result)) {
                                    if (settings.isModal) {
                                        AjaxModalBundle.unmask();
                                        if (result.message) {
                                            toastr.error(result.message);
                                        }
                                    } else if (result.message) {
                                        toastr.error(result.message);
                                    }
                                }
                            }
                        },
                        error : function (msg) {
                            AjaxModalBundle.unmask();
                            toastr.error(msg.responseJSON.message);
                            parseFormErrors(msg.responseJSON);
                        }
                    });
                });
            } else {
                validateForm($(this));
            }
        });

        /*
         * @form : the form we want to validate;
         * @customSubmit : execute custom js function insted of form submission.
         * don't pass the 2nd parameter for regular form submission
         */
        function validateForm(form, customSubmit) {
            //add custom method
            $.validator.addMethod("greaterThanOrEqual",
                function (value, element, params) {
                    var paramsVal = params;
                    if (params && (params.indexOf("#") === 0 || params.indexOf(".") === 0)) {
                        paramsVal = $(params).val();
                    }
                    if (!/Invalid|NaN/.test(new Date(value))) {
                        return new Date(value) >= new Date(paramsVal);
                    }
                    return isNaN(value) && isNaN(paramsVal) || (Number(value) >= Number(paramsVal));
                }, 'Must be greater than {0}.');
            $(form).validate({
                submitHandler: function (form) {
                    if (customSubmit) {
                        customSubmit(form);
                    } else {
                        return true;
                    }
                },
                highlight: function (element) {
                    $(element).addClass('is-invalid');
                },
                unhighlight: function (element) {
                    $(element).removeClass('is-invalid');
                },
                errorElement: 'span',
                errorClass: 'invalid-feedback',
                ignore: ":hidden:not(.validate-hidden)",
                errorPlacement: function (error, element) {
                    if (element.parent('.input-group').length ||element.parent('.form-check').length ) {
                        error.insertAfter(element.parent());
                    } else {
                        error.insertAfter(element);
                    }
                }
            });
            //handeling the hidden field validation like select2
            $(".validate-hidden").click(function () {
                $(this).closest('.form-group').removeClass('has-error').find(".help-block").hide();
            });
        }
    };
})(jQuery);