/**
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2019-03-27 10:04:32   		ankith.ravindran
 *
 * Description: Lead Capture         
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2019-11-22 10:58:06
 *
 */


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

function leadForm(request, response) {
    if (request.getMethod() == "GET") {

        var customer_id = null;
        var customer_record;
        var entityid;
        var companyName = '';
        var abn = '';
        var zeeText = '';
        var accounts_email = '';
        var accounts_phone = '';
        var daytodayemail = '';
        var daytodayphone = '';
        var ap_mail_parcel = '';
        var ap_outlet = '';
        var lpo_customer = '';
        var customer_status = '';
        var customer_status_id = '';
        var lead_source = '';
        var lead_source_text = '';
        var customer_industry = '';
        var multisite = '';
        var website = '';
        var pricing_notes = '';
        var zee_visit_notes = '';
        var zee_visit = '';
        var savedNoteSearch = null;
        var ampo_price;
        var ampo_time;
        var pmpo_price;
        var pmpo_time;

        var params = request.getParameter('custparam_params');

        if (!isNullorEmpty(params)) {
            params = JSON.parse(params);
            customer_id = parseInt(params.custid);
        } else if (!isNullorEmpty(request.getParameter('custid'))) {
            customer_id = parseInt(request.getParameter('custid'));
        }


        var form = nlapiCreateForm('Lead Capture');

        if (!isNullorEmpty(customer_id)) {

            form.addField('customer_id', 'text', 'customer_id').setDisplayType('hidden').setDefaultValue(customer_id);

            var customer_record = nlapiLoadRecord('customer', customer_id);

            entityid = customer_record.getFieldValue('entityid');
            companyName = customer_record.getFieldValue('companyname');
            abn = customer_record.getFieldValue('vatregnumber');
            if (isNullorEmpty(abn)) {
                abn = '';
            }
            zee = customer_record.getFieldValue('partner');
            zeeText = customer_record.getFieldText('partner');
            accounts_email = customer_record.getFieldValue('email');
            if (isNullorEmpty(accounts_email)) {
                accounts_email = '';
            }
            accounts_phone = customer_record.getFieldValue('altphone');
            if (isNullorEmpty(accounts_phone)) {
                accounts_phone = '';
            }
            daytodayemail = customer_record.getFieldValue('custentity_email_service');
            if (isNullorEmpty(daytodayemail)) {
                daytodayemail = '';
            }
            daytodayphone = customer_record.getFieldValue('phone');
            if (isNullorEmpty(daytodayphone)) {
                daytodayphone = '';
            }
            ap_mail_parcel = customer_record.getFieldValue('custentity_ap_mail_parcel');
            using_express_post = customer_record.getFieldValue('custentity_customer_express_post');
            using_local_couriers = customer_record.getFieldValue('custentity_customer_local_couriers');
            using_po_box = customer_record.getFieldValue('custentity_customer_po_box');
            bank_visit = customer_record.getFieldValue('custentity_customer_bank_visit');
            ap_outlet = customer_record.getFieldValue('custentity_ap_outlet');
            lpo_customer = customer_record.getFieldValue('custentity_ap_lpo_customer');
            classify_lead = customer_record.getFieldValue('custentity_lead_type');
            customer_status = customer_record.getFieldText('entitystatus');
            customer_status_id = customer_record.getFieldValue('entitystatus');
            lead_source = customer_record.getFieldValue('leadsource');
            lead_source_text = customer_record.getFieldValue('leadsource');
            customer_industry = customer_record.getFieldValue('custentity_industry_category');
            multisite = customer_record.getFieldValue('custentity_category_multisite');
            pricing_notes = customer_record.getFieldValue('custentity_customer_pricing_notes');
            zee_visit_notes = customer_record.getFieldValue('custentity_mp_toll_zeevisit_memo');
            zee_visit = customer_record.getFieldValue('custentity_mp_toll_zeevisit');
            ampo_price = customer_record.getFieldValue('custentity_ampo_service_price');
            ampo_time = customer_record.getFieldValue('custentity_ampo_service_time');
            pmpo_price = customer_record.getFieldValue('custentity_pmpo_service_price');
            pmpo_time = customer_record.getFieldValue('custentity_pmpo_service_time');

            if (multisite == 'T') {
                multisite = 1;
            } else {
                multisite = 2;
            }

            if (zee_visit == 'T') {
                zee_visit = 1;
            } else {
                zee_visit = 2;
            }

            if (isNullorEmpty(ampo_price)) {
                ampo_price = '';
            }

            if (isNullorEmpty(pmpo_price)) {
                pmpo_price = '';
            }



            website = customer_record.getFieldValue('custentity_category_multisite_link');

            var savedNoteSearch = nlapiLoadSearch('note', 'customsearch_user_note');
            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('internalid', 'CUSTOMER', 'is', customer_id);

            savedNoteSearch.addFilters(newFilters);

            var resultSet_note = savedNoteSearch.runSearch();


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


            var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_salesp_service_chg');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_service_customer", "CUSTRECORD_SERVICECHG_SERVICE", 'is', customer_id);

            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_status', null, 'noneof', [2, 3]);

            searched_service_change.addFilters(newFilters);

            resultSet_service_change = searched_service_change.runSearch();

            resultServiceChange = resultSet_service_change.getResults(0, 1);


        }


        var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style>.mandatory{color:red;}</style>';

        inlineHtml += '<div class="container" style="padding-top: 3%;"><div id="alert" class="alert alert-danger fade in"></div>';

        if (role == 1000) {


            var resultSetZees = null;
        } else {
            var searchZees = nlapiLoadSearch('partner', 'customsearch_salesp_franchisee');

            var resultSetZees = searchZees.runSearch();
        }


        inlineHtml += '<input id="customer_id" class="form-control" required value="' + customer_id + '" type="hidden"/></div></div>';

        form.addField('status_id', 'text', 'status_id').setDisplayType('hidden');

        inlineHtml += '<input id="zee_id" class="form-control" required value="' + zee + '" type="hidden"/></div></div>';


        var resultSetContacts = null;
        var resultSetAddresses = null;

        if (!isNullorEmpty(customer_id)) {

            var searched_addresses = nlapiLoadSearch('customer', 'customsearch_salesp_address');
            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('internalid', null, 'anyof', customer_id);

            searched_addresses.addFilters(newFilters);

            resultSetAddresses = searched_addresses.runSearch();

            var serviceAddressResult = resultSetAddresses.getResults(0, 1);

            var searched_contacts = nlapiLoadSearch('contact', 'customsearch_salesp_contacts');
            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('internalid', 'CUSTOMER', 'is', customer_id);

            searched_contacts.addFilters(newFilters);

            resultSetContacts = searched_contacts.runSearch();
        }


        //Customer Details
        inlineHtml += customerDetailsSection(entityid, companyName, abn, resultSetZees, zee, accounts_email, daytodayphone, daytodayemail, accounts_phone, customer_status, lead_source, customer_industry, lead_source_text, customer_status_id);

        //Address and Contacts Details
        inlineHtml += addressContactsSection(resultSetAddresses, resultSetContacts);

        if (!isNullorEmpty(serviceAddressResult)) {
            if (serviceAddressResult.length > 0) {
                inlineHtml += '<div class="tabs" style="font-size: xx-small;"><ul class="nav nav-tabs nav-justified" style="padding-top: 3%;">';

                var tab_content = '';
                inlineHtml += '<li role="presentation" class="active"><a href="#services">SERVICES / PRICING NOTES</a></li>';
                inlineHtml += '<li role="presentation" class=""><a href="#survey">ADDITIONAL INFORMATION</a></li>';
                if (role != 1000) {


                    inlineHtml += '<li role="presentation" class=""><a href="#notes">USER NOTES</a></li>';
                }
                inlineHtml += '</ul>';

                //Service Details Tab Contenet
                tab_content += '<div role="tabpanel" class="tab-pane active" id="services">';
                tab_content += serviceDetailsSection(pricing_notes);
                tab_content += '</div>';

                tab_content += '<div role="tabpanel" class="tab-pane" id="survey">';
                //Survey Questions
                tab_content += surveyInfo(ap_mail_parcel, ap_outlet, lpo_customer, multisite, website, zee_visit_notes, zee_visit, ap_mail_parcel, ap_outlet, lpo_customer, using_express_post, using_local_couriers, using_po_box, bank_visit, classify_lead);
                tab_content += '</div>';

                if (role != 1000) {
                    tab_content += '<div role="tabpanel" class="tab-pane" id="notes">';
                    //User Notes
                    tab_content += userNote(resultSet_note);
                    tab_content += '</div>';
                }

                inlineHtml += '<div class="tab-content" style="padding-top: 3%;">';

                inlineHtml += tab_content;

                inlineHtml += '</div></div>';
            }
        }



        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineHtml);
        if (!isNullorEmpty(serviceAddressResult)) {
            if (serviceAddressResult.length > 0) {
                form.addSubmitButton('SAVE');
            }
        }
        form.addButton('back', 'Back', 'onclick_back()');
        form.setScript('customscript_cl_lead_capture');
        response.writePage(form);
    } else {

        var status_id = request.getParameter('status_id');
        var customer_id = parseInt(request.getParameter('customer_id'));

        var customer_record = nlapiLoadRecord('customer', customer_id);
        var entity_id = customer_record.getFieldValue('entityid');
        var customer_name = customer_record.getFieldValue('companyname');

        if (status_id == '57') {
            var recordtoCreate = nlapiCreateRecord('customrecord_sales');
            var date2 = new Date();
            var subject = '';
            var body = '';

            var cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customer_id;

            body = 'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

            var userRole = parseInt(nlapiGetContext().getRole());

            // Set customer, campaign, user, last outcome, callback date
            recordtoCreate.setFieldValue('custrecord_sales_customer', customer_id);
            recordtoCreate.setFieldValue('custrecord_sales_campaign', 64);

            recordtoCreate.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
            nlapiSetFieldValue('salesrep', 668712);

            recordtoCreate.setFieldValue('custrecord_sales_outcome', 5);
            recordtoCreate.setFieldValue('custrecord_sales_callbackdate', getDate());
            recordtoCreate.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date2.addHours(0), 'timeofday'));
            if (nlapiGetFieldValue('campaign_type') == 56) {
                recordtoCreate.setFieldValue('custrecord_sales_followup_stage', 5);
            }

            // nlapiSubmitRecord(recordtoCreate);

            nlapiSendEmail(112209, ['belinda.urbani@mailplus.com.au', 'stacey.williams@mailplus.com.au'], 'Sales HOT Lead - ' + entity_id + ' ' + customer_name, body, ['luke.forbes@mailplus.com.au', 'ankith.ravindran@mailplus.com.au', 'raine.giderson@mailplus.com.au']);

        }



        nlapiSetRedirectURL('SUITELET', 'customscript_sl_lead_capture', 'customdeploy_sl_lead_capture', null, null);
    }
}

function customerDetailsSection(entityid, companyName, abn, resultSetZees, zee, accounts_email, daytodayphone, daytodayemail, accounts_phone, customer_status, lead_source, customer_industry, lead_source_text, customer_status_id) {
    var inlineQty = '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">CUSTOMER DETAILS</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    if (!isNullorEmpty(entityid)) {
        inlineQty += '<div class="form-group container entityid_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-6 entityid"><div class="input-group"><span class="input-group-addon" id="entityid_text">ID </span><input id="entityid" class="form-control entityid" readonly value="' + entityid + '" data-oldvalue="' + entityid + '" /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';
    }

    inlineQty += '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 company_name"><div class="input-group"><span class="input-group-addon" id="company_name_text">COMPANY NAME <span class="mandatory">*</span></span><input id="company_name" class="form-control company_name" required value="' + companyName + '" data-oldvalue="' + companyName + '" /></div></div>';
    inlineQty += '<div class="col-xs-6 industry"><div class="input-group"><span class="input-group-addon" id="industry_text">INDUSTRY <span class="mandatory">*</span></span><select id="industry" class="form-control industry"><option value="19">OTHER SERVICES</option>';
    var columns = new Array();
    columns[0] = new nlobjSearchColumn('name');
    columns[1] = new nlobjSearchColumn('internalId');

    var industry_search = nlapiCreateSearch('customlist_industry_category', null, columns)
    var resultSetIndustry = industry_search.runSearch();
    resultSetIndustry.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(customer_industry)) {
            if (customer_industry == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            }
        }
        inlineQty += '<option value="' + listID + '">' + listValue + '</option>';

        return true;
    });
    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container abn_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 abn"><div class="input-group"><span class="input-group-addon" id="abn_text">ABN </span><input id="abn" class="form-control abn" value="' + abn + '" data-oldvalue="' + abn + '"/></div></div>';
    if (isNullorEmpty(customer_status_id)) {
        customer_status = 'SUSPECT - New'
    }

    if (role != 1000) {
        inlineQty += '<div class="col-xs-6 status"><div class="input-group"><span class="input-group-addon" id="status_text">STATUS <span class="mandatory">*</span></span><select id="status" class="form-control status"><option></option>';

        if (customer_status_id == 6) {
            inlineQty += '<option value="' + 6 + '" selected>SUSPECT - New</option>';
        } else if (customer_status_id == 57) {
            inlineQty += '<option value="' + 57 + '" selected>SUSPECT - Hot Lead</option>';
        }
        inlineQty += '<option value="' + 6 + '" >SUSPECT - New</option>';
        inlineQty += '<option value="' + 57 + '" >SUSPECT - Hot Lead</option>';



    } else {
        inlineQty += '<div class="col-xs-6 status"><div class="input-group"><span class="input-group-addon" id="status_text">STATUS <span class="mandatory">*</span></span><select id="status" class="form-control status" readonly><option value="' + 6 + '" selected>SUSPECT - New</option>';

    }
    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container zee_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 zee"><div class="input-group"><span class="input-group-addon" id="zee_text">FRANCHISEE <span class="mandatory">*</span></span>';
    if (role == 1000) {
        var zee_record = nlapiLoadRecord('partner', zee);
        var zee_name = zee_record.getFieldValue('companyname')
        inlineQty += '<select id="zee" readonly class="form-control zee" ><option value="' + zee + '" selected>' + zee_name + '</option>';
    } else {
        inlineQty += '<select id="zee" class="form-control zee" ><option value=0></option>';
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
    }

    if (!isNullorEmpty(resultSetZees)) {

    } else {

    }


    inlineQty += '</select></div></div>';
    inlineQty += '<div class="col-xs-6 leadsource_div"><div class="input-group"><span class="input-group-addon" id="leadsource_text">LEAD SOURCE <span class="mandatory">*</span></span><select id="leadsource" class="form-control leadsource" ><option></option>';

    // var campaignSearch = search.create({
    // 	type: search.Type.CAMPAIGN,
    // 	title: 'LEAD SOURCE',
    // 	id: 'customsearch_lead_source',
    // 	columns: [{
    // 		name: 'internalId'
    // 	}, {
    // 		name: 'title'
    // 	}]
    // });

    // campaignSearch.save();
    // var campaignSearch = search.load({
    // 	id: 'customsearch_lead_source'
    // });
    // campaignSearch.run().each(function(searchResult) {

    // 	var listValue = searchResult.getValue('title');
    // 	// var listID = searchResult.getValue('internalId');
    // 	inlineQty += '<option value="">' + listValue + '</option>';
    // 	return true;
    // });

    if (role == 1000) {
        inlineQty += '<option value="-4" selected>Franchisee Generated</option>';
    } else {
        if (lead_source == 97943) {
            inlineQty += '<option value="97943" selected>HO Generated</option>';
        } else {
            inlineQty += '<option value="97943">HO Generated</option>';
        }
        if (lead_source == 17) {
            inlineQty += '<option value="17" selected>Inbound - Call</option>';
        } else {
            inlineQty += '<option value="17">Inbound - Call</option>';
        }
        if (lead_source == 99417) {
            inlineQty += '<option value="99417" selected>Inbound - Web</option>';
        } else {
            inlineQty += '<option value="99417">Inbound - Web</option>';
        }
        if (lead_source == 202599) {
            inlineQty += '<option value="202599" selected>Relocation</option>';
        } else {
            inlineQty += '<option value="202599">Relocation</option>';
        }

        if (lead_source == 217602) {
            inlineQty += '<option value="217602" selected>Change of Entity</option>';
        } else {
            inlineQty += '<option value="217602">Change of Entity</option>';
        }
        if (lead_source == 11) {
            inlineQty += '<option value="11" selected>Referral</option>';
        } else {
            inlineQty += '<option value="11">Referral</option>';
        }

        if (lead_source == 99417) {
            inlineQty += '<option value="99417" selected>Inbound - Web</option>';
        } else {
            inlineQty += '<option value="99417">Inbound - Web</option>';
        }

        if (lead_source == -4) {
            inlineQty += '<option value="-4" selected>Franchisee Generated</option>';
        } else {
            inlineQty += '<option value="-4" >Franchisee Generated</option>';
        }

        if (lead_source == 239030) {
            inlineQty += '<option value="239030" selected>Field Sales</option>';
        } else {
            inlineQty += '<option value="239030">Field Sales</option>';
        }

        if (lead_source == 239954) {
            inlineQty += '<option value="239954" selected>Inbound - Customer Portal</option>';
        } else {
            inlineQty += '<option value="239954">Inbound - Customer Portal</option>';
        }
    }


    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container email_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 account_email_div"><div class="input-group"><span class="input-group-addon" id="account_email_text">ACCOUNTS (MAIN) EMAIL</span><input id="account_email" type="email" class="form-control account_email" data-oldvalue="' + accounts_email + '" value="' + accounts_email + '" /></div></div>';
    inlineQty += '<div class="col-xs-6 daytodayemail_div"><div class="input-group"><span class="input-group-addon" id="daytodayemail_text">DAY-TO-DAY EMAIL </span><input id="daytodayemail" type="email" class="form-control daytodayemail" data-oldvalue="' + daytodayemail + '" value="' + daytodayemail + '" /></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';


    inlineQty += '<div class="form-group container phone_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 account_phone_div"><div class="input-group"><span class="input-group-addon" id="account_phone_text">ACCOUNTS (MAIN) PHONE</span><input id="account_phone" class="form-control account_phone" data-oldvalue="' + accounts_phone + '" value="' + accounts_phone + '" /> <div class="input-group-btn"><button type="button" class="btn btn-success" id="call_accounts_phone"><span class="glyphicon glyphicon-earphone"></span></button></div></div></div>';
    inlineQty += '<div class="col-xs-6 daytodayphone_div"><div class="input-group"><span class="input-group-addon" id="daytodayphone_text">DAY-TO-DAY PHONE </span><input id="daytodayphone" class="form-control daytodayphone" data-oldvalue="' + daytodayphone + '" value="' + daytodayphone + '" /><div class="input-group-btn"><button type="button" class="btn btn-success" id="call_daytoday_phone"><span class="glyphicon glyphicon-earphone"></span></button></div></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;

}

function addressContactsSection(resultSetAddresses, resultSetContacts) {
    var inlineQty = '<div class="form-group container company_name_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 heading3"><h4><span class="label label-default col-xs-12">ADDRESS DETAILS</span></h4></div>';
    inlineQty += '<div class="col-xs-6 heading2"><h4><span class="label label-default col-xs-12">CONTACT DETAILS</span></h4></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container contacts_section" style="font-size: xx-small;">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 address_div">';
    inlineQty += '<table border="0" cellpadding="15" id="address" class="table table-responsive table-striped address tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>DETAILS</b></th><th style="vertical-align: middle;text-align: center;"><b>GEOCODED</b></th></tr></thead><tbody>';
    if (!isNullorEmpty(resultSetAddresses)) {
        resultSetAddresses.forEachResult(function(searchResultAddresses) {
            var id = searchResultAddresses.getValue('addressinternalid',
                'Address', null);
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
                    var billing_error = 'F';
                } else {
                    var billing_error = 'T';
                }
            }

            if (default_shipping == 'T') {
                shipping_state = state;
            }

            if (billing_error == 'F') {
                inlineQty += '<tr><td>' + full_address + '</td><td> NO </td></tr>';
            } else {
                inlineQty += '<tr><td>' + full_address + '</td><td> YES </td></tr>';
            }


            return true;
        });
    }

    inlineQty += '</tbody></table>';
    inlineQty += '</div>';
    inlineQty += '<div class="col-xs-6 contacts_div">';
    inlineQty += '<table border="0" cellpadding="15" id="contacts" class="table table-responsive table-striped contacts tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>DETAILS</b></th><th style="vertical-align: middle;text-align: center;"><b>ROLE</b></th></tr></thead><tbody>';
    if (!isNullorEmpty(resultSetContacts)) {
        resultSetContacts.forEachResult(function(searchResultContacts) {
            var contact_id = searchResultContacts.getValue('internalid');
            var contact_text = searchResultContacts.getValue('formulatext');
            var contact_role = searchResultContacts.getValue('contactrole');
            var contact_role_text = searchResultContacts.getText('contactrole');


            inlineQty += '<tr class="text-center"><td>' + contact_text + '</td><td>' + contact_role_text + '</td></tr>';

            return true;
        });
    }
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

function surveyInfo(ap_mail_parcel, ap_outlet, lpo_customer, multisite, website, zee_visit_notes, zee_visit, ap_mail_parcel, ap_outlet, lpo_customer, using_express_post, using_local_couriers, using_po_box, bank_visit, classify_lead) {

    var columns = new Array();
    columns[0] = new nlobjSearchColumn('name');
    columns[1] = new nlobjSearchColumn('internalId');

    var yes_no_search = nlapiCreateSearch('customlist_yes_no_unsure', null, columns)
    var resultSetYesNo = yes_no_search.runSearch();

    var columns2 = new Array();
    columns2[0] = new nlobjSearchColumn('name');
    columns2[1] = new nlobjSearchColumn('internalId');

    var classifyLeadsearch = nlapiCreateSearch('customlist_classify_lead', null, columns)
    var resultClassifyLead = classifyLeadsearch.runSearch();

    var inlineQty = '<div class="form-group container multisite_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-4 multisite"><div class="input-group"><span class="input-group-addon" id="multisite_text">Multisite? </span><select id="multisite" class="form-control multisite" ><option></option>';

    resultSetYesNo.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(multisite)) {
            if (multisite == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        return true;
    });

    inlineQty += '</select></div></div>';
    inlineQty += '<div class="col-xs-6 website"><div class="input-group"><span class="input-group-addon" id="survey2_text">MULTISITE WEB LINK </span><input id="website" type="text" class="form-control website" /></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container pricing_notes">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-4 zee_visit"><div class="input-group"><span class="input-group-addon" id="zee_visit_text">VISITED BY FRANCHISEE? </span><select id="zee_visit" class="form-control zee_visit" ><option></option>';

    resultSetYesNo.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(zee_visit)) {
            if (zee_visit == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        return true;
    });

    inlineQty += '</select></div></div>';
    inlineQty += '<div class="col-xs-6 zee_notes"><div class="input-group"><span class="input-group-addon" id="zee_notes_text">FRANCHISEE VISIT NOTES </span><input type="text" id="zee_notes" class="form-control zee_notes" value="' + zee_visit_notes + '" /></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    inlineQty += '<div class="form-group container surveys">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-4 survey1"><div class="input-group"><span class="input-group-addon" id="survey1_text">Using AusPost for Mail & Parcel? </span><select id="survey1" class="form-control survey1"><option></option>';

    resultSetYesNo.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(ap_mail_parcel)) {
            if (ap_mail_parcel == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        return true;
    });

    inlineQty += '</select></div></div>';
    inlineQty += '<div class="col-xs-4 survey2"><div class="input-group"><span class="input-group-addon" id="survey2_text">Using Express Post? </span><select id="survey2" class="form-control survey2"><option></option>';
    resultSetYesNo.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(using_express_post)) {
            if (using_express_post == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        return true;
    });
    inlineQty += '</select></div></div>';
    inlineQty += '<div class="col-xs-4 survey3"><div class="input-group"><span class="input-group-addon" id="survey3_text">Using Local Couriers? </span><select id="survey3" class="form-control survey3"><option></option>';
    resultSetYesNo.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(using_local_couriers)) {
            if (using_local_couriers == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        return true;
    });
    inlineQty += '</select></div></div>';
    inlineQty += '</div></div>';

    inlineQty += '<div class="form-group container surveys_2">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-4 survey4"><div class="input-group"><span class="input-group-addon" id="survey4_text">Using P.O. Box? </span><select id="survey4" class="form-control survey4"><option></option>';
    resultSetYesNo.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(using_po_box)) {
            if (using_po_box == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        return true;
    });
    inlineQty += '</select></div></div>';


    inlineQty += '<div class="col-xs-4 survey5"><div class="input-group"><span class="input-group-addon" id="survey5_text">Bank Visit? </span><select id="survey5" class="form-control survey5"><option></option>';
    resultSetYesNo.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(bank_visit)) {
            if (bank_visit == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        return true;
    });
    inlineQty += '</select></div></div>';

    inlineQty += '<div class="col-xs-4 survey6"><div class="input-group"><span class="input-group-addon" id="survey6_text">Classify Lead </span><select id="survey6" class="form-control survey6"><option></option>';
    resultClassifyLead.forEachResult(function(searchResult) {

        var listValue = searchResult.getValue('name');
        var listID = searchResult.getValue('internalId');
        if (!isNullorEmpty(classify_lead)) {
            if (classify_lead == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
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


    return inlineQty;

}

function serviceDetailsSection(pricing_notes, ampo_price, ampo_time, pmpo_price, pmpo_time) {

    var inlineQty = '<div class="form-group container pricing_notes">';
    inlineQty += '<div class="row">';
    if (isNullorEmpty(pricing_notes)) {
        pricing_notes = "";
    }
    inlineQty += '<div class="col-xs-6 pricing_notes"><div class="input-group"><span class="input-group-addon" id="pricing_notes_text">PRICING NOTES </span><textarea id="pricing_notes" class="form-control pricing_notes" style="margin: 0px; height: 122px; width: 444px;">' + pricing_notes + '</textarea></div></div>';
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
    if (!isNullorEmpty(ampo_price)) {
        inlineQty += ' value="' + ampo_price + '" data-oldvalue="' + ampo_price + '" /></div></div>';
    } else {
        inlineQty += ' value="" data-oldvalue="" /></div></div>';
    }

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
    if (!isNullorEmpty(pmpo_price)) {
        inlineQty += 'value="' + pmpo_price + '" data-oldvalue="' + pmpo_price + '" /></div></div>';
    } else {
        inlineQty += 'value="" data-oldvalue="" /></div></div>';
    }

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


    return inlineQty;
}

function userNote(savedNoteSearch) {

    var inlineQty = '<div class="form-group container reviewaddress_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-3 create_note"><input type="button" value="CREATE USER NOTE" class="form-control btn btn-primary" id="create_note" /></div>';

    inlineQty += '</div>';
    inlineQty += '</div>';

    if (!isNullorEmpty(savedNoteSearch)) {

        inlineQty += '<div class="form-group container contacts_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 address_div">';
        inlineQty += '<table border="0" cellpadding="15" id="address" class="table table-responsive table-striped address tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>CREATED DATE</b></th><th style="vertical-align: middle;text-align: center;"><b>ORGANISER</b></th><th style="vertical-align: middle;text-align: center;"><b>MESSAGE</b></th></tr></thead><tbody>';

        savedNoteSearch.forEachResult(function(searchResult) {

            var note_date = searchResult.getValue('notedate');

            var author = searchResult.getText("author");

            var message = searchResult.getValue('note');

            inlineQty += '<tr><td>' + note_date + '</td><td>' + author + '</td><td>' + message + '</td></tr>';

            return true;
        });

        inlineQty += '</tbody></table>';
        inlineQty += '</div>';
        inlineQty += '</div>';
        inlineQty += '</div>';
    }

    return inlineQty;
}


function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);

    return date;
}

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
}