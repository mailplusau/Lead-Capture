/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-10-29T09:36:21+11:00
 * @Filename: mp_cl2.0_mpex_usage_per_month_v2.js
 * @Last modified by:   ankithravindran
 * @Last modified time: 2021-11-02T19:51:36+11:00
 */


define(
    ['N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log',
        'N/error', 'N/url', 'N/format', 'N/currentRecord'
    ],
    function (email, runtime, search, record, http, log, error, url, format,
        currentRecord) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }

        role = runtime.getCurrentUser().role;
        var userName = runtime.getCurrentUser().name;
        var userId = runtime.getCurrentUser().id;
        var currRec = currentRecord.get();

        var invoiceType = null;

        var no_of_working_days = [];
        var working_days_json = '{[]}';

        var no_of_working_days = [];
        var invoiceTypeServices = [];
        var invoiceTypeMPEX = [];
        var invoiceTypeNeoPost = [];

        var customerID;

        var total_revenue_per_state = [];

        var month;
        var weekdays_current_month;

        var total_months = 14;

        var today = new Date();
        var today_day_in_month = today.getDate();
        var today_day_in_week = today.getDay();
        var today_month = today.getMonth() + 1;
        var today_year = today.getFullYear();

        var customer_signed = 0;
        var suspect_new = 0;
        var suspect_hot_lead = 0;
        var suspect_reassign = 0;
        var suspect_lost = 0;
        var suspect_customer_lost = 0;
        var suspect_off_peak_pipeline = 0;
        var total_leads = 0;



        var kerina_sales_rep = 0;
        var lee_sales_rep = 0;
        var david_sales_rep = 0;
        var belinda_sales_rep = 0;
        var others_sales_rep = 0;
        var total_sales_rep_leads = 0;

        /**
         * 	MailPlus Express	1	 
 
Post Office Services	2	 
 
Biodegradable satchel	3	 
 
API Solution	4	 
 
Standard parcel delivery	5	 
 
Starshipit integration	6	 
         */

        var service_mpex = 0;
        var service_po = 0;
        var service_bio = 0;
        var service_api = 0;
        var service_std = 0;
        var service_starshipit = 0;
        var total_service_leads = 0;


        if (today_day_in_month < 10) {
            today_day_in_month = '0' + today_day_in_month;
        }

        if (today_month < 10) {
            today_month = '0' + (today_month);
        }

        var todayString = today_day_in_month + '/' + today_month + '/' +
            today_year;
        // console.log('Todays Date: ' + todayString);

        var current_year_month = today_year + '-' + today_month;
        // console.log('Current Year-Month: ' + current_year_month);

        var difference_months = total_months - parseInt(today_month);

        if (role == 1000) {
            zee = runtime.getCurrentUser().id;
        } else if (role == 3) { // Administrator
            zee = 6; // test
        } else if (role == 1032) { // System Support
            zee = 425904; // test-AR
        }

        function isWeekday(year, month, day) {
            var day = new Date(year, month, day).getDay();
            return day != 0 && day != 6;
        }

        function getWeekdaysInMonth(month, year) {
            var days = daysInMonth(month, year);
            var weekdays = 0;
            for (var i = 0; i < days; i++) {
                if (isWeekday(year, month, i + 1))
                    weekdays++;
            }
            return weekdays;
        }

        function daysInMonth(iMonth, iYear) {
            return 32 - new Date(iYear, iMonth, 32).getDate();
        }

        function pageLoad() {
            $('.range_filter_section').addClass('hide');
            $('.range_filter_section_top').addClass('hide');
            $('.date_filter_section').addClass('hide');
            $('.period_dropdown_section').addClass('hide');
            $('.main-tabs-sections').addClass('hide');
            $('.loading_section').removeClass('hide');
        }

        function beforeSubmit() {
            // $('#customer_benchmark_preview').hide();
            // $('#customer_benchmark_preview').addClass('hide');
            $('.main-tabs-sections').addClass('hide');
            $('.loading_section').removeClass('hide');
        }

        function afterSubmit() {
            $('.date_filter_section').removeClass('hide');
            $('.period_dropdown_section').removeClass('hide');
            $('.main-tabs-sections').removeClass('hide');
            $('.loading_section').addClass('hide');

            // if (!isNullorEmpty($('#result_customer_benchmark').val())) {
            // $('#customer_benchmark_preview').removeClass('hide');
            // $('#customer_benchmark_preview').show();
            // }
            //
            // $('#result_customer_benchmark').on('change', function() {
            // $('#customer_benchmark_preview').removeClass('hide');
            // $('#customer_benchmark_preview').show();
            // });
            //
            // $('#customer_benchmark_preview').removeClass('hide');
            // $('#customer_benchmark_preview').show();
        }

        function pageInit() {
            // selectRangeOptions();

            $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            $("#body").css("background-color", "#CFE0CE");

            previewDataSet = [];
            preview_set = [];

            postcodeDataSet = [];
            postcode_set = [];

            salesRepDataSet = [];
            salesRep_set = [];


            serviceDataSet = [];
            service_set = [];


            if (!isNullorEmpty($('#period_dropdown option:selected').val())) {
                selectDate();
            }
            $('#period_dropdown').change(function () {
                selectDate();
            });

            $('#invoice_type_dropdown').change(
                function () {
                    invoiceType = $(
                        '#invoice_type_dropdown option:selected')
                        .val();
                    // selectInvoiceType();
                });

            /**
             * Submit Button Function
             */
            $('#submit').click(function () {
                // Ajax request
                var fewSeconds = 10;
                var btn = $(this);
                btn.addClass('disabled');
                // btn.addClass('')
                setTimeout(function () {
                    btn.removeClass('disabled');
                }, fewSeconds * 1000);

                previewDataSet = [];
                preview_set = [];

                postcodeDataSet = [];
                postcode_set = [];

                salesRepDataSet = [];
                salesRep_set = [];

                serviceDataSet = [];
                service_set = [];

                beforeSubmit();
                submitSearch();

                return true;
            });

            /**
             * Auto Load Submit Search and Load Results on Page
             * Initialisation
             */
            pageLoad();
            submitSearch();
            var dataTable = $('#mpexusage-preview').DataTable();
            var dataTable2 = $('#mpexusage-customer').DataTable();

            var today = new Date();
            var today_year = today.getFullYear();
            var today_month = today.getMonth();
            var today_day = today.getDate();

            /**
             * Click for Instructions Section Collapse
             */
            $('.collapse').on('shown.bs.collapse', function () {
                $(".range_filter_section_top").css("padding-top", "500px");
            })
            $('.collapse').on('hide.bs.collapse', function () {
                $(".range_filter_section_top").css("padding-top", "0px");
            })
        }

        function submitSearch() {
            beforeSubmit();

            var date_from = $('#date_from').val();
            var date_to = $('#date_to').val();
            date_from = dateISOToNetsuite(date_from);
            date_to = dateISOToNetsuite(date_to);

            console.log('Load DataTable Params: ' + date_from + ' | ' +
                date_to + ' | ' + zee);

            LoadSearchResults(date_from, date_to, zee, null, customerID);

            console.log('Loaded Results');

            afterSubmit();
        }

        function expActWeeklyUsage() {
            var today = new Date();
            var today_day_in_month = today.getDate();
            var today_day_in_week = today.getDay();
            var today_month = today.getMonth() + 1;
            var today_year = today.getFullYear();

            var todayString = today_year + '-' + today_month + '-' + today_day_in_month;
            var url =
                'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1378&deploy=1'
            // window.location.href = url;
            window.open(
                url,
                '_blank' // <- This is what makes it open in a new window.
            );
        }

        function LoadSearchResults(date_from, date_to, zee_id, dataTable, custID) {
            // Website New Leads - Monthly
            var websiteNewLeadsMonthlySearch = search.load({
                type: 'customer',
                id: 'customsearch_website_new_leads_monthly'
            });

            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                websiteNewLeadsMonthlySearch.filters.push(search.createFilter({
                    name: 'custentity_date_lead_entered',
                    join: null,
                    operator: search.Operator.ONORAFTER,
                    values: date_from
                }));
                websiteNewLeadsMonthlySearch.filters.push(search.createFilter({
                    name: 'custentity_date_lead_entered',
                    join: null,
                    operator: search.Operator.ONORBEFORE,
                    values: date_to
                }));
            }

            var old_date = null;
            var count = 0;

            websiteNewLeadsMonthlySearch.run().each(function (websiteNewLeadsMonthlyResult) {

                var dateLeadEnteredMonthly = websiteNewLeadsMonthlyResult.getValue({
                    name: 'custentity_date_lead_entered',
                    summary: 'GROUP'
                });
                var leadCount = parseInt(websiteNewLeadsMonthlyResult.getValue({
                    name: 'internalid',
                    summary: 'COUNT'
                }));

                var leadStatus = websiteNewLeadsMonthlyResult.getValue({
                    name: 'entitystatus',
                    summary: 'GROUP'
                });

                var leadStatusText = websiteNewLeadsMonthlyResult.getText({
                    name: 'entitystatus',
                    summary: 'GROUP'
                });

                if (old_date == null) {

                    if (leadStatus == 13) { //Customer - Signed
                        customer_signed = leadCount
                    } else if (leadStatus == 22) { //Suspect - Customer - Lost
                        suspect_customer_lost = leadCount
                    } else if (leadStatus == 57) { //Suspect - Hot Lead
                        suspect_hot_lead = leadCount
                    } else if (leadStatus == 59) { //Suspect - Lost
                        suspect_lost = leadCount
                    } else if (leadStatus == 60) { //Suspect - Rep Reassign
                        suspect_reassign = leadCount
                    } else if (leadStatus == 62) { //Suspect - Off Peak Pipeline
                        suspect_off_peak_pipeline = leadCount
                    } else if (leadStatus == 6) { // Suspect - New
                        suspect_new = leadCount
                    }

                    total_leads = customer_signed + suspect_customer_lost + suspect_hot_lead + suspect_lost + suspect_reassign + suspect_off_peak_pipeline + suspect_new

                } else if (old_date != null &&
                    old_date == dateLeadEnteredMonthly) {
                    if (leadStatus == 13) { //Customer - Signed
                        customer_signed += leadCount
                    } else if (leadStatus == 22) { //Suspect - Customer - Lost
                        suspect_customer_lost += leadCount
                    } else if (leadStatus == 57) { //Suspect - Hot Lead
                        suspect_hot_lead += leadCount
                    } else if (leadStatus == 59) { //Suspect - Lost
                        suspect_lost += leadCount
                    } else if (leadStatus == 60) { //Suspect - Rep Reassign
                        suspect_reassign += leadCount
                    } else if (leadStatus == 62) { //Suspect - Off Peak Pipeline
                        suspect_off_peak_pipeline += leadCount
                    } else if (leadStatus == 6) { // Suspect - New
                        suspect_new += leadCount
                    }

                    total_leads = customer_signed + suspect_customer_lost + suspect_hot_lead + suspect_lost + suspect_reassign + suspect_off_peak_pipeline + suspect_new;

                } else if (old_date != null &&
                    old_date != dateLeadEnteredMonthly) {

                    preview_set.push({
                        dateLeadEntered: old_date,
                        suspect_new: suspect_new,
                        suspect_hot_lead: suspect_hot_lead,
                        suspect_reassign: suspect_reassign,
                        suspect_off_peak_pipeline: suspect_off_peak_pipeline,
                        suspect_lost: suspect_lost,
                        suspect_customer_lost: suspect_customer_lost,
                        customer_signed: customer_signed,
                        total_leads: total_leads
                    });

                    customer_signed = 0;
                    suspect_new = 0;
                    suspect_hot_lead = 0;
                    suspect_reassign = 0;
                    suspect_lost = 0;
                    suspect_customer_lost = 0;
                    suspect_off_peak_pipeline = 0;
                    total_leads = 0;

                    if (leadStatus == 13) { //Customer - Signed
                        customer_signed = leadCount
                    } else if (leadStatus == 22) { //Suspect - Customer - Lost
                        suspect_customer_lost = leadCount
                    } else if (leadStatus == 57) { //Suspect - Hot Lead
                        suspect_hot_lead = leadCount
                    } else if (leadStatus == 59) { //Suspect - Lost
                        suspect_lost = leadCount
                    } else if (leadStatus == 60) { //Suspect - Rep Reassign
                        suspect_reassign = leadCount
                    } else if (leadStatus == 62) { //Suspect - Off Peak Pipeline
                        suspect_off_peak_pipeline = leadCount
                    } else if (leadStatus == 6) { // Suspect - New
                        suspect_new = leadCount
                    }

                    total_leads = customer_signed + suspect_customer_lost + suspect_hot_lead + suspect_lost + suspect_reassign + suspect_off_peak_pipeline + suspect_new


                }

                old_date = dateLeadEnteredMonthly;
                count++;
                return true;
            });


            if (count > 0) {
                preview_set.push({
                    dateLeadEntered: old_date,
                    suspect_new: suspect_new,
                    suspect_hot_lead: suspect_hot_lead,
                    suspect_reassign: suspect_reassign,
                    suspect_off_peak_pipeline: suspect_off_peak_pipeline,
                    suspect_lost: suspect_lost,
                    suspect_customer_lost: suspect_customer_lost,
                    customer_signed: customer_signed,
                    total_leads: total_leads
                });
            }

            console.log('preview_set');
            console.log(preview_set);

            // Website New Leads - By Postcode
            var websiteNewLeadsByPostcodeSearch = search.load({
                type: 'customer',
                id: 'customsearch_website_new_leads_postcode'
            });

            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                websiteNewLeadsByPostcodeSearch.filters.push(search
                    .createFilter({
                        name: 'custentity_date_lead_entered',
                        join: null,
                        operator: search.Operator.ONORAFTER,
                        values: date_from
                    }));
                websiteNewLeadsByPostcodeSearch.filters.push(search
                    .createFilter({
                        name: 'custentity_date_lead_entered',
                        join: null,
                        operator: search.Operator.ONORBEFORE,
                        values: date_to
                    }));
            }


            websiteNewLeadsByPostcodeSearch
                .run()
                .each(
                    function (websiteNewLeadsByPostcodeSearchResults) {

                        var leadCountByPostcode = parseInt(websiteNewLeadsByPostcodeSearchResults
                            .getValue({
                                name: 'internalid',
                                summary: 'COUNT'
                            }));

                        var leadShippingZip = websiteNewLeadsByPostcodeSearchResults
                            .getValue({
                                name: 'shipzip',
                                summary: 'GROUP'
                            });

                        if (!isNullorEmpty(leadShippingZip) && leadShippingZip != '- None -') {
                            postcode_set.push({
                                leadCountByPostcode: leadCountByPostcode,
                                leadShippingZip: leadShippingZip
                            });
                        }


                        return true;
                    });
            console.log('postcode_set');
            console.log(postcode_set);


            // Website New Leads - By Sales Rep
            var websiteNewLeadsBySalesRepSearch = search.load({
                type: 'customer',
                id: 'customsearch_website_new_leads_salesrep'
            });

            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                websiteNewLeadsBySalesRepSearch.filters.push(search.createFilter({
                    name: 'custentity_date_lead_entered',
                    join: null,
                    operator: search.Operator.ONORAFTER,
                    values: date_from
                }));
                websiteNewLeadsBySalesRepSearch.filters.push(search.createFilter({
                    name: 'custentity_date_lead_entered',
                    join: null,
                    operator: search.Operator.ONORBEFORE,
                    values: date_to
                }));
            }

            var count_sales_rep = 0;
            var old_sales_rep_date_entered = null;

            websiteNewLeadsBySalesRepSearch.run().each(function (websiteNewLeadsBySalesRepSearchResult) {

                var dateLeadEnteredBySalesRep = websiteNewLeadsBySalesRepSearchResult.getValue({
                    name: 'custentity_date_lead_entered',
                    summary: 'GROUP'
                });

                var leadCountBySalesRep = parseInt(websiteNewLeadsBySalesRepSearchResult.getValue({
                    name: 'internalid',
                    summary: 'COUNT'
                }));

                var salesRepAssignedId = websiteNewLeadsBySalesRepSearchResult.getValue({
                    name: "custrecord_sales_assigned",
                    join: "CUSTRECORD_SALES_CUSTOMER",
                    summary: "GROUP"
                });

                var salesRepAssigned = websiteNewLeadsBySalesRepSearchResult.getText({
                    name: "custrecord_sales_assigned",
                    join: "CUSTRECORD_SALES_CUSTOMER",
                    summary: "GROUP"
                });

                if (old_sales_rep_date_entered == null) {

                    if (salesRepAssignedId == 696160) { //Sales Rep - Kerina
                        kerina_sales_rep = leadCountBySalesRep
                    } else if (salesRepAssignedId == 690145) { //Sales Rep - David
                        david_sales_rep = leadCountBySalesRep
                    } else if (salesRepAssignedId == 668711) { //Sales Rep - Lee
                        lee_sales_rep = leadCountBySalesRep
                    } else if (salesRepAssignedId == 668712) { // Sales Rep - Belinda
                        belinda_sales_rep = leadCountBySalesRep
                    } else {
                        others_sales_rep = leadCountBySalesRep
                    }

                    total_sales_rep_leads = kerina_sales_rep + david_sales_rep + lee_sales_rep + belinda_sales_rep + others_sales_rep

                } else if (old_sales_rep_date_entered != null &&
                    old_sales_rep_date_entered == dateLeadEnteredBySalesRep) {
                    if (salesRepAssignedId == 696160) { //Sales Rep - Kerina
                        kerina_sales_rep += leadCountBySalesRep
                    } else if (salesRepAssignedId == 690145) { //Sales Rep - David
                        david_sales_rep += leadCountBySalesRep
                    } else if (salesRepAssignedId == 668711) { //Sales Rep - Lee
                        lee_sales_rep += leadCountBySalesRep
                    } else if (salesRepAssignedId == 668712) { // Sales Rep - Belinda
                        belinda_sales_rep += leadCountBySalesRep
                    } else {
                        others_sales_rep += leadCountBySalesRep
                    }

                    total_sales_rep_leads = kerina_sales_rep + david_sales_rep + lee_sales_rep + belinda_sales_rep + others_sales_rep

                } else if (old_sales_rep_date_entered != null &&
                    old_sales_rep_date_entered != dateLeadEnteredBySalesRep) {

                    salesRep_set.push({
                        dateLeadEntered: old_sales_rep_date_entered,
                        kerina_sales_rep: kerina_sales_rep,
                        david_sales_rep: david_sales_rep,
                        lee_sales_rep: lee_sales_rep,
                        belinda_sales_rep: belinda_sales_rep,
                        others_sales_rep: others_sales_rep,
                        total_sales_rep_leads: total_sales_rep_leads
                    });

                    kerina_sales_rep = 0;
                    lee_sales_rep = 0;
                    david_sales_rep = 0;
                    belinda_sales_rep = 0;
                    others_sales_rep = 0;
                    total_sales_rep_leads = 0;

                    if (salesRepAssignedId == 696160) { //Sales Rep - Kerina
                        kerina_sales_rep = leadCountBySalesRep
                    } else if (salesRepAssignedId == 690145) { //Sales Rep - David
                        david_sales_rep = leadCountBySalesRep
                    } else if (salesRepAssignedId == 668711) { //Sales Rep - Lee
                        lee_sales_rep = leadCountBySalesRep
                    } else if (salesRepAssignedId == 668712) { // Sales Rep - Belinda
                        belinda_sales_rep = leadCountBySalesRep
                    } else {
                        others_sales_rep = leadCountBySalesRep
                    }

                    total_sales_rep_leads = kerina_sales_rep + david_sales_rep + lee_sales_rep + belinda_sales_rep + others_sales_rep


                }

                old_sales_rep_date_entered = dateLeadEnteredBySalesRep;
                count_sales_rep++;
                return true;
            });


            if (count_sales_rep > 0) {
                salesRep_set.push({
                    dateLeadEntered: old_sales_rep_date_entered,
                    kerina_sales_rep: kerina_sales_rep,
                    david_sales_rep: david_sales_rep,
                    lee_sales_rep: lee_sales_rep,
                    belinda_sales_rep: belinda_sales_rep,
                    others_sales_rep: others_sales_rep,
                    total_sales_rep_leads: total_sales_rep_leads
                });
            }
            console.log('salesRep_set');
            console.log(salesRep_set);

            // Website New Leads - By Service of Interest
            var websiteNewLeadsByServiceOfInterestSearch = search.load({
                type: 'customer',
                id: 'customsearch_website_new_leads_services'
            });

            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                websiteNewLeadsByServiceOfInterestSearch.filters.push(search.createFilter({
                    name: 'custentity_date_lead_entered',
                    join: null,
                    operator: search.Operator.ONORAFTER,
                    values: date_from
                }));
                websiteNewLeadsByServiceOfInterestSearch.filters.push(search.createFilter({
                    name: 'custentity_date_lead_entered',
                    join: null,
                    operator: search.Operator.ONORBEFORE,
                    values: date_to
                }));
            }

            var count_service = 0;
            var old_service_date_entered = null;

            websiteNewLeadsByServiceOfInterestSearch.run().each(function (websiteNewLeadsByServiceOfInterestSearchResult) {

                var dateLeadEnteredByService = websiteNewLeadsByServiceOfInterestSearchResult.getValue({
                    name: 'custentity_date_lead_entered',
                    summary: 'GROUP'
                });

                var serviceOfInterestId = websiteNewLeadsByServiceOfInterestSearchResult.getValue({
                    name: 'custentity_services_of_interest',
                    summary: 'GROUP'
                });

                var serviceOfInterest = websiteNewLeadsByServiceOfInterestSearchResult.getText({
                    name: 'custentity_services_of_interest',
                    summary: 'GROUP'
                });

                var leadCountByServices = parseInt(websiteNewLeadsByServiceOfInterestSearchResult.getValue({
                    name: 'internalid',
                    summary: 'COUNT'
                }));

                /**
                 * 	MailPlus Express	1	 
 
                    Post Office Services	2	 
                    
                    Biodegradable satchel	3	 
                    
                    API Solution	4	 
                    
                    Standard parcel delivery	5	 
                    
                    Starshipit integration	6	 
                 */

                if (old_service_date_entered == null) {

                    if (serviceOfInterestId == 1) {
                        service_mpex = leadCountByServices
                    } else if (serviceOfInterestId == 2) {
                        service_po = leadCountByServices
                    } else if (serviceOfInterestId == 3) {
                        service_bio = leadCountByServices
                    } else if (serviceOfInterestId == 4) {
                        service_api = leadCountByServices
                    } else if (serviceOfInterestId == 5) {
                        service_std = leadCountByServices
                    } else if (serviceOfInterestId == 6) {
                        service_starshipit = leadCountByServices
                    }

                    total_service_leads = service_mpex + service_po + service_bio + service_api + service_std + service_starshipit

                } else if (old_service_date_entered != null &&
                    old_service_date_entered == dateLeadEnteredByService) {

                    if (serviceOfInterestId == 1) {
                        service_mpex = leadCountByServices
                    } else if (serviceOfInterestId == 2) {
                        service_po = leadCountByServices
                    } else if (serviceOfInterestId == 3) {
                        service_bio = leadCountByServices
                    } else if (serviceOfInterestId == 4) {
                        service_api = leadCountByServices
                    } else if (serviceOfInterestId == 5) {
                        service_std = leadCountByServices
                    } else if (serviceOfInterestId == 6) {
                        service_starshipit = leadCountByServices
                    }
                    total_service_leads = service_mpex + service_po + service_bio + service_api + service_std + service_starshipit

                } else if (old_service_date_entered != null &&
                    old_service_date_entered != dateLeadEnteredByService) {

                    service_set.push({
                        dateLeadEnteredByService: old_service_date_entered,
                        service_mpex: service_mpex,
                        service_po: service_po,
                        service_bio: service_bio,
                        service_api: service_api,
                        service_std: service_std,
                        service_starshipit: service_starshipit,
                        total_service_leads: total_service_leads
                    });

                    service_mpex = 0;
                    service_po = 0;
                    service_bio = 0;
                    service_api = 0;
                    service_std = 0;
                    service_starshipit = 0;
                    total_service_leads = 0;


                    if (serviceOfInterestId == 1) {
                        service_mpex = leadCountByServices
                    } else if (serviceOfInterestId == 2) {
                        service_po = leadCountByServices
                    } else if (serviceOfInterestId == 3) {
                        service_bio = leadCountByServices
                    } else if (serviceOfInterestId == 4) {
                        service_api = leadCountByServices
                    } else if (serviceOfInterestId == 5) {
                        service_std = leadCountByServices
                    } else if (serviceOfInterestId == 6) {
                        service_starshipit = leadCountByServices
                    }

                    total_service_leads = service_mpex + service_po + service_bio + service_api + service_std + service_starshipit


                }

                old_service_date_entered = dateLeadEnteredByService;
                count_service++;
                return true;
            });


            if (count_service > 0) {
                service_set.push({
                    dateLeadEnteredByService: old_service_date_entered,
                    service_mpex: service_mpex,
                    service_po: service_po,
                    service_bio: service_bio,
                    service_api: service_api,
                    service_std: service_std,
                    service_starshipit: service_starshipit,
                    total_service_leads: total_service_leads
                });
            }
            console.log('service_set');
            console.log(service_set);

            loadDatatable(preview_set, postcode_set, salesRep_set, service_set);
            preview_set = [];
            customer_set = [];

        }

        function loadDatatable(preview_rows, postcode_rows, salesRep_rows, service_rows) {
            // $('#result_debt').empty();
            previewDataSet = [];
            postcodeDataSet = [];
            salesRepDataSet = [];
            serviceDataSet = [];

            csvPreviewSet = [];
            csvPostcodeSet = [];
            csvSalesRepSet = [];


            if (!isNullorEmpty(preview_rows)) {
                preview_rows
                    .forEach(function (preview_row, index) {

                        // var month = preview_row.dateLeadEntered;

                        previewDataSet.push([preview_row.dateLeadEntered,
                        preview_row.suspect_new,
                        preview_row.suspect_hot_lead,
                        preview_row.suspect_reassign,
                        preview_row.suspect_off_peak_pipeline,
                        preview_row.suspect_lost,
                        preview_row.suspect_customer_lost,
                        preview_row.customer_signed,
                        preview_row.total_leads,
                        ]);

                    });
            }

            console.log('previewDataSet');
            console.log(previewDataSet);

            var dataTable = $('#mpexusage-preview').DataTable({
                destroy: true,
                data: previewDataSet,
                pageLength: 1000,
                columns: [{
                    title: 'Period'
                }, {
                    title: 'Suspect - New'
                }, {
                    title: 'Suspect - Hot Lead'
                }, {
                    title: 'Suspect - Reassign'
                }, {
                    title: 'Suspect - Off Peak Pipeline'
                }, {
                    title: 'Suspect - Lost'
                }, {
                    title: 'Suspect - Customer Lost'
                }, {
                    title: 'Customer - Signed'
                }, {
                    title: 'Total Lead Count'
                }],
                columnDefs: [{
                    targets: [0, 7, 8],
                    className: 'bolded'
                }]

            });

            saveCsv(previewDataSet);

            var data = dataTable.rows().data();

            var month_year = []; // creating array for storing browser
            var suspect_new = [];
            var suspect_hot_lead = [];
            var suspect_reassign = [];
            var suspect_off_peak_pipeline = [];
            var suspect_lost = [];
            var suspect_customer_lost = [];
            var customer_signed = [];
            var total_leads = [];

            for (var i = 0; i < data.length; i++) {
                month_year.push(data[i][0]);
                suspect_new[data[i][0]] = data[i][1]
                suspect_hot_lead[data[i][0]] = data[i][2]
                suspect_reassign[data[i][0]] = data[i][3]
                suspect_off_peak_pipeline[data[i][0]] = data[i][4]
                suspect_lost[data[i][0]] = data[i][5]
                suspect_customer_lost[data[i][0]] = data[i][6]
                customer_signed[data[i][0]] = data[i][7]
                total_leads[data[i][0]] = data[i][8]
            }
            var count = {}; // creating object for getting categories with
            // count
            month_year.forEach(function (i) {
                count[i] = (count[i] || 0) + 1;
            });

            var series_data20 = [];
            var series_data21 = [];
            var series_data22 = [];
            var series_data23 = [];
            var series_data24 = [];
            var series_data25 = [];
            var series_data26 = [];
            var series_data27 = [];

            var categores1 = []; // creating empty array for highcharts
            // categories
            Object.keys(suspect_new).map(function (item, key) {
                series_data20.push(parseInt(suspect_new[item]));
                series_data21.push(parseInt(suspect_hot_lead[item]));
                series_data22.push(parseInt(suspect_reassign[item]));
                series_data23.push(parseInt(suspect_off_peak_pipeline[item]));
                series_data24.push(parseInt(suspect_lost[item]));
                series_data25.push(parseInt(suspect_customer_lost[item]));
                series_data26.push(parseInt(customer_signed[item]));
                series_data27.push(parseInt(total_leads[item]));
                categores1.push(item)
            });
            plotChartPreview(series_data20,
                series_data21,
                series_data22,
                series_data23,
                series_data24,
                series_data25,
                series_data26,
                series_data27, categores1)

            if (!isNullorEmpty(postcode_rows)) {
                postcode_rows
                    .forEach(function (postcode_row, index) {

                        postcodeDataSet.push([
                            postcode_row.leadShippingZip,
                            postcode_row.leadCountByPostcode
                        ]);

                    });
            }

            var dataTable2 = $('#mpexusage-postcode_table').DataTable({
                destroy: true,
                data: postcodeDataSet,
                pageLength: 1000,
                columns: [{
                    title: 'Postcode'
                }, {
                    title: 'Lead Count'
                }],
                columnDefs: [{
                    targets: [0, 1],
                    className: 'bolded'
                }]

            });

            var data2 = dataTable2.rows().data();

            console.log('data2');
            console.log(data2)

            var postcode = []; // creating array for storing browser
            // type in array.
            var lead_count_postcode = []; // creating array for storing browser

            for (var i = 0; i < data2.length; i++) {
                postcode[i] = data2[i][0]
                lead_count_postcode[i] = data2[i][1]

            }

            var series_data4 = []; // creating empty array for highcharts
            // series data
            var categores2 = []; // creating empty array for highcharts
            // categories
            Object.keys(postcode).map(function (item, key) {

                series_data4.push(parseInt(lead_count_postcode[item]));
                categores2.push(postcode[item])

            });


            plotChartCustomer(series_data4, categores2)

            if (!isNullorEmpty(salesRep_rows)) {
                salesRep_rows
                    .forEach(function (salesRep_row, index) {

                        salesRepDataSet.push([
                            salesRep_row.dateLeadEntered,
                            salesRep_row.belinda_sales_rep,
                            salesRep_row.david_sales_rep,
                            salesRep_row.kerina_sales_rep,
                            salesRep_row.lee_sales_rep,
                            salesRep_row.others_sales_rep,
                            salesRep_row.total_sales_rep_leads
                        ]);


                    });
            }

            console.log('salesRepDataSet: ' + salesRepDataSet)

            var dataTable3 = $('#mpexusage-salesrep_table').DataTable({
                destroy: true,
                data: salesRepDataSet,
                pageLength: 1000,
                columns: [{
                    title: 'Period'
                }, {
                    title: 'Belinda'
                }, {
                    title: 'David'
                }, {
                    title: 'Kerina'
                }, {
                    title: 'Lee'
                }, {
                    title: 'Others'
                }, {
                    title: 'Total Lead Count'
                }],
                columnDefs: [{
                    targets: [0, 1, 6],
                    className: 'bolded'
                }]

            });

            var data3 = dataTable3.rows().data();

            var month_year_sales_rep = []; // creating array for storing browser
            var kerina_new = [];
            var daivd_new = [];
            var lee_new = [];
            var belinda_new = [];
            var others_new = [];
            var total_sales_rep_new = [];

            for (var i = 0; i < data3.length; i++) {
                month_year_sales_rep.push(data3[i][0]);
                kerina_new[data3[i][0]] = data3[i][3]
                daivd_new[data3[i][0]] = data3[i][2]
                lee_new[data3[i][0]] = data3[i][4]
                belinda_new[data3[i][0]] = data3[i][1]
                others_new[data3[i][0]] = data3[i][5]
                total_sales_rep_new[data3[i][0]] = data3[i][6]
            }
            var count = {}; // creating object for getting categories with
            // count
            month_year_sales_rep.forEach(function (i) {
                count[i] = (count[i] || 0) + 1;
            });

            var series_data30 = [];
            var series_data31 = [];
            var series_data32 = [];
            var series_data33 = [];
            var series_data34 = [];
            var series_data35 = [];

            var categores39 = []; // creating empty array for highcharts
            // categories
            Object.keys(kerina_new).map(function (item, key) {
                series_data30.push(parseInt(kerina_new[item]));
                series_data31.push(parseInt(daivd_new[item]));
                series_data32.push(parseInt(lee_new[item]));
                series_data33.push(parseInt(belinda_new[item]));
                series_data34.push(parseInt(others_new[item]));
                series_data35.push(parseInt(total_sales_rep_new[item]));

                categores39.push(item)
            });

            plotChartPreviewSalesRep(series_data30,
                series_data31,
                series_data32,
                series_data33, series_data34,
                series_data35, categores39)

            if (!isNullorEmpty(service_rows)) {
                service_rows
                    .forEach(function (service_row, index) {

                        serviceDataSet.push([
                            service_row.dateLeadEnteredByService,
                            service_row.service_mpex,
                            service_row.service_po,
                            service_row.service_bio,
                            service_row.service_api,
                            service_row.service_std,
                            service_row.service_starshipit,
                            service_row.total_service_leads
                        ]);


                    });
            }

            var dataTable4 = $('#mpexusage-services_of_interest').DataTable({
                destroy: true,
                data: serviceDataSet,
                pageLength: 1000,
                columns: [{
                    title: 'Period'
                }, {
                    title: 'MailPlus Express'
                }, {
                    title: 'Post Office Services'
                }, {
                    title: 'Biodegradable Satchel'
                }, {
                    title: 'API Solution'
                }, {
                    title: 'Standard Parcel Delivery'
                }, {
                    title: 'Starshipit Integration'
                }, {
                    title: 'Total Lead Count'
                }],
                columnDefs: [{
                    targets: [0, 7],
                    className: 'bolded'
                }]

            });

            var data4 = dataTable4.rows().data();

            var month_year_services = []; // creating array for storing browser
            var mpex_new = [];
            var po_new = [];
            var bio_new = [];
            var api_new = [];
            var std_new = [];
            var starshipit_new = [];
            var total_services_new = [];

            for (var i = 0; i < data4.length; i++) {
                month_year_services.push(data4[i][0]);
                mpex_new[data4[i][0]] = data4[i][1]
                po_new[data4[i][0]] = data4[i][2]
                bio_new[data4[i][0]] = data4[i][3]
                api_new[data4[i][0]] = data4[i][4]
                std_new[data4[i][0]] = data4[i][5]
                starshipit_new[data4[i][0]] = data4[i][6]
                total_sales_rep_new[data4[i][0]] = data4[i][7]
            }
            var count = {}; // creating object for getting categories with
            // count
            month_year_services.forEach(function (i) {
                count[i] = (count[i] || 0) + 1;
            });

            var series_data40 = [];
            var series_data41 = [];
            var series_data42 = [];
            var series_data43 = [];
            var series_data44 = [];
            var series_data45 = [];
            var series_data46 = [];

            var categores49 = []; // creating empty array for highcharts
            // categories
            Object.keys(mpex_new).map(function (item, key) {
                series_data40.push(parseInt(mpex_new[item]));
                series_data41.push(parseInt(po_new[item]));
                series_data42.push(parseInt(bio_new[item]));
                series_data43.push(parseInt(api_new[item]));
                series_data44.push(parseInt(std_new[item]));
                series_data45.push(parseInt(starshipit_new[item]));
                series_data46.push(parseInt(total_sales_rep_new[item]));

                categores49.push(item)
            });

            plotChartPreviewServices(series_data40,
                series_data41,
                series_data42,
                series_data43, series_data44,
                series_data45, series_data46, categores49)

            return true;
        }

        function plotChartSource(series_data1, categores) {
            // console.log(series_data)
            Highcharts
                .chart(
                    'container4', {
                    chart: {
                        type: 'column'
                    },
                    xAxis: {
                        categories: categores,
                        crosshair: true,
                        style: {
                            fontWeight: 'bold',
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Total MPEX Usage'
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{point.x}</b><br/>',
                        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true
                            }
                        }
                    },
                    series: [{
                        name: 'Manual',
                        data: series_data1,

                        style: {
                            fontWeight: 'bold',
                        }
                    }]
                });
        }

        function plotChartPreview(series_data20,
            series_data21,
            series_data22,
            series_data23,
            series_data24,
            series_data25,
            series_data26,
            series_data27, categores) {
            // console.log(series_data)

            Highcharts.chart(
                'container', {
                chart: {
                    type: 'column'
                },
                xAxis: {
                    categories: categores,
                    crosshair: true,
                    style: {
                        fontWeight: 'bold',
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Total Lead Count'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold'
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'Suspect - New',
                    data: series_data20,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Suspect - Hot Lead',
                    data: series_data21,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Suspect - Reassign',
                    data: series_data22,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Suspect - Off Peak Pipeline',
                    data: series_data23,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Suspect - Lost',
                    data: series_data24,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Suspect - Customer Lost',
                    data: series_data25,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Customer - Signed',
                    data: series_data26,

                    style: {
                        fontWeight: 'bold',
                    }
                }]
            });
        }

        function plotChartPreviewSalesRep(series_data30,
            series_data31,
            series_data32,
            series_data33, series_data34,
            series_data35, categores39) {
            // console.log(series_data)

            Highcharts.chart(
                'container3', {
                chart: {
                    type: 'column'
                },
                xAxis: {
                    categories: categores39,
                    crosshair: true,
                    style: {
                        fontWeight: 'bold',
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Total Lead Count'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold'
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'Kerina',
                    data: series_data30,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'David',
                    data: series_data31,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Lee',
                    data: series_data32,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Belinda',
                    data: series_data33,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Others',
                    data: series_data34,

                    style: {
                        fontWeight: 'bold',
                    }
                }]
            });
        }

        function plotChartPreviewServices(series_data40,
            series_data41,
            series_data42,
            series_data43, series_data44,
            series_data45, series_data46, categores49) {
            // console.log(series_data)

            Highcharts.chart(
                'container4', {
                chart: {
                    type: 'column'
                },
                xAxis: {
                    categories: categores49,
                    crosshair: true,
                    style: {
                        fontWeight: 'bold',
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Total Lead Count'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold'
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'MailPlus Express',
                    data: series_data40,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Post Office Services',
                    data: series_data41,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Biodegradable satchel',
                    data: series_data42,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'API Solution',
                    data: series_data43,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Standard parcel delivery',
                    data: series_data44,

                    style: {
                        fontWeight: 'bold',
                    }
                }, {
                    name: 'Starshipit integration',
                    data: series_data45,

                    style: {
                        fontWeight: 'bold',
                    }
                }]
            });
        }

        function plotChartCustomer(series_data, categores) {
            // console.log(series_data)
            Highcharts
                .chart(
                    'container2', {
                    chart: {
                        height: (6 / 16 * 100) + '%',
                        zoomType: 'xy',
                        type: 'column',
                        events: {
                            load: function () {
                                var points = this.series[0].points,
                                    chart = this,
                                    newPoints = [];
                                Highcharts
                                    .each(
                                        points,
                                        function (point,
                                            i) {
                                            point
                                                .update({
                                                    name: categores[i]
                                                },
                                                    false);
                                            newPoints
                                                .push({
                                                    x: point.x,
                                                    y: point.y,
                                                    name: point.name
                                                });
                                        });
                                chart.redraw();
                                var filteredArray = newPoints
                                    .slice(0, 25);

                                chart.series[0].setData(
                                    filteredArray, true,
                                    false, false);

                                // Usage Dropdown
                                $('#top_range')
                                    .change(
                                        function () {
                                            console
                                                .log('Inside Usage Dropdown: ');

                                            var val = $(
                                                '#top_range option:selected')
                                                .val();
                                            console
                                                .log('dropdown val: ' +
                                                    val);
                                            if (val == 1) {
                                                var filteredArray = newPoints
                                                    .slice(
                                                        0,
                                                        25);

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);
                                            } else if (val == 2) {
                                                var filteredArray = newPoints
                                                    .slice(
                                                        0,
                                                        50);

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);

                                            } else if (val == 3) {
                                                var filteredArray = newPoints
                                                    .slice(
                                                        0,
                                                        75);

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);
                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);

                                            } else if (val == 4) {
                                                var filteredArray = newPoints
                                                    .slice(
                                                        0,
                                                        100);

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);

                                            } else if (val == 0) {

                                                chart.series[0]
                                                    .setData(
                                                        newPoints,
                                                        true,
                                                        false,
                                                        false);

                                            }

                                        });

                                $('#bottom_range')
                                    .change(
                                        function () {
                                            console
                                                .log('Inside Usage Dropdown: ');

                                            var val = $(
                                                '#bottom_range option:selected')
                                                .val();
                                            $(
                                                '#top_range')
                                                .val(
                                                    0);
                                            console
                                                .log('dropdown val: ' +
                                                    val);
                                            if (val == 1) {

                                                var filteredArray = newPoints
                                                    .slice(Math
                                                        .max(
                                                            newPoints.length - 25,
                                                            0))

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);
                                            } else if (val == 2) {
                                                var filteredArray = newPoints
                                                    .slice(Math
                                                        .max(
                                                            newPoints.length - 50,
                                                            0))

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);

                                            } else if (val == 3) {
                                                var filteredArray = newPoints
                                                    .slice(Math
                                                        .max(
                                                            newPoints.length - 75,
                                                            0))

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);
                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);

                                            } else if (val == 4) {
                                                var filteredArray = newPoints
                                                    .slice(Math
                                                        .max(
                                                            newPoints.length - 100,
                                                            0))

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);

                                                chart.series[0]
                                                    .setData(
                                                        filteredArray,
                                                        true,
                                                        false,
                                                        false);

                                            } else if (val == 0) {

                                                chart.series[0]
                                                    .setData(
                                                        newPoints,
                                                        true,
                                                        false,
                                                        false);

                                            }

                                        });
                            }
                        }
                    },
                    legend: {
                        enabled: true,
                        reversed: false,
                        align: 'center',
                        verticalAlign: 'top',
                    },
                    xAxis: {
                        categories: categores,
                        style: {
                            fontWeight: 'bold',
                        }
                    },
                    plotOptions: {
                        column: {
                            colorByPoint: false
                        },
                        series: {
                            dataLabels: {
                                enabled: true,
                                align: 'right',
                                color: 'black',
                                // x: -10
                            },
                            pointPadding: 0.1,
                            groupPadding: 0,
                            turboThreshold: 0
                        }
                    },
                    series: [{
                        name: 'Customers',
                        data: series_data,
                        color: '#108372',
                        style: {
                            fontWeight: 'bold',
                        }
                    }]
                });
        }

        function plotChartZee(series_data, categores) {
            // console.log(series_data)
            Highcharts
                .chart(
                    'container3', {
                    chart: {
                        height: (6 / 16 * 100) + '%',
                        zoomType: 'xy',
                        events: {
                            load: function () {
                                var points = this.series[0].points,
                                    chart = this,
                                    newPoints = [];
                                Highcharts
                                    .each(
                                        points,
                                        function (point,
                                            i) {
                                            point
                                                .update({
                                                    name: categores[i]
                                                },
                                                    false);
                                            newPoints
                                                .push({
                                                    x: point.x,
                                                    y: point.y,
                                                    name: point.name
                                                });
                                        });
                                chart.redraw();
                                newPoints.sort(function (a, b) {
                                    return b.y - a.y
                                });

                                Highcharts.each(newPoints,
                                    function (el, i) {
                                        el.x = i;
                                    });

                                chart.series[0].setData(
                                    newPoints, true, false,
                                    false);

                                // Sorting min - max
                                $('#sort_min_max_zee')
                                    .on(
                                        'click',
                                        function () {

                                            newPoints
                                                .sort(function (
                                                    a,
                                                    b) {
                                                    return a.y -
                                                        b.y
                                                });

                                            Highcharts
                                                .each(
                                                    newPoints,
                                                    function (
                                                        el,
                                                        i) {
                                                        el.x = i;
                                                    });

                                            chart.series[0]
                                                .setData(
                                                    newPoints,
                                                    true,
                                                    false,
                                                    false);
                                        });

                                // Sorting max - min
                                $('#sort_max_min_zee')
                                    .on(
                                        'click',
                                        function () {
                                            newPoints
                                                .sort(function (
                                                    a,
                                                    b) {
                                                    return b.y -
                                                        a.y
                                                });

                                            newPoints
                                                .forEach(function (
                                                    el,
                                                    i) {
                                                    el.x = i;
                                                });

                                            chart.series[0]
                                                .setData(
                                                    newPoints,
                                                    true,
                                                    false,
                                                    false);
                                        });
                            }
                        }
                    },
                    xAxis: {
                        categories: categores,
                        // crosshair: true,
                        style: {
                            fontWeight: 'bold',
                        }
                    },
                    yAxis: [{
                        title: {
                            text: 'MPEX Count'
                        }
                    }, {
                        title: {
                            text: 'MPEX Count'
                        },
                        opposite: true
                    }],
                    plotOptions: {
                        column: {
                            colorByPoint: false
                        },
                        series: {
                            dataLabels: {
                                enabled: true,
                                align: 'right',
                                color: 'black',
                                // x: -10
                            },
                            pointPadding: 0.1,
                            groupPadding: 0,
                            turboThreshold: 0
                        }
                    },
                    series: [{
                        name: 'Franchisees',
                        type: 'column',
                        // yAxis: 1,
                        data: series_data,
                        color: '#108372',
                        style: {
                            fontWeight: 'bold',
                        },
                        dataSorting: {
                            enabled: true,
                            sortKey: 'value'
                        },
                    }]
                });
        }

        /**
         * Load the string stored in the hidden field 'custpage_table_csv'.
         * Converts it to a CSV file. Creates a hidden link to download the
         * file and triggers the click of the link.
         */
        function downloadCsv() {
            var today = new Date();
            today = formatDate(today);
            var val1 = currentRecord.get();
            var csv = val1.getValue({
                fieldId: 'custpage_table_csv',
            });
            today = replaceAll(today);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var content_type = 'text/csv';
            var csvFile = new Blob([csv], {
                type: content_type
            });
            var url = window.URL.createObjectURL(csvFile);
            var filename = 'MPEX Monthly Usage_' + today + '.csv';
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);

        }

        function saveRecord() { }

        /**
         * Create the CSV and store it in the hidden field
         * 'custpage_table_csv' as a string.
         *
         * @param {Array}
         *            ordersDataSet The `billsDataSet` created in
         *            `loadDatatable()`.
         */
        function saveCsv(ordersDataSet) {
            var sep = "sep=;";
            var headers = ["Month", "MPEX Count", "Customer Count",
                "Franchisee Count"
            ]
            headers = headers.join(';'); // .join(', ')

            var csv = sep + "\n" + headers + "\n";

            ordersDataSet.forEach(function (row) {
                row = row.join(';');
                csv += row;
                csv += "\n";
            });

            var val1 = currentRecord.get();
            val1.setValue({
                fieldId: 'custpage_table_csv',
                value: csv
            });

            return true;
        }

        function formatDate(testDate) {
            console.log('testDate: ' + testDate);
            var responseDate = format.format({
                value: testDate,
                type: format.Type.DATE
            });
            console.log('responseDate: ' + responseDate);
            return responseDate;
        }

        function replaceAll(string) {
            return string.split("/").join("-");
        }

        function stateIDPublicHolidaysRecord(state) {
            switch (state) {
                case 1:
                    return 1; // NSW
                    break;
                case 2:
                    return 6; // QLD
                    break;
                case 3:
                    return 5; // VIC
                    break;
                case 4:
                    return 3; // SA
                    break;
                case 5:
                    return 7; // TAS
                    break;
                case 6:
                    return 4; // ACT
                    break;
                case 7:
                    return 2; // WA
                    break;
                case 8:
                    return 8; // NT
                    break;
                default:
                    return null;
                    break;
            }
        }

        function stateID(state) {
            state = state.toUpperCase();
            switch (state) {
                case 'ACT':
                    return 6
                    break;
                case 'NSW':
                    return 1
                    break;
                case 'NT':
                    return 8
                    break;
                case 'QLD':
                    return 2
                    break;
                case 'SA':
                    return 4
                    break;
                case 'TAS':
                    return 5
                    break;
                case 'VIC':
                    return 3
                    break;
                case 'WA':
                    return 7
                    break;
                default:
                    return 0;
                    break;
            }
        }
        /**
         * Sets the values of `date_from` and `date_to` based on the
         * selected option in the '#period_dropdown'.
         */
        function selectDate() {
            var period_selected = $('#period_dropdown option:selected')
                .val();
            var today = new Date();
            var today_day_in_month = today.getDate();
            var today_day_in_week = today.getDay();
            var today_month = today.getMonth();
            var today_year = today.getFullYear();

            var today_date = new Date(Date.UTC(today_year, today_month,
                today_day_in_month))

            switch (period_selected) {
                case "this_week":
                    // This method changes the variable "today" and sets it
                    // on the previous monday
                    if (today_day_in_week == 0) {
                        var monday = new Date(Date.UTC(today_year,
                            today_month, today_day_in_month - 6));
                    } else {
                        var monday = new Date(Date.UTC(today_year,
                            today_month, today_day_in_month -
                            today_day_in_week + 1));
                    }
                    var date_from = monday.toISOString().split('T')[0];
                    var date_to = today_date.toISOString().split('T')[0];
                    break;

                case "last_week":
                    var today_day_in_month = today.getDate();
                    var today_day_in_week = today.getDay();
                    // This method changes the variable "today" and sets it
                    // on the previous monday
                    if (today_day_in_week == 0) {
                        var previous_sunday = new Date(Date.UTC(today_year,
                            today_month, today_day_in_month - 7));
                    } else {
                        var previous_sunday = new Date(Date.UTC(today_year,
                            today_month, today_day_in_month -
                        today_day_in_week));
                    }

                    var previous_sunday_year = previous_sunday
                        .getFullYear();
                    var previous_sunday_month = previous_sunday.getMonth();
                    var previous_sunday_day_in_month = previous_sunday
                        .getDate();

                    var monday_before_sunday = new Date(Date.UTC(
                        previous_sunday_year, previous_sunday_month,
                        previous_sunday_day_in_month - 6));

                    var date_from = monday_before_sunday.toISOString()
                        .split('T')[0];
                    var date_to = previous_sunday.toISOString().split('T')[0];
                    break;

                case "this_month":
                    var first_day_month = new Date(Date.UTC(today_year,
                        today_month));
                    var date_from = first_day_month.toISOString()
                        .split('T')[0];
                    var date_to = today_date.toISOString().split('T')[0];
                    break;

                case "last_month":
                    var first_day_previous_month = new Date(Date.UTC(
                        today_year, today_month - 1));
                    var last_day_previous_month = new Date(Date.UTC(
                        today_year, today_month, 0));
                    var date_from = first_day_previous_month.toISOString()
                        .split('T')[0];
                    var date_to = last_day_previous_month.toISOString()
                        .split('T')[0];
                    break;

                case "full_year":
                    var first_day_in_year = new Date(Date
                        .UTC(today_year, 0));
                    var date_from = first_day_in_year.toISOString().split(
                        'T')[0];
                    var date_to = today_date.toISOString().split('T')[0];
                    break;

                case "financial_year":
                    if (today_month >= 6) {
                        var first_july = new Date(Date.UTC(today_year, 6));
                    } else {
                        var first_july = new Date(Date.UTC(today_year - 1,
                            6));
                    }
                    var date_from = first_july.toISOString().split('T')[0];
                    var date_to = today_date.toISOString().split('T')[0];
                    break;

                default:
                    var date_from = '';
                    var date_to = '';
                    break;
            }
            $('#date_from').val(date_from);
            $('#date_to').val(date_to);
        }

        function formatAMPM() {
            var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }
        /**
         * @param {Number}
         *            x
         * @returns {String} The same number, formatted in Australian
         *          dollars.
         */
        function financial(x) {
            if (typeof (x) == 'string') {
                x = parseFloat(x);
            }
            if (isNullorEmpty(x) || isNaN(x)) {
                return "$0.00";
            } else {
                return x.toLocaleString('en-AU', {
                    style: 'currency',
                    currency: 'AUD'
                });
            }
        }

        function getRange(array) {

        }
        /**
         * Used to pass the values of `date_from` and `date_to` between the
         * scripts and to Netsuite for the records and the search.
         *
         * @param {String}
         *            date_iso "2020-06-01"
         * @returns {String} date_netsuite "1/6/2020"
         */
        function dateISOToNetsuite(date_iso) {
            var date_netsuite = '';
            if (!isNullorEmpty(date_iso)) {
                var date_utc = new Date(date_iso);
                // var date_netsuite = nlapiDateToString(date_utc);
                var date_netsuite = format.format({
                    value: date_utc,
                    type: format.Type.DATE
                });
            }
            return date_netsuite;
        }
        /**
         * [getDate description] - Get the current date
         *
         * @return {[String]} [description] - return the string date
         */
        function getDate() {
            var date = new Date();
            date = format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            });

            return date;
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }
        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            downloadCsv: downloadCsv,
            expActWeeklyUsage: expActWeeklyUsage
        }
    });
