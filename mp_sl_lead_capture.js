    /**
     * Module Description
     * 
     * NSVersion    Date                        Author         
     * 1.00         2019-03-27 10:04:32         ankith.ravindran
     *
     * Description: Lead Capture / Customer Details Page        
     * 
     * @Last Modified by:   Ankith
     * @Last Modified time: 2020-08-25 11:23:50
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
    var customer_list_page = null;

    var service_type_search = serviceTypeSearch(null, [1]);

    if (role == 1000) { //Role is Franchisee
        zee = ctx.getUser(); //Get Franchisee ID
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
            var old_zee = '';
            var old_zee_text = '';
            var old_customer = '';
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

            var script_id = null;
            var deploy_id = null;
            var mpex_drop_off = null;

            if (!isNullorEmpty(params)) {
                //Coming from the Customer List Page
                params = JSON.parse(params);
                customer_id = parseInt(params.custid);
                script_id = params.scriptid;
                deploy_id = params.deployid;
                mpex_drop_off = params.mpex;
            } else if (!isNullorEmpty(request.getParameter('custid'))) {
                customer_id = parseInt(request.getParameter('custid'));
                script_id = null;
                deploy_id = null;
            }

            if (!isNullorEmpty(script_id) && !isNullorEmpty(deploy_id)) {
                //Coming from the Customer List Page
                var form = nlapiCreateForm('Customer Details');
                customer_list_page = 'T';
            } else {
                //Lead Capture Page
                var form = nlapiCreateForm('Lead Capture');
            }

            if (!isNullorEmpty(customer_id)) {
                //Load Customer Record
                var customer_record = nlapiLoadRecord('customer', customer_id);
                customer_status_id = customer_record.getFieldValue('entitystatus'); //Customer Status

                if (customer_status_id == 13) { //Status is Customer - Signed
                    form = nlapiCreateForm('Customer Details');
                    customer_list_page = 'T';
                } else {
                    form = nlapiCreateForm('Lead Capture');
                }

                //Hidden Fields on the form
                form.addField('customer_id', 'text', 'customer_id').setDisplayType('hidden').setDefaultValue(customer_id);
                form.addField('script_id', 'text', 'customer_id').setDisplayType('hidden').setDefaultValue(script_id);
                form.addField('deploy_id', 'text', 'customer_id').setDisplayType('hidden').setDefaultValue(deploy_id);
                form.addField('mpex_drop_off', 'text', 'customer_id').setDisplayType('hidden').setDefaultValue(mpex_drop_off);
                form.addField('customer_list', 'text', 'customer_id').setDisplayType('hidden').setDefaultValue(customer_list_page);

                entityid = customer_record.getFieldValue('entityid'); // Customer ID
                companyName = customer_record.getFieldValue('companyname'); // Customer Name
                abn = customer_record.getFieldValue('vatregnumber'); // Customer ABN
                if (isNullorEmpty(abn)) {
                    abn = '';
                }
                zee = customer_record.getFieldValue('partner'); //Customer Franchisee ID
                zeeText = customer_record.getFieldText('partner'); //Customer Franchisee Text
                accounts_email = customer_record.getFieldValue('email'); //Customer Accounts Email
                if (isNullorEmpty(accounts_email)) {
                    accounts_email = '';
                }
                accounts_phone = customer_record.getFieldValue('altphone'); // Customer Accounts Phone
                if (isNullorEmpty(accounts_phone)) {
                    accounts_phone = '';
                }
                daytodayemail = customer_record.getFieldValue('custentity_email_service'); // Customer Day-to-day Email
                if (isNullorEmpty(daytodayemail)) {
                    daytodayemail = '';
                }
                daytodayphone = customer_record.getFieldValue('phone'); // Customer Day-to-day Phone
                if (isNullorEmpty(daytodayphone)) {
                    daytodayphone = '';
                }

                ap_mail_parcel = customer_record.getFieldValue('custentity_ap_mail_parcel'); // Customer Using AusPost for Mail & Parcel
                using_express_post = customer_record.getFieldValue('custentity_customer_express_post'); // Customer Using Express Post
                using_local_couriers = customer_record.getFieldValue('custentity_customer_local_couriers'); // Customer Using Local Couriers
                using_po_box = customer_record.getFieldValue('custentity_customer_po_box'); // Customer Using PO Box
                bank_visit = customer_record.getFieldValue('custentity_customer_bank_visit'); // Customer Bank Visit
                ap_outlet = customer_record.getFieldValue('custentity_ap_outlet'); //Customer Using AusPost Outlet
                lpo_customer = customer_record.getFieldValue('custentity_ap_lpo_customer'); // Customer AusPost LPO Customer
                classify_lead = customer_record.getFieldValue('custentity_lead_type'); // Customer Lead Type
                customer_status = customer_record.getFieldText('entitystatus'); // Customer Status Text
                customer_status_id = customer_record.getFieldValue('entitystatus'); // Customer Status ID
                lead_source = customer_record.getFieldValue('leadsource'); //Customer Lead Source ID
                lead_source_text = customer_record.getFieldValue('leadsource'); // Customer Lead Source Text
                old_zee = customer_record.getFieldValue('custentity_old_zee'); //Customer Old Franchisee ID
                old_zee_text = customer_record.getFieldText('custentity_old_zee'); //Customer Old Franchisee Text
                old_customer = customer_record.getFieldValue('custentity_old_customer'); //Old Customer ID
                customer_industry = customer_record.getFieldValue('custentity_industry_category'); //Customer Category
                multisite = customer_record.getFieldValue('custentity_category_multisite'); //Customer Multisite
                pricing_notes = customer_record.getFieldValue('custentity_customer_pricing_notes'); //Customer Pricing Notes
                zee_visit_notes = customer_record.getFieldValue('custentity_mp_toll_zeevisit_memo'); //Customer Franchisee Visit Memo
                zee_visit = customer_record.getFieldValue('custentity_mp_toll_zeevisit'); //Customer Visited by Franchisee
                ampo_price = customer_record.getFieldValue('custentity_ampo_service_price'); //Customer AMPO Price
                ampo_time = customer_record.getFieldValue('custentity_ampo_service_time'); //Customer AMPO Time
                pmpo_price = customer_record.getFieldValue('custentity_pmpo_service_price'); //Customer PMPO Price
                pmpo_time = customer_record.getFieldValue('custentity_pmpo_service_time'); //Customer PMPO Time

                //MPEX SECTION
                min_dl = customer_record.getFieldValue('custentity_mpex_dl_float'); //Customer Min DL Float
                min_b4 = customer_record.getFieldValue('custentity_mpex_b4_float'); //Customer Min B4 Float 
                min_c5 = customer_record.getFieldValue('custentity_mpex_c5_float'); //Customer Min C5 Float
                min_1kg = customer_record.getFieldValue('custentity_mpex_1kg_float'); //Customer Min 1Kg Float
                min_3kg = customer_record.getFieldValue('custentity_mpex_3kg_float'); //Customer Min 3kg Float
                min_5kg = customer_record.getFieldValue('custentity_mpex_5kg_float'); //Customer Min 5Kg Float
                total_1kg = customer_record.getFieldValue('custentity_mpen'); //Customer Total 1Kg Stock at customer location
                total_3kg = customer_record.getFieldValue('custentity_mpet'); //Customer Total 3Kg Stock at customer location
                total_5kg = customer_record.getFieldValue('custentity_mpef'); //Customer Total 5Kg Stock at customer location
                total_b4 = customer_record.getFieldValue('custentity_mpeb'); //Customer Total B4 Stock at customer location
                total_c5 = customer_record.getFieldValue('custentity_mpec'); //Customer Total C5 Stock at customer location
                total_dl = customer_record.getFieldValue('custentity_mped'); //Customer Total DL Stock at customer location
                mpex_drop_notified = customer_record.getFieldValue('custentity_mpex_drop_notified'); // Customer Franchisee Notified

                var mpex_1kg = customer_record.getFieldText("custentity_mpex_1kg_price_point");
                var mpex_3kg = customer_record.getFieldText("custentity_mpex_3kg_price_point");
                var mpex_5kg = customer_record.getFieldText("custentity_mpex_5kg_price_point");
                var mpex_500g = customer_record.getFieldText("custentity_mpex_500g_price_point");
                var mpex_b4 = customer_record.getFieldText("custentity_mpex_b4_price_point");
                var mpex_c5 = customer_record.getFieldText("custentity_mpex_c5_price_point");
                var mpex_dl = customer_record.getFieldText("custentity_mpex_dl_price_point");
                var mpex_1kg_new = customer_record.getFieldValue("custentity_mpex_1kg_price_point_new");
                var mpex_3kg_new = customer_record.getFieldValue("custentity_mpex_3kg_price_point_new");
                var mpex_5kg_new = customer_record.getFieldValue("custentity_mpex_5kg_price_point_new");
                var mpex_500g_new = customer_record.getFieldValue("custentity_mpex_500g_price_point_new");
                var mpex_b4_new = customer_record.getFieldValue("custentity_mpex_b4_price_point_new");
                var mpex_c5_new = customer_record.getFieldValue("custentity_mpex_c5_price_point_new");
                var mpex_dl_new = customer_record.getFieldValue("custentity_mpex_dl_price_point_new");
                var mpex_start_date = customer_record.getFieldValue("custentity_mpex_price_point_start_date");

                //If empty, set field to 0
                if (isNullorEmpty(min_dl)) {
                    min_dl = 0
                }
                if (isNullorEmpty(min_b4)) {
                    min_b4 = 0
                }
                if (isNullorEmpty(min_c5)) {
                    min_c5 = 0
                }
                if (isNullorEmpty(min_1kg)) {
                    min_1kg = 0
                }
                if (isNullorEmpty(min_3kg)) {
                    min_3kg = 0
                }
                if (isNullorEmpty(min_5kg)) {
                    min_5kg = 0
                }

                if (isNullorEmpty(total_dl)) {
                    total_dl = 0
                }
                if (isNullorEmpty(total_b4)) {
                    total_b4 = 0
                }
                if (isNullorEmpty(total_c5)) {
                    total_c5 = 0
                }
                if (isNullorEmpty(total_1kg)) {
                    total_1kg = 0
                }
                if (isNullorEmpty(total_3kg)) {
                    total_3kg = 0
                }
                if (isNullorEmpty(total_5kg)) {
                    total_5kg = 0
                }

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


                //NetSuite Search: User Note Search
                website = customer_record.getFieldValue('custentity_category_multisite_link');

                var savedNoteSearch = nlapiLoadSearch('note', 'customsearch_user_note');
                var newFilters = new Array();
                newFilters[newFilters.length] = new nlobjSearchFilter('internalid', 'CUSTOMER', 'is', customer_id);

                savedNoteSearch.addFilters(newFilters);

                var resultSet_note = savedNoteSearch.runSearch();

                /**
                 * Description - To get all the services associated with this customer
                 * NetSuite Search: SALESP - Services
                 */
                var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_salesp_services');

                var newFilters_service = new Array();
                newFilters_service[newFilters_service.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', customer_id);

                serviceSearch.addFilters(newFilters_service);

                var resultSet_service = serviceSearch.runSearch();

                var serviceResult = resultSet_service.getResults(0, 1);

                var resultSet_service_change = null;
                var resultServiceChange = [];

                //NetSuite Search: SALESP - Service Change
                var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_salesp_service_chg');

                var newFilters = new Array();
                newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_service_customer", "CUSTRECORD_SERVICECHG_SERVICE", 'is', customer_id);
                newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_status', null, 'noneof', [2, 3]);

                searched_service_change.addFilters(newFilters);

                resultSet_service_change = searched_service_change.runSearch();

                resultServiceChange = resultSet_service_change.getResults(0, 1);
            }


            var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

            inlineHtml += '<div class="container" style="padding-top: 3%;"><div id="alert" class="alert alert-danger fade in"></div>';

            if (role == 1000) {
                var resultSetZees = null;
            } else {
                //NetSuite Search: SALESP - Franchisees
                var searchZees = nlapiLoadSearch('partner', 'customsearch_salesp_franchisee');
                var resultSetZees = searchZees.runSearch();
            }

            inlineHtml += '<input id="customer_id" class="form-control" required value="' + customer_id + '" type="hidden"/></div></div>';

            form.addField('status_id', 'text', 'status_id').setDisplayType('hidden');
            form.addField('zee_id', 'text', 'zee_id').setDisplayType('hidden').setDefaultValue(zee);
            form.addField('custpage_auto_allocate', 'text', 'custpage_auto_allocate').setDisplayType('hidden');

            inlineHtml += '<input id="zee_id" class="form-control" required value="' + zee + '" type="hidden"/></div></div>';

            var resultSetContacts = null;
            var resultSetAddresses = null;

            if (!isNullorEmpty(customer_id)) {
                //NetSuite Search: SALESP - Addresses
                var searched_addresses = nlapiLoadSearch('customer', 'customsearch_salesp_address');

                var newFilters = new Array();
                newFilters[newFilters.length] = new nlobjSearchFilter('internalid', null, 'anyof', customer_id);

                searched_addresses.addFilters(newFilters);

                resultSetAddresses = searched_addresses.runSearch();

                var serviceAddressResult = resultSetAddresses.getResults(0, 1);

                //NetSuite Search: SALESP - Contacts
                var searched_contacts = nlapiLoadSearch('contact', 'customsearch_salesp_contacts');

                var newFilters_contact = new Array();
                newFilters_contact[newFilters_contact.length] = new nlobjSearchFilter('internalid', 'CUSTOMER', 'is', customer_id);
                newFilters_contact[newFilters_contact.length] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

                searched_contacts.addFilters(newFilters_contact);

                resultSetContacts = searched_contacts.runSearch();

                var serviceContactResult = resultSetContacts.getResults(0, 1);
            }


            //Customer Details
            inlineHtml += customerDetailsSection(entityid, companyName, abn, resultSetZees, zee, accounts_email, daytodayphone, daytodayemail, accounts_phone, customer_status, lead_source, old_zee, old_zee_text, old_customer, customer_industry, lead_source_text, customer_status_id);

            //Address and Contacts Details
            inlineHtml += addressContactsSection(resultSetAddresses, resultSetContacts);

            //Show the Tabs only if Address has been created
            if (!isNullorEmpty(serviceAddressResult)) {
                if (serviceAddressResult.length > 0) {
                    inlineHtml += '<div class="tabs" style="font-size: xx-small;"><ul class="nav nav-tabs nav-justified" style="padding-top: 3%;">';

                    var tab_content = '';
                    if (customer_status_id == 13 || customer_status_id == 32) {
                        inlineHtml += '<li role="presentation" class="active"><a href="#mpex"><b>MPEX</b></a></li>';
                        inlineHtml += '<li role="presentation" class=""><a href="#services"><b>SERVICES / PRICING NOTES</b></a></li>';
                        // inlineHtml += '<li role="presentation" class=""><a href="#ap"><b>AP REVENUE</b></a></li>';
                    } else {
                        inlineHtml += '<li role="presentation" class="active"><a href="#services"><b>SERVICES / PRICING NOTES</b></a></li>';
                    }

                    inlineHtml += '<li role="presentation" class=""><a href="#survey"><b>ADDITIONAL INFORMATION</b></a></li>';

                    //If User Role is not Franchisee
                    if (role != 1000) {
                        inlineHtml += '<li role="presentation" class=""><a href="#notes"><b>USER NOTES</b></a></li>';
                    }
                    inlineHtml += '</ul>';

                    if (customer_status_id == 13 || customer_status_id == 32) {
                        //For the MPEX Tab
                        tab_content += '<div role="tabpanel" class="tab-pane active" id="mpex">';
                        tab_content += mpexTab(min_c5, min_dl, min_b4, min_1kg, min_3kg, min_5kg, total_b4, total_c5, total_dl, total_1kg, total_3kg, total_5kg, mpex_drop_notified, serviceContactResult, serviceAddressResult, mpex_5kg, mpex_3kg, mpex_1kg, mpex_500g, mpex_b4, mpex_c5, mpex_dl, mpex_5kg_new, mpex_3kg_new, mpex_1kg_new, mpex_500g_new, mpex_b4_new, mpex_c5_new, mpex_dl_new, mpex_start_date, customer_id);
                        tab_content += '</div>';

                        //Service Details Tab Contenet
                        tab_content += '<div role="tabpanel" class="tab-pane" id="services">';
                        tab_content += serviceDetailsSection(pricing_notes);
                        tab_content += '</div>';
                    } else {
                        //Service Details Tab Contenet
                        tab_content += '<div role="tabpanel" class="tab-pane active" id="services">';
                        tab_content += serviceDetailsSection(pricing_notes);
                        tab_content += '</div>';
                    }


                    tab_content += '<div role="tabpanel" class="tab-pane" id="survey">';
                    //Survey Questions
                    tab_content += surveyInfo(ap_mail_parcel, ap_outlet, lpo_customer, multisite, website, zee_visit_notes, zee_visit, ap_mail_parcel, ap_outlet, lpo_customer, using_express_post, using_local_couriers, using_po_box, bank_visit, classify_lead);
                    tab_content += '</div>';

                    //If role is not a Franchisee
                    if (role != 1000) {
                        tab_content += '<div role="tabpanel" class="tab-pane" id="notes">';
                        //User Notes Tab
                        tab_content += userNote(resultSet_note);
                        tab_content += '</div>';
                    }

                    inlineHtml += '<div class="tab-content" style="padding-top: 3%;">';

                    inlineHtml += tab_content;

                    inlineHtml += '</div></div>';
                }
            }

            form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineHtml);

            //Show Save button only if atleast 1 Address is create
            if (!isNullorEmpty(serviceAddressResult)) {
                if (serviceAddressResult.length > 0) {
                    form.addSubmitButton('SAVE');
                }
            }

            //Show the buttons only if customer status is Customer - Signed or Customer - Free Trial
            if (customer_status_id == 13 || customer_status_id == 32) {
                //Show Send Email button if Contacts and Address is present
                if (!isNullorEmpty(serviceContactResult) && !isNullorEmpty(serviceAddressResult)) {
                    if (serviceContactResult.length > 0 && serviceAddressResult.length > 0) {
                        form.addButton('back', 'SEND EMAIL', 'onclick_SendEmail()');
                    }
                }
                form.addButton('back', 'Back', 'onclick_back()');
            }

            form.setScript('customscript_cl_lead_capture');
            response.writePage(form);
        } else {

            var status_id = request.getParameter('status_id');
            var partner_id = request.getParameter('zee_id');
            var script_id = request.getParameter('script_id');
            var deploy_id = request.getParameter('deploy_id');
            var auto_allocate = request.getParameter('custpage_auto_allocate');
            var customer_id = parseInt(request.getParameter('customer_id'));

            //Loca the Customer Record
            var customer_record = nlapiLoadRecord('customer', customer_id);
            var entity_id = customer_record.getFieldValue('entityid');
            var customer_name = customer_record.getFieldValue('companyname');
            var customer_list = customer_record.getFieldValue('customer_list');
            var customer_status_id = customer_record.getFieldValue('entitystatus');

            //If Customer status not Customer - Signed
            if (customer_status_id != 13) {
                //If User is not Raine OR Auto Allocate is set to YES OR Not coming from the Customer List Page
                if (ctx.getUser() != 696992 && auto_allocate == 1 && customer_list != 'T') {
                    //If Customer Status is SUSPECT - Hot Lead
                    if (status_id == '57') {
                        //Load Franchisee Record
                        var zeeRecord = nlapiLoadRecord('partner', partner_id);
                        var salesRep = zeeRecord.getFieldValue('custentity_sales_rep_assigned'); //Franchisee Sales Rep Assigned

                        //Create Sales Record
                        var recordtoCreate = nlapiCreateRecord('customrecord_sales');
                        var date2 = new Date();
                        var subject = '';
                        var body = '';

                        var cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customer_id;

                        body = 'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

                        var userRole = parseInt(nlapiGetContext().getRole());

                        // Set customer, campaign, user, last outcome, callback date
                        recordtoCreate.setFieldValue('custrecord_sales_customer', customer_id);
                        recordtoCreate.setFieldValue('custrecord_sales_campaign', 62);

                        recordtoCreate.setFieldValue('custrecord_sales_assigned', salesRep);
                        nlapiSetFieldValue('salesrep', salesRep);

                        recordtoCreate.setFieldValue('custrecord_sales_outcome', 5);
                        recordtoCreate.setFieldValue('custrecord_sales_callbackdate', getDate());
                        recordtoCreate.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date2.addHours(0), 'timeofday'));
                        if (nlapiGetFieldValue('campaign_type') == 56) {
                            recordtoCreate.setFieldValue('custrecord_sales_followup_stage', 5);
                        }

                        nlapiSubmitRecord(recordtoCreate);

                        //Send email to assigned Sales Rep on the Franchisee Record
                        nlapiSendEmail(112209, salesRep, 'Sales HOT Lead - ' + entity_id + ' ' + customer_name, body, ['luke.forbes@mailplus.com.au', 'ankith.ravindran@mailplus.com.au', 'raine.giderson@mailplus.com.au', 'belinda.urbani@mailplus.com.au']);

                    } else {
                        //Load Franchisee Record
                        var zeeRecord = nlapiLoadRecord('partner', partner_id);
                        var salesRep = zeeRecord.getFieldValue('custentity_sales_rep_assigned');

                        //Create Sales Record
                        var recordtoCreate = nlapiCreateRecord('customrecord_sales');
                        var date2 = new Date();
                        var subject = '';
                        var body = '';

                        var cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customer_id;

                        body = 'New sales record has been created. \n You have been assigned a lead. \n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;

                        var userRole = parseInt(nlapiGetContext().getRole());

                        // Set customer, campaign, user, last outcome, callback date
                        recordtoCreate.setFieldValue('custrecord_sales_customer', customer_id);
                        recordtoCreate.setFieldValue('custrecord_sales_campaign', 62);


                        recordtoCreate.setFieldValue('custrecord_sales_assigned', salesRep);


                        nlapiSetFieldValue('salesrep', salesRep);

                        recordtoCreate.setFieldValue('custrecord_sales_outcome', 5);
                        recordtoCreate.setFieldValue('custrecord_sales_callbackdate', getDate());
                        recordtoCreate.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date2.addHours(0), 'timeofday'));
                        if (nlapiGetFieldValue('campaign_type') == 56) {
                            recordtoCreate.setFieldValue('custrecord_sales_followup_stage', 5);
                        }

                        nlapiSubmitRecord(recordtoCreate);

                        //Send Email to Sales Rep assigned to the Franchisee Record
                        nlapiSendEmail(112209, salesRep, 'Sales Lead - ' + entity_id + ' ' + customer_name, body);
                    }
                }
            }


            if (customer_status_id == 13) { //If customer Status is Customer - Signed redirect to ther Customer List Page
                nlapiSetRedirectURL('SUITELET', 'customscript_sl_customer_list', 'customdeploy_sl_customer_list', null, null);
            } else { //If new lead created, redirect the Lead Capture Form
                nlapiSetRedirectURL('SUITELET', 'customscript_sl_lead_capture', 'customdeploy_sl_lead_capture', null, null);
            }

        }
    }

    /*
        Creates the Customer Details Section of the Page
     */
    function customerDetailsSection(entityid, companyName, abn, resultSetZees, zee, accounts_email, daytodayphone, daytodayemail, accounts_phone, customer_status, lead_source, old_zee, old_zee_text, old_customer, customer_industry, lead_source_text, customer_status_id) {
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

        //Create Search for Industry Category
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

        //If Role is not Franchisee, customer status can be SUSPECT - New or SUSPECT - Hot Lead
        if (role != 1000) {
            inlineQty += '<div class="col-xs-6 status"><div class="input-group"><span class="input-group-addon" id="status_text">STATUS <span class="mandatory">*</span></span>';
            if (customer_status_id == 13 || customer_status_id == 32) {
                inlineQty += '<select id="status" class="form-control status" readonly><option></option>';
            } else {
                inlineQty += '<select id="status" class="form-control status"><option></option>';
            }


            if (customer_status_id == 6) {
                inlineQty += '<option value="' + 6 + '" selected>SUSPECT - New</option>';
            } else if (customer_status_id == 57) {
                inlineQty += '<option value="' + 57 + '" selected>SUSPECT - Hot Lead</option>';
            } else if (customer_status_id == 13 || customer_status_id == 32) {
                inlineQty += '<option value="' + customer_status_id + '" selected >' + customer_status + '</option>';
            }
            inlineQty += '<option value="' + 6 + '" >SUSPECT - New</option>';
            inlineQty += '<option value="' + 57 + '" >SUSPECT - Hot Lead</option>';



        } else {
            //For Franchisees, the status of custoemr is always SUSPECT - New
            inlineQty += '<div class="col-xs-6 status"><div class="input-group"><span class="input-group-addon" id="status_text">STATUS <span class="mandatory">*</span></span><select id="status" class="form-control status" readonly><option value="' + 6 + '" selected>SUSPECT - New</option>';

        }
        inlineQty += '</select></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container zee_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-6 zee"><div class="input-group"><span class="input-group-addon" id="zee_text">FRANCHISEE <span class="mandatory">*</span></span>';

        if (role == 1000) {
            //For Franchisee role, Franchisee field is preselected
            var zee_record = nlapiLoadRecord('partner', zee);
            var zee_name = zee_record.getFieldValue('companyname')
            inlineQty += '<select id="zee" readonly class="form-control zee" ><option value="' + zee + '" selected>' + zee_name + '</option>';
        } else {
            //For all other roles, Franchisee is chosen
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
        inlineQty += '<div class="col-xs-6 leadsource_div"><div class="input-group"><span class="input-group-addon" id="leadsource_text">LEAD SOURCE <span class="mandatory">*</span></span>';

        //NetSuite Search: LEAD SOURCE
        var searched_lead_source = nlapiLoadSearch('campaign', 'customsearch_lead_source');
        resultSetLeadSource = searched_lead_source.runSearch();

        //If Role is Franchisee
        if (role == 1000) {
            //If franchisee is Brisbane, Lead Source is preselected Field Sales - Wendie
            if (zee != 696179) {
                inlineQty += '<select id="leadsource" class="form-control leadsource" readonly ><option value="-4"  selected>Franchisee Generated</option>';
            } else {
                inlineQty += '<select id="leadsource" class="form-control leadsource" readonly ><option value="242647"  selected>Field Sales - Wendie</option>';
            }

        } else {
            //Lead Source is selected
            inlineQty += '<select id="leadsource" class="form-control leadsource" ><option></option>';
            resultSetLeadSource.forEachResult(function(searchResultLeadSource) {

                var leadsourceid = searchResultLeadSource.getValue('internalid');
                var leadsourcename = searchResultLeadSource.getValue('title');

                if (leadsourceid == lead_source) {
                    inlineQty += '<option value="' + leadsourceid + '" selected>' + leadsourcename + '</option>';
                } else {
                    if (leadsourceid == 202599 || leadsourceid == 217602) {
                        if (role == 1032) { //only Data System Coordinateur can enter a Change of Entity or a Relocation
                            inlineQty += '<option value="' + leadsourceid + '" >' + leadsourcename + '</option>';
                        }
                    } else {
                        inlineQty += '<option value="' + leadsourceid + '" >' + leadsourcename + '</option>';
                    }
                }

                return true;
            });


        }


        inlineQty += '</select></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        if (role == 1032) {

            inlineQty += '<div class="form-group container relocation_section hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 old_zee"><div class="input-group"><span class="input-group-addon" id="zee_text">OLD FRANCHISEE</span><input id="old_zee" class="form-control old_cust" value="' + old_zee_text + '" data-oldvalue="' + old_zee_text + '" data-id="' + old_zee + '" readonly/>';
            inlineQty += '</div></div>';
            inlineQty += '<div class="col-xs-6"><div class="input-group"><span class="input-group-addon" id="cust_text">OLD CUSTOMER</span><input id="old_cust" type="number" class="form-control old_cust" value="' + old_customer + '" data-oldvalue="' + old_customer + '"/></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';
        }

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

    /*
        Creates the Address & Contacts Section of the Page
     */
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
        if (!isNullorEmpty(resultSetAddresses)) {
            inlineQty += '<div class="col-xs-3 reviewcontacts"><input type="button" value="ADD/EDIT CONTACTS" class="form-control btn btn-primary" id="reviewcontacts" /></div>';
        }
        inlineQty += '</div>';
        inlineQty += '</div>';

        return inlineQty;
    }

    /*
        Create AP Tab
     */
    function apTotol(resultSetAPTotal) {
        var inlineQty = '<div class="form-group container pricing_notes">';
        inlineQty += '<div class="row">';
        var count = 0;
        resultSetAPTotal.forEachResult(function(searchResult) {
            var apTotolValue = searchResult.getValue("custrecord_ap_order_exprevenue", "CUSTRECORD_AP_PRODUCT_ORDER", "SUM");
            var apTotolQty = searchResult.getValue("custrecord_ap_stock_line_actual_qty", null, "SUM");

            inlineQty += '<div class="col-xs-6 ap_total"><div class="input-group"><span class="input-group-addon" id="ap_total_text">TOTAL REVENUE ($)</span><input type="text" id="ap_total" class="form-control ap_total" value="' + apTotolValue + '" readonly /></div></div>';
            inlineQty += '<div class="col-xs-6 ap_total_qty"><div class="input-group"><span class="input-group-addon" id="ap_total_qty_text">TOTAL QTY (10-Packs)</span><input type="text" id="ap_total_qty" class="form-control ap_total_qty" value="' + apTotolQty + '" readonly /></div></div>';

            count++;
            return true;
        });

        if (count == 0) {

            inlineQty += '<div class="col-xs-6 ap_total"><div class="input-group"><span class="input-group-addon" id="ap_total_text">TOTAL REVENUE ($)</span><input type="text" id="ap_total" class="form-control ap_total" value="0" readonly /></div></div>';
            inlineQty += '<div class="col-xs-6 ap_total_qty"><div class="input-group"><span class="input-group-addon" id="ap_total_qty_text">TOTAL QTY (10-Packs)</span><input type="text" id="ap_total_qty" class="form-control ap_total_qty" value="0" readonly /></div></div>';
        }
        inlineQty += '</div>';
        inlineQty += '</div>';

        return inlineQty;
    }

    /*
        Create MPEX Tab
     */
    function mpexTab(min_c5, min_dl, min_b4, min_1kg, min_3kg, min_5kg, total_b4, total_c5, total_dl, total_1kg, total_3kg, total_5kg, mpex_drop_notified, serviceContactResult, serviceAddressResult, mpex_5kg, mpex_3kg, mpex_1kg, mpex_500g, mpex_b4, mpex_c5, mpex_dl, mpex_5kg_new, mpex_3kg_new, mpex_1kg_new, mpex_500g_new, mpex_b4_new, mpex_c5_new, mpex_dl_new, mpex_start_date, customer_id) {

        var inlineQty = '<div class="form-group container company_name_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX - STOCK TO BE DROPPED OFF</span></h4></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container entityid_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 drop_b4"><div class="input-group"><span class="input-group-addon" id="min_b4_text">B4 (10-Packs)</span><input id="drop_b4" class="form-control drop_b4"  value="2"  /></div></div>';
        inlineQty += '<div class="col-xs-2 drop_c5"><div class="input-group"><span class="input-group-addon" id="drop_c5_text">C5 (10-Packs)</span><input id="drop_c5" class="form-control drop_c5"  value="2"  /></div></div>';
        inlineQty += '<div class="col-xs-2 drop_dl"><div class="input-group"><span class="input-group-addon" id="drop_dl_text">DL (10-Packs)</span><input id="drop_dl" class="form-control drop_dl"  value="2"  /></div></div>';
        inlineQty += '<div class="col-xs-2 drop_1kg"><div class="input-group"><span class="input-group-addon" id="drop_1kg_text">1Kg (10-Packs)</span><input id="drop_1kg" class="form-control drop_1kg"  value="2"  /></div></div>';
        inlineQty += '<div class="col-xs-2 drop_3kg"><div class="input-group"><span class="input-group-addon" id="drop_3kg_text">3Kg (10-Packs)</span><input id="drop_3kg" class="form-control drop_3kg"  value="2" /></div></div>';
        inlineQty += '<div class="col-xs-2 drop_5kg"><div class="input-group"><span class="input-group-addon" id="drop_5kg_text">5Kg (10-Packs)</span><input id="drop_5kg" class="form-control drop_5kg"  value="2"  /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container dropoffdate_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-4 "></div>';
        inlineQty += '<div class="col-xs-4 dropoffdate"><div class="input-group"><span class="input-group-addon" id="dropoffdate_text">DROP OFF DATE</span><input id="dropoffdate" class="form-control dropoffdate"  value="" type="date" /></div></div>';
        inlineQty += '<div class="col-xs-4 "></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container contact_name_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-4 "></div>';
        inlineQty += '<div class="col-xs-4 contact_name"><div class="input-group"><span class="input-group-addon" id="contact_name_text">CONTACT NAME</span><input id="contact_name" class="form-control contact_name"  value="" type="text" /></div></div>';
        inlineQty += '<div class="col-xs-4 "></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container sendemail_section">';
        inlineQty += '<div class="row">';
        // inlineQty += '<div class="col-xs-3 "></div>';
        if (mpex_drop_notified == 1) {
            inlineQty += '<div class="col-xs-3 sendemail"><input type="button" value="FRANCHISEE NOTIFIED" class="form-control btn" id="sendemail" style=""/></div>';
        } else {
            inlineQty += '<div class="col-xs-3 sendemail"><input type="button" value="NOTIFY FRANCHISEE" class="form-control btn btn-primary" id="sendemail" style="background-color: #008657;"/></div>';
        }

        //Show buttons only is Address & Contact is created 
        if (!isNullorEmpty(serviceContactResult) && !isNullorEmpty(serviceAddressResult)) {
            if (serviceContactResult.length > 0 && serviceAddressResult.length > 0) {
                inlineQty += '<div class="col-xs-3 "><input type="button" id="invitetoportal" class="form-control invitetoportal btn btn-success" value="INVITE TO PORTAL" onclick="onclick_InviteEmail();" style="background-color: #fdce0e;"/></div>';
                inlineQty += '<div class="col-xs-3 "><input type="button" id="invitetoportal" class="form-control invitetoportal btn btn-success" value="INVITE TO PORTAL (U4)" onclick="onclick_InviteEmailU4();" style="background-color: #fdce0e;"/></div>';
                inlineQty += '<div class="col-xs-3 "><input type="button" id="sendinfo" class="form-control sendInfo btn btn-primary" value="SEND INFO" onclick="onclick_SendInfo();" style=""/></div>';
            }
        }

        // inlineQty += '<div class="col-xs-3 "></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container mpex_pricing">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX - PRICING STRUCTURE</span></h4></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading2"><h5><span class="label label-default col-xs-12" style="background-color: #00808087;">MPEX - CURRENT PRICING STRUCTURE</span></h5></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container current_mpex_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 mpex_b4"><div class="input-group"><span class="input-group-addon">B4</span><input class="form-control mpex_b4"  value="' + mpex_b4 + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_c5"><div class="input-group"><span class="input-group-addon">C5</span><input class="form-control mpex_c5"  value="' + mpex_c5 + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_dl"><div class="input-group"><span class="input-group-addon">DL</span><input class="form-control mpex_dl"  value="' + mpex_dl + '" readonly /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';
        inlineQty += '<div class="form-group container current_mpex_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 mpex_500g"><div class="input-group"><span class="input-group-addon">500g</span><input" class="form-control mpex_500g"  value="' + mpex_500g + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_1kg"><div class="input-group"><span class="input-group-addon">1Kg</span><input class="form-control mpex_1kg"  value="' + mpex_1kg + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_3kg"><div class="input-group"><span class="input-group-addon">3Kg</span><input class="form-control mpex_3kg"  value="' + mpex_3kg + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_5kg"><div class="input-group"><span class="input-group-addon">5Kg</span><input class="form-control mpex_5kg"  value="' + mpex_5kg + '" readonly /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading2"><h5><span class="label label-default col-xs-12" style="background-color: #00808087;">MPEX - SCHEDULED PRICING STRUCTURE</span></h5></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container scheduled_mpex_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 mpex_b4_new"><div class="input-group"><span class="input-group-addon">B4</span><input class="form-control mpex_b4_new"  value="' + mpex_b4_new + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_c5_new"><div class="input-group"><span class="input-group-addon">C5</span><input class="form-control mpex_c5_new"  value="' + mpex_c5_new + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_dl_new"><div class="input-group"><span class="input-group-addon">DL</span><input class="form-control mpex_dl_new"  value="' + mpex_dl_new + '" readonly /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';
        inlineQty += '<div class="form-group container scheduled_mpex_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 mpex_500g_new"><div class="input-group"><span class="input-group-addon">500g</span><input" class="form-control mpex_500g_new"  value="' + mpex_500g_new + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_1kg_new"><div class="input-group"><span class="input-group-addon">1Kg</span><input class="form-control mpex_1kg_new"  value="' + mpex_1kg_new + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_3kg_new"><div class="input-group"><span class="input-group-addon">3Kg</span><input class="form-control mpex_3kg_new"  value="' + mpex_3kg_new + '" readonly /></div></div>';
        inlineQty += '<div class="col-xs-2 mpex_5kg_new"><div class="input-group"><span class="input-group-addon">5Kg</span><input class="form-control mpex_5kg_new"  value="' + mpex_5kg_new + '" readonly /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container scheduled_date_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-4 "></div>';
        inlineQty += '<div class="col-xs-4 scheduled_date"><div class="input-group"><span class="input-group-addon" id="dropoffdate_text">SCHEDULED DATE</span><input id="scheduled_date" class="form-control scheduled_date"  value="' + mpex_start_date + '" type="date" readonly /></div></div>';
        inlineQty += '<div class="col-xs-4 "></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container mpex_weekly_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX - WEEKLY USAGE</span></h4></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container mpex_weekly_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<br><br><style>table#customer_weekly_usage {font-size:12px; font-weight:bold; border-color: #24385b;} </style><table border="0" cellpadding="15" id="customer_weekly_usage" class="tablesorter table table-striped" cellspacing="0" style="width: 50%;margin-left: 25%;"><thead style="color: white;background-color: #607799;"><tr><th style="text-align: center;">WEEK USED</th><th style="text-align: center;">USAGE COUNT</th></tr></thead><tbody>';

        //Search: MPEX Usage - Per Week (Updated Customer)
        var customerSearch = nlapiLoadSearch('customer', 'customsearch_customer_mpex_weekly_usage');

        var addFilterExpression = new nlobjSearchFilter('internalid', null, 'is', customer_id);
        customerSearch.addFilter(addFilterExpression);


        var resultSetCustomer = customerSearch.runSearch();


        resultSetCustomer.forEachResult(function(searchResult) {

            var custid = searchResult.getValue('internalid');
            var entityid = searchResult.getValue('entityid');
            var companyname = searchResult.getValue('companyname');
            var zee = searchResult.getValue('partner');
            var weeklyUsage = searchResult.getValue('custentity_actual_mpex_weekly_usage');

            var parsedUsage = JSON.parse(weeklyUsage);

            for (var x = 0; x < parsedUsage['Usage'].length; x++) {
                var parts = parsedUsage['Usage'][x]['Week Used'].split('/');

                inlineQty += '<tr class="dynatable-editable">';
                inlineQty += '<td>' + parts[2] + '-' + ('0' + parts[1]).slice(-2) + '-' + ('0' + parts[0]).slice(-2) + '</td><td>' + parsedUsage['Usage'][x]['Count'] + '</td>';
                inlineQty += '</tr>';
            }


            return true;
        });

        inlineQty += '</tbody>';
        inlineQty += '</table><br/>';
        inlineQty += '</div>';
        inlineQty += '</div>';



        inlineQty += '<div class="form-group container company_name_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX - MIN STOCK REQUIRED</span></h4></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container entityid_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 min_b4"><div class="input-group"><span class="input-group-addon" id="min_b4_text">B4 (Pieces)</span><input id="min_b4" class="form-control min_b4"  value="' + min_b4 + '" data-oldvalue="' + min_b4 + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 min_c5"><div class="input-group"><span class="input-group-addon" id="min_c5_text">C5 (Pieces)</span><input id="min_c5" class="form-control min_c5"  value="' + min_c5 + '" data-oldvalue="' + min_b4 + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 min_dl"><div class="input-group"><span class="input-group-addon" id="min_dl_text">DL (Pieces)</span><input id="min_dl" class="form-control min_dl"  value="' + min_dl + '" data-oldvalue="' + min_dl + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 min_1kg"><div class="input-group"><span class="input-group-addon" id="min_1kg_text">1Kg (Pieces)</span><input id="min_1kg" class="form-control min_1kg"  value="' + min_1kg + '" data-oldvalue="' + min_1kg + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 min_3kg"><div class="input-group"><span class="input-group-addon" id="min_3kg_text">3Kg (Pieces)</span><input id="min_3kg" class="form-control min_3kg"  value="' + min_3kg + '" data-oldvalue="' + min_3kg + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 min_5kg"><div class="input-group"><span class="input-group-addon" id="min_5kg_text">5Kg (Pieces)</span><input id="min_5kg" class="form-control min_5kg"  value="' + min_5kg + '" data-oldvalue="' + min_5kg + '" /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';


        inlineQty += '<div class="form-group container company_name_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX - STOCK AT CUSTOMER</span></h4></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container entityid_section">';
        inlineQty += '<div class="row">';

        inlineQty += '<div class="col-xs-2 total_b4"><div class="input-group"><span class="input-group-addon" id="min_b4_text">B4 (Pieces) </span><input id="total_b4" class="form-control total_b4" readonly value="' + total_b4 + '" data-oldvalue="' + total_b4 + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 total_c5"><div class="input-group"><span class="input-group-addon" id="total_c5_text">C5 (Pieces)</span><input id="total_c5" class="form-control total_c5" readonly value="' + total_c5 + '" data-oldvalue="' + total_b4 + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 total_dl"><div class="input-group"><span class="input-group-addon" id="total_dl_text">DL (Pieces)</span><input id="total_dl" class="form-control total_dl"readonly  value="' + total_dl + '" data-oldvalue="' + total_dl + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 total_1kg"><div class="input-group"><span class="input-group-addon" id="total_1kg_text">1Kg (Pieces) </span><input id="total_1kg" class="form-control total_1kg" readonly value="' + total_1kg + '" data-oldvalue="' + total_1kg + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 total_3kg"><div class="input-group"><span class="input-group-addon" id="total_3kg_text">3Kg (Pieces) </span><input id="total_3kg" class="form-control total_3kg" readonly value="' + total_3kg + '" data-oldvalue="' + total_3kg + '" /></div></div>';
        inlineQty += '<div class="col-xs-2 total_5kg"><div class="input-group"><span class="input-group-addon" id="total_5kg_text">B4 (Pieces)</span><input id="total_5kg" class="form-control total_5kg" readonly value="' + total_5kg + '" data-oldvalue="' + total_5kg + '" /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';



        return inlineQty;
    }

    /*
        Create the Survey Tab
     */
    function surveyInfo(ap_mail_parcel, ap_outlet, lpo_customer, multisite, website, zee_visit_notes, zee_visit, ap_mail_parcel, ap_outlet, lpo_customer, using_express_post, using_local_couriers, using_po_box, bank_visit, classify_lead) {

        var columns = new Array();
        columns[0] = new nlobjSearchColumn('name');
        columns[1] = new nlobjSearchColumn('internalId');

        var yes_no_search = nlapiCreateSearch('customlist107_2', null, columns)
        var resultSetYesNo = yes_no_search.runSearch();

        var columns2 = new Array();
        columns2[0] = new nlobjSearchColumn('name');
        columns2[1] = new nlobjSearchColumn('internalId');

        var classifyLeadsearch = nlapiCreateSearch('customlist_classify_lead', null, columns)
        var resultClassifyLead = classifyLeadsearch.runSearch();

        var columns3 = new Array();
        columns3[0] = new nlobjSearchColumn('name');
        columns3[1] = new nlobjSearchColumn('internalId');

        var usage_freq_search = nlapiCreateSearch('customlist_usage_frequency', null, columns3)
        var resultSetUsageFreq = usage_freq_search.runSearch();

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
        if (zee != 696179 || (zee == 696179 && role != 1000)) {
            inlineQty += '<div class="col-xs-4 survey1"><div class="input-group"><span class="input-group-addon" id="survey1_text">Using Mail / Parcels / Satchels Regularly? </span><select id="survey1" class="form-control survey1"><option></option>';

        } else if (zee == 696179 && role == 1000) {
            inlineQty += '<div class="col-xs-4 survey1"><div class="input-group"><span class="input-group-addon" id="survey1_text">Using Mail / Parcels / Satchels Regularly? <span class="mandatory">*</span></span><select id="survey1" class="form-control survey1" required><option></option>';
        }

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
        if (zee != 696179 || (zee == 696179 && role != 1000)) {
            inlineQty += '<div class="col-xs-6 survey7"><div class="input-group"><span class="input-group-addon" id="survey7_text">Frequency of Mail / Parcels / Satchels? </span><select id="survey7" class="form-control survey7"><option></option>';

        } else if (zee == 696179 && role == 1000) {
            inlineQty += '<div class="col-xs-6 survey7"><div class="input-group"><span class="input-group-addon" id="survey7_text">Frequency of Mail / Parcels / Satchels? <span class="mandatory">*</span> </span><select id="survey7" class="form-control survey7" required><option></option>';
        }


        resultSetUsageFreq.forEachResult(function(searchResult) {

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
        inlineQty += '</div></div>';
        inlineQty += '<div class="form-group container surveys_3">';
        inlineQty += '<div class="row">';
        if (zee != 696179 || (zee == 696179 && role != 1000)) {
            inlineQty += '<div class="col-xs-4 survey2"><div class="input-group"><span class="input-group-addon" id="survey2_text">Using Express Post? </span><select id="survey2" class="form-control survey2"><option></option>';

        } else if (zee == 696179 && role == 1000) {
            inlineQty += '<div class="col-xs-4 survey2"><div class="input-group"><span class="input-group-addon" id="survey2_text">Using Express Post? <span class="mandatory">*</span></span><select id="survey2" class="form-control survey2" required><option></option>';
        }

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
        if (zee != 696179 || (zee == 696179 && role != 1000)) {
            inlineQty += '<div class="col-xs-4 survey3"><div class="input-group"><span class="input-group-addon" id="survey3_text">Using Local Couriers? </span><select id="survey3" class="form-control survey3"><option></option>';

        } else if (zee == 696179 && role == 1000) {
            inlineQty += '<div class="col-xs-4 survey3"><div class="input-group"><span class="input-group-addon" id="survey3_text">Using Local Couriers? <span class="mandatory">*</span></span><select id="survey3" class="form-control survey3"><option></option>';
        }

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

    /*
        Create the Service Details Tab
     */
    function serviceDetailsSection(pricing_notes, ampo_price, ampo_time, pmpo_price, pmpo_time) {

        var inlineQty = '';
        if (role != 1000 && customer_list_page == null) {
            inlineQty += '<div class="form-group container auto_allocate">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 auto_allocate_div"><div class="input-group"><span class="input-group-addon" id="auto_allocate_text">AUTO ALLOCATE</span><select id="auto_allocate" class="form-control auto_allocate"><option value="' + 1 + '">YES</option><option value="' + 2 + '">NO</option></select></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';
        } else {
            inlineQty += '<div class="form-group container auto_allocate">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 auto_allocate_div"><div class="input-group"><span class="input-group-addon" id="auto_allocate_text">AUTO ALLOCATE</span><select id="auto_allocate" class="form-control auto_allocate" disabled><option value="' + 1 + '">YES</option><option value="' + 2 + '" selected>NO</option></select></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';
        }


        inlineQty += '<div class="form-group container pricing_notes">';
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
        if (role == 1000 && zee != 696179) {
            inlineQty += ' <span class="mandatory">*</span>';
        }
        inlineQty += '</span><input id="ampo_price" class="form-control ampo_price" ';
        if (role == 1000 && zee != 696179) {
            inlineQty += 'required';
        }
        if (!isNullorEmpty(ampo_price)) {
            inlineQty += ' value="' + ampo_price + '" data-oldvalue="' + ampo_price + '" /></div></div>';
        } else {
            inlineQty += ' value="" data-oldvalue="" /></div></div>';
        }

        inlineQty += '<div class="col-xs-6 ampo_time_div"><div class="input-group"><span class="input-group-addon" id="ampo_time_text">AMPO TIME ';
        if (role == 1000 && zee != 696179) {
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
        if (role == 1000 && zee != 696179) {
            inlineQty += '<span class="mandatory">*</span>';
        }
        inlineQty += '</span><input id="pmpo_price" class="form-control pmpo_price"';
        if (role == 1000 && zee != 696179) {
            inlineQty += ' required ';
        }
        if (!isNullorEmpty(pmpo_price)) {
            inlineQty += 'value="' + pmpo_price + '" data-oldvalue="' + pmpo_price + '" /></div></div>';
        } else {
            inlineQty += 'value="" data-oldvalue="" /></div></div>';
        }

        inlineQty += '<div class="col-xs-6 pmpo_time_div"><div class="input-group"><span class="input-group-addon" id="pmpo_time_text">PMPO TIME ';
        if (role == 1000 && zee != 696179) {
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

    /*
        Create the User Notes Tab
     */
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