/**
 * Module Description
 * 
 * NSVersion    Date                    Author         
 * 1.00         2018-04-12 09:22:33     Ankith 
 *
 * Remarks:         
 * 
 * @Last Modified by:   Anesu
 * @Last Modified time: 2020-09-07 17:00:20
 *
 */
var financialTabItemArray = [];
var financialTabPriceArray = [];
var serviceChgItemArray = [];
var serviceChgPriceArray = [];

var funcsubmitter = false;

var updateButton = false;

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {

});

$(".nav-tabs").on("click", "a", function(e) {

    $(this).tab('show');
});

$(window).load(function() {
    // Animate loader off screen
    $(".se-pre-con").fadeOut("slow");;
});

$(document).on('change', '.input', function(e) {

    pdffile = document.getElementsByClassName("input");

    console.log(pdffile);
    pdffile_url = URL.createObjectURL(pdffile[0].files[0]);
    $('#viewer').show();
    $('#viewer').attr('src', pdffile_url);
});


$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});

function showAlert(message) {
    $('#alert').html('<button type="button" class="close">&times;</button>' + message);
    $('#alert').show();
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
    // $(window).scrollTop($('#alert').offset().top);
}

$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});


function pageInit() {

    // if (isNullorEmpty(nlapiGetFieldValue('create_service_change'))) {
    // document.getElementById('tr_submitter').style.display = 'none';
    // }

    var scf_upload = document.getElementsByClassName('input');
    var scf_upload_field = document.getElementsByClassName('uir-field');
    $('#upload_file_1_fs_lbl_uir_label').attr("style", "padding-left:15%;");

    for (var i = 0; i < scf_upload.length; i++) {
        scf_upload[i].className += " form-control";
    }

    for (var i = 0; i < scf_upload_field.length; i++) {
        scf_upload_field[i].setAttribute("style", "padding-left:15%;");
    }

    $('#alert').hide();
}

$(document).on('click', '#call_accounts_phone', function(e) {
    window.close();
    NLDial($('#account_phone').val());


    var sales_record = nlapiLoadRecord('customrecord_sales', parseInt(nlapiGetFieldValue('sales_record_id')));

    sales_record.setFieldValue('custrecord_sales_call_made', 'T');

    nlapiSubmitRecord(sales_record);

    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_finalise_page', 'customdeploy_sl_finalise_page') + '&sales_record_id=' + parseInt(nlapiGetFieldValue('sales_record_id')) + '&callcenter=T&button=T&recid=' + parseInt(nlapiGetFieldValue('customer'));
    window.open(upload_url);

});

$(document).on('click', '#call_daytoday_phone', function(e) {
    window.close();
    NLDial($('#daytodayphone').val());


    var sales_record = nlapiLoadRecord('customrecord_sales', parseInt(nlapiGetFieldValue('sales_record_id')));

    sales_record.setFieldValue('custrecord_sales_call_made', 'T');

    nlapiSubmitRecord(sales_record);

    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_finalise_page', 'customdeploy_sl_finalise_page') + '&sales_record_id=' + parseInt(nlapiGetFieldValue('sales_record_id')) + '&callcenter=T&button=T&recid=' + parseInt(nlapiGetFieldValue('customer'));
    window.open(upload_url);

});


//On click of Review Addresses
$(document).on('click', '#reviewcontacts', function(event) {

    var result = validate('true');
    if (result == false) {
        return false;
    }
    updateCustomerDetails(false);
    var params = {
        custid: parseInt(nlapiGetFieldValue('customer')),
        sales_record_id: parseInt(nlapiGetFieldValue('sales_record_id')),
        id: 'customscript_sl_finalise_page',
        deploy: 'customdeploy_sl_finalise_page',
        callcenter: nlapiGetFieldValue('custpage_callcenter')
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_conatcts_module', 'customdeploy_sl_conatcts_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
});

$(document).on('click', '#reviewaddress', function(event) {

    var result = validate('true');
    if (result == false) {
        return false;
    }
    updateCustomerDetails(false);
    var params = {
        custid: parseInt(nlapiGetFieldValue('customer')),
        sales_record_id: parseInt(nlapiGetFieldValue('sales_record_id')),
        id: 'customscript_sl_finalise_page',
        deploy: 'customdeploy_sl_finalise_page',
        callcenter: nlapiGetFieldValue('custpage_callcenter')
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_new_address_module', 'customdeploy_sl_new_address_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
});


//On click of Create Service Change
$(document).on('click', '.createservicechg', function(event) {

    var result = validate();
    if (result == false) {
        return false;
    }
    updateCustomerDetails(false);


    var sales_record_id = parseInt(nlapiGetFieldValue('sales_record_id'));
    var state = nlapiGetFieldValue('shipping_state');
    var customer_id = parseInt(nlapiGetFieldValue('customer'))

    var state_id;

    switch (state) {
        case 'NSW':
            state_id = 1;
            break;
        case 'QLD':
            state_id = 2;
            break;
        case 'VIC':
            state_id = 3;
            break;
        case 'SA':
            state_id = 4;
            break;
        case 'TAS':
            state_id = 5;
            break;
        case 'ACT':
            state_id = 6;
            break;
        case 'WA':
            state_id = 7;
            break;
        case 'NT':
            state_id = 8;
            break;
        case 'NZ':
            state_id = 9;
            break;
    }



    nlapiSetFieldValue('create_service_change', 'T');


    var zee = $('#zee').val();
    var dateofentry = $('#dateofentry').val();
    var commencementtype = $('#commencementtype').val();
    var inoutbound = $('#inoutbound').val();
    var commencementdate = $('#commencementdate').val();
    var commRegId = $('#commencementdate').attr('data-commregid');
    var signupdate = $('#signupdate').val();

    console.log(commRegId);

    var splitDate = commencementdate.split('-');
    commencementdate = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];

    var splitDate = signupdate.split('-');
    signupdate = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];

    if (isNullorEmpty(commRegId)) {
        var salesRecord = nlapiLoadRecord('customrecord_sales', sales_record_id);
        var sales_rep = salesRecord.getFieldValue('custrecord_sales_assigned');
        var commReg = createCommReg(dateofentry, commencementdate, signupdate, customer_id, sales_rep, zee, inoutbound, commencementtype, state_id, sales_record_id);
    } else {
        var commReg = updateCommReg(commRegId, commencementdate, signupdate, inoutbound, commencementtype);
        console.log(commReg);
    }

    nlapiSetFieldValue('comm_reg', commReg);
    console.log('click')
    $('#submitter').trigger('click');

});

/**
 * [description] - On the click of the edit button
 */
$(document).on('click', '.edit_class', function(event) {

    var commregid = $(this).attr('data-commreg');
    var dateEffective = $(this).attr('data-dateeffective');


    var params = {
        custid: parseInt(nlapiGetFieldValue('customer')),
        salesrecordid: parseInt(nlapiGetFieldValue('sales_record_id')),
        salesrep: 'T',
        commreg: commregid,
        date: dateEffective
    }
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_create_service_change', 'customdeploy_sl_create_service_change') + '&custparam_params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
});

function onclick_reassign() {
    if (validate()) {

        updateCustomerDetails(false);
        var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_sales_campaign_popup', 'customdeploy_sl_sales_campaign_popup') + '&sales_record_id=' + parseInt(nlapiGetFieldValue('sales_record_id')) + '&recid=' + parseInt(nlapiGetFieldValue('customer'));
        window.open(url, "_self", "height=300,width=300,modal=yes,alwaysRaised=yes,location=0,toolbar=0");
    }
}



function onclick_NoAnswer() {
    if (validate()) {

        updateCustomerDetails(false);
        var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_salescamp_noanswer', 'customdeploy_sl_salescamp_noanswer');
        window.open(url, "Window", "height=300,width=300,modal=yes,alwaysRaised=yes,location=0,toolbar=0");
    }
}

function submit_NoAnswer(callnotes) {
    nlapiSetFieldValue('custpage_outcome', 'noanswer');
    nlapiSetFieldValue('custpage_callnotes', callnotes);
    // nlapiSetFieldValue('create_service_change', 'T');
    funcsubmitter = true;
    document.getElementById('submitter').click();
}

function onclick_Disconnected() {
    if (validate()) {
        updateCustomerDetails(false);
        if (confirm('Outcome: Disconnected\nPress OK to continue.')) {
            nlapiSetFieldValue('custpage_outcome', 'disconnected');
            funcsubmitter = true;
            document.getElementById('submitter').click();
        }
    }
}

function onclick_DoNotCall() {
    if (validate()) {
        updateCustomerDetails(false);
        var notes = prompt('Outcome: Do Not Call\n\nEnter call notes and press OK to continue.');

        if (notes != null) {
            nlapiSetFieldValue('custpage_outcome', 'donotcall');
            nlapiSetFieldValue('custpage_callnotes', notes);
            funcsubmitter = true;
            document.getElementById('submitter').click();
        }
    }
}

function submit_NoSale(reason, callnotes) {
    nlapiSetFieldValue('custpage_outcome', 'nosale');
    nlapiSetFieldValue('custpage_nosalereason', reason);
    nlapiSetFieldValue('custpage_callnotes', callnotes);
    // nlapiSetFieldValue('create_service_change', 'T');
    funcsubmitter = true;
    document.getElementById('submitter').click();
}


// function onclick_NoSale() {
//  if (validate()) {
//      updateCustomerDetails(false);
//      var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_salescamp_nosale', 'customdeploy_sl_salescamp_nosale');
//      window.open(url, "Window", "height=300,width=420,modal=yes,alwaysRaised=yes,location=0,toolbar=0");

//  }
// }

function submit_Callback(date, time, callnotes) {
    if (isNullorEmpty(time)) {
        time = "10:00 AM";
    }

    nlapiSetFieldValue('custpage_outcome', 'callback');
    nlapiSetFieldValue('custpage_callbackdate', date);
    nlapiSetFieldValue('custpage_callbacktime', time);
    nlapiSetFieldValue('custpage_callnotes', callnotes);
    funcsubmitter = true;
    document.getElementById('submitter').click();
}

function submit_Reject(reason, callnotes) {

    nlapiSetFieldValue('custpage_outcome', 'reject');
    nlapiSetFieldValue('custpage_rejectreason', reason);
    nlapiSetFieldValue('custpage_rejectnotes', callnotes);
    // nlapiSetFieldValue('create_service_change', 'T');
    funcsubmitter = true;
    document.getElementById('submitter').click();
}

function onclick_Callback() {
    if (validate()) {
        var result = updateCustomerDetails(false);
        if (result == false) {
            return false;
        }
        var params = {
            custid: parseInt(nlapiGetFieldValue('customer')),
            sales_record_id: parseInt(nlapiGetFieldValue('sales_record_id')),
            callback: 'T',
            id: 'customscript_sl_finalise_page',
            deploy: 'customdeploy_sl_finalise_page'
        };
        params = JSON.stringify(params);
        var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }
}

function onclick_OffPeak() {
    if (validate()) {
        var result = updateCustomerDetails(true);
        if (result == false) {
            return false;
        }
        var upload_url = baseURL + '/app/common/entity/custjob.nl?id=' + parseInt(nlapiGetFieldValue('customer'));
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }
}

function onclick_Quadient() {
    if (validate()) {
        var result = updateCustomerDetails(false, true);
        if (result == false) {
            return false;
        }

        var custId = parseInt(nlapiGetFieldValue('customer'));

        var recCustomer = nlapiLoadRecord('customer', custId);
        var partner_id = recCustomer.getFieldValue('partner');
        var companyName = recCustomer.getFieldValue('companyname');
        var entity_id = recCustomer.getFieldValue('entityid');
        var day_to_day_email = recCustomer.getFieldValue('custentity_email_service');

        var salesRecordId = parseInt(nlapiGetFieldValue('sales_record_id'));
        var salesRecord = nlapiLoadRecord('customrecord_sales', salesRecordId);
        var sales_rep = salesRecord.getFieldValue('custrecord_sales_assigned');

        var email_subject = 'MailPlus Quadient Program ' + entity_id + ' ' + companyName;

        var email_body = 'Your opportunity for ' + companyName + ' has been successfully registered. Your reference number is ' + entity_id + '</br></br>Please contact your Account Manager for any additional information or assistance.';

        nlapiSendEmail(sales_rep, day_to_day_email, email_subject, email_body, ['luke.forbes@mailplus.com.au'], sales_rep);

        var upload_url = baseURL + '/app/common/entity/custjob.nl?id=' + parseInt(nlapiGetFieldValue('customer'));
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }
}

function onclick_Reject() {
    if (validate()) {
        var result = updateCustomerDetails(false);
        if (result == false) {
            return false;
        }
        var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_sales_campaign_reject', 'customdeploy_sl_sales_campaign_reject');
        window.open(url, "Window", "height=240,width=320,modal=yes,alwaysRaised=yes,location=0,toolbar=0");
    }
}


function onclick_Refer() {
    if (validate()) {
        var result = updateCustomerDetails(false);
        if (result == false) {
            return false;
        }
        var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_salescamp_refer', 'customdeploy_sl_salescamp_refer');
        window.open(url, "Window", "height=210,width=230,modal=yes,alwaysRaised=yes,location=0,toolbar=0");
    }
}


function submit_Refer(assign, notes) {
    nlapiSetFieldValue('custpage_outcome', 'refer');
    nlapiSetFieldValue('custpage_referto', assign);
    nlapiSetFieldValue('custpage_refernotes', notes);
    nlapiSetFieldValue('custpage_callnotes', notes);
    document.getElementById('submitter').click();
}

function submit_Complete() {
    nlapiSetFieldValue('custpage_outcome', 'complete');

    document.getElementById('submitter').click();
}


function submit_Sale(commreg, outcome, startdate, trialperiod) {
    nlapiSetFieldValue('custpage_startdate', startdate);
    nlapiSetFieldValue('custpage_trialperiod', trialperiod);
    nlapiSetFieldValue('custpage_commreg', commreg);
    nlapiSetFieldValue('custpage_outcome', outcome);
    document.getElementById('submitter').click();
}

function onclick_Signed() {
    if (validate()) {
        updateCustomerDetails(false);
        var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_salescamp_sale', 'customdeploy_sl_salescamp_sale') + '&custid=' + parseInt(nlapiGetFieldValue('customer'));
        window.open(url, "Window", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }
}

function onclick_FreeTrial() {
    if (validate()) {
        var result = updateCustomerDetails(false);
        if (result == false) {
            return false;
        }
        var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_salescamp_sale', 'customdeploy_sl_salescamp_sale') + '&custid=' + nlapiGetFieldValue('customer') + '&trial=yes';
        window.open(url, "Window", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }
}

function onclick_Address() {
    if (validate()) {
        updateCustomerDetails(false);
        var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_salescamp_editaddress', 'customdeploy_sl_salescamp_editaddress') + '&custid=' + parseInt(nlapiGetFieldValue('customer'));
        window.open(url, "Window", "height=550,width=800,modal=yes,alwaysRaised=yes");
    }
}

function submit_Address(siteAddress, billAddress, postalAddress) {
    nlapiSetFieldValue('custpage_addsummary_site', siteAddress);
    nlapiSetFieldValue('custpage_addsummary_billing', billAddress);
    nlapiSetFieldValue('custpage_addsummary_residential', postalAddress);
}

function onclick_SendEmail() {
    var result = validate();
    if (result == false) {
        return false;
    }
    updateCustomerDetails(false);
    var params = {
        custid: parseInt(nlapiGetFieldValue('customer')),
        sales_record_id: parseInt(nlapiGetFieldValue('sales_record_id')),
        id: 'customscript_sl_finalise_page',
        deploy: 'customdeploy_sl_finalise_page'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

function onclick_NoSale() {
    var result = validate();
    if (result == false) {
        return false;
    }
    updateCustomerDetails(false);
    var params = {
        custid: parseInt(nlapiGetFieldValue('customer')),
        sales_record_id: parseInt(nlapiGetFieldValue('sales_record_id')),
        nosale: 'T',
        id: 'customscript_sl_finalise_page',
        deploy: 'customdeploy_sl_finalise_page'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}



function onclick_ProductSale() {
    if (validate()) {
        updateCustomerDetails(false);
        var url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_salescamp_satchelorder', 'customdeploy_sl_salescamp_satchelorder') + '&custid=' + parseInt(nlapiGetFieldValue('customer'));
        window.open(url, "Window", "height=250,width=250,modal=yes,alwaysRaised=yes");
    }
}

function submit_ProductSale(callnotes) {
    nlapiSetFieldValue('custpage_outcome', 'satchelonly');
    nlapiSetFieldValue('custpage_callnotes', callnotes);
    funcsubmitter = true;
    document.getElementById('submitter').click();
}



function saveRecord() {

    console.log('start')
    var result = validate();
    if (result == false) {
        return false;
    }
    updateCustomerDetails(false);
    console.log('after update');
    var sales_record_id = parseInt(nlapiGetFieldValue('sales_record_id'));
    var state = nlapiGetFieldValue('shipping_state');
    var customer_id = parseInt(nlapiGetFieldValue('customer'))



    var state_id;

    if ((isNullorEmpty(nlapiGetFieldValue('create_service_change')) || nlapiGetFieldValue('create_service_change') == 'F') && funcsubmitter == false) {
        console.log('inside')
        switch (state) {
            case 'NSW':
                state_id = 1;
                break;
            case 'QLD':
                state_id = 2;
                break;
            case 'VIC':
                state_id = 3;
                break;
            case 'SA':
                state_id = 4;
                break;
            case 'TAS':
                state_id = 5;
                break;
            case 'ACT':
                state_id = 6;
                break;
            case 'WA':
                state_id = 7;
                break;
            case 'NT':
                state_id = 8;
                break;
            case 'NZ':
                state_id = 9;
                break;
        }

        var edit_class_elem = document.getElementsByClassName("edit_class");
        var service_name_elem = document.getElementsByClassName("service_name");
        var service_descp_elem = document.getElementsByClassName("service_descp");
        var service_price_elem = document.getElementsByClassName("new_service_price_class");
        var service_freq_elem = document.getElementsByClassName("new_service_freq");

        var item_array = new Array();
        var item_price_array = [];
        var item_price_count = 0;
        var item_count = 0;

        var pricing_notes_services = '';

        pricing_notes_services += $('#pricing_notes').val();

        for (var i = 0; i < edit_class_elem.length; i++) {
            var nsItem = service_name_elem[i].getAttribute('data-ns');
            var serviceTypeId = service_name_elem[i].getAttribute('data-servicetypeid');
            var price = service_price_elem[i].value;
            var descp = service_descp_elem[i].value;
            var service_text = service_name_elem[i].value;
            var service_freq = service_freq_elem[i].value;

            console.log(nsItem)
            var nsTypeRec = nlapiLoadRecord('serviceitem', nsItem);
            console.log(nsItem)
            var serviceText = nsTypeRec.getFieldValue('itemid');
            var serviceTypeRec = nlapiLoadRecord('customrecord_service_type', serviceTypeId);
            // service_freq.sort(function(a, b) {
            //     return a - b
            // });

            if (i == 0) {
                pricing_notes_services += '\n' + $('#commencementdate').val() + '\n' + serviceText + ' - @$' + price + ' - ' + service_freq + '\n';
            } else {
                pricing_notes_services += '\n' + serviceText + ' - @$' + price + ' - ' + service_freq + '\n';
            }



            if (isNullorEmpty(descp)) {
                descp = 0;
            } else {
                descp = descp.replace(/\s+/g, '-').toLowerCase()
            }

            if (item_price_array[serviceTypeId] == undefined) {
                item_price_array[serviceTypeId] = [];
                item_price_array[serviceTypeId][0] = price + '_' + descp;
            } else {
                var size = item_price_array[serviceTypeId].length;
                item_price_array[serviceTypeId][size] = price + '_' + descp;
            }

            item_price_count++;
        }


        var zee = $('#zee').val();
        var dateofentry = $('#dateofentry').val();
        var commencementtype = $('#commencementtype').val();
        var inoutbound = $('#inoutbound').val();
        var commencementdate = $('#commencementdate').val();
        var commRegId = $('#commencementdate').attr('data-commregid');
        var signupdate = $('#signupdate').val();

        var splitDate = commencementdate.split('-');
        commencementdate = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];

        var splitDate = signupdate.split('-');
        signupdate = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];

        if (isNullorEmpty(commRegId)) {
            var salesRecord = nlapiLoadRecord('customrecord_sales', sales_record_id);
            var sales_rep = salesRecord.getFieldValue('custrecord_sales_assigned');
            var commReg = createCommReg(dateofentry, commencementdate, signupdate, customer_id, sales_rep, zee, inoutbound, commencementtype, state_id, sales_record_id);
        } else {
            var commReg = updateCommReg(commRegId, commencementdate, signupdate, inoutbound, commencementtype);
        }


        nlapiSetFieldValue('comm_reg', commReg);

        var sales_record = nlapiLoadRecord('customrecord_sales', sales_record_id);

        var sales_campaign_id = sales_record.getFieldValue('custrecord_sales_campaign');

        var sales_campaign_record = nlapiLoadRecord('customrecord_salescampaign', sales_campaign_id);
        var sales_campaign_name = sales_campaign_record.getFieldValue('name');


        sales_record.setFieldValue('custrecord_sales_outcome', 2);
        sales_record.setFieldValue('custrecord_sales_completed', 'T');
        sales_record.setFieldValue('custrecord_sales_inuse', 'F');
        sales_record.setFieldValue('custrecord_sales_commreg', commReg);
        sales_record.setFieldValue('custrecord_sales_completedate', getDate());


        try {
            nlapiSubmitRecord(sales_record);
        } catch (err) {
            alert('Error While Finalising Sale - Phone Call');
            return false;
        }

        var phonecall = nlapiCreateRecord('phonecall');
        phonecall.setFieldValue('assigned', zee);
        phonecall.setFieldValue('custevent_organiser', nlapiGetContext().getUser());
        phonecall.setFieldValue('startdate', getDate());
        phonecall.setFieldValue('company', customer_id);
        phonecall.setFieldValue('status', 'COMPLETE');
        phonecall.setFieldValue('custevent_call_outcome', 16);

        var recCustomer = nlapiLoadRecord('customer', customer_id);
        var finacnial_tab_size = recCustomer.getLineItemCount('itempricing');
        var old_financial_tab_size = finacnial_tab_size;
        var new_financial_tab_size = 0;

        var initial_size_of_financial = recCustomer.getLineItemCount('itempricing');

        var financial_tab_item_array = [];
        var financial_tab_price_array = [];
        var count_array = [];

        for (var i = 0; i < edit_class_elem.length; i++) {
            var nsItem = service_name_elem[i].getAttribute('data-ns');
            var serviceTypeId = service_name_elem[i].getAttribute('data-servicetypeid');
            var price = service_price_elem[i].value;
            var descp = service_descp_elem[i].value;


            if (count_array[serviceTypeId] == undefined) {
                count_array[serviceTypeId] = -1;
            }

            var size = item_price_array[serviceTypeId].length;

            //if the size is 1, directly create in the financial tab
            if (size == 1) {
                initial_size_of_financial++;
                financial_tab_item_array[initial_size_of_financial] = nsItem;
                financial_tab_price_array[initial_size_of_financial] = price;
            } else {
                //if the size is more than 1, go through the NS array in the service type record and create the ns iitems in the financial tab respectively
                var ns_array_items = serviceTypeRec.getFieldValue('custrecord_service_type_ns_item_array');
                if (!isNullorEmpty(ns_array_items)) {

                    var ns_items = ns_array_items.split(",")

                    if (count_array[serviceTypeId] < ns_items.length) {
                        initial_size_of_financial++;
                        if (count_array[serviceTypeId] == -1) {
                            financial_tab_item_array[initial_size_of_financial] = serviceTypeRec.getFieldValue('custrecord_service_type_ns_item');
                            financial_tab_price_array[initial_size_of_financial] = price;

                            count_array[serviceTypeId] = count_array[serviceTypeId] + 1;

                        } else {

                            financial_tab_item_array[initial_size_of_financial] = ns_items[count_array[serviceTypeId]];
                            financial_tab_price_array[initial_size_of_financial] = price;

                            count_array[serviceTypeId] = count_array[serviceTypeId] + 1;
                        }
                    }
                } else if (count_array[serviceTypeId] == -1) {

                    initial_size_of_financial++;
                    financial_tab_item_array[initial_size_of_financial] = serviceTypeRec.getFieldValue('custrecord_service_type_ns_item');
                    financial_tab_price_array[initial_size_of_financial] = price;
                    count_array[serviceTypeId] = count_array[serviceTypeId] + 1;
                }
            }
        }

        nlapiSetFieldValue('financial_item_array', financial_tab_item_array.toString());
        nlapiSetFieldValue('financial_price_array', financial_tab_price_array.toString());

        if (customerStatus == 13) {
            phonecall.setFieldValue('title', 'X Sale - ' + sales_campaign_name + ' - Signed');
        } else {
            phonecall.setFieldValue('title', 'Sale - ' + sales_campaign_name + ' - Signed');
        }


        try {
            nlapiSubmitRecord(phonecall);
        } catch (err) {
            alert('Error While Finalising Sale - Phone Call');
            return false;
        }

        for (var i = 1; i <= recCustomer.getLineItemCount('itempricing'); i++) {
            var financialTabItem = recCustomer.getLineItemValue('itempricing', 'item', i);
            financialTabItemArray[financialTabItemArray.length] = financialTabItem;
        }
        var customerStatus = recCustomer.getFieldValue('entitystatus');

        recCustomer.setFieldValue('custentity_customer_pricing_notes', pricing_notes_services);


        nlapiSubmitRecord(recCustomer);

        nlapiSetFieldValue('custpage_item_ids', financialTabItemArray.toString());



        nlapiSetFieldValue('create_service_change', 'F');
    }
    console.log('end')
    return true;
}

function AddJavascript(jsname, pos) {
    var tag = document.getElementsByTagName(pos)[0];
    var addScript = document.createElement('script');
    addScript.setAttribute('type', 'text/javascript');
    addScript.setAttribute('src', jsname);
    tag.appendChild(addScript);
}

function AddStyle(cssLink, pos) {
    var tag = document.getElementsByTagName(pos)[0];
    var addLink = document.createElement('link');
    addLink.setAttribute('type', 'text/css');
    addLink.setAttribute('rel', 'stylesheet');
    addLink.setAttribute('href', cssLink);
    tag.appendChild(addLink);
}


function validate(status) {

    var callcenter = nlapiGetFieldValue('custpage_callcenter');

    var companyName = $('#company_name').val();
    var abn = $('#abn').val();
    var zee = $('#zee').val();
    var account_email = $('#account_email').val();
    var account_phone = $('#account_phone').val();
    var daytodayemail = $('#daytodayemail').val();
    var daytodayphone = $('#daytodayphone').val();
    var industry = $('#industry').val();

    var survey1 = $('#survey1').val();
    var survey2 = $('#survey2').val();
    var survey3 = $('#survey3').val();


    var commencementtype = $('#commencementtype').val();
    var inoutbound = $('#inoutbound').val();
    var commencementdate = $('#commencementdate').val();
    var signupdate = $('#signupdate').val();

    var return_value = true;

    var alertMessage = ''

    if (isNullorEmpty(companyName)) {
        alertMessage += 'Please Enter the Company Name</br>';
        return_value = false;
    }

    if (isNullorEmpty(callcenter)) {
        if (isNullorEmpty(abn)) {
            alertMessage += 'Please Enter the ABN</br>';
            return_value = false;
        } else {
            var result = verify_abn(abn);
            if (result == false) {
                alertMessage += 'ABN entered is incorrect';
                return_value = false;
            }
        }

        if (isNullorEmpty(account_email) && isNullorEmpty(daytodayemail)) {
            alertMessage += 'Please Enter either Account Email or Day-To-Day Email</br>';
            return_value = false;
        } else {
            if (!isNullorEmpty(daytodayemail)) {
                var email_test = /.+@.+\..+/;
                if (email_test.test(daytodayemail) === false) {
                    alertMessage += 'Please check Day-To-Day Email</br>';
                    return_value = false;
                }
            }

            if (!isNullorEmpty(account_email)) {
                var email_test = /.+@.+\..+/;
                if (email_test.test(account_email) === false) {
                    alertMessage += 'Please check Account Email </br>';
                    return_value = false;
                }
            }
        }

    }

    if (isNullorEmpty(industry)) {
        alertMessage += 'Please Select an Industry</br>';
        return_value = false;
    }
    // if (isNullorEmpty(survey1)) {
    //  alertMessage += 'Please Answer Survey Information "Using AusPost for Mail & Parcel?" </br>';
    //  return_value = false;
    // }
    // if (isNullorEmpty(survey2)) {
    //  alertMessage += 'Please Answer Survey Information "Using AusPost Outlet?"</br>';
    //  return_value = false;
    // }
    // if (isNullorEmpty(survey3)) {
    //  alertMessage += 'Please Answer Survey Information "Is this Auspost outlet a LPO?"</br>';
    //  return_value = false;
    // }

    if (isNullorEmpty(zee)) {
        alertMessage += 'Please select a Franchisee to which the customer Belongs</br>';
        return_value = false;
    }


    if (isNullorEmpty(account_phone) && isNullorEmpty(daytodayphone)) {
        alertMessage += 'Please Enter either Account Phone or Day-To-Day Phone</br>';
        return_value = false;
    } else {
        if (!isNullorEmpty(account_phone)) {
            var result = validatePhone(account_phone);
        }

        if (!isNullorEmpty(daytodayphone)) {
            var result = validatePhone(daytodayphone);
        }
    }

    if (isNullorEmpty(nlapiGetFieldValue('custpage_callcenter')) && isNullorEmpty(status)) {
        if (isNullorEmpty(commencementdate)) {
            alertMessage += 'Please Select the Commencement Date</br>';
            return_value = false;
        }

        if (isNullorEmpty(signupdate)) {
            alertMessage += 'Please Select the Sign Up Date</br>';
            return_value = false;
        }


        if (isNullorEmpty(commencementtype)) {
            alertMessage += 'Please Select the Commencement Type</br>';
            return_value = false;
        }

        if (isNullorEmpty(inoutbound)) {
            alertMessage += 'Please Select the Inbound/Outbound</br>';
            return_value = false;
        }

        if (isNullorEmpty($('#viewer').attr('src'))) {
            alertMessage += 'Please Attach a Service Commencement Form</br>';
            return_value = false;
        }
    }

    if (return_value == false) {
        showAlert(alertMessage);

    }
    return return_value;
}

function updateCustomerDetails(offPeak, quadient) {

    var update_required = false;

    if ($('#company_name').val() != $('#company_name').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#abn').val() != $('#abn').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#account_email').val() != $('#account_email').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#account_phone').val() != $('#account_phone').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#daytodayemail').val() != $('#daytodayemail').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#daytodayphone').val() != $('#daytodayphone').attr('data-oldvalue')) {
        update_required = true;
    }

    var customerRecord = nlapiLoadRecord('customer', parseInt(nlapiGetFieldValue('customer')));
    if (update_required == true) {

        customerRecord.setFieldValue('companyname', $('#company_name').val());
        customerRecord.setFieldValue('vatregnumber', $('#abn').val());
        customerRecord.setFieldValue('partner', $('#zee').val());
        customerRecord.setFieldValue('email', $('#account_email').val());
        customerRecord.setFieldValue('altphone', $('#account_phone').val());
        customerRecord.setFieldValue('custentity_email_service', $('#daytodayemail').val());
        customerRecord.setFieldValue('phone', $('#daytodayphone').val());
        customerRecord.setFieldValue('leadsource', $('#leadsource option:selected').val());
    }
    var multisite = $('#multisite option:selected').val();

    if (isNullorEmpty(multisite)) {
        multisite = 'F';
    } else {
        if (multisite == 1) {
            multisite = 'T';
        } else {
            multisite = 'F';
        }
    }

    customerRecord.setFieldValue('custentity_category_multisite', multisite);
    customerRecord.setFieldValue('custentity_category_multisite_link', $('#website').val());
    customerRecord.setFieldValue('custentity_ap_mail_parcel', $('#survey1 option:selected').val());
    customerRecord.setFieldValue('custentity_ap_outlet', $('#survey2 option:selected').val());
    customerRecord.setFieldValue('custentity_ap_lpo_customer', $('#survey3 option:selected').val());
    customerRecord.setFieldValue('custentity_date_reviewed_sra', getDate());
    customerRecord.setFieldValue('custentity_customer_pricing_notes', $('#pricing_notes').val());

    /**
     *  Update List of MPEX Customers
     */
    customerRecord.setFieldValue('custentity_exp_mpex_weekly_usage', $("#weekly_usage").val());

    // Invoicing Cycle is the only thing listed as a result under Customer Record
    customerRecord.setFieldValue('custentity_mpex_invoicing_cycle', $('#invoice_cycle option:selected').val());

    // Minimum Float Amount
    customerRecord.setFieldValue('custentity_mpex_500g_float', $('#min_500g').val()); // Float for min
    customerRecord.setFieldValue('custentity_mpex_1kg_float', $('#min_1kg').val());
    customerRecord.setFieldValue('custentity_mpex_3kg_float', $('#min_3kg').val());
    customerRecord.setFieldValue('custentity_mpex_5kg_float', $('#min_5kg').val());
    customerRecord.setFieldValue('custentity_mpex_b4_float', $('#min_b4').val());
    customerRecord.setFieldValue('custentity_mpex_c5_float', $('#min_c5').val());
    customerRecord.setFieldValue('custentity_mpex_dl_float', $('#min_dl').val());
    // Price Point
    var price_point_500g = $('#price_500g option:selected').val();
    console.log(price_point_500g);
    nlapiLogExecution('AUDIT', price_point_500g);

    customerRecord.setFieldValue('custentity_mpex_500g_price_point', $('#price_500g option:selected').val());
    customerRecord.setFieldValue('custentity_mpex_1kg_price_point', $('#price_1kg option:selected').val());
    customerRecord.setFieldValue('custentity_mpex_3kg_price_point', $('#price_3kg option:selected').val());
    customerRecord.setFieldValue('custentity_mpex_5kg_price_point', $('#price_5kg option:selected').val());
    customerRecord.setFieldValue('custentity_mpex_b4_price_point', $('#price_b4 option:selected').val());
    customerRecord.setFieldValue('custentity_mpex_c5_price_point', $('#price_c5 option:selected').val());
    customerRecord.setFieldValue('custentity_mpex_dl_price_point', $('#price_dl option:selected').val());

    if (offPeak == true) {
        customerRecord.setFieldValue('entitystatus', 62);
    } else if (quadient == true) {
        customerRecord.setFieldValue('entitystatus', 63);
    }
    nlapiSubmitRecord(customerRecord);

    if (!isNullorEmpty($('#sale_notes').val())) {
        var sales_record_id = parseInt(nlapiGetFieldValue('sales_record_id'));
        var sales_record = nlapiLoadRecord('customrecord_sales', sales_record_id);
        var sales_campaign_id = sales_record.getFieldValue('custrecord_sales_campaign');
        var sales_campaign_record = nlapiLoadRecord('customrecord_salescampaign', sales_campaign_id);
        var sales_campaign_name = sales_campaign_record.getFieldValue('name');

        var phonecall = nlapiCreateRecord('phonecall');
        phonecall.setFieldValue('assigned', $('#zee').val());
        phonecall.setFieldValue('custevent_organiser', nlapiGetContext().getUser());
        phonecall.setFieldValue('startdate', getDate());
        phonecall.setFieldValue('company', parseInt(nlapiGetFieldValue('customer')));
        phonecall.setFieldValue('status', 'COMPLETE');
        phonecall.setFieldValue('custevent_call_outcome', 16);

        phonecall.setFieldValue('title', 'X Sale - ' + sales_campaign_name + ' - Call Notes');

        phonecall.setFieldValue('message', $('#sale_notes').val());

        nlapiSubmitRecord(phonecall);
    }
}

function onclick_Update() {
    var result = validate();
    if (result == false) {
        return false;
    }
    updateCustomerDetails(false);
    updateButton = true;

    var upload_url = baseURL + '/app/common/entity/custjob.nl?id=' + parseInt(nlapiGetFieldValue('customer'));
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

function createCommReg(date_of_entry, comm_date, signup_date, customerid, salesrep, zee, in_out, salestype, state, sales_record_id) {
    customer_comm_reg = nlapiCreateRecord('customrecord_commencement_register');
    customer_comm_reg.setFieldValue('custrecord_date_entry', date_of_entry);
    customer_comm_reg.setFieldValue('custrecord_comm_date', comm_date);
    customer_comm_reg.setFieldValue('custrecord_comm_date_signup', signup_date);
    customer_comm_reg.setFieldValue('custrecord_customer', customerid);
    customer_comm_reg.setFieldValue('custrecord_salesrep', salesrep);
    customer_comm_reg.setFieldValue('custrecord_franchisee', zee);
    customer_comm_reg.setFieldValue('custrecord_wkly_svcs', '5');
    customer_comm_reg.setFieldValue('custrecord_in_out', in_out);
    customer_comm_reg.setFieldValue('custrecord_trial_status', 9);
    customer_comm_reg.setFieldValue('custrecord_state', state);
    customer_comm_reg.setFieldValue('custrecord_sale_type', salestype);
    customer_comm_reg.setFieldValue('custrecord_commreg_sales_record', sales_record_id);

    var commRegId = nlapiSubmitRecord(customer_comm_reg);

    return commRegId;
}

function updateCommReg(id, comm_date, signup_date, in_out, salestype) {

    console.log(id);
    console.log(comm_date);
    console.log(signup_date);
    console.log(in_out);
    console.log(salestype);

    var customer_comm_reg = nlapiLoadRecord('customrecord_commencement_register', id);
    customer_comm_reg.setFieldValue('custrecord_comm_date', comm_date);
    customer_comm_reg.setFieldValue('custrecord_comm_date_signup', signup_date);
    customer_comm_reg.setFieldValue('custrecord_in_out', in_out);
    customer_comm_reg.setFieldValue('custrecord_sale_type', salestype);

    var commRegId = nlapiSubmitRecord(customer_comm_reg);

    return commRegId;
}

function validatePhone(val) {

    var digits = val.replace(/[^0-9]/g, '');
    var australiaPhoneFormat = /^(\+\d{2}[ \-]{0,1}){0,1}(((\({0,1}[ \-]{0,1})0{0,1}\){0,1}[2|3|7|8]{1}\){0,1}[ \-]*(\d{4}[ \-]{0,1}\d{4}))|(1[ \-]{0,1}(300|800|900|902)[ \-]{0,1}((\d{6})|(\d{3}[ \-]{0,1}\d{3})))|(13[ \-]{0,1}([\d \-]{5})|((\({0,1}[ \-]{0,1})0{0,1}\){0,1}4{1}[\d \-]{8,10})))$/;
    var phoneFirst6 = digits.substring(0, 6);
    //Check if all phone characters are numerals
    if (val != digits) {
        showAlert('Phone numbers should contain numbers only.\n\nPlease re-enter the phone number without spaces or special characters.');
        return false;
    } else if (digits.length != 10) {
        //Check if phone is not blank, need to contains 10 digits
        showAlert('Please enter a 10 digit phone number with area code.');
        return false;
    } else if (!(australiaPhoneFormat.test(digits))) {
        //Check if valid Australian phone numbers have been entered
        showAlert('Please enter a valid Australian phone number.\n\nNote: 13 or 12 numbers are not accepted');
        return false;
    } else if (digits.length == 10) {
        //Check if all 10 digits are the same numbers using checkDuplicate function
        if (checkDuplicate(digits)) {
            showAlert('Please enter a valid 10 digit phone number.');
            return false;
        }
    }
}

function checkDuplicate(digits) {
    var digit01 = digits.substring(0, 1);
    var digit02 = digits.substring(1, 2);
    var digit03 = digits.substring(2, 3);
    var digit04 = digits.substring(3, 4);
    var digit05 = digits.substring(4, 5);
    var digit06 = digits.substring(5, 6);
    var digit07 = digits.substring(6, 7);
    var digit08 = digits.substring(7, 8);
    var digit09 = digits.substring(8, 9);
    var digit10 = digits.substring(9, 10);

    if (digit01 == digit02 && digit02 == digit03 && digit03 == digit04 && digit04 == digit05 && digit05 == digit06 && digit06 == digit07 && digit07 == digit08 && digit08 == digit09 && digit09 == digit10) {
        return true;
    } else {
        return false;
    }
}

function verify_abn(str) {

    if (!str || str.length !== 11) {
        alert('Invalid ABN');
        return false;
    }
    var weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
        checksum = str.split('').map(Number).reduce(
            function(total, digit, index) {
                if (!index) {
                    digit--;
                }
                return total + (digit * weights[index]);
            },
            0
        );

    if (!checksum || checksum % 89 !== 0) {
        showAlert('Invalid ABN');
        return false;
    }

    return true;
}


function getDate() {
    var date = new Date();
    // if (date.getHours() > 6) {
    //     date = nlapiAddDays(date, 1);
    // }
    date = nlapiDateToString(date);
    return date;
}