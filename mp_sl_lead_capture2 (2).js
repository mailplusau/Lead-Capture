/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
    function(ui, email, runtime, search, record, http, log, redirect, format) {
        var role = runtime.getCurrentUser().role;
        var zee = 0;
        var customer_list_page = null;
        if (role == 1000) { // Role is Franchisee
            zee = runtime.getCurrentUser().id; //Get Franchisee ID
        } else {
            zee = 0;
        }
        function onRequest(context) {     
            if (context.request.method === 'GET') {
                var customer_id = null;
                var ticket_id = null;
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
                var maap_bank_account_number = null;
                var maap_parent_bank_account_number = null;
                var franchisee_name = '';
                var zee_main_contact_name = '';
                var zee_email = '';
                var zee_main_contact_phone = '';
                var zee_abn = '';
                var selector_type = 'invoice_number';
                var selected_invoice_method_id = null;
                var accounts_cc_email = '';
                var mpex_po_number = '';
                var customer_po_number = '';
                var terms = null;
                var customer_terms = '';
                var selected_invoice_cycle_id = null;
                var status_value = null;

                            
                var params = context.request.parameters.custparam_params;
                var customer_id = context.request.parameters.custid;
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
                } else if (!isNullorEmpty(customer_id)) {
                    customer_id = parseInt(customer_id);
                    script_id = null;
                    deploy_id = null;
                }

                if (!isNullorEmpty(script_id) && !isNullorEmpty(deploy_id)) {
                    //Coming from the Customer List Page
                    var form = ui.createForm({
						title: 'Customer Details'
					});
                    customer_list_page = 'T';

                } else {
                    //Lead Capture Page
                    var form = ui.createForm({
						title: 'Lead Capture'
					});
                }

                if (!isNullorEmpty(customer_id)) {
                    //Load Customer Record
                    var customer_record = record.load({
						type: record.Type.CUSTOMER,
						id: customer_id,
						isDynamic: true
					});
                    var zee_id = customer_record.getValue({
                        fieldId: 'partner'
                    });

                    if (!isNullorEmpty(zee_id)) {
                        var zeeRecord = record.load({
                            type: record.Type.PARTNER,
                            id: zee_id,
                            isDynamic: true
                        });
                        var franchisee_name = zeeRecord.getValue({
                            fieldId: 'companyname'
                        });

                        zee_main_contact_name = zeeRecord.getValue({
                            fieldId: 'custentity3'
                        });
                        zee_email = zeeRecord.getValue({
                        fieldId: 'email'
                        });
                        zee_main_contact_phone = zeeRecord.getValue({
                            fieldId: 'custentity2'
                        });
                        zee_abn = zeeRecord.getValue({
                            fieldId: 'custentity_abn_franchiserecord'
                        });
                    }
                    //Customer Status
                    customer_status_id = customer_record.getValue({
						fieldId: 'entitystatus'
                    });
                    
                    if (customer_status_id == 13) { //Status is Customer - Signed
                        form = ui.createForm({
                            title: 'Customer Details'
                        });                        
                        customer_list_page = 'T';
                    } else {
                        form = ui.createForm({
                            title: 'Lead Capture'
                        }); 
                    }

                    //Hidden Fields on the form
                    form.addField({
                        id: 'customer_id',
                        type: ui.FieldType.TEXT,
                        label: 'customer_id'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    }).defaultValue = customer_id;

                    form.addField({
                        id: 'script_id',
                        type: ui.FieldType.TEXT,
                        label: 'script_id'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    }).defaultValue = script_id;

                    form.addField({
                        id: 'deploy_id',
                        type: ui.FieldType.TEXT,
                        label: 'deploy_id'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    }).defaultValue = deploy_id;

                    form.addField({
                        id: 'mpex_drop_off',
                        type: ui.FieldType.TEXT,
                        label: 'mpex_drop_off'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    }).defaultValue = mpex_drop_off;

                    form.addField({
                        id: 'customer_list',
                        type: ui.FieldType.TEXT,
                        label: 'customer_list'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    }).defaultValue = customer_list_page;
                    
                    // Customer ID
                    entityid = customer_record.getValue({
						fieldId: 'entityid'
                    });

                    // Customer Name
                    companyName = customer_record.getValue({
                        fieldId: 'companyname'
                    });

                    // Customer ABN
                    abn = customer_record.getValue({
                        fieldId: 'vatregnumber'
                    });

                    if (isNullorEmpty(abn)) {
                        abn = '';
                    }
                    
                    // Customer Franchisee ID
                    zee = customer_record.getValue({
                        fieldId: 'partner'
                    });

                    
                    // Customer Franchisee Text
                    zeeText = customer_record.getText({
                        fieldId: 'partner'
                    });

                    // Customer Accounts Email
                    accounts_email = customer_record.getValue({
                        fieldId: 'email'
                    });

                    if (isNullorEmpty(accounts_email)) {
                        accounts_email = '';
                    }

                    // Customer Accounts Phone
                    accounts_phone = customer_record.getValue({
                        fieldId: 'altphone'
                    });

                    if (isNullorEmpty(accounts_phone)) {
                        accounts_phone = '';
                    }

                    // Customer Day-to-day Email
                    daytodayemail = customer_record.getValue({
                        fieldId: 'custentity_email_service'
                    });

                    if (isNullorEmpty(daytodayemail)) {
                        daytodayemail = '';
                    }

                    // Customer Day-to-day Phone
                    daytodayphone = customer_record.getValue({
                        fieldId: 'phone'
                    });

                    if (isNullorEmpty(daytodayphone)) {
                        daytodayphone = '';
                    }

                    // Customer Using AusPost for Mail & Parcel
                    ap_mail_parcel = customer_record.getValue({
						fieldId: 'custentity_ap_mail_parcel'
					});

                    // Customer Using Express Post
                    using_express_post = customer_record.getValue({
                        fieldId: 'custentity_customer_express_post'
                    })

                    // Customer Using Local Couriers
                    using_local_couriers = customer_record.getValue({
                        fieldId: 'custentity_customer_local_couriers'
                    })

                    // Customer Using PO Box
                    using_po_box = customer_record.getValue({
                        fieldId: 'custentity_customer_po_box'
                    })

                    // Customer Bank Visit
                    bank_visit = customer_record.getValue({
                        fieldId: 'custentity_customer_bank_visit'
                    })

                    // Customer Using AusPost Outlet
					ap_outlet = customer_record.getValue({
						fieldId: 'custentity_ap_outlet'
					});

                    // Customer AusPost LPO Customer
					lpo_customer = customer_record.getValue({
						fieldId: 'custentity_ap_lpo_customer'
					});

                    // Customer Lead Type
                    classify_lead = customer_record.getValue({
                        fieldId: 'custentity_lead_type'
                    })

                    // Customer Status Text
                    customer_status = customer_record.getText({
						fieldId: 'entitystatus'
                    });

                    // Customer Status ID
					customer_status_id = customer_record.getValue({
						fieldId: 'entitystatus'
					});

                    // Customer Lead Source ID
					lead_source = customer_record.getValue({
						fieldId: 'leadsource'
					});

                    /// Customer Lead Source Text
					lead_source_text = customer_record.getValue({
						fieldId: 'leadsource'
					});
                    
                    // Customer Old Franchisee ID
                    old_zee = customer_record.getValue({
                        fieldId: 'custentity_old_zee'
                    });

                    // Customer Old Franchisee Text
                    old_zee_text = customer_record.getText({
                        fieldId: 'custentity_old_zee'
                    })

                    // Old Customer ID
                    old_customer = customer_record.getValue({
                        fieldId: 'custentity_old_customer'
                    })

                    // Customer Category
					customer_industry = customer_record.getValue({
						fieldId: 'custentity_industry_category'
					});

                    // Customer Multisite
					multisite = customer_record.getValue({
						fieldId: 'custentity_category_multisite'
					});

                    // Customer Pricing Notes
                    pricing_notes = customer_record.getValue({
                        fieldId: 'custentity_customer_pricing_notes'
                    });

                    // Customer Franchisee Visit Memo
                    zee_visit_notes = customer_record.getValue({
                        fieldId: 'custentity_mp_toll_zeevisit_memo'
                    });

                    //Customer Visited by Franchisee
                    zee_visit = customer_record.getValue({
                        fieldId: 'custentity_mp_toll_zeevisit'
                    });

                    // Customer AMPO Price
                    ampo_price = customer_record.getValue({
                        fieldId: 'custentity_ampo_service_price'
                    });

                    // Customer AMPO Time
                    ampo_time = customer_record.getValue({
                        fieldId: 'custentity_ampo_service_time'
                    });

                    // Customer PMPO Price
                    pmpo_price = customer_record.getValue({
                        fieldId: 'custentity_pmpo_service_price'
                    });

                    // Customer PMPO Time
                    pmpo_time = customer_record.getValue({
                        fieldId: 'custentity_pmpo_service_time'
                    });


                    /**
                     * MPEX SECTION
                     */

                    // Customer Min DL Float
                    min_dl = customer_record.getValue({
                        fieldId: 'custentity_mpex_dl_float'
                    });

                    // Customer Min B4 Float
                    min_b4 = customer_record.getValue({
                        fieldId: 'custentity_mpex_b4_float'
                    });

                    // Customer Min C5 Float
                    min_c5 = customer_record.getValue({
                        fieldId: 'custentity_mpex_c5_float'
                    });

                    // Customer Min 1Kg Float
                    min_1kg = customer_record.getValue({
                        fieldId: 'custentity_mpex_1kg_float'
                    });

                    // Customer Min 3kg Float
                    min_3kg = customer_record.getValue({
                        fieldId: 'custentity_mpex_3kg_float'    
                    });

                    // Customer Min 5Kg Float
                    min_5kg = customer_record.getValue({
                        fieldId: 'custentity_mpex_5kg_float'
                    });

                    // Customer Total 1Kg Stock at customer location
                    total_1kg = customer_record.getValue({
                        fieldId: 'custentity_mpen'
                    });

                    // Customer Total 3Kg Stock at customer location
                    total_3kg = customer_record.getValue({
                        fieldId: 'custentity_mpet'
                    });

                    // Customer Total 5Kg Stock at customer location
                    total_5kg = customer_record.getValue({
                        fieldId: 'custentity_mpef'
                    });

                    // Customer Total B4 Stock at customer location
                    total_b4 = customer_record.getValue({
                        fieldId: 'custentity_mpeb'
                    });

                    // Customer Total C5 Stock at customer location
                    total_c5 = customer_record.getValue({
                        fieldId: 'custentity_mpec'
                    });

                    //Customer Total DL Stock at customer location
                    total_dl = customer_record.getValue({
                        fieldId: 'custentity_mped'
                    });

                    // Customer Franchisee Notified
                    mpex_drop_notified = customer_record.getValue({
                        fieldId: 'custentity_mpex_drop_notified'
                    });

                    var mpex_1kg = customer_record.getText({
                        fieldId: 'custentity_mpex_1kg_price_point'
                    });

                    var mpex_3kg = customer_record.getText({
                        fieldId: 'custentity_mpex_3kg_price_point'
                    });

                    var mpex_5kg = customer_record.getText({
                        fieldId: 'custentity_mpex_5kg_price_point'
                    });

                    var mpex_500g = customer_record.getText({
                        fieldId: 'custentity_mpex_500g_price_point'
                    });

                    var mpex_b4 = customer_record.getText({
                        fieldId: 'custentity_mpex_b4_price_point'
                    });

                    var mpex_c5 = customer_record.getText({
                        fieldId: 'custentity_mpex_c5_price_point'
                    });

                    var mpex_dl = customer_record.getText({
                        fieldId: 'custentity_mpex_dl_price_point'
                    });

                    var mpex_1kg_new = customer_record.getValue({
                        fieldId: 'custentity_mpex_1kg_price_point_new'
                    });

                    var mpex_3kg_new = customer_record.getValue({
                        fieldId: 'custentity_mpex_3kg_price_point_new'
                    });

                    var mpex_5kg_new = customer_record.getValue({
                        fieldId: 'custentity_mpex_5kg_price_point_new'
                    });

                    var mpex_500g_new = customer_record.getValue({
                        fieldId: 'custentity_mpex_500g_price_point_new'
                    });

                    var mpex_b4_new = customer_record.getValue({
                        fieldId: 'custentity_mpex_b4_price_point_new'
                    });

                    var mpex_c5_new = customer_record.getValue({
                        fieldId: 'custentity_mpex_c5_price_point_new'
                    });

                    var mpex_dl_new = customer_record.getValue({
                        fieldId: 'custentity_mpex_dl_price_point_new'
                    });

                    var mpex_start_date = customer_record.getValue({
                        fieldId: 'custentity_mpex_price_point_start_date'
                    });

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

                    if (multisite) {
                        multisite = 1;
                    } else {
                        multisite = 2;
                    }

                    if (zee_visit) {
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

                    maap_bank_account_number = customer_record.getValue({
                        fieldId: 'custentity_maap_bankacctno'
                    });

                    
                    maap_parent_bank_account_number = customer_record.getValue({
                        fieldId: 'custentity_maap_bankacctno_parent'
                    });

                    
                    selected_invoice_method_id = customer_record.getValue({
                        fieldId: 'custentity_invoice_method'
                    });


                    accounts_cc_email = customer_record.getValue({
                        fieldId: 'custentity_accounts_cc_email'
                    });
                    mpex_po_number = customer_record.getValue({
                        fieldId: 'custentity_mpex_po'
                    });
                    customer_po_number = customer_record.getValue({
                        fieldId: 'custentity11'
                    });
                    
                    selected_invoice_cycle_id = customer_record.getValue({
                        fieldId: 'custentity_mpex_invoicing_cycle'
                    });

                    terms = customer_record.getValue({
                        fieldId: 'terms'
                    });
                    customer_terms = customer_record.getValue({
                        fieldId: 'custentity_finance_terms'
                    });

                    /**
                     * Description = To get all the user note searches associated with this custoemr
                     * NetSuite Search: User Note Search
                     */
                    website = customer_record.getValue({
                        fieldId: 'custentity_category_multisite_link'
                    });

                    var savedNoteSearch = search.load({
                        id: 'customsearch_user_note',
                        type: 'note'
                    });


                    savedNoteSearch.filters.push(search.createFilter({
						name: 'internalid',
						join: 'CUSTOMER',
						operator: search.Operator.IS,
						values: customer_id
                    }));

                    var resultSet_note = savedNoteSearch.run();

                    /**
                     * Description - To get all the services associated with this customer
                     * NetSuite Search: SALESP - Services
                     */

                    var serviceSearch = search.load({
                        id: 'customsearch_salesp_services',
                        type: 'customrecord_service'
                    });
                    
                    serviceSearch.filters.push(search.createFilter({
                        name: 'custrecord_service_customer',
                        operator: search.Operator.IS,
                        values: customer_id
                    }));

                    var resultSet_service = serviceSearch.run();
                    
                    var serviceResult = resultSet_service.getRange({
                        start: 0,
                        end: 1
                    });

                    var resultSet_service_change = null;
                    var resultServiceChange = [];

                    /**
                     * Description - To get all the service changes
                     * NetSuite Search: SALESP - Service Change
                     * CHECK THIS ONE!!! --> 2 filters?? && check the get range fn is = to get results
                     */

                    var searched_service_change = search.load({
                        id: 'customsearch_salesp_service_chg',
                        type: 'customrecord_servicechg'
                    });

                    searched_service_change.filters.push(search.createFilter({
                        name: 'custrecord_service_customer',
                        join: 'CUSTRECORD_SERVICECHG_SERVICE',
                        operator: search.Operator.IS,
                        values: customer_id
                    }));

                    searched_service_change.filters.push(search.createFilter({
                        name: 'custrecord_servicechg_status',
                        operator: search.Operator.NONEOF,
                        values: [2, 3]
                    }));

                    resultSet_service_change = searched_service_change.run();
                    resultServiceChange = resultSet_service_change.getRange({
                        start: 0,
                        end: 1
                    })

                }

                
                var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<div class="container" style="padding-top: 3%;"><div id="alert" class="alert alert-danger fade in"></div>';
                
                // Load DataTables
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

                if (role == 1000) {
                    var resultSetZees = null;
                } else {
                    //NetSuite Search: SALESP - Franchisees
                    var searchZees = search.load({
                        id: 'customsearch_salesp_franchisee',
                        type: 'partner'
                    });

                    var resultSetZees = searchZees.run();
                }

                inlineHtml += '<input id="customer_id" class="form-control" required value="' + customer_id + '" type="hidden"/></div></div>';
                
                form.addField({
                    id: 'status_id',
                    label: 'status_id',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                
                form.addField({
                    id: 'zee_id',
                    type: ui.FieldType.TEXT,
                    label: 'zee_id'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee;

                form.addField({
                    id: 'custpage_auto_allocate',
                    type: ui.FieldType.TEXT,
                    label: 'custpage_auto_allocate'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                inlineHtml += '<input id="zee_id" class="form-control" required value="' + zee + '" type="hidden"/></div></div>';
                var resultSetContacts = null;
                var resultSetAddresses = null;

                
                if (!isNullorEmpty(customer_id)) {
                    //NetSuite Search: SALESP - Addresses
                    var searched_addresses = search.load({
                        id: 'customsearch_salesp_address',
                        type: 'customer'
                    });

                    searched_addresses.filters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: customer_id
                    }));
                    
                    resultSetAddresses = searched_addresses.run();

                    var serviceAddressResult = resultSetAddresses.getRange({
                        start: 0,
                        end: 1
                    });

                    // NetSuite Search: SALESP - Contacts
                    var searched_contacts = search.load({
                        id: 'customsearch_salesp_contacts',
                        type: 'contact'
                    });

                    searched_contacts.filters.push(search.createFilter({
                        name: 'internalid',
                        join: 'CUSTOMER',
                        operator: search.Operator.IS,
                        values: customer_id
                    }));

                    searched_contacts.filters.push(search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: false
                    }));

                    resultSetContacts = searched_contacts.run();

                    var serviceContactResult = resultSetContacts.getRange({
                        start: 0,
                        end: 1
                    });
                }
                // Customer Details
                inlineHtml += customerDetailsSection(entityid, companyName, abn, resultSetZees, zee, accounts_email, daytodayphone, daytodayemail, accounts_phone, customer_status, lead_source, old_zee, old_zee_text, old_customer, customer_industry, lead_source_text, customer_status_id);
                //Address and Contacts Details
                inlineHtml += addressContactsSection(resultSetAddresses, resultSetContacts);
                

                //Show the Tabs only if Address has been created
                if (!isNullorEmpty(serviceAddressResult)) {
                    if (serviceAddressResult.length > 0) {
                       
                        //Extra tables only if ADMIN, FINANCE, DS role
                        if (isFinanceRole(role)) {
                           
                            inlineHtml += selectorSection(entityid);
                            inlineHtml += maapBankAccountSection(maap_bank_account_number, maap_parent_bank_account_number, selector_type);
                           
                            inlineHtml += franchiseeMainContactSection(franchisee_name, zee_main_contact_name, zee_email, zee_main_contact_phone, zee_abn);
                            inlineHtml += enquiryHeader();
                            inlineHtml += otherInvoiceFieldsSection(selected_invoice_method_id, accounts_cc_email, mpex_po_number, customer_po_number, selected_invoice_cycle_id, terms, customer_terms, status_value, selector_type);
                            inlineHtml += openInvoicesSection(ticket_id, selector_type);
                        }

                        inlineHtml += '<div class="tabs" style="font-size: xx-small;"><ul class="nav nav-tabs nav-justified" style="padding-top: 3%;">';
                        var tab_content = '';
                        if (customer_status_id == 13 || customer_status_id == 32) {
                                inlineHtml += '<li role="presentation" class="active"><a href="#mpex"><b>MPEX</b></a></li>';
                                inlineHtml += '<li role="presentation" class=""><a href="#services"><b>SERVICES / PRICING NOTES</b></a></li>';
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

                form.addField({
                    id: 'preview_table',
                    type: ui.FieldType.INLINEHTML,
                    label: 'preview_table'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.OUTSIDEBELOW
                }).updateBreakType({
                    breakType: ui.FieldBreakType.STARTROW
                }).defaultValue = inlineHtml;


                //Show Save button only if atleast 1 Address is create
                if (!isNullorEmpty(serviceAddressResult)) {
                    if (serviceAddressResult.length > 0) {
                        form.addSubmitButton({
                            label : 'SAVE'
                        });
                    }
                }

                //Show the buttons only if customer status is Customer - Signed or Customer - Free Trial
                if (customer_status_id == 13 || customer_status_id == 32) {
                    //Show Send Email button if Contacts and Address is present
                    if (!isNullorEmpty(serviceContactResult) && !isNullorEmpty(serviceAddressResult)) {
                        if (serviceContactResult.length > 0 && serviceAddressResult.length > 0) {
                            form.addButton({
                                id : 'back',
                                label : 'SEND EMAIL',
                                functionName : 'onclick_SendEmail()'
                            });
                            form.addButton({
                                id : 'back',
                                label : 'SEND REFERRAL EMAIL',
                                functionName : 'onclick_SendReferralEmail()'
                            });
                        }
                    }

                    form.addButton({
                        id : 'back',
                        label : 'Back',
                        functionName : 'onclick_back()'
                    });
                }

                form.clientScriptFileId = 4366712;
                context.response.writePage(form);

            } else {

                var status_id = context.request.parameters.status_id;
                var partner_id = context.request.parameters.zee_id;
                var script_id = context.request.parameters.script_id;
                var deploy_id = context.request.parameters.deploy_id;
                var auto_allocate = context.request.parameters.custpage_auto_allocate;
                var customer_id = parseInt(context.request.parameters.customer_id);

                //Locate the Customer Record
                var customer_record = record.load({
                    type: record.Type.CUSTOMER,
                    id: customer_id,
                    isDynamic: true
                });            
                
                var entity_id = customer_record.getValue({
                    fieldId: 'entityid'

                });
                var customer_name = customer_record.getValue({
                    fieldId: 'companyname'

                });
                var customer_list = customer_record.getValue({
                    fieldId: 'customer_list'

                });
                var customer_status_id = customer_record.getValue({
                    fieldId: 'entitystatus'

                });

                // If Customer status not Customer - Signed
                if (customer_status_id != 13) {
                    // If User is not Raine OR Auto Allocate then set to YES OR Not coming from the Customer List Page
                    if (runtime.getCurrentUser() != 696992 && auto_allocate == 1 && customer_list != 'T') {
                        // If Customer Status is SUSPECT - Hot Lead 
                        if (status_id == '57') {
                            // Load Franchisee Record
                            var zeeRecord = record.load({
                                type: record.Type.PARTNER,
                                id: partner_id,
                                isDynamic: true
                            });
                            // Franchisee Sales Rep Assigned
                            var salesRep = zeeRecord.getValue({
                                fieldId: 'custentity_sales_rep_assigned'
                            });

                            //Create Sales Record
                            var recordtoCreate = record.create({
                                type: 'customrecord_sales',
                                isDynamic: true
                            });

                            var date2 = new Date();
                            var subject = '';
                            var body = '';
                            var cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customer_id;
                            body = 'New sales record has been created. \n A HOT Lead has been entered into the System. Please respond in an hour. \n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                            var userRole = parseInt(runtime.getCurrentUser().role);

                            // Set customer, campaign, user, last outcome, callback date
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_customer',
                                value: customer_id
                            });
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_campaign',
                                value: 62
                            });
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_assigned',
                                value: salesRep
                            });
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_outcome',
                                value: 5
                            });
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_callbackdate',
                                value: getDate()
                            });

                            format.format({
                                value: date2.addHours(0),
                                type: format.Type.TIMEOFDAY
                            })
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_callbacktime',
                                value: date2
                            });
                            
                            var val1 = context.request.parameters.campaign_type;
                           
                            
                            if (val1 == 56) {
                                recordtoCreate.setValue({
                                    fieldId: 'custrecord_sales_followup_stage',
                                    value: 5
                                })
                            }

                            recordtoCreate.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            
                            email.send({
                                author: 112209,
                                body: body,
                                recipients: salesRep,
                                subject: 'Sales HOT Lead - ' + entity_id + ' ' + customer_name,
                                cc: ['luke.forbes@mailplus.com.au', 'ankith.ravindran@mailplus.com.au', 'raine.giderson@mailplus.com.au', 'belinda.urbani@mailplus.com.au'],
                            });


                        } else {
                            //Load Franchisee Record
                            var zeeRecord = record.load({
                                type: record.Type.PARTNER,
                                id: partner_id,
                                isDynamic: true
                            });
                            var salesRep = zeeRecord.getValue({
                                fieldId: 'custentity_sales_rep_assigned'
                            });

                            //Create Sales Record
                            var recordtoCreate = record.create({
                                type: 'customrecord_sales',
                                isDynamic: true
                            });
                            var date2 = new Date();
                            var subject = '';
                            var body = '';

                            var cust_id_link = 'https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customer_id;
                            body = 'New sales record has been created. \n You have been assigned a lead. \n Customer Name: ' + entity_id + ' ' + customer_name + '\nLink: ' + cust_id_link;
                            var userRole = parseInt(runtime.getCurrentUser().role);

                            // Set customer, campaign, user, last outcome, callback date
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_customer',
                                value: customer_id
                            });
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_campaign',
                                value: 62
                            });
                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_assigned',
                                value: salesRep
                            });

                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_outcome',
                                value: 5
                            });

                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_callbackdate',
                                value: getDate()
                            });
                            
                            format.format({
                                value: date2.addHours(0),
                                type: format.Type.TIMEOFDAY
                            })

                            recordtoCreate.setValue({
                                fieldId: 'custrecord_sales_callbacktime',
                                value: date2
                            });

                            var val1 = context.request.parameters.campaign_type;

                            if (val1 == 56) {
                                recordtoCreate.setValue({
                                    fieldId: 'custrecord_sales_followup_stage',
                                    value: 5
                                });
                            }

                            recordtoCreate.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });

                            //Send Email to Sales Rep assigned to the Franchisee Record
                            email.send({
                                author: 112209,
                                body: body,
                                recipients: salesRep,
                                subject: 'Sales Lead - ' + entity_id + ' ' + customer_name
                            });
                            
                            
                        }
                    }

                }

                if (!isNullorEmpty(partner_id)) {
                    var zeeRecord = record.load({
                        type: record.Type.PARTNER,
                        id: partner_id,
                        isDynamic: true
                    });

                }
                if (customer_status_id == 13) { //If customer Status is Customer - Signed redirect to ther Customer List Page
                    redirect.toSuitelet({
                        scriptId: 'customscript_sl_customer_list',
                        deploymentId: 'customdeploy_sl_customer_list',
                    });
                } else { //If new lead created, redirect the Lead Capture Form
                    redirect.toSuitelet({
                        scriptId: 'customscript_sl_lead_capture2',
                        deploymentId: 'customdeploy_sl_lead_capture2',
                    });
                }                     
            }

        }           
        

        /*
            Creates the Customer Details Section of the Page
        */
        function customerDetailsSection(entityid, companyName, abn, resultSetZees, zee, accounts_email, daytodayphone, daytodayemail, accounts_phone, customer_status, lead_source, old_zee, old_zee_text, old_customer, customer_industry, lead_source_text, customer_status_id) {
            var inlineQty = '';
            inlineQty = '<div class="form-group container company_name_section">';
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
            var industry_search = search.create({
                type: 'customlist_industry_category',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });
            var industryRes = industry_search.run();
            industryRes.each(function(industrySearch) {
                var listValue = industrySearch.getValue('name');
                var listID = industrySearch.getValue('internalId');
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
                customer_status = 'SUSPECT - New';
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
                var zeeRecord = record.load({
                    type: record.Type.PARTNER,
                    id: zee,
                    isDynamic: true
                });
                var zee_name = zeeRecord.getValue({
                    fieldId: 'companyname'
                });

                franchisee_name = zeeRecord.getValue({
                    fieldId: 'companyname'
                });

                inlineQty += '<select id="zee" readonly class="form-control zee" ><option value="' + zee + '" selected>' + zee_name + '</option>';
            } else {
                //For all other roles, Franchisee is chosen
                inlineQty += '<select id="zee" class="form-control zee" ><option value=0></option>';
                resultSetZees.each(function(searchResultZees) {
                    zeeId = searchResultZees.getValue('internalid');
                    zeeName = searchResultZees.getValue('companyname');
                    franchisee_name = searchResultZees.getValue('companyname');
                    zee_main_contact_name = searchResultZees.getValue('custentity3');
                    zee_email = searchResultZees.getValue('email');
                    zee_main_contact_phone = searchResultZees.getValue('custentity2');
                    zee_abn = searchResultZees.getValue('custentity_abn_franchiserecord');

                    if (zeeId == zee) {
                        inlineQty += '<option value="' + zeeId + '" selected>' + zeeName + '</option>';
                    } else {
                        inlineQty += '<option value="' + zeeId + '">' + zeeName + '</option>';
                    }

                    return true;
                });
            }

            inlineQty += '</select></div></div>';
            inlineQty += '<div class="col-xs-6 leadsource_div"><div class="input-group"><span class="input-group-addon" id="leadsource_text">LEAD SOURCE <span class="mandatory">*</span></span>';

            //NetSuite Search: LEAD SOURCE
            var searched_lead_source = search.load({
                id: 'customsearch_lead_source',
                type: 'campaign'
            });

            
            resultSetLeadSource = searched_lead_source.run();

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
                resultSetLeadSource.each(function(searchResultLeadSource) {
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

        function selectorSection(entityid) {
            // Ticket details header
            var inlineQty = '<div class="form-group container tickets_details_header_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading2">';
            inlineQty += '<h4><span class="label label-default col-xs-12">TICKET DETAILS</span></h4>';
            inlineQty += '</div></div></div>';           
            return inlineQty;
        }

        function maapBankAccountSection(maap_bank_account_number, maap_parent_bank_account_number, selector_type) {  
            var inlineQty = '<div class="form-group container accounts_number_section">';
            inlineQty += '<div class="row">';

            // MAAP Bank Account # field
            inlineQty += '<div class="col-xs-6 account_number_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="account_number_text">MAAP BANK ACCOUNT #</span>';
            inlineQty += '<input id="account_number" type="number" value="' + maap_bank_account_number + '" class="form-control account_number" disabled />';
            inlineQty += '</div></div>';
        
            // MAAP Parent Bank Account # field
            inlineQty += '<div class="col-xs-6 parent_account_number_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="parent_account_number_text">MAAP PARENT BANK ACCOUNT #</span>';
            inlineQty += '<input id="parent_account_number" type="number" value="' + maap_parent_bank_account_number + '" class="form-control parent_account_number" disabled />';
            inlineQty += '</div></div></div></div>';
           
            return inlineQty;
        }

        /**
         * The Franchisee name, and its main contact name and phone number fields.
         * These fields should be automatically filled based on the Selector number value.
         * @param   {String}    franchisee_name
         * @param   {String}    zee_main_contact_name
         * @param   {String}    zee_email
         * @param   {String}    zee_main_contact_phone
         * @param   {String}    zee_abn
         * @return  {String}    inlineQty
         */
        function franchiseeMainContactSection(franchisee_name, zee_main_contact_name, zee_email, zee_main_contact_phone, zee_abn) {
            if (isNullorEmpty(franchisee_name)) {
                franchisee_name = '';
            }
            if (isNullorEmpty(zee_main_contact_name)) {
                zee_main_contact_name = '';
            }
            if (isNullorEmpty(zee_email)) {
                zee_email = '';
            }
            if (isNullorEmpty(zee_main_contact_phone)) {
                zee_main_contact_phone = '';
            }
            if (isNullorEmpty(zee_abn)) {
                zee_abn = '';
            }

            var inlineQty = '<div class="form-group container zee_main_contact_section">';
            inlineQty += '<div class="row">';

            // Franchisee name field
            inlineQty += '<div class="col-xs-6 franchisee_name">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="franchisee_name_text">FRANCHISEE NAME</span>';
            inlineQty += '<input id="franchisee_name" value="' + franchisee_name + '" class="form-control franchisee_name" disabled>';
            inlineQty += '</div></div>';

            // Franchisee main contact name field
            inlineQty += '<div class="col-xs-6 zee_main_contact_name">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="zee_main_contact_name_text">MAIN CONTACT</span>';
            inlineQty += '<input id="zee_main_contact_name" value="' + zee_main_contact_name + '" class="form-control zee_main_contact_name" disabled>';
            inlineQty += '</div></div></div></div>';

            // Franchisee contact details
            inlineQty += '<div class="form-group container zee_main_contact_section">';
            inlineQty += '<div class="row">';
            // Franchisee email field
            inlineQty += '<div class="col-xs-12 zee_email">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="zee_email_text">FRANCHISEE EMAIL</span>';
            inlineQty += '<input id="zee_email" type="email" value="' + zee_email + '" class="form-control accountsemail" disabled />';
            inlineQty += '<div class="input-group-btn">';
            var zee_contact_id = '0';
            inlineQty += '<button type="button" class="btn btn-success add_as_recipient" data-email="' + zee_email + '" data-contact-id="' + zee_contact_id + '" data-firstname="' + franchisee_name + '" data-toggle="tooltip" data-placement="right" title="Add as recipient">';
            inlineQty += '<span class="glyphicon glyphicon-envelope"></span>';
            inlineQty += '</button>';
            inlineQty += '</div>';
            inlineQty += '</div></div></div></div>';

            // Franchisee phone and ABN details
            inlineQty += '<div class="form-group container zee_main_contact_section">';
            inlineQty += '<div class="row">';
            // Franchisee main contact phone field
            inlineQty += '<div class="col-xs-6 zee_main_contact_phone">'
            inlineQty += '<div class="input-group">'
            inlineQty += '<span class="input-group-addon" id="zee_main_contact_phone_text">FRANCHISEE PHONE</span>';
            inlineQty += '<input id="zee_main_contact_phone" type="tel" value="' + zee_main_contact_phone + '" class="form-control zee_main_contact_phone" disabled />';
            inlineQty += '<div class="input-group-btn"><button type="button" class="btn btn-success" id="call_zee_main_contact_phone"><span class="glyphicon glyphicon-earphone"></span></button>';
            inlineQty += '</div>';
            inlineQty += '</div></div>';

            // Franchisee ABN number
            inlineQty += '<div class="col-xs-6 zee_abn">'
            inlineQty += '<div class="input-group">'
            inlineQty += '<span class="input-group-addon" id="zee_abn_text">FRANCHISEE ABN</span>'
            inlineQty += '<input id="zee_abn" class="form-control zee_abn" value="' + zee_abn + '" disabled>'
            inlineQty += '</div></div></div></div>';

            return inlineQty;
        }

        function enquiryHeader() {
            //Ticket Enquiry Header
            var inlineQty = '<div class="form-group container ticket_enquiry_header_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading2">';
            inlineQty += '<h4><span class="label label-default col-xs-12">TICKET ENQUIRY DETAILS</span></h4>';
            inlineQty += '</div></div></div>';
            return inlineQty
        }
        /**
         *  These fields should be displayed only for an Invoice ticket, and be edited only by the finance team.
         * - Invoice Method field
         * - Accounts cc email field
         * - MPEX PO # field
         * - Customer PO # field
         * - MPEX Invoicing Cycle field
         * @param   {Number} selected_invoice_method_id
         * @param   {String} accounts_cc_email
         * @param   {String} mpex_po_number
         * @param   {String} customer_po_number
         * @param   {Number} selected_invoice_cycle_id
         * @param   {Number} terms
         * @param   {String} customer_terms
         * @param   {Number} status_value
         * @param   {String} selector_type
         * @return  {String} inlineQty
         */
        function otherInvoiceFieldsSection(selected_invoice_method_id, accounts_cc_email, mpex_po_number, customer_po_number, selected_invoice_cycle_id, terms, customer_terms, status_value, selector_type) {
            
            if (isNullorEmpty(accounts_cc_email)) { accounts_cc_email = '' }
            if (isNullorEmpty(mpex_po_number)) { mpex_po_number = '' }
            if (isNullorEmpty(customer_po_number)) { customer_po_number = '' }
            if (isNullorEmpty(customer_terms)) { customer_terms = '' }

            var invoice_search = search.create({
                type: 'customlist_invoice_method',
                columns: ['name', 'internalId']
            });
          
            var invoiceMethodResultSet = invoice_search.run().getRange({
                start: 0,
                end: 1000
            });
            var disabled = '';
           
            inlineQty = '<div class="form-group container invoice_method_accounts_cc_email_section">';
            inlineQty += '<div class="row">';

            // Invoice Method field
            inlineQty += '<div class="col-xs-6 invoice_method_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="invoice_method_text">INVOICE METHOD</span>';
            inlineQty += '<select id="invoice_method" class="form-control" ' + disabled + '>';
            inlineQty += '<option></option>';

            invoiceMethodResultSet.forEach(function(invoiceMethodResult) {
                
                var invoice_method_name = invoiceMethodResult.getValue('name');
                var invoice_method_id = invoiceMethodResult.getValue('internalId');
                log.debug({
                    title: "name",
                    details: invoice_method_name
                });
                log.debug({
                    title: "id",
                    details: invoice_method_id
                });
                if (invoice_method_id == selected_invoice_method_id) {
                    inlineQty += '<option value="' + invoice_method_id + '" selected>' + invoice_method_name + '</option>';
                } else {
                    inlineQty += '<option value="' + invoice_method_id + '">' + invoice_method_name + '</option>';
                }
            });
            
            inlineQty += '</select>';
            inlineQty += '</div></div>';

            // Accounts cc email field -->
            inlineQty += '<div class="col-xs-6 accounts_cc_email_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="accounts_cc_email_text">ACCOUNTS CC EMAIL</span>';
            inlineQty += '<input id="accounts_cc_email" type="email" value="' + accounts_cc_email + '" class="form-control accounts_cc_email"  ' + disabled + '/>';
            inlineQty += '<div class="input-group-btn">';
            inlineQty += '<button type="button" class="btn btn-success add_as_recipient" data-email="' + accounts_cc_email + '" data-contact-id="" data-firstname="" data-toggle="tooltip" data-placement="right" title="Add as recipient">';
            inlineQty += '<span class="glyphicon glyphicon-envelope"></span>';
            inlineQty += '</button>';
            inlineQty += '</div>';
            inlineQty += '</div></div></div></div>';

            inlineQty += '<div class="form-group container mpex_customer_po_number_section">';

            inlineQty += '<div class="row">';
            // MPEX PO #
            inlineQty += '<div class="col-xs-6 mpex_po_number_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="mpex_po_number_text">MPEX PO #</span>';
            inlineQty += '<input id="mpex_po_number" value="' + mpex_po_number + '" class="form-control mpex_po_number"  ' + disabled + '/>';
            inlineQty += '</div></div>';
            // Customer PO #
            inlineQty += '<div class="col-xs-6 customer_po_number_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="customer_po_number_text">CUSTOMER PO #</span>';
            inlineQty += '<input id="customer_po_number" value="' + customer_po_number + '" class="form-control customer_po_number"  ' + disabled + '/>';
            inlineQty += '</div></div></div></div>';

            // Terms fields
            inlineQty += '<div class="form-group container terms_section">';

            inlineQty += '<div class="row">';
            // Terms
            inlineQty += '<div class="col-xs-6 terms_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="terms_text">TERMS</span>';
            // Find the text related to the terms value.
            var terms_options = [{
                "value": "",
                "text": ""
            }, {
                "value": "5",
                "text": "1% 10 Net 30"
            }, {
                "value": "6",
                "text": "2% 10 Net 30"
            }, {
                "value": "4",
                "text": "Due on receipt"
            }, {
                "value": "1",
                "text": "Net 15 Days"
            }, {
                "value": "2",
                "text": "Net 30 Days"
            }, {
                "value": "8",
                "text": "Net 45 Days"
            }, {
                "value": "3",
                "text": "Net 60 Days"
            }, {
                "value": "7",
                "text": "Net 7 Days"
            }, {
                "value": "9",
                "text": "Net 90 Days"
            }];
            var terms_option = findObjectByKey(terms_options, "value", terms);
            var terms_text = isNullorEmpty(terms_option) ? '' : terms_option.text;
            inlineQty += '<input id="terms" class="form-control terms" value="' + terms_text + '" disabled/>';
            inlineQty += '</div></div>';

            // Customer's terms
            inlineQty += '<div class="col-xs-6 customers_terms_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="customers_terms_text">' + "CUSTOMER'S TERMS</span>";
            inlineQty += '<input id="customers_terms" class="form-control customers_terms" value="' + customer_terms + '" ' + disabled + '/>';
            inlineQty += '</div></div></div></div>';

            // MPEX Invoicing Cycle
            var invoice_cycle_search = search.create({
                type: 'customlist_invoicing_cyle',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });
          
            var invoiceCycleResultSet = invoice_cycle_search.run();

            inlineQty += '<div class="form-group container mpex_invoicing_cycle_section">';

            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 mpex_invoicing_cycle_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="mpex_invoicing_cycle_text">MPEX INVOICING CYCLE</span>';
            inlineQty += '<select id="mpex_invoicing_cycle" class="form-control mpex_invoicing_cycle" ' + disabled + '>';
            inlineQty += '<option></option>';

            invoiceCycleResultSet.each(function (invoiceCycleResult) {
                var invoice_cycle_name = invoiceCycleResult.getValue('name');
                var invoice_cycle_id = invoiceCycleResult.getValue('internalId');

                if (invoice_cycle_id == selected_invoice_cycle_id) {
                    inlineQty += '<option value="' + invoice_cycle_id + '" selected>' + invoice_cycle_name + '</option>';
                } else {
                    inlineQty += '<option value="' + invoice_cycle_id + '">' + invoice_cycle_name + '</option>';
                }
            });
            inlineQty += '</select>';
            inlineQty += '</div></div></div></div>';

            return inlineQty;
        }    

        /**
         * A Datatable displaying the open invoices of the customer
         * @param   {Number}    ticket_id
         * @param   {String}    selector_type
         * @return  {String}    inlineQty
         */
        function openInvoicesSection(ticket_id, selector_type) {
            if (isNullorEmpty(ticket_id)) {
                ticket_id = ''
            }

            //var hide_class_section = (isNullorEmpty(ticket_id) || selector_type != 'invoice_number') ? 'hide' : '';
            var hide_class_section = '';
            // Open invoices header
            var inlineQty = '<div class="form-group container open_invoices open_invoices_header ' + hide_class_section + '">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading2">';
            inlineQty += '<h4><span class="label label-default col-xs-12">OPEN INVOICES</span></h4>';
            inlineQty += '</div></div></div>';

            // Open invoices dropdown field
            inlineQty += '<div class="form-group container open_invoices invoices_dropdown ' + hide_class_section + '">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 invoices_dropdown_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="invoices_dropdown_text">INVOICE STATUS</span>';
            inlineQty += '<select id="invoices_dropdown" class="form-control">';
            inlineQty += '<option value="open" selected>Open</option>';
            inlineQty += '<option value="paidInFull">Paid In Full (last 3 months)</option>';
            inlineQty += '</select>';
            inlineQty += '</div></div></div></div>';

            // Open Invoices Datatable
            inlineQty += '<div class="form-group container open_invoices open_invoices_table ' + hide_class_section + '">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12" id="open_invoice_dt_div">';
            // It is inserted as inline html in the script mp_cl_open_ticket
            inlineQty += '</div></div></div>';

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
                //console.log("addresses work");
                
                resultSetAddresses.each(function(searchResultAddresses) {
                    var id = searchResultAddresses.getValue({
                        name: 'addressinternalid',
                        join: 'Address'
                    });
                    var addr1 = searchResultAddresses.getValue({
						name: 'address1',
						join: 'Address'
					});
					var addr2 = searchResultAddresses.getValue({
						name: 'address2',
						join: 'Address'
					});
					var city = searchResultAddresses.getValue({
						name: 'city',
						join: 'Address'
					});
					var state = searchResultAddresses.getValue({
						name: 'state',
						join: 'Address'
					});
					var zip = searchResultAddresses.getValue({
						name: 'zipcode',
						join: 'Address'
					});
					var lat = searchResultAddresses.getValue({
						name: 'custrecord_address_lat',
						join: 'Address'
					});
					var lon = searchResultAddresses.getValue({
						name: 'custrecord_address_lon',
						join: 'Address'
					});
					var default_shipping = searchResultAddresses.getValue({
						name: 'isdefaultshipping',
						join: 'Address'
					});
					var default_billing = searchResultAddresses.getValue({
						name: 'isdefaultbilling',
						join: 'Address'
					});
					var default_residential = searchResultAddresses.getValue({
						name: 'isresidential',
						join: 'Address'
					});

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
                resultSetContacts.each(function(searchResultContacts) {
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
            resultSetAPTotal.each(function(searchResult) {
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
            var customerSearch = search.load({
                id: 'customsearch_customer_mpex_weekly_usage',
                type: 'customer'
            });

            customerSearch.filters.push(search.createFilter({
                name: 'internalid',
                operator: search.Operator.IS,
                values: customer_id
            }));

            var resultSetCustomer = customerSearch.run();


            resultSetCustomer.each(function(searchResult) {

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


            var yes_no_search = search.create({
                type: 'customlist107_2',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });

            
            var resultSetYesNo = yes_no_search.run();

            var classifyLeadsearch = search.create({
                type: 'customlist_classify_lead',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });

            var resultClassifyLead = classifyLeadsearch.run();

            var usage_freq_search = search.create({
                type: 'customlist_usage_frequency',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });

            var resultSetUsageFreq = usage_freq_search.run();

            var inlineQty = '<div class="form-group container multisite_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-4 multisite"><div class="input-group"><span class="input-group-addon" id="multisite_text">Multisite? </span><select id="multisite" class="form-control multisite" ><option></option>';

            resultSetYesNo.each(function(searchResult) {

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

            resultSetYesNo.each(function(searchResult) {

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

            resultSetYesNo.each(function(searchResult) {

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


            resultSetUsageFreq.each(function(searchResult) {

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

            resultSetYesNo.each(function(searchResult) {

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

            resultSetYesNo.each(function(searchResult) {

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
            
            resultSetYesNo.each(function(searchResult) {

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
            
            resultSetYesNo.each(function(searchResult) {

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
            
            resultClassifyLead.each(function(searchResult) {

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
            
            var industry_search = search.create({
                type: 'customlist_service_time_range',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });
          
            var resultSetIndustry = industry_search.run();
            
            resultSetIndustry.each(function(searchResult) {

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
            
            var industry_search = search.create({
                type: 'customlist_service_time_range',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });
            
            var resultSetIndustry = industry_search.run();
            
            resultSetIndustry.each(function(searchResult) {
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

                savedNoteSearch.each(function(searchResult) {

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
        /**
         *  retrieve date
         */
        function getDate() {
            var date = new Date();
            if (date.getHours() > 6) {
                date.setDate(date.getDate() + 1); 
            }

            format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            })

            return date;
        }

        Date.prototype.addHours = function(h) {
            this.setHours(this.getHours() + h);
            return this;
        }

        /**
         * Whether the user is from the finance team,
         * or a Data Systems Co-ordinator, MailPlus Administration or Administrator user.
         * @param   {Number} userRole
         * @returns {Boolean}
         */
        function isFinanceRole(userRole) {
            // 1001, 1031 and 1023 are finance roles
            // 1032 is the Data Systems Co-ordinator role
            // 1006 is the Mail Plus Administration role.
            // 3 is the Administrator role.
            return ((userRole == 1001 || userRole == 1031 || userRole == 1023) || ((userRole == 1032) || (userRole == 1006) || (userRole == 3)));
        }

        /**
         * Parse the objects in an array, and returns an object based on the value of one of its keys.
         * With ES6, this function would simply be `array.find(obj => obj[key] == value)`
         * @param   {Array}     array
         * @param   {String}    key
         * @param   {*}         value
         * @returns {Object}
         */
        function findObjectByKey(array, key, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][key] === value) {
                    return array[i];
                }
            }
            return null;
        }

        /**
		 * Is Null or Empty.
		 * 
		 * @param {Object} strVal
		 */
		function isNullorEmpty(strVal) {
			return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
		}
        return {
            onRequest: onRequest
        };
    }
); 
    
