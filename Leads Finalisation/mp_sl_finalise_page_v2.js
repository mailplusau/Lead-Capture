/**
 * Module Description
 * 
 * NSVersion    Date                    Author         
 * 1.00         2018-04-11 15:54:16     Ankith 
 *
 * Remarks:         
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2021-03-02 11:43:11
 *
 */

//GLOBAL VARIABLES
var billing_error = 'F';
var shipping_state;
var callcenter = null;
var button = null;

var item_array = new Array();
var item_price_array = [];

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();
var row_count = 0;

var service_type_search = serviceTypeSearch(null, [1]);


if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
} else {
    zee = 0;
}

var ampo_price;
var ampo_time;
var pmpo_price;
var pmpo_time;

var contact_count = 0;
var address_count = 0;



function main(request, response) {
    if (request.getMethod() == "GET") {

        var params = request.getParameter('custparam_params');

        if (isNullorEmpty(params)) {
            var customer_id = parseInt(request.getParameter('recid'));
            var sales_record_id = parseInt(request.getParameter('sales_record_id'));
            callcenter = request.getParameter('callcenter');
            button = request.getParameter('button');
        } else {
            entryParamsString = params;

            params = JSON.parse(params);
            var customer_id = parseInt(params.custid);
            var sales_record_id = parseInt(params.sales_record_id);
            callcenter = params.callcenter;
        }

        //Details from Customer Record
        var customer_record = nlapiLoadRecord('customer', customer_id);
        var entityid = customer_record.getFieldValue('entityid');
        var companyName = customer_record.getFieldValue('companyname');

        var abn = customer_record.getFieldValue('vatregnumber');
        if (isNullorEmpty(abn)) {
            abn = '';
        }
        var zee = customer_record.getFieldValue('partner');
        var zeeText = customer_record.getFieldText('partner');
        var accounts_email = customer_record.getFieldValue('email');
        if (isNullorEmpty(accounts_email)) {
            accounts_email = '';
        }
        var accounts_phone = customer_record.getFieldValue('altphone');
        if (isNullorEmpty(accounts_phone)) {
            accounts_phone = '';
        }
        var daytodayemail = customer_record.getFieldValue('custentity_email_service');
        if (isNullorEmpty(daytodayemail)) {
            daytodayemail = '';
        }
        var daytodayphone = customer_record.getFieldValue('phone');
        if (isNullorEmpty(daytodayphone)) {
            daytodayphone = '';
        }
        var ap_mail_parcel = customer_record.getFieldValue('custentity_ap_mail_parcel');
        var ap_outlet = customer_record.getFieldValue('custentity_ap_outlet');
        var lpo_customer = customer_record.getFieldValue('custentity_ap_lpo_customer');
        var customer_status = customer_record.getFieldText('entitystatus');
        var customer_status_id = customer_record.getFieldValue('entitystatus');
        var lead_source = customer_record.getFieldValue('leadsource');
        var customer_industry = customer_record.getFieldValue('custentity_industry_category');
        ampo_price = customer_record.getFieldValue('custentity_ampo_service_price');
        ampo_time = customer_record.getFieldValue('custentity_ampo_service_time');
        pmpo_price = customer_record.getFieldValue('custentity_pmpo_service_price');
        pmpo_time = customer_record.getFieldValue('custentity_pmpo_service_time');

        //MPEX SECTION - Min
        var min_dl = customer_record.getFieldValue('custentity_mpex_dl_float'); //Customer Min DL Float
        var min_b4 = customer_record.getFieldValue('custentity_mpex_b4_float'); //Customer Min B4 Float 
        var min_c5 = customer_record.getFieldValue('custentity_mpex_c5_float'); //Customer Min C5 Float
        var min_1kg = customer_record.getFieldValue('custentity_mpex_1kg_float'); //Customer Min 1Kg Float
        var min_3kg = customer_record.getFieldValue('custentity_mpex_3kg_float'); //Customer Min 3kg Float
        var min_5kg = customer_record.getFieldValue('custentity_mpex_5kg_float'); //Customer Min 5Kg Float
        var min_500g = customer_record.getFieldValue('custentity_mpex_5kg_float'); //Customer Min 500g Float

        //If empty, set field to 0
        if (isNullorEmpty(min_dl)) {
            min_dl = 0;
        }
        if (isNullorEmpty(min_b4)) {
            min_b4 = 0;
        }
        if (isNullorEmpty(min_c5)) {
            min_c5 = 0;
        }
        if (isNullorEmpty(min_1kg)) {
            min_1kg = 0;
        }
        if (isNullorEmpty(min_3kg)) {
            min_3kg = 0;
        }
        if (isNullorEmpty(min_5kg)) {
            min_5kg = 0;
        }
        if (isNullorEmpty(min_500g)) {
            min_500g = 0;
        }

        var multisite = customer_record.getFieldValue('custentity_category_multisite');
        if (multisite == 'T') {
            multisite = 1;
        } else {
            multisite = 2;
        }

        var website = customer_record.getFieldValue('custentity_category_multisite_link');
        if (isNullorEmpty(website)) {
            website = '';
        }

        var salesRecord = nlapiLoadRecord('customrecord_sales', sales_record_id);
        var lastOutcome = salesRecord.getFieldValue('custrecord_sales_outcome');
        var phone_call_made = salesRecord.getFieldValue('custrecord_sales_call_made');
        var salesCampaignID = salesRecord.getFieldValue('custrecord_sales_campaign');


        var searchZees = nlapiLoadSearch('partner', 'customsearch_salesp_franchisee');

        var resultSetZees = searchZees.runSearch();

        //Search for Addresses
        var searchedAddresses = nlapiLoadSearch('customer', 'customsearch_salesp_address');

        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter('internalid', null, 'is', customer_id);

        searchedAddresses.addFilters(newFilters);

        var resultSetAddresses = searchedAddresses.runSearch();

        //Search for Contacts
        var searchedContacts = nlapiLoadSearch('contact', 'customsearch_salesp_contacts');

        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter('company', null, 'is', customer_id);

        searchedContacts.addFilters(newFilters);

        var resultSetContacts = searchedContacts.runSearch();

        var commReg = null;

        var newFiltersCommReg = new Array();
        newFiltersCommReg[newFiltersCommReg.length] = new nlobjSearchFilter('custrecord_commreg_sales_record', null, 'anyof', sales_record_id);
        newFiltersCommReg[newFiltersCommReg.length] = new nlobjSearchFilter('custrecord_customer', null, 'anyof', customer_id);
        newFiltersCommReg[newFiltersCommReg.length] = new nlobjSearchFilter('custrecord_trial_status', null, 'anyof', [9, 10]);

        var col = new Array();
        col[0] = new nlobjSearchColumn('internalId');
        col[1] = new nlobjSearchColumn('custrecord_date_entry');
        col[2] = new nlobjSearchColumn('custrecord_sale_type');
        col[3] = new nlobjSearchColumn('custrecord_franchisee');
        col[4] = new nlobjSearchColumn('custrecord_comm_date');
        col[5] = new nlobjSearchColumn('custrecord_in_out');
        col[6] = new nlobjSearchColumn('custrecord_customer');
        col[7] = new nlobjSearchColumn('custrecord_trial_status');
        col[7] = new nlobjSearchColumn('custrecord_comm_date_signup');

        var old_comm_reg;
        var customer_comm_reg;
        var comm_reg_results = nlapiSearchRecord('customrecord_commencement_register', null, newFiltersCommReg, col);

        if (!isNullorEmpty(comm_reg_results)) {
            if (comm_reg_results.length == 1) {
                commReg = comm_reg_results[0].getValue('internalid');
            } else if (comm_reg_results.length > 1) {

            }
        }

        /**
         * Description - To get all the services associated with this customer
         */
        var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_salesp_services');

        var newFilters_service = new Array();
        newFilters_service[newFilters_service.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', customer_id);

        serviceSearch.addFilters(newFilters_service);

        var resultSet_service = serviceSearch.runSearch();

        var serviceResult = resultSet_service.getResults(0, 1);

        var resultSet_service_change = null;
        var resultServiceChange = [];

        if (!isNullorEmpty(commReg)) {
            var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_salesp_service_chg');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_service_customer", "CUSTRECORD_SERVICECHG_SERVICE", 'is', customer_id);
            newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_servicechg_comm_reg", null, 'is', commReg);
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_status', null, 'noneof', [2, 3]);

            searched_service_change.addFilters(newFilters);

            resultSet_service_change = searched_service_change.runSearch();

            resultServiceChange = resultSet_service_change.getResults(0, 1);
        }
        if (isNullorEmpty(callcenter)) {
            var form = nlapiCreateForm('Finalise X Sale: ' + entityid + ' ' + companyName);
        } else {
            var form = nlapiCreateForm('Call Center: ' + entityid + ' ' + companyName);
        }

        form.addField('customer', 'text', 'Customer').setDisplayType('hidden').setDefaultValue(customer_id);
        form.addField('entityid', 'text', 'Customer').setDisplayType('hidden').setDefaultValue(entityid);
        form.addField('sales_record_id', 'text', 'Customer').setDisplayType('hidden').setDefaultValue(sales_record_id);
        form.addField('service_change', 'text', 'Customer').setDisplayType('hidden').setDefaultValue(resultSet_service_change);
        form.addField('custpage_phone_call_made', 'text', 'Phone Call Made').setDisplayType('hidden').setDefaultValue(phone_call_made);
        form.addField('custpage_sales_campaign_id', 'text', 'Sales Campaign ID').setDisplayType('hidden').setDefaultValue(salesCampaignID);
        form.addField('custpage_callcenter', 'text', 'callcenter').setDisplayType('hidden').setDefaultValue(callcenter);
        form.addField('custpage_button', 'text', 'Button').setDisplayType('hidden').setDefaultValue(button);

        form.addField('custpage_nosalereason', 'select', 'No Sale Reason', 'customlist_nosalereason').setDisplayType('hidden');
        form.addField('custpage_callbackdate', 'date', ' ').setDisplayType('hidden');
        form.addField('custpage_callbacktime', 'timeofday', ' ').setDisplayType('hidden');

        form.addField('custpage_rejectreason', 'select', 'customlist_sales_infoincomplete_reason').setDisplayType('hidden');
        form.addField('custpage_rejectnotes', 'longtext', 'Reject Notes').setDisplayType('hidden');

        form.addField('custpage_refernotes', 'longtext', 'Refer Notes').setDisplayType('hidden');
        form.addField('custpage_callnotes', 'longtext', 'Call Notes').setDisplayType('hidden');
        form.addField('custpage_startdate', 'date', 'Start Date').setDisplayType('hidden');
        form.addField('financial_item_array', 'text', 'Start Date').setDisplayType('hidden');
        form.addField('financial_price_array', 'text', 'Start Date').setDisplayType('hidden');
        form.addField('custpage_item_ids', 'text', 'Start Date').setDisplayType('hidden');
        var fldTrial = form.addField('custpage_trialperiod', 'select', 'Trial Period').setDisplayType('hidden');

        var fldOutcome = form.addField('custpage_outcome', 'select', 'Outcome').setDisplayType('hidden');


        //INITIALIZATION OF JQUERY AND BOOTSTRAP
        var inlineQty = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2060796&amp;c=1048144&amp;h=9ee6accfd476c9cae718&amp;_xt=.css"><script src="https://system.na2.netsuite.com/core/media/media.nl?id=2060797&amp;c=1048144&amp;h=ef2cda20731d146b5e98&amp;_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&amp;c=1048144&amp;h=a0ef6ac4e28f91203dfe&amp;_xt=.css"><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&amp;c=1048144&amp;h=a0ef6ac4e28f91203dfe&amp;_xt=.css"><style>.mandatory{color:red;}</style>';

        inlineQty += '<div class="se-pre-con"></div><div ng-app="myApp" ng-controller="myCtrl"><div class="container" style="padding-top: 3%;"><div id="alert" class="alert alert-danger fade in"></div>';

        //Customer Details
        inlineQty += customerDetailsSection(companyName, abn, resultSetZees, zee, accounts_email, daytodayphone, daytodayemail, accounts_phone, customer_status, lead_source, customer_industry, callcenter);

        //Address and Contacts Details
        inlineQty += addressContactsSection(resultSetAddresses, resultSetContacts, form);

        form.addField('shipping_state', 'text', 'Customer').setDisplayType('hidden').setDefaultValue(shipping_state);

        form.addField('create_service_change', 'text', 'Customer').setDisplayType('hidden').setDefaultValue('F');

        form.addField('comm_reg', 'text', 'Customer').setDisplayType('hidden').setDefaultValue(commReg);

        var fils = new Array();
        fils[fils.length] = new nlobjSearchFilter('entity', null, 'is', customer_id);
        fils[fils.length] = new nlobjSearchFilter('mainline', null, 'is', true);
        fils[fils.length] = new nlobjSearchFilter('memorized', null, 'is', false);
        fils[fils.length] = new nlobjSearchFilter('custbody_inv_type', null, 'is', '@NONE@');
        fils[fils.length] = new nlobjSearchFilter('voided', null, 'is', false);

        var cols = new Array();
        cols[cols.length] = new nlobjSearchColumn('internalid');
        cols[cols.length] = new nlobjSearchColumn('tranid');
        cols[cols.length] = new nlobjSearchColumn('total');
        cols[cols.length] = new nlobjSearchColumn('trandate').setSort(true);
        cols[cols.length] = new nlobjSearchColumn('status');

        var inv_results = nlapiSearchRecord('invoice', null, fils, cols);

        if (!isNullorEmpty(inv_results)) {

            inlineQty += '<div class="form-group container">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 "><h4><span class="label label-default col-xs-12">LAST 3 INVOICES</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12">';

            inlineQty += '<style>table#customer_invoice {font-size:12px; text-align:center; border-color: #24385b}</style><table border="0" cellpadding="15" id="customer_invoice" class="table table-responsive table-striped customer tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"></tr><tr class="text-center">';

            /**
             * INVOICE DATE
             */
            inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>INVOICE DATE</b></th>';
            /**
             * INVOICE NO.
             */
            inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>INVOICE NO.</b></th>';
            /**
             * INVOICE TOTAL
             */
            inlineQty += '<th style="vertical-align: middle;text-align: center;" ><b>INVOICE TOTAL</b></th>';

            /**
             * INVOICE STATUS
             */
            inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>STATUS</b></th></tr></thead><tbody>';

            for (var x = 0; x < inv_results.length && x < 3; x++) {
                inlineQty += '<tr>';
                inlineQty += '<td>' + inv_results[x].getValue('trandate') + '</td>';
                inlineQty += '<td><a href="' + baseURL + '/app/accounting/transactions/custinvc.nl?id=' + inv_results[x].getValue('internalid') + '" target="_blank">' + inv_results[x].getValue('tranid') + '</a></td>';
                inlineQty += '<td>' + inv_results[x].getValue('total') + '</td>';
                inlineQty += '<td>' + inv_results[x].getText('status') + '</td>';
                inlineQty += '</tr>';
            }

            inlineQty += '</tbody></table>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            inlineQty += '</div>';
        }

        if (isNullorEmpty(callcenter)) {
            var survey_tab = '';
            var service_tab = 'active';
            var notes_tab = '';
            var mpex_tab = '';
        } else {
            var notes_tab = 'active';
            var service_tab = '';
            var survey_tab = '';
            var mpex_tab = '';
        }

        inlineQty += '<div class="tabs"><ul class="nav nav-tabs nav-justified" style="padding-top: 3%;">';

        inlineQty += '<li role="presentation" class="' + survey_tab + '"><a href="#survey">SURVEY INFORMATION</a></li>';
        inlineQty += '<li role="presentation" class="' + service_tab + '"><a href="#services">CURRENT SERVICES</a></li>';
        inlineQty += '<li role="presentation" class="' + mpex_tab + '"><a href="#mpex">MPEX</a></li>'; // MPEX List Tab
        inlineQty += '<li role="presentation" class="' + notes_tab + '"><a href="#salenotes">SALE NOTES</a></li>';

        inlineQty += '</ul>';

        var tab_content = '';

        //Survey Tab Content
        tab_content += '<div role="tabpanel" class="tab-pane ' + survey_tab + '" id="survey">';
        tab_content += surveyInfo(ap_mail_parcel, ap_outlet, lpo_customer, multisite, website);
        tab_content += '</div>';

        //Service Details Tab Contenet
        tab_content += '<div role="tabpanel" class="tab-pane ' + service_tab + '" id="services">';
        tab_content += serviceDetailsSection(resultSet_service);
        tab_content += '</div>';

        //For the MPEX Tab Content
        tab_content += '<div role="tabpanel" class="tab-pane ' + mpex_tab + '" id="mpex">';
        tab_content += mpexTab(customer_id, min_c5, min_dl, min_b4, min_1kg, min_3kg, min_5kg);
        tab_content += '</div>';

        //Sale Notes Tab Contenet
        tab_content += '<div role="tabpanel" class="tab-pane ' + notes_tab + '" id="salenotes">';
        tab_content += salesNotesSection(customer_id, customer_record);
        tab_content += '</div>';

        inlineQty += '<div class="tab-content" style="padding-top: 3%;">';

        inlineQty += tab_content;

        inlineQty += '</div></div>';

        if (!isNullorEmpty(callcenter) && callcenter == 'T') {
            inlineQty += callCentreButtons(salesCampaignID, phone_call_made, customer_status_id, resultSetContacts, resultSetAddresses, lead_source);
        }

        //Commencement Register Details
        if (isNullorEmpty(callcenter)) {
            inlineQty += commencementDetailsSection(commReg, resultSet_service_change, resultServiceChange);
        }

        if (!isNullorEmpty(resultSet_service_change) && isNullorEmpty(callcenter)) {
            if (resultServiceChange.length > 0) {
                //Service Change Details
                inlineQty += serviceChangeSection(resultSet_service_change);
            }
        }

        inlineQty += '</div></div>';


        form.addField('preview_table_extras', 'inlinehtml', '').setLayoutType('startrow').setDefaultValue(inlineQty);

        if (isNullorEmpty(callcenter)) {
            form.addField('upload_file_1', 'file', 'Service Commencement Form').setLayoutType('outsidebelow', 'startrow').setDisplaySize(40);
        }


        if (!isNullorEmpty(resultSet_service_change) && isNullorEmpty(callcenter)) {
            if (resultServiceChange.length > 0) {
                form.addSubmitButton('FINALISE');
            } else {
                form.addSubmitButton('');
            }
        } else {
            form.addSubmitButton('');
        }
        form.addButton('cust_back', 'Back', 'onclick_summaryPage()');
        form.addButton('back', 'Reset', 'onclick_reset()');

        form.setScript('customscript_cl_finalise_page');

        response.writePage(form);

    } else {
        var custId = parseInt(request.getParameter('customer'));
        var commRegID = request.getParameter('comm_reg');
        var sales_record_id = request.getParameter('sales_record_id');
        var callcenter = request.getParameter('custpage_callcenter');
        var entity_id = request.getParameter('entityid');
        var file = request.getFile('upload_file_1');
        var create_service_change = request.getParameter('create_service_change');

        var outcome = request.getParameter('custpage_outcome');
        nlapiLogExecution('DEBUG', 'OUTCOME', outcome)
        var nosalereason = request.getParameter('custpage_nosalereason');
        var callbackdate = request.getParameter('custpage_callbackdate');
        var callbacktime = request.getParameter('custpage_callbacktime');
        var referto = request.getParameter('custpage_referto');
        var notes = request.getParameter('custpage_refernotes');
        var callnotes = request.getParameter('custpage_callnotes');
        var startdate = request.getParameter('custpage_startdate');
        var trialperiod = request.getParameter('custpage_trialperiod');

        var reject_reason = request.getParameter('custpage_rejectreason');
        var reject_notes = request.getParameter('custpage_rejectnotes');

        var sales_campaign = request.getParameter('custpage_sales_campaign_id');

        var financial_tab_item_array = request.getParameter('financial_item_array');
        var financial_tab_price_array = request.getParameter('financial_price_array');
        var item_ids = request.getParameter('custpage_item_ids');

        var connect_admin = request.getParameter('custpage_connect_admin')
        var connect_user = request.getParameter('custpage_connect_user')


        nlapiLogExecution('DEBUG', 'file', file);
        nlapiLogExecution('DEBUG', 'commRegID', commRegID);

        if (isNullorEmpty(callcenter)) {
            if (!isNullorEmpty(commRegID)) {
                if (!isNullorEmpty(file)) {
                    file.setFolder(1212243);

                    var type = file.getType();
                    if (type == 'JPGIMAGE') {
                        type = 'jpg';
                        var file_name = getDate() + '_' + entity_id + '.' + type;

                    } else if (type == 'PDF') {
                        type == 'pdf';
                        var file_name = getDate() + '_' + entity_id + '.' + type;
                    } else if (type == 'PNGIMAGE') {
                        type == 'png';
                         var file_name = getDate() + '_' + entity_id + '.' + type;
                    } else if (type == 'PJPGIMAGE') {
                        type == 'png';
                         var file_name = getDate() + '_' + entity_id + '.' + type;
                    }

                    file.setName(file_name);

                    // Create file and upload it to the file cabinet.
                    var id = nlapiSubmitFile(file);

                    var commRegRecord = nlapiLoadRecord('customrecord_commencement_register', commRegID);

                    commRegRecord.setFieldValue('custrecord_scand_form', id);
                    commRegRecord.setFieldValue('custrecord_trial_status', 9);

                    nlapiSubmitRecord(commRegRecord);

                    var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_salesp_service_chg');

                    var newFilters = new Array();
                    newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_service_customer", "CUSTRECORD_SERVICECHG_SERVICE", 'is', custId);
                    newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_servicechg_comm_reg", null, 'is', commRegID);
                    newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_status', null, 'noneof', [2, 3]);

                    searched_service_change.addFilters(newFilters);

                    resultSet_service_change = searched_service_change.runSearch();
                    resultSet_service_change.forEachResult(function(searchResult_service_change) {
                        var serviceChangeId = searchResult_service_change.getValue('internalid');
                        var serviceId = searchResult_service_change.getValue("internalid", "CUSTRECORD_SERVICECHG_SERVICE", null);

                        var service_change_record = nlapiLoadRecord('customrecord_servicechg', serviceChangeId);
                        service_change_record.setFieldValue('custrecord_servicechg_status', 1);
                        nlapiSubmitRecord(service_change_record);

                        return true;
                    });

                }
            }

            var recCustomer = nlapiLoadRecord('customer', custId);
            var partner_id = recCustomer.getFieldValue('partner');
            var companyName = recCustomer.getFieldValue('companyname');
            var partner_text = recCustomer.getFieldText('partner');
            var lead_source_text = recCustomer.getFieldText('leadsource');
            var lead_source_id = recCustomer.getFieldValue('leadsource');
            var day_to_day_email = recCustomer.getFieldValue('custentity_email_service');
            recCustomer.setFieldValue('entitystatus', 13);
            if (isNullorEmpty(recCustomer.getFieldValue('custentity_date_prospect_opportunity'))) {
                recCustomer.setFieldValue('custentity_date_prospect_opportunity', getDate());
            }
            recCustomer.setFieldValue('custentity_cust_closed_won', 'T');
            nlapiSubmitRecord(recCustomer);

            if (create_service_change == 'T') {
                var custparam_params = {
                        custid: parseInt(request.getParameter('customer')),
                        salesrecordid: sales_record_id,
                        salesrep: 'T',
                        commreg: commRegID,
                        customid: 'customscript_sl_finalise_page',
                        customdeploy: 'customdeploy_sl_finalise_page'
                    }
                    // custparam_params = JSON.stringify(custparam_params);
                nlapiSetRedirectURL('SUITELET', 'customscript_sl_create_service_change', 'customdeploy_sl_create_service_change', null, custparam_params);
            } else {
                /**
                 * [params3 description] - Params passed to delete / edit / create the financial tab
                 */
                var params3 = {
                    custscriptcustomer_id: parseInt(request.getParameter('customer')),
                    custscriptids: item_ids.toString(),
                    custscriptlinked_service_ids: null,
                    custscriptfinancial_tab_array: financial_tab_item_array.toString(),
                    custscriptfinancial_tab_price_array: financial_tab_price_array.toString()
                }
                
                var records = new Array();
                records['entity'] = custId;
                
               

                var email_subject = '';
                var email_body = ' New Customer NS ID: ' + custId + '</br> New Customer: ' + entity_id + ' ' + companyName + '</br> New Customer Franchisee NS ID: ' + partner_id + '</br> New Customer Franchisee Name: ' + partner_text + '';
                if (lead_source_id == 246306) {
                    email_subject = 'Shopify Customer Finalised on NetSuite';
                    email_body += '</br> Email: ' + day_to_day_email;
                    email_body += '</br> Lead Source: ' + lead_source_text;
                } else {
                    email_subject = 'New Customer Finalised on NetSuite';
                }

                if (connect_user == 1 || connect_user == 1) {
                    email_body += '</br></br> Customer Portal Access - User Details';
                    email_body += '</br>First Name: ' + request.getParameter('custpage_connect_fn');
                    email_body += '</br>Last Name: ' + request.getParameter('custpage_connect_ln');
                    email_body += '</br>Email: ' + request.getParameter('custpage_connect_email');
                    email_body += '</br>Phone: ' + request.getParameter('custpage_connect_phone');
                    
                    var recCustomer_portalaccess = nlapiLoadRecord('customer', custId);
                    recCustomer_portalaccess.setFieldValue('custentity_portal_access', 1);
                    recCustomer_portalaccess.setFieldValue('custentity_portal_how_to_guides', 2);
                    nlapiSubmitRecord(recCustomer_portalaccess);
                }

                nlapiSendEmail(1132504, ['mailplussupport@protechly.com'], email_subject, email_body, ['raine.giderson@mailplus.com.au', 'ankith.ravindran@mailplus.com.au', 'rianne.mansell@mailplus.com.au', 'fiona.harrison@mailplus.com.au'], records, null, true)

                /**
                 * Description - Schedule Script to create / edit / delete the financial tab items with the new details
                 */
                var status = nlapiScheduleScript('customscript_sc_smc_item_pricing_update', 'customdeploy1', params3);
                if (status == 'QUEUED') {

                    response.sendRedirect('RECORD', 'customer', parseInt(request.getParameter('customer')), false);
                    return false;
                }

            }
        } else {
            var recCustomer = nlapiLoadRecord('customer', custId);

            var customerStatus = recCustomer.getFieldValue('entitystatus');

            var recSales = nlapiLoadRecord('customrecord_sales', parseInt(sales_record_id));
            var sales_campaign_record = nlapiLoadRecord('customrecord_salescampaign', sales_campaign);
            var sales_campaign_type = sales_campaign_record.getFieldValue('custrecord_salescampaign_recordtype');
            var sales_campaign_name = sales_campaign_record.getFieldValue('name');


            var phonecall = nlapiCreateRecord('phonecall');
            phonecall.setFieldValue('assigned', recCustomer.getFieldValue('partner'));
            phonecall.setFieldValue('custevent_organiser', nlapiGetUser());
            phonecall.setFieldValue('startdate', getDate());
            phonecall.setFieldValue('company', custId);
            phonecall.setFieldText('status', 'Completed');
            phonecall.setFieldValue('custevent_call_type', 2);


            if (outcome == 'nosale') {
                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 21);
                    phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - No Sale');
                } else {
                    phonecall.setFieldValue('title', 'X Sales - ' + sales_campaign_name + ' - No Sale');
                }


                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 16);

                recSales.setFieldValue('custrecord_sales_completed', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_completedate', getDate());
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 10);
                recSales.setFieldValue('custrecord_sales_nosalereason', nosalereason);
                recSales.setFieldValue('custrecord_sales_callbackdate', '');
                recSales.setFieldValue('custrecord_sales_callbacktime', '');
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());
            } else if (outcome == 'noanswer') {
                if (sales_campaign == 55) {

                    recCustomer.setFieldValue('entitystatus', 20);
                    phonecall.setFieldValue('title', 'Prospecting Call - GPO - No Answer');

                    if (!isNullorEmpty(decison_maker)) {
                        recSales.setFieldValue('custrecord_sales_dm_collected', 'T')
                    }
                    if (!isNullorEmpty(site_address)) {
                        recSales.setFieldValue('custrecord_sales_streetaddress_collected', 'T');
                    }

                } else {
                    if (sales_campaign_type != 65) {
                        recCustomer.setFieldValue('entitystatus', 35);
                        phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - No Answer');
                    } else {
                        phonecall.setFieldValue('title', 'X Sales - ' + sales_campaign_name + ' - No Answer');
                    }

                }



                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 6);

                recSales.setFieldValue('custrecord_sales_completed', "F");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_callbackdate', nlapiDateToString(nlapiAddDays(nlapiStringToDate(getDate()), 5)));
                recSales.setFieldValue('custrecord_sales_callbacktime', '10:00 AM');
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 7);
                recSales.setFieldValue('custrecord_sales_attempt', parseInt(recSales.getFieldValue('custrecord_sales_attempt')) + 1);

                if (parseInt(recSales.getFieldValue('custrecord_sales_attempt')) > 2) {
                    recSales.setFieldValue('custrecord_sales_outcome', 12);
                    recSales.setFieldValue('custrecord_sales_completed', "T");
                    if (sales_campaign_type != 65) {
                        recCustomer.setFieldValue('entitystatus', 36);
                    }
                    recSales.setFieldValue('custrecord_sales_callbackdate', '');
                    recSales.setFieldValue('custrecord_sales_callbacktime', '');
                }


            } else if (outcome == 'disconnected') {
                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 33);
                    phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Disconnected');
                } else {
                    phonecall.setFieldValue('title', 'X Sales - ' + sales_campaign_name + ' -  Disconnected');
                }


                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 3);

                recSales.setFieldValue('custrecord_sales_completed', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_completedate', getDate());
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 8);
                recSales.setFieldValue('custrecord_sales_callbackdate', '');
                recSales.setFieldValue('custrecord_sales_callbacktime', '');
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());
            } else if (outcome == 'donotcall') {
                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 9);
                    phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Do Not Call');
                } else {
                    phonecall.setFieldValue('title', 'X Sales - ' + sales_campaign_name + ' - Do Not Call');
                }


                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 4);

                recSales.setFieldValue('custrecord_sales_completed', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_completedate', getDate());
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 9);
                recSales.setFieldValue('custrecord_sales_callbackdate', '');
                recSales.setFieldValue('custrecord_sales_callbacktime', '');
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());
            } else if (outcome == 'callback') {
                if (sales_campaign == 55) {

                    recCustomer.setFieldValue('entitystatus', 30);

                    phonecall.setFieldValue('title', 'Prospecting Call - GPO - Callback');

                    if (!isNullorEmpty(decison_maker)) {
                        recSales.setFieldValue('custrecord_sales_dm_collected', 'T')
                    }
                    if (!isNullorEmpty(site_address)) {
                        recSales.setFieldValue('custrecord_sales_streetaddress_collected', 'T');
                    }

                } else {
                    if (sales_campaign_type != 65) {
                        recCustomer.setFieldValue('entitystatus', 8);
                        phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Callback');
                    } else {
                        phonecall.setFieldValue('title', 'X Sales - ' + sales_campaign_name + ' - Callback');
                    }

                }



                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 17);

                recSales.setFieldValue('custrecord_sales_completed', "F");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_callbackdate', callbackdate);
                recSales.setFieldValue('custrecord_sales_callbacktime', callbacktime);
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 5);
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());

                nlapiLogExecution('debug', '4. Callback Details entered');
            } else if (outcome == 'complete') {

                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 42);
                    phonecall.setFieldValue('title', 'Prospecting - ' + sales_campaign_name + ' - Complete');
                } else {
                    phonecall.setFieldValue('title', 'X Sale - ' + sales_campaign_name + ' - Complete');
                }

                if (!isNullorEmpty(decison_maker)) {
                    recSales.setFieldValue('custrecord_sales_dm_collected', 'T')
                }
                if (!isNullorEmpty(site_address)) {
                    recSales.setFieldValue('custrecord_sales_streetaddress_collected', 'T');
                }

                recSales.setFieldValue('custrecord_sales_outcome', 16);



                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 17);

                recSales.setFieldValue('custrecord_sales_completed', "F");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_callbackdate', '');
                recSales.setFieldValue('custrecord_sales_callbacktime', '');
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());

                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());

                nlapiLogExecution('debug', '4. Callback Details entered');
            } else if (outcome == 'reject') {

                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 9);
                    phonecall.setFieldValue('title', 'Prospecting Call - GPO - Reject');
                } else {
                    phonecall.setFieldValue('title', 'X Sale - ' + sales_campaign_name + ' - Reject');
                }


                phonecall.setFieldValue('message', reject_notes);
                phonecall.setFieldValue('custevent_call_outcome', 16);

                recSales.setFieldValue('custrecord_sales_completed', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_completedate', getDate());
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 17);
                recSales.setFieldValue('custrecord_sales_infoincomplete_reason', reject_reason);
                recSales.setFieldValue('custrecord_sales_callbackdate', '');
                recSales.setFieldValue('custrecord_sales_callbacktime', '');
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());

                nlapiLogExecution('debug', '4. Callback Details entered');
            } else if (outcome == 'sendinfo') {

                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 19);
                    phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Info Sent');
                } else {
                    phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Info Sent');
                }


                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 17);

                recSales.setFieldValue('custrecord_sales_completed', "F");
                recSales.setFieldValue('custrecord_sales_infosent', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_callbackdate', callbackdate);
                recSales.setFieldValue('custrecord_sales_callbacktime', callbacktime);
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 4);
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());

            } else if (outcome == 'sendforms') {

                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 51);
                    phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Forms Sent');
                } else {
                    phonecall.setFieldValue('title', 'X Sales - ' + sales_campaign_name + ' - Forms Sent');
                }


                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 24);

                recSales.setFieldValue('custrecord_sales_completed', "F");
                recSales.setFieldValue('custrecord_sales_formsent', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_callbackdate', callbackdate);
                recSales.setFieldValue('custrecord_sales_callbacktime', callbacktime);
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 14);
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());

            } else if (outcome == 'sendquote') {

                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 50);
                    phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Quote Sent');
                } else {
                    phonecall.setFieldValue('title', 'X Sales - ' + sales_campaign_name + ' - Quote Sent');
                }


                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 23);

                recSales.setFieldValue('custrecord_sales_completed', "F");
                recSales.setFieldValue('custrecord_sales_quotesent', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_callbackdate', callbackdate);
                recSales.setFieldValue('custrecord_sales_callbacktime', callbacktime);
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 15);
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());

            } else if (outcome == 'refer') {

                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 29);
                    phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Referred');
                } else {
                    phonecall.setFieldValue('title', 'X Sales - ' + sales_campaign_name + ' - Referred');
                }


                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 17);

                var task = nlapiCreateRecord('task');
                task.setFieldValue('title', 'Existing Customer Sales Call - Refer');
                task.setFieldValue('assigned', referto);
                task.setFieldValue('company', custId);
                task.setFieldValue('sendemail', 'T');
                task.setFieldValue('message', notes);
                task.setFieldText('status', 'Not Started');
                nlapiSubmitRecord(task);

                recSales.setFieldValue('custrecord_sales_completed', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 6);
                recSales.setFieldValue('custrecord_sales_callbackdate', '');
                recSales.setFieldValue('custrecord_sales_callbacktime', '');
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());
            } else if (outcome == 'signed') {


                recCustomer.setFieldValue('entitystatus', 13);
                recCustomer.setFieldValue('salesrep', nlapiGetUser());

                phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Customer Signed');
                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 15);

                recSales.setFieldValue('custrecord_sales_completed', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 2);
                recSales.setFieldValue('custrecord_sales_callbackdate', '');
                recSales.setFieldValue('custrecord_sales_callbacktime', '');
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());
            } else if (outcome == 'trial') {


                if (sales_campaign_type != 65) {
                    recCustomer.setFieldValue('entitystatus', 32);
                }
                recCustomer.setFieldValue('salesrep', nlapiGetUser());

                phonecall.setFieldValue('title', 'Sales - ' + sales_campaign_name + ' - Free Trial Accepted');
                phonecall.setFieldValue('message', callnotes);
                phonecall.setFieldValue('custevent_call_outcome', 9);

                recSales.setFieldValue('custrecord_sales_completed', "T");
                recSales.setFieldValue('custrecord_sales_inuse', "F");
                recSales.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
                recSales.setFieldValue('custrecord_sales_outcome', 1);
                recSales.setFieldValue('custrecord_sales_callbackdate', '');
                recSales.setFieldValue('custrecord_sales_callbacktime', '');
                recSales.setFieldValue('custrecord_sales_lastcalldate', getDate());
                if (!isNullorEmpty(trialperiod) && parseInt(trialperiod) > 0) {
                    recSales.setFieldValue('custrecord_sales_day0call', startdate);
                    recSales.setFieldValue('custrecord_sales_followup_stage', 1);
                    if (parseInt(trialperiod) == 1 || parseInt(trialperiod) == 2) {
                        recSales.setFieldValue('custrecord_sales_day25call', nlapiDateToString(nlapiAddDays(nlapiStringToDate(startdate), (parseInt(trialperiod) * 7) - 3)));
                    } else {
                        recSales.setFieldValue('custrecord_sales_day14call', nlapiDateToString(nlapiAddDays(nlapiStringToDate(startdate), 13)));
                        recSales.setFieldValue('custrecord_sales_day25call', nlapiDateToString(nlapiAddDays(nlapiStringToDate(startdate), (parseInt(trialperiod) * 7) - 3)));
                    }
                }
            }

            nlapiLogExecution('debug', '5. Ready to submit records');

            nlapiSubmitRecord(recCustomer);
            nlapiLogExecution('debug', '6. Submitted Customer');
            nlapiSubmitRecord(phonecall);
            nlapiLogExecution('debug', '7. Submitted Phone call');
            nlapiSubmitRecord(recSales);
            nlapiLogExecution('debug', '8. Submitted sales record');

            response.sendRedirect('RECORD', 'customer', parseInt(request.getParameter('customer')), false);
        }

    }

}

function customerDetailsSection(companyName, abn, resultSetZees, zee, accounts_email, daytodayphone, daytodayemail, accounts_phone, customer_status, lead_source, customer_industry, callcenter) {
    var inlineQty = '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">CUSTOMER DETAILS</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 company_name"><div class="input-group"><span class="input-group-addon" id="company_name_text">NAME <span class="mandatory">*</span></span><input id="company_name" class="form-control company_name" required value="' + companyName + '" data-oldvalue="' + companyName + '" /></div></div>';
    inlineQty += '<div class="col-xs-6 industry"><div class="input-group"><span class="input-group-addon" id="industry_text">INDUSTRY <span class="mandatory">*</span></span><select id="industry" class="form-control industry" required><option></option>';
    var col = new Array();
    col[0] = new nlobjSearchColumn('name');
    col[1] = new nlobjSearchColumn('internalId');
    var results = nlapiSearchRecord('customlist_industry_category', null, null, col);
    for (var i = 0; results != null && i < results.length; i++) {
        var res = results[i];
        var listValue = res.getValue('name');
        var listID = res.getValue('internalId');
        if (!isNullorEmpty(customer_industry)) {
            if (customer_industry == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            }
        }
        inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    }
    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container abn_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 abn"><div class="input-group"><span class="input-group-addon" id="abn_text">ABN ';
    nlapiLogExecution('DEBUG', 'callcenter', callcenter);
    if (isNullorEmpty(callcenter)) {
        inlineQty += '<span class="mandatory">*</span>';
        inlineQty += '</span><input id="abn" class="form-control abn" value="' + abn + '" data-oldvalue="' + abn + '" required/></div></div>';
    } else {
        inlineQty += '</span><input id="abn" class="form-control abn" value="' + abn + '" data-oldvalue="' + abn + '" /></div></div>';
    }

    inlineQty += '<div class="col-xs-6 status"><div class="input-group"><span class="input-group-addon" id="status_text">STATUS </span><input id="status" class="form-control status" readonly value="' + customer_status + '" data-oldvalue="' + customer_status + '" /></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container zee_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 zee"><div class="input-group"><span class="input-group-addon" id="zee_text">FRANCHISEE <span class="mandatory">*</span></span><select id="zee" class="form-control zee" ><option value=0></option>';
    resultSetZees.forEachResult(function(searchResultZees) {

        zeeId = searchResultZees.getValue('internalid');
        zeeName = searchResultZees.getValue('companyname');

        if (zeeId == zee) {
            inlineQty += '<option value="' + zeeId + '" selected>' + zeeName + '</option>';
        } else {
            inlineQty += '<option value="' + zeeId + '">' + zeeName + '</option>';
        }

        return true;
    });
    inlineQty += '</select></div></div>';
    inlineQty += '<div class="col-xs-6 leadsource_div"><div class="input-group"><span class="input-group-addon" id="leadsource_text">LEAD SOURCE <span class="mandatory">*</span></span>';

    //NetSuite Search: LEAD SOURCE
    var searched_lead_source = nlapiLoadSearch('campaign', 'customsearch_lead_source');
    resultSetLeadSource = searched_lead_source.runSearch();
    inlineQty += '<select id="leadsource" class="form-control leadsource" ><option></option>';

    resultSetLeadSource.forEachResult(function(searchResultLeadSource) {

        var leadsourceid = searchResultLeadSource.getValue('internalid');
        var leadsourcename = searchResultLeadSource.getValue('title');

        if (leadsourceid == lead_source) {
            inlineQty += '<option value="' + leadsourceid + '" selected>' + leadsourcename + '</option>';
        } else {
            inlineQty += '<option value="' + leadsourceid + '" >' + leadsourcename + '</option>';
        }

        return true;
    });
    inlineQty += '</select></div></div>';
    // inlineQty += '<div class="col-xs-6 leadsource_div"><div class="input-group"><span class="input-group-addon" id="leadsource_text">LEAD SOURCE </span><input id="leadsource" class="form-control leadsource" readonly value="' + lead_source + '" data-oldvalue="' + lead_source + '" required/></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container email_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 account_email_div"><div class="input-group"><span class="input-group-addon" id="account_email_text">ACCOUNTS (MAIN) EMAIL</span><input id="account_email" class="form-control account_email" data-oldvalue="' + accounts_email + '" value="' + accounts_email + '" /></div></div>';
    inlineQty += '<div class="col-xs-6 daytodayemail_div"><div class="input-group"><span class="input-group-addon" id="daytodayemail_text">DAY-TO-DAY EMAIL</span><input id="daytodayemail" class="form-control daytodayemail" data-oldvalue="' + daytodayemail + '" value="' + daytodayemail + '" /></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';


    inlineQty += '<div class="form-group container phone_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 account_phone_div"><div class="input-group"><span class="input-group-addon" id="account_phone_text">ACCOUNTS (MAIN) PHONE</span><input id="account_phone" class="form-control account_phone" data-oldvalue="' + accounts_phone + '" value="' + accounts_phone + '" /> <div class="input-group-btn"><button type="button" class="btn btn-success" id="call_accounts_phone"><span class="glyphicon glyphicon-earphone"></span></button></div></div></div>';
    inlineQty += '<div class="col-xs-6 daytodayphone_div"><div class="input-group"><span class="input-group-addon" id="daytodayphone_text">DAY-TO-DAY PHONE <span class="mandatory">*</span></span><input id="daytodayphone" class="form-control daytodayphone" data-oldvalue="' + daytodayphone + '" value="' + daytodayphone + '" /><div class="input-group-btn"><button type="button" class="btn btn-success" id="call_daytoday_phone"><span class="glyphicon glyphicon-earphone"></span></button></div></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;

}

function addressContactsSection(resultSetAddresses, resultSetContacts, form) {
    var inlineQty = '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 heading3"><h4><span class="label label-default col-xs-12">ADDRESS DETAILS</span></h4></div>';
    inlineQty += '<div class="col-xs-6 heading2"><h4><span class="label label-default col-xs-12">CONTACT DETAILS</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container contacts_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 address_div">';
    inlineQty += '<table border="0" cellpadding="15" id="address" class="table table-responsive table-striped address tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>DETAILS</b></th><th style="vertical-align: middle;text-align: center;"><b>GEOCODED</b></th></tr></thead><tbody>';

    resultSetAddresses.forEachResult(function(searchResultAddresses) {
        var id = searchResultAddresses.getValue('addressinternalid', 'Address', null);
        var addr1 = searchResultAddresses.getValue('address1', 'Address', null);
        var addr2 = searchResultAddresses.getValue('address2', 'Address', null);
        var city = searchResultAddresses.getValue('city', 'Address', null);
        var state = searchResultAddresses.getValue('state', 'Address', null);
        var zip = searchResultAddresses.getValue('zipcode', 'Address', null);
        var lat = searchResultAddresses.getValue('custrecord_address_lat', 'Address', null);
        var lon = searchResultAddresses.getValue('custrecord_address_lon', 'Address', null);
        var default_shipping = searchResultAddresses.getValue('isdefaultshipping', 'Address', null);
        var default_billing = searchResultAddresses.getValue('isdefaultbilling', 'Address', null);
        var default_residential = searchResultAddresses.getValue('isresidential', 'Address', null);

        if (isNullorEmpty(addr1) && isNullorEmpty(addr2)) {
            var full_address = city + ', ' + state + ' - ' + zip;
        } else if (isNullorEmpty(addr1) && !isNullorEmpty(addr2)) {
            var full_address = addr2 + ', ' + city + ', ' + state + ' - ' + zip;
        } else if (!isNullorEmpty(addr1) && isNullorEmpty(addr2)) {
            var full_address = addr1 + ', ' + city + ', ' + state + ' - ' + zip;
        } else {
            var full_address = addr1 + ', ' + addr2 + ', ' + city + ', ' + state + ' - ' + zip;
        }

        if (default_billing == 'T' || default_shipping == 'T') {
            if (isNullorEmpty(lon) || isNullorEmpty(lat)) {
                billing_error = 'F';
            } else {
                billing_error = 'T';
            }
        }

        if (default_shipping == 'T') {
            shipping_state = state
        }

        if (billing_error == 'F') {
            inlineQty += '<tr><td>' + full_address + '</td><td> NO </td></tr>';
        } else {
            inlineQty += '<tr><td>' + full_address + '</td><td> YES </td></tr>';
        }

        address_count++;
        return true;
    });

    inlineQty += '</tbody></table>';
    inlineQty += '</div>';
    inlineQty += '<div class="col-xs-6 contacts_div">';
    inlineQty += '<table border="0" cellpadding="15" id="contacts" class="table table-responsive table-striped contacts tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>DETAILS</b></th><th style="vertical-align: middle;text-align: center;"><b>ROLE</b></th></tr></thead><tbody>';
    resultSetContacts.forEachResult(function(searchResultContacts) {
        var contact_id = searchResultContacts.getValue('internalid');
        var contact_fn = searchResultContacts.getValue('firstname');
        var contact_ln = searchResultContacts.getValue('lastname');
        var contact_phone = searchResultContacts.getValue('phone');
        var contact_email = searchResultContacts.getValue('email');
        var contact_text = searchResultContacts.getValue('formulatext');
        var contact_role = searchResultContacts.getValue('contactrole');
        var contact_role_text = searchResultContacts.getText('contactrole');
        var contact_connect_admin = searchResultContacts.getValue('custentity_connect_admin');
        var contact_connect_user = searchResultContacts.getValue('custentity_connect_user');

        if (contact_connect_admin == 1 || contact_connect_user == 1) {
            form.addField('custpage_connect_admin', 'text', 'Connect Admin').setDisplayType('hidden').setDefaultValue(contact_connect_admin);
            form.addField('custpage_connect_user', 'text', 'Connect User').setDisplayType('hidden').setDefaultValue(contact_connect_user);
            form.addField('custpage_connect_id', 'text', 'Connect User').setDisplayType('hidden').setDefaultValue(contact_id);
            form.addField('custpage_connect_fn', 'text', 'Connect User').setDisplayType('hidden').setDefaultValue(contact_fn);
            form.addField('custpage_connect_ln', 'text', 'Connect User').setDisplayType('hidden').setDefaultValue(contact_ln);
            form.addField('custpage_connect_email', 'text', 'Connect User').setDisplayType('hidden').setDefaultValue(contact_email);
            form.addField('custpage_connect_phone', 'text', 'Connect User').setDisplayType('hidden').setDefaultValue(contact_phone);
        }
        inlineQty += '<tr class="text-center"><td>' + contact_text + '</td><td>' + contact_role_text + '</td></tr>';

        contact_count++;
        return true;
    });
    inlineQty += '</tbody></table>';
    inlineQty += '</div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container reviewaddress_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-3 reviewaddress"><input type="button" value="ADD/EDIT ADDRESSES" class="form-control btn btn-primary" id="reviewaddress" /></div>';
    inlineQty += '<div class="col-xs-3 "></div>';
    inlineQty += '<div class="col-xs-3 reviewcontacts"><input type="button" value="ADD/EDIT CONTACTS" class="form-control btn btn-primary" id="reviewcontacts" /></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';


    return inlineQty;
}

function commencementDetailsSection(commReg, resultSet_service_change, resultServiceChange) {

    var commRegRecord;
    var dateofentry;
    var date_signup;
    var sale_type;
    var date_comm;
    var in_out;

    if (!isNullorEmpty(commReg)) {
        commRegRecord = nlapiLoadRecord('customrecord_commencement_register', commReg);
        dateofentry = commRegRecord.getFieldValue('custrecord_date_entry');
        date_signup = commRegRecord.getFieldValue('custrecord_comm_date_signup');
        date_signup = GetFormattedDate(date_signup);
        sale_type = commRegRecord.getFieldValue('custrecord_sale_type');
        date_comm = commRegRecord.getFieldValue('custrecord_comm_date');
        date_comm = GetFormattedDate(date_comm);
        in_out = commRegRecord.getFieldValue('custrecord_in_out');
    }

    var inlineQty = '<div class="form-group container commencement_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading4"><h4><span class="label label-default col-xs-12">COMMENCEMENT DETAILS</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container dateofentry_section">';
    inlineQty += '<div class="row">';
    if (isNullorEmpty(dateofentry)) {
        inlineQty += '<div class="col-xs-6 dateofentry"><div class="input-group"><span class="input-group-addon" id="dateofentry_text">DATE OF ENTRY</span><input type="text" id="dateofentry" class="form-control dateofentry" value="' + getDate() + '" readonly/></div></div>';
    } else {
        inlineQty += '<div class="col-xs-6 dateofentry"><div class="input-group"><span class="input-group-addon" id="dateofentry_text">DATE OF ENTRY</span><input type="text" id="dateofentry" class="form-control dateofentry" value="' + dateofentry + '" readonly/></div></div>';
    }
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container dates_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 commencementdate"><div class="input-group"><span class="input-group-addon" id="commencementdate_text">DATE - COMMENCEMENT <span class="mandatory">*</span></span><input type="date" id="commencementdate" class="form-control commencementdate" data-oldvalue="' + date_comm + '" value="' + date_comm + '" data-commregid="' + commReg + '" required/></div></div>';
    inlineQty += '<div class="col-xs-6 signupdate"><div class="input-group"><span class="input-group-addon" id="signupdate_text">DATE - SIGNUP <span class="mandatory">*</span></span><input type="date" id="signupdate" class="form-control signupdate" data-oldvalue="' + date_signup + '" value="' + date_signup + '" required/></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container details_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 commencementtype"><div class="input-group"><span class="input-group-addon" id="commencementtype_text">COMMENCEMENT TYPE <span class="mandatory">*</span></span><select id="commencementtype" class="form-control commencementtype" required><option></option>';
    var col = new Array();
    col[0] = new nlobjSearchColumn('name');
    col[1] = new nlobjSearchColumn('internalId');
    var results = nlapiSearchRecord('customlist_sale_type', null, null, col);
    for (var i = 0; results != null && i < results.length; i++) {
        var res = results[i];
        var listValue = res.getValue('name');
        var listID = res.getValue('internalId');
        if (!isNullorEmpty(sale_type)) {
            if (sale_type == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            }
        }
        inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    }
    inlineQty += '</select></div></div>';
    inlineQty += '<div class="col-xs-6 inoutbound"><div class="input-group"><span class="input-group-addon" id="inoutbound_text">INBOUND/OUTBOUND <span class="mandatory">*</span></span><select id="inoutbound" class="form-control inoutbound" required><option></option>';
    var col = new Array();
    col[0] = new nlobjSearchColumn('name');
    col[1] = new nlobjSearchColumn('internalId');
    var results = nlapiSearchRecord('customlist_in_outbound', null, null, col);
    for (var i = 0; results != null && i < results.length; i++) {
        var res = results[i];
        var listValue = res.getValue('name');
        var listID = res.getValue('internalId');
        if (!isNullorEmpty(in_out)) {
            if (in_out == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            }
        }
        inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    }
    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container details_section">';
    inlineQty += '<div class="row"><div class="col-xs-6 upload">';
    if (!isNullorEmpty(commReg)) {
        var commRegRecord = nlapiLoadRecord('customrecord_commencement_register', commReg);
        var file_id = commRegRecord.getFieldValue('custrecord_scand_form');

        if (!isNullorEmpty(file_id)) {
            var fileRecord = nlapiLoadFile(file_id);
            inlineQty += '<iframe id="viewer" frameborder="0" scrolling="no" width="400" height="600" src="' + fileRecord.getURL() + '"></iframe>';
        } else {
            inlineQty += '<iframe id="viewer" frameborder="0" scrolling="no" width="400" height="600" style="display: none;"></iframe>';
        }
    } else {

        // inlineQty += '<div class="input-group"><span class="input-group-addon" id="scf_text">UPLOAD SCF <span class="mandatory">*</span></span><input type="file" class="form-control fileToUpload" name="fileToUpload" id="fileToUpload"></div></br>';
        inlineQty += '<iframe id="viewer" frameborder="0" scrolling="no" width="400" height="600" style="display: none;"></iframe>';
    }
    inlineQty += '</div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    if (isNullorEmpty(resultSet_service_change) || resultServiceChange.length == 0) {
        inlineQty += '<div class="form-group container createservicechg_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-3 createservicechg"><input type="button" value="CREATE SERVICE CHANGE" class="form-control btn btn-success" id="createservicechg" /></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';
    }

    return inlineQty;
}

function serviceDetailsSection(resultSet_service) {

    var inlineQty = '';
    inlineQty += '<div class="form-group container ampo_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading3"><h4><span class="label label-default col-xs-12">FRANCHISEE ENTERED SERVICE DETAILS</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container ampo_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 ampo_price_div"><div class="input-group"><span class="input-group-addon" id="ampo_price_text">AMPO PRICE';
    if (role == 1000) {
        inlineQty += ' <span class="mandatory">*</span>';
    }
    inlineQty += '</span><input id="ampo_price" class="form-control ampo_price" ';
    if (role == 1000) {
        inlineQty += 'required';
    }
    inlineQty += ' value="' + ampo_price + '" data-oldvalue="' + ampo_price + '" /></div></div>';
    inlineQty += '<div class="col-xs-6 ampo_time_div"><div class="input-group"><span class="input-group-addon" id="ampo_time_text">AMPO TIME ';
    if (role == 1000) {
        inlineQty += ' <span class="mandatory">*</span>';
    }
    inlineQty += '</span><select id="ampo_time" class="form-control ampo_time"><option></option>';
    var columns = new Array();
    columns[0] = new nlobjSearchColumn('name');
    columns[1] = new nlobjSearchColumn('internalId');

    var industry_search = nlapiCreateSearch('customlist_service_time_range', null, columns)
    var resultSetIndustry = industry_search.runSearch();
    resultSetIndustry.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(ampo_time)) {
            if (ampo_time == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            }
        }
        inlineQty += '<option value="' + listID + '">' + listValue + '</option>';

        return true;
    });
    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container ampo_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 pmpo_price_div"><div class="input-group"><span class="input-group-addon" id="pmpo_price_text">PMPO PRICE ';
    if (role == 1000) {
        inlineQty += '<span class="mandatory">*</span>';
    }
    inlineQty += '</span><input id="pmpo_price" class="form-control pmpo_price"';
    if (role == 1000) {
        inlineQty += ' required ';
    }
    0
    inlineQty += 'value="' + ampo_price + '" data-oldvalue="' + ampo_price + '" /></div></div>';
    inlineQty += '<div class="col-xs-6 pmpo_time_div"><div class="input-group"><span class="input-group-addon" id="pmpo_time_text">PMPO TIME ';
    if (role == 1000) {
        inlineQty += '<span class="mandatory">*</span>';
    }
    inlineQty += '</span><select id="pmpo_time" class="form-control pmpo_time"><option></option>';
    var columns = new Array();
    columns[0] = new nlobjSearchColumn('name');
    columns[1] = new nlobjSearchColumn('internalId');

    var industry_search = nlapiCreateSearch('customlist_service_time_range', null, columns)
    var resultSetIndustry = industry_search.runSearch();
    resultSetIndustry.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(pmpo_time)) {
            if (pmpo_time == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            }
        }
        inlineQty += '<option value="' + listID + '">' + listValue + '</option>';

        return true;
    });
    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container service_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading3"><h4><span class="label label-default col-xs-12">CURRENT SERVICES PERFORMED</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';
    inlineQty += '<div class="form-group container service_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 service_div">';
    inlineQty += '<table border="0" cellpadding="15" id="service" class="table table-responsive table-striped service tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>SERVICE NAME</b></th><th style="vertical-align: middle;text-align: center;"><b>SERVICE DESCRIPTION</b></th><th style="vertical-align: middle;text-align: center;"><b>SERVICE PRICE</b></th><th style="vertical-align: middle;text-align: center;"><b>MON</b></th><th style="vertical-align: middle;text-align: center;"><b>TUE</b></th><th style="vertical-align: middle;text-align: center;"><b>WED</b></th><th style="vertical-align: middle;text-align: center;"><b>THU</b></th><th style="vertical-align: middle;text-align: center;"><b>FRI</b></th><th style="vertical-align: middle;text-align: center;"><b>ADHOC</b></th></tr></thead><tbody>';
    resultSet_service.forEachResult(function(searchResult_service) {
        var serviceId = searchResult_service.getValue('internalid');
        var serviceTypeId = searchResult_service.getText("internalid", "CUSTRECORD_SERVICE", null);
        var serviceText = searchResult_service.getText('custrecord_service');
        var serviceDescp = searchResult_service.getValue('custrecord_service_description');
        var servicePrice = searchResult_service.getValue('custrecord_service_price');

        inlineQty += '<tr>';

        inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name_current" data-serviceid="' + serviceId + '" data-servicetypeid="' + serviceTypeId + '" readonly value="' + serviceText + '" /></div></td>';

        inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class_current" disabled value="' + serviceDescp + '"  type="text" /></div></td>';

        inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + servicePrice + '"  type="number" step=".01" /></div></td>';

        if (searchResult_service.getValue('custrecord_service_day_mon') == 'T') {
            inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
        }

        if (searchResult_service.getValue('custrecord_service_day_tue') == 'T') {
            inlineQty += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            inlineQty += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
        }

        if (searchResult_service.getValue('custrecord_service_day_wed') == 'T') {
            inlineQty += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            inlineQty += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
        }

        if (searchResult_service.getValue('custrecord_service_day_thu') == 'T') {
            inlineQty += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            inlineQty += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
        }

        if (searchResult_service.getValue('custrecord_service_day_fri') == 'T') {
            inlineQty += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            inlineQty += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
        }

        if (searchResult_service.getValue('custrecord_service_day_adhoc') == 'T') {
            inlineQty += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled checked /></div></td>';
        } else {
            inlineQty += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled /></div></td>';
        }

        inlineQty += '</tr>';
        return true;
    });
    inlineQty += '</tbody></table>';
    inlineQty += '</div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

function surveyInfo(ap_mail_parcel, ap_outlet, lpo_customer, multisite, website) {
    var inlineQty = '<div class="form-group container survey_section">';
    inlineQty += '<div class="row">';
    // inlineQty += '<div class="col-xs-4 survey1"><div class="input-group"><span class="input-group-addon" id="survey1_text">Using AusPost for Mail & Parcel? <span class="mandatory">*</span></span><select id="survey1" class="form-control survey1" required><option></option>';
    // var col = new Array();
    // col[0] = new nlobjSearchColumn('name');
    // col[1] = new nlobjSearchColumn('internalId');
    // var results = nlapiSearchRecord('customlist_yes_no_unsure', null, null, col);
    // for (var i = 0; results != null && i < results.length; i++) {
    //  var res = results[i];
    //  var listValue = res.getValue('name');
    //  var listID = res.getValue('internalId');
    //  if (!isNullorEmpty(ap_mail_parcel)) {
    //      if (ap_mail_parcel == listID) {
    //          inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
    //      } else {
    //          inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    //      }
    //  } else {
    //      inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    //  }

    // }
    // inlineQty += '</select></div></div>';
    // inlineQty += '<div class="col-xs-3 survey2"><div class="input-group"><span class="input-group-addon" id="survey2_text">Using AusPost Outlet? <span class="mandatory">*</span></span><select id="survey2" class="form-control survey2" required><option></option>';
    // for (var i = 0; results != null && i < results.length; i++) {
    //  var res = results[i];
    //  var listValue = res.getValue('name');
    //  var listID = res.getValue('internalId');
    //  if (!isNullorEmpty(ap_outlet)) {
    //      if (ap_outlet == listID) {
    //          inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
    //      } else {
    //          inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    //      }
    //  } else {
    //      inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    //  }
    // }
    // inlineQty += '</select></div></div>';
    // inlineQty += '<div class="col-xs-4 survey3"><div class="input-group"><span class="input-group-addon" id="survey3_text">Is this Auspost outlet a LPO? <span class="mandatory">*</span></span><select id="survey3" class="form-control survey3" required><option></option>';
    // for (var i = 0; results != null && i < results.length; i++) {
    //  var res = results[i];
    //  var listValue = res.getValue('name');
    //  var listID = res.getValue('internalId');
    //  if (!isNullorEmpty(lpo_customer)) {
    //      if (lpo_customer == listID) {
    //          inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
    //      } else {
    //          inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    //      }
    //  } else {
    //      inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
    //  }
    // }
    // inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container multisite_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-4 multisite"><div class="input-group"><span class="input-group-addon" id="multisite_text">Multisite? </span><select id="multisite" class="form-control multisite" ><option></option>';
    var col = new Array();
    col[0] = new nlobjSearchColumn('name');
    col[1] = new nlobjSearchColumn('internalId');
    var results = nlapiSearchRecord('customlist_yes_no_unsure', null, null, col);

    for (var i = 0; results != null && i < results.length; i++) {
        var res = results[i];
        var listValue = res.getValue('name');
        var listID = res.getValue('internalId');
        if (!isNullorEmpty(multisite)) {
            if (multisite == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
    }

    inlineQty += '</select></div></div>';
    inlineQty += '<div class="col-xs-6 website"><div class="input-group"><span class="input-group-addon" id="survey2_text">MULTISITE WEB LINK </span><input id="website" type="text" class="form-control website" value="' + website + '" /></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;

}

function callCentreButtons(salesCampaign_id, phone_call_made, customer_status, resultSetContacts, resultSetAddresses, lead_source) {

    var inlineQty = '<div class="container" style="padding-top: 5%;">';

    nlapiLogExecution('DEBUG', 'Status', customer_status)
    if (customer_status == '13') {

        inlineQty += '<div class="form-group container info_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-3 sendinfo"><input type="button" id="sendinfo" class="form-control sendinfo btn btn-warning" value="SEND EMAIL" onclick="onclick_SendEmail();"/></div>';
        inlineQty += '<div class="col-xs-3 callback"><input type="button" id="callback" class="form-control callback btn btn-primary" value="CALL BACK" onclick="onclick_Callback()"/></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container noanswer_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-3 noanswer"><input type="button" id="noanswer" class="form-control noanswer btn btn-danger" value="NO ANSWER" onclick="onclick_NoAnswer()" /></div>';
        inlineQty += '<div class="col-xs-3 nosale"><input type="button" id="nosale" class="form-control nosale btn btn-danger" required value="NO SALE / NO CONTACT" onclick="onclick_NoSale()"/></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

    } else {
        // if (salesCampaign_id != 55) {
        if (contact_count > 0 && address_count > 0) {
            inlineQty += '<div class="form-group container info_section">';
            inlineQty += '<div class="row">';
            if (lead_source == 246616) {
                inlineQty += '<div class="col-xs-4 sendinfo"><input type="button" id="sendinfo" class="form-control sendinfo btn btn-success" value="CLOSED WON / OPPORTUNITY WITH VALUE" onclick="onclick_SendEmail();"/></div>';
                inlineQty += '<div class="col-xs-2 sendforms"><input type="button" id="quadient" class="form-control quadient btn btn-success" value="QUADIENT PROGRAM" onclick="onclick_Quadient()"/></div>';
            } else {
                inlineQty += '<div class="col-xs-4 sendinfo"><input type="button" id="sendinfo" class="form-control sendinfo btn btn-success" value="CLOSED WON / OPPORTUNITY WITH VALUE" onclick="onclick_SendEmail();"/></div>';
                inlineQty += '<div class="col-xs-2 offpeakpipeline"><input type="button" id="offpeakpipeline" class="form-control offpeakpipeline btn btn-warning" value="OFF PEAK PIPELINE" onclick="onclick_OffPeak()"/></div>';
            }

            inlineQty += '</div>';
            inlineQty += '</div>';
        }


        // } else {
        //     if (phone_call_made == 'T') {
        //         inlineQty += '<div class="form-group container complete_section">';
        //         inlineQty += '<div class="row">';
        //         inlineQty += '<div class="col-xs-3 complete"><input type="button" id="complete" class="form-control complete btn btn-success" value="COMPLETE" onclick="submit_Complete()"/></div>';
        //         inlineQty += '<div class="col-xs-3 rejected"><input type="button" id="rejected" class="form-control rejected btn btn-danger" value="REJECTED" onclick="onclick_Reject()"/></div>';
        //         inlineQty += '</div>';
        //         inlineQty += '</div>';
        //     }
        // }

        // if (salesCampaign_id == 55 && phone_call_made == 'T') {
        //     inlineQty += '<div class="form-group container callback_section">';
        //     inlineQty += '<div class="row">';
        //     inlineQty += '<div class="col-xs-3 callback"><input type="button" id="callback" class="form-control callback btn btn-primary" value="CALL BACK" onclick="onclick_Callback()"/></div>';
        //     inlineQty += '</div>';
        //     inlineQty += '</div>';
        // }

        // if (salesCampaign_id != 55) {
        // inlineQty += '<div class="form-group container callback_section">';
        // inlineQty += '<div class="row">';

        // inlineQty += '<div class="col-xs-3 refer"><input type="button" id="refer" class="form-control refer btn btn-primary" value="REFER" onclick="onclick_Refer()"/></div>';
        // inlineQty += '</div>';
        // inlineQty += '</div>';
        // }


        // if (salesCampaign_id == 55) {
        //     if (phone_call_made == 'T') {

        //         inlineQty += '<div class="form-group container noanswer_section">';
        //         inlineQty += '<div class="row">';
        //         inlineQty += '<div class="col-xs-3 noanswer"><input type="button" id="noanswer" class="form-control noanswer btn btn-danger" required value="NO ANSWER" onclick="onclick_NoAnswer()" /></div>';
        //         inlineQty += '</div>';
        //         inlineQty += '</div>';
        //     }
        // } else {

        //     }
    }

    inlineQty += '<div class="form-group container callback_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-2 callback"><input type="button" id="callback" class="form-control callback btn btn-info" value="UPDATE" onclick="onclick_Update()"/></div>';
    inlineQty += '<div class="col-xs-2 setAppointment"><input type="button" id="setAppointment" class="form-control setAppointment btn btn-primary" value="SET APPOINTMENT" onclick="onclick_Callback()"/></div>';
    inlineQty += '<div class="col-xs-2 reassign"><input type="button" id="reassign" class="form-control reassign btn btn-warning" value="ALLOCATE TO REP" onclick="onclick_reassign()"/></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    // inlineQty += '<div class="form-group container callback_section">';
    // inlineQty += '<div class="row">';

    // inlineQty += '</div>';
    // inlineQty += '</div>';

    // inlineQty += '<div class="form-group container callback_section">';
    // inlineQty += '<div class="row">';

    // inlineQty += '</div>';
    // inlineQty += '</div>';

    inlineQty += '<div class="form-group container noanswer_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-2 noanswer"><input type="button" id="noanswer" class="form-control noanswer btn btn-danger" value="NO ANSWER" onclick="onclick_NoAnswer()" /></div>';

    inlineQty += '<div class="col-xs-2 disconnected"><input type="button" id="disconnected" class="form-control disconnected btn btn-danger" value="DISCONNECTED" onclick="onclick_Disconnected()"/></div>';

    inlineQty += '<div class="col-xs-2 nosale"><input type="button" id="nosale" class="form-control nosale btn btn-danger" required value="LOST" onclick="onclick_NoSale()"/></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '</div>';
    return inlineQty;
}

function serviceChangeSection(resultSet_service_change) {
    var inlineQty = '<div class="form-group container service_chg_details_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading6"><h4><span class="label label-default col-xs-12">SERVICE CHANGE DETAILS</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';


    inlineQty += '<div class="form-group container service_chg_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 service_chg_div">';
    inlineQty += '<table border="0" cellpadding="15" id="service_chg" class="table table-responsive table-striped service_chg tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr style="font-size: xx-small;"><th style="vertical-align: middle;text-align: center;"><b>ACTION</b></th><th style="vertical-align: middle;text-align: center;"><b>SERVICE NAME</b></th><th style="vertical-align: middle;text-align: center;"><b>DESCRIPTION</b></th><th style="vertical-align: middle;text-align: center;"><b>DATE EFFECTIVE</b></th><th class="col-xs-2" style="vertical-align: middle;text-align: center;"><b>OLD PRICE</b></th><th class="col-xs-2" style="vertical-align: middle;text-align: center;"><b>NEW PRICE</b></th><th style="vertical-align: middle;text-align: center;"><b>FREQUENCY</b></th></tr></thead><tbody>';

    resultSet_service_change.forEachResult(function(searchResult_service_change) {
        var serviceChangeId = searchResult_service_change.getValue('internalid');
        var serviceId = searchResult_service_change.getValue('custrecord_servicechg_service');
        var serviceText = searchResult_service_change.getText('custrecord_servicechg_service');
        var serviceDescp = searchResult_service_change.getValue("custrecord_service_description", "CUSTRECORD_SERVICECHG_SERVICE", null);
        var serviceTypeID = searchResult_service_change.getValue("custrecord_service", "CUSTRECORD_SERVICECHG_SERVICE", null);
        var oldServicePrice = searchResult_service_change.getValue("custrecord_service_price", "CUSTRECORD_SERVICECHG_SERVICE", null);
        var nsItem = searchResult_service_change.getValue("custrecord_service_ns_item", "CUSTRECORD_SERVICECHG_SERVICE", null);
        var newServiceChangePrice = searchResult_service_change.getValue('custrecord_servicechg_new_price');
        var dateEffective = searchResult_service_change.getValue('custrecord_servicechg_date_effective');
        var commRegId = searchResult_service_change.getValue('custrecord_servicechg_comm_reg');
        var serviceChangeTypeText = searchResult_service_change.getText('custrecord_servicechg_type');
        var serviceChangeFreqText = searchResult_service_change.getText('custrecord_servicechg_new_freq');

        inlineQty += '<tr>';

        inlineQty += '<td><button class="btn btn-warning btn-xs edit_class glyphicon glyphicon-pencil" data-dateeffective="' + dateEffective + '" data-commreg="' + commRegId + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button></td>';


        inlineQty += '<td><input id="service_name" class="form-control service_name" data-serviceid="' + serviceId + '" data-servicetypeid="' + serviceTypeID + '" data-ns="' + nsItem + '" readonly value="' + serviceText + '" /></td>';
        inlineQty += '<td><input id="service_chg_descp" class="form-control service_descp" readonly value="' + serviceDescp + '" /></td>';
        inlineQty += '<td><input id="date_effective" class="form-control date_effective" readonly value="' + dateEffective + '" /></td>';
        inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + oldServicePrice + '"  type="number" step=".01" /></div></td>';
        inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value="' + parseFloat(newServiceChangePrice).toFixed(2) + '"  type="number" step=".01" /></div></td>';

        inlineQty += '<td style="font-size: xx-small;"><input class="form-control new_service_freq" disabled value="' + serviceChangeFreqText + '"/></td>';
        var fileID = searchResult_service_change.getValue("custrecord_scand_form", "CUSTRECORD_SERVICECHG_COMM_REG", null);

        // if (!isNullorEmpty(fileID)) {
        //  var fileRecord = nlapiLoadFile(fileID);
        //  inlineQty += '<td><a href="' + fileRecord.getURL() + '" target="_blank">' + searchResult_service_change.getText("custrecord_scand_form", "CUSTRECORD_SERVICECHG_COMM_REG", null) + '</a></td>';
        // } else {
        //  inlineQty += '<td></td>';
        // }


        inlineQty += '</tr>';
        return true;
    });
    inlineQty += '</tbody></table>';
    inlineQty += '</div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

function salesNotesSection(custId, recCustomer) {

    var notesVal = '';
    var pricingNotes = '';

    if (!isNullorEmpty(recCustomer.getFieldValue('custentity_customer_pricing_notes'))) {
        pricingNotes += recCustomer.getFieldValue('custentity_customer_pricing_notes') + '\n'
    }

    var filters = new Array();
    filters[0] = new nlobjSearchFilter('company', null, 'anyof', custId);

    var columns = new Array();
    columns[0] = new nlobjSearchColumn('createddate');
    columns[1] = new nlobjSearchColumn('completeddate');
    columns[2] = new nlobjSearchColumn('type');
    columns[3] = new nlobjSearchColumn('assigned');
    columns[4] = new nlobjSearchColumn('title');
    columns[5] = new nlobjSearchColumn('message');
    columns[6] = new nlobjSearchColumn('custevent_organiser');

    var notesSearch = nlapiSearchRecord('activity', 'customsearch_salescamp_activity', filters, columns);

    var inlineQty = '';
    inlineQty += '<div class="form-group container contacts_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 sale_notes"><div class="input-group"><span class="input-group-addon" id="sale_notes_text">NOTES </span><textarea id="sale_notes" class="form-control sale_notes" rows="4" cols="50" >' + notesVal + '</textarea></div></div>';
    inlineQty += '<div class="col-xs-6 pricing_notes"><div class="input-group"><span class="input-group-addon" id="gsale_notes_text">PRICING NOTES </span><textarea id="pricing_notes" class="form-control pricing_notes" rows="4" cols="50" >' + pricingNotes + '</textarea></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';
    if (!isNullorEmpty(notesSearch)) {

        inlineQty += '<div class="form-group container contacts_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 address_div">';
        inlineQty += '<table border="0" cellpadding="15" id="address" class="table table-responsive table-striped address tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>CREATED DATE</b></th><th style="vertical-align: middle;text-align: center;"><b>COMPLETED DATE</b></th><th style="vertical-align: middle;text-align: center;"><b>ORGANISER</b></th><th style="vertical-align: middle;text-align: center;"><b>TITLE</b></th><th style="vertical-align: middle;text-align: center;"><b>MESSAGE</b></th></tr></thead><tbody>';
        for (x = 0; x < notesSearch.length; x++) {

            inlineQty += '<tr class="text-center"><td>' + notesSearch[x].getValue(columns[0]) + '</td><td>' + notesSearch[x].getValue(columns[1]) + '</td><td>' + notesSearch[x].getText(columns[6]) + '</td><td>' + notesSearch[x].getValue(columns[4]) + '</td><td>' + notesSearch[x].getValue(columns[5]).replace(/(\r\n|\n|\r)/gm, ", ") + '</td></tr>';

            // notesVal += notesSearch[x].getValue(columns[0]) + ' - ';
            // notesVal += notesSearch[x].getValue(columns[1]) + ' - ';
            // //notesVal += notesSearch[x].getText(columns[3]) + ' - ';
            // notesVal += notesSearch[x].getText(columns[6]) + ' - ';
            // notesVal += notesSearch[x].getValue(columns[4]) + ' - ';
            // notesVal += notesSearch[x].getValue(columns[5]).replace(/(\r\n|\n|\r)/gm, ", ") + '\n';
        }
    }

    inlineQty += '</tbody></table>';
    inlineQty += '</div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}


function mpexTab(customer_id, min_c5, min_dl, min_b4, min_1kg, min_3kg, min_5kg) {
    // Defining Variables
    var record = nlapiLoadRecord('customer', customer_id);
    var invoice_cycle = record.getFieldValue('custentity_mpex_invoicing_cycle');
    var weekly_usage = record.getFieldValue('custentity_exp_mpex_weekly_usage');
    var price_c5 = record.getFieldValue('custentity_mpex_c5_price_point');
    var price_dl = record.getFieldValue('custentity_mpex_dl_price_point');
    var price_b4 = record.getFieldValue('custentity_mpex_b4_price_point');
    var price_1kg = record.getFieldValue('custentity_mpex_1kg_price_point');
    var price_3kg = record.getFieldValue('custentity_mpex_3kg_price_point');
    var price_5kg = record.getFieldValue('custentity_mpex_5kg_price_point');
    var price_500g = record.getFieldValue('custentity_mpex_500g_price_point');

    // Search Function
    var columns = new Array();
    columns[0] = new nlobjSearchColumn('name');
    columns[1] = new nlobjSearchColumn('internalId');

    // Expected Weekly Usage
    var inlineQty = '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX - EXPECTED WEEKLY USAGE | INVOICE CYCLE</span></div>'; // <h4><span class="label label-default col-xs-3">MPEX - INVOICE CYCLE</span></h4></h4>
    // inlineQty += '<div class="col-xs-12 heading1"></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container entityid_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-9 weekly_usage"><div class="input-group"><span class="input-group-addon" id="weekly_usage_text">Weekly Usage</span><input id="weekly_usage" class="form-control weekly_usage">';
    inlineQty += '</input></div></div>';

    // Invoice Cycle
    inlineQty += '<div class="col-xs-3 invoice_cycle"><div class="input-group"><span class="input-group-addon" id="invoice_cycle_text">Invoice Cycle</span><select id="invoice_cycle" class="form-control invoice_cycle"><option></option>';

    var invoice_cycle_search = nlapiCreateSearch('customlist_invoicing_cyle', null, columns);
    resultInvoiceCycle = invoice_cycle_search.runSearch();

    resultInvoiceCycle.forEachResult(function(searchResult) {
        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');

        if (!isNullorEmpty(invoice_cycle)) {
            if (invoice_cycle == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                invoice_cycle = record.setFieldValue('custentity_mpex_invoicing_cycle', listID);
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        return true;
    });
    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    // Minimum Stock Required
    inlineQty += '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX - MIN STOCK REQUIRED</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container entityid_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-2 min_1kg"><div class="input-group"><span class="input-group-addon" id="min_1kg_text">1Kg (Pieces)</span><input id="min_1kg" class="form-control min_1kg" value="' + min_1kg + '" data-oldvalue="' + min_1kg + '"/></div></div>';
    inlineQty += '<div class="col-xs-2 min_3kg"><div class="input-group"><span class="input-group-addon" id="min_3kg_text">3Kg (Pieces)</span><input id="min_3kg" class="form-control min_3kg" value="' + min_3kg + '" data-oldvalue="' + min_3kg + '"/></div></div>';
    inlineQty += '<div class="col-xs-2 min_5kg"><div class="input-group"><span class="input-group-addon" id="min_5kg_text">5Kg (Pieces)</span><input id="min_5kg" class="form-control min_5kg" value="' + min_5kg + '" data-oldvalue="' + min_5kg + '"/></div></div>';
    inlineQty += '<div class="col-xs-2 min_b4"><div class="input-group"><span class="input-group-addon" id="min_b4_text">B4 (Pieces)</span><input id="min_b4" class="form-control min_b4" value="' + min_b4 + '" data-oldvalue="' + min_b4 + '"/></div></div>';
    inlineQty += '<div class="col-xs-2 min_c5"><div class="input-group"><span class="input-group-addon" id="min_c5_text">C5 (Pieces)</span><input id="min_c5" class="form-control min_c5" value="' + min_c5 + '" data-oldvalue="' + min_b4 + '"/></div></div>';
    inlineQty += '<div class="col-xs-2 min_dl"><div class="input-group"><span class="input-group-addon" id="min_dl_text">DL (Pieces)</span><input id="min_dl" class="form-control min_dl" value="' + min_dl + '" data-oldvalue="' + min_dl + '"/></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    // Price Point
    var price_point_search = nlapiCreateSearch('customlist_mpex_price_points', null, columns);
    resultPricePoint = price_point_search.runSearch();

    inlineQty += '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX - PRICE POINT</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    // New Div - Section for DL, C5, & B4 
    inlineQty += '<div class="form-group container sleeves_section">';
    inlineQty += '<div class="row">';

    inlineQty += '<div class="col-xs-3 price_dl"><div class="input-group"><span class="input-group-addon" id="price_dl_text">DL</span><select id="price_dl" class="form-control price_dl"><option></option>';
    resultPricePoint.forEachResult(function(searchResult) {
        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');

        if (!isNullorEmpty(price_dl)) {
            if (price_dl == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                price_dl = record.setFieldValue('custentity_mpex_dl_price_point', listID);
            } else {
                if (listID != 3) {
                    inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
                }
            }
        } else {
            if (listID != 3) {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }
        return true;
    });
    inlineQty += '</select></div></div>';

    inlineQty += '<div class="col-xs-3 price_c5"><div class="input-group"><span class="input-group-addon" id="price_c5_text">C5</span><select id="price_c5" class="form-control price_c5"><option></option>';
    resultPricePoint.forEachResult(function(searchResult) {
        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');

        if (!isNullorEmpty(price_c5)) {
            if (price_c5 == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                price_c5 = record.setFieldValue('custentity_mpex_c5_price_point', listID);
            } else {
                if (listID != 3) {
                    inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
                }
            }
        } else {
            if (listID != 3) {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }
        return true;
    });
    inlineQty += '</select></div></div>';

    inlineQty += '<div class="col-xs-3 price_b4"><div class="input-group"><span class="input-group-addon" id="price_b4_text">B4</span><select id="price_b4" class="form-control price_b4"><option></option>';
    resultPricePoint.forEachResult(function(searchResult) {
        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');

        if (!isNullorEmpty(price_b4)) {
            nlapiLogExecution('DEBUG', 'listID', listID);
            nlapiLogExecution('DEBUG', 'listValue', listValue);

            if (price_b4 == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                price_b4 = record.setFieldValue('custentity_mpex_b4_price_point', listID);
            } else {
                if (listID != 3) {
                    inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
                }
            }
        } else {
            if (listID != 3) {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }

        return true;
    });
    inlineQty += '</select></div></div>';

    inlineQty += '</div>';
    inlineQty += '</div>';

    // Section for MPEX 500g, 1kg, 3kg, 5kg
    inlineQty += '<div class="form-group container mpex_bag_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-3 price_500g"><div class="input-group"><span class="input-group-addon" id="price_500g_text">500g</span><select id="price_500g" class="form-control price_500g"><option></option>';
    resultPricePoint.forEachResult(function(searchResult) {
        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');

        if (!isNullorEmpty(price_500g)) {
            if (price_1kg == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                price_1kg = record.setFieldValue('custentity_mpex_500g_price_point', listID);
            } else {
                if (listID != 3) {
                    inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
                }
            }
        } else {
            if (listID != 3) {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }
        return true;
    });
    inlineQty += '</select></div></div>';

    inlineQty += '<div class="col-xs-3 price_1kg"><div class="input-group"><span class="input-group-addon" id="price_1kg_text">1Kg</span><select id="price_1kg" class="form-control price_1kg"><option></option>';
    resultPricePoint.forEachResult(function(searchResult) {
        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');

        if (!isNullorEmpty(price_1kg)) {
            if (price_1kg == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                price_1kg = record.setFieldValue('custentity_mpex_1kg_price_point', listID);
            } else {
                if (listID != 3) {
                    inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
                }
            }
        } else {
            if (listID != 3) {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }
        return true;
    });
    inlineQty += '</select></div></div>';

    inlineQty += '<div class="col-xs-3 price_3kg"><div class="input-group"><span class="input-group-addon" id="price_3kg_text">3Kg</span><select id="price_3kg" class="form-control price_3kg"><option></option>';
    resultPricePoint.forEachResult(function(searchResult) {
        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');

        if (!isNullorEmpty(price_3kg)) {
            if (price_3kg == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                price_3kg = record.setFieldValue('custentity_mpex_3kg_price_point', listID);
            } else {
                if (listID != 3) {
                    inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
                }
            }
        } else {
            if (listID != 3) {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }
        return true;
    });
    inlineQty += '</select></div></div>';

    inlineQty += '<div class="col-xs-3 price_5kg"><div class="input-group"><span class="input-group-addon" id="price_5kg_text">5Kg</span><select id="price_5kg" class="form-control price_5kg"><option></option>';
    resultPricePoint.forEachResult(function(searchResult) {
        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');

        if (!isNullorEmpty(price_5kg)) {
            if (price_5kg == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                price_5kg = record.setFieldValue('custentity_mpex_5kg_price_point', listID);
            } else {
                if (listID != 3) {
                    inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
                }
            }
        } else {
            if (listID != 3) {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }
        return true;
    });
    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    nlapiSubmitRecord(record);

    return inlineQty;
}

function freqCal(freq) {

    var multiselect = '';

    if (freq.indexOf(1) != -1) {
        multiselect += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
    }

    if (freq.indexOf(2) != -1) {
        multiselect += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
    }

    if (freq.indexOf(3) != -1) {
        multiselect += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
    }

    if (freq.indexOf(4) != -1) {
        multiselect += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
    }

    if (freq.indexOf(5) != -1) {
        multiselect += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
    }

    if (freq.indexOf(6) != -1) {
        multiselect += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled checked /></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled /></div></td>';
    }



    return multiselect;
}

function pad(s) {
    return (s < 10) ? '0' + s : s;
}

function GetFormattedDate(stringDate) {

    var todayDate = nlapiStringToDate(stringDate);
    var month = pad(todayDate.getMonth() + 1);
    var day = pad(todayDate.getDate());
    var year = (todayDate.getFullYear());
    return year + "-" + month + "-" + day;
}