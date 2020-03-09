/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2019-03-27 13:47:56         ankith.ravindran
 *
 * Description: Lead Capture /Customer Details - Client     
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-02-24 11:59:50
 *
 */


var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var ctx = nlapiGetContext();
var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 6; //test
} else if (role == 1032) { // System Support
    zee = 425904; //test-AR
}

var customer_id = null;
var type = null;
var cust_inactive = false;

function pageInit() {

    $('#alert').hide();
    $('.create_nominate_section').hide();
    $('.customer_section').hide();

    customer_id = $('#customer_id').val();
    console.log('customer_id', customer_id);

    if (!isNullorEmpty(nlapiGetFieldValue('script_id')) && !isNullorEmpty(nlapiGetFieldValue('deploy_id'))) {
        cust_inactive = true;
    }

    if ($('#leadsource option:selected').val() == 202599){ //Relocation
        $('.relocation_section').removeClass('hide');
    }
}

function showAlert(message) {
    console.log(message)
    $('#alert').html('<button type="button" class="close">&times;</button>' + message);
    $('#alert').show();
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
    setTimeout(function() {
        $("#alert .close").trigger('click');
    }, 100000);
    // $(window).scrollTop($('#alert').offset().top);
}

$(".nav-tabs").on("click", "a", function(e) {

    $(this).tab('show');
});

$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});

$(document).on('change', '#survey1', function(e) {
    if ($('#survey1 option:selected').val() == 2) {
        $('#survey2').val(2);
        $('#survey2').hide()
        $('.survey2').hide()
        $('#survey3').val(2);
        $('#survey3').hide();
        $('.survey3').hide();
    } else {
        $('#survey2').val();
        $('#survey2').show()
        $('.survey2').show()
        $('#survey3').val();
        $('#survey3').show();
        $('.survey3').show();
    }
});

$(document).on("change", ".zee_dropdown", function(e) {

    var zee = $(this).val();

    $('#hiddenzee').val(zee);

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=750&deploy=1&type=nominate";

    url += "&zee=" + zee + "";

    window.location.href = url;
});

$(document).on('change', '#campaign', function(e) {
    var campaign_id = $('#campaign option:selected').val();
    var campaign_record_type = $('#campaign option:selected').attr('data-recordtype');
    var campaign_special_customer = $('#campaign option:selected').attr('data-sc');

    $('#camp_id').val(campaign_id);
    $('#camp_sc').val(campaign_special_customer);

    $('.create_nominate_section').show();

    if (campaign_record_type == 1) {
        $('.create').hide();
    } else {
        $('.create').show();
    }
    $('.nominate').show();
});

$(document).on("change", "#leadsource", function(e) {
    var lead_source = $('#leadsource option:selected').val();
    console.log('lead_source', lead_source);
    if (lead_source == 202599){ //Relocation
        $('.relocation_section').removeClass('hide');
    }
    else {
        $('.relocation_section').addClass('hide');
    }
});

$(document).on('click', '.createservicechg', function(event) {

    var result = validate('true');
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id);


    // var sales_record_id = parseInt(nlapiGetFieldValue('sales_record_id'));
    // var state = nlapiGetFieldValue('shipping_state');
    // var customer_id = parseInt(nlapiGetFieldValue('customer'))

    // var state_id;

    // switch (state) {
    //     case 'NSW':
    //         state_id = 1;
    //         break;
    //     case 'QLD':
    //         state_id = 2;
    //         break;
    //     case 'VIC':
    //         state_id = 3;
    //         break;
    //     case 'SA':
    //         state_id = 4;
    //         break;
    //     case 'TAS':
    //         state_id = 5;
    //         break;
    //     case 'ACT':
    //         state_id = 6;
    //         break;
    //     case 'WA':
    //         state_id = 7;
    //         break;
    //     case 'NT':
    //         state_id = 8;
    //         break;
    //     case 'NZ':
    //         state_id = 9;
    //         break;
    // }



    // nlapiSetFieldValue('create_service_change', 'T');


    // var zee = $('#zee_id').val();
    // var dateofentry = $('#dateofentry').val();
    // var commencementtype = $('#commencementtype').val();
    // var inoutbound = $('#inoutbound').val();
    // // var commencementdate = $('#commencementdate').val();
    // // var commRegId = $('#commencementdate').attr('data-commregid');
    // var signupdate = $('#signupdate').val();

    // // console.log(commRegId);

    // var splitDate = commencementdate.split('-');
    // commencementdate = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];

    // var splitDate = signupdate.split('-');
    // signupdate = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];

    var custparam_params = {
        custid: parseInt(customer_id),
        salesrecordid: null,
        salesrep: 'F',
        commreg: null,
        lead: 'T',
        customid: 'customscript_sl_lead_capture',
        customdeploy: 'customdeploy_sl_lead_capture'
    }
    custparam_params = JSON.stringify(custparam_params);

    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_create_service_change', 'customdeploy_sl_create_service_change') + '&custparam_params=' + custparam_params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

});

$(document).on('click', '#sendemail', function(event) {

    var recCustomer = nlapiLoadRecord('customer', customer_id);
    var zee_id = recCustomer.getFieldValue('partner');

    var zee_record = nlapiLoadRecord('partner', zee_id);
    var email = zee_record.getFieldValue('email');

    var dropoff_date = $('#dropoffdate').val();
    var contact_name = $('#contact_name').val();

    var emailSubject = 'MPEX DROP OFF - ' + recCustomer.getFieldValue('entityid') + ' ' + recCustomer.getFieldValue('companyname');
    var emailBody = 'Customer Name: ' + recCustomer.getFieldValue('entityid') + ' ' + recCustomer.getFieldValue('companyname');
    emailBody += '</br>Please drop-off the following 10-packs on ' + dropoff_date + ': </br>';
    if (!isNullorEmpty(contact_name)) {
        emailBody += '</br>Ordered By: ' + contact_name + ': </br>';
    }

    emailBody += 'B4: ' + $('#drop_b4').val() + ' (10-Packs)</br>';
    emailBody += 'C5: ' + $('#drop_c5').val() + ' (10-Packs)</br>';
    emailBody += 'DL: ' + $('#drop_dl').val() + ' (10-Packs)</br>';
    emailBody += '1KG: ' + $('#drop_1kg').val() + ' (10-Packs)</br>';
    emailBody += '3KG: ' + $('#drop_3kg').val() + ' (10-Packs)</br>';
    emailBody += '5KG: ' + $('#drop_5kg').val() + ' (10-Packs)</br>';

    console.log(email)
    console.log(emailSubject)
    console.log(emailBody)
    nlapiSendEmail(112209, email, emailSubject, emailBody, ['ankith.ravindran@mailplus.com.au']);

    recCustomer.setFieldValue('custentity_mpex_drop_notified', 1);
    var date_split = dropoff_date.split('-');
    console.log(date_split);
    recCustomer.setFieldValue('custentity_mpex_drop_date', date_split[2] + '/' + date_split[1] + '/' + date_split[0]);
    nlapiSubmitRecord(recCustomer);

    $('#sendemail').val('FRANCHISEE NOTIFIED');
    $('#sendemail').removeAttr('style');

    // var button = $("#sendemail"),
    //     text = (button.text() == 'NOTIFY FRANCHISEE') ? 'FRANCHISEE NOTIFIED' : 'NOTIFY FRANCHISEE';
    // button.text(text).toggleClass('btn-success');

    // var url = baseURL + "/app/site/hosting/scriptlet.nl?script=925&deploy=1";
    // window.location.href = url;

});


$(document).on('click', '#reviewcontacts', function(event) {

    var result = validate('true');
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id);
    // if (!isNullorEmpty($('#note').val())) {
    //     createUserNote(customer_id);
    // }

    var params = {
        custid: parseInt(customer_id),
        sales_record_id: null,
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture',
        callcenter: null,
        scriptid: nlapiGetFieldValue('script_id'),
        deployid: nlapiGetFieldValue('deploy_id'),
        type: 'create'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_conatcts_module', 'customdeploy_sl_conatcts_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

});

$(document).on('click', '#reviewaddress', function(event) {

    var result = validate();
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id);

    // if (!isNullorEmpty($('#note').val())) {
    //     createUserNote(customer_id);
    // }

    var params = {
        custid: parseInt(customer_id),
        sales_record_id: null,
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture',
        callcenter: null,
        scriptid: nlapiGetFieldValue('script_id'),
        deployid: nlapiGetFieldValue('deploy_id'),
        type: 'create'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_new_address_module', 'customdeploy_sl_new_address_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

});

function onclick_SendEmail() {
    var result = validate();
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id);
    var params = {
        custid: customer_id,
        sales_record_id: null,
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

function onclick_InviteEmail() {
    var result = validate();
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id);
    var params = {
        custid: customer_id,
        sales_record_id: null,
        invitetoportal: 'T',
        unity: null,
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

function onclick_InviteEmailU4() {
    var result = validate();
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id);
    var params = {
        custid: customer_id,
        sales_record_id: null,
        invitetoportal: 'T',
        unity: 'T',
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}


$(document).on('click', '#create_note', function(event) {

    var result = validate('true');
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id);
    // if (!isNullorEmpty($('#note').val())) {
    //     createUserNote(customer_id);
    // }



    var params2 = {
        custid: customer_id,
        sales_record_id: null,
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture',
        type: 'create'
    };
    params2 = JSON.stringify(params2);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_create_user_note', 'customdeploy_sl_create_user_note') + '&params=' + params2;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

});

function saveRecord(context) {

    var type = $('#type').val();
    var pricing_notes = $('#pricing_notes').val();

    var ampo_price = $('#ampo_price').val();
    var ampo_time = $('#ampo_time option:selected').val();
    var pmpo_price = $('#pmpo_price').val();
    var pmpo_time = $('#pmpo_time').val();

    if (role == 1000) {
        if (isNullorEmpty(ampo_price)) {
            showAlert('Please Enter AMPO Price');
            return false;
        }


        if (isNullorEmpty(ampo_time)) {
            showAlert('Please Select Time at which AMPO Service can be performed');
            return false;
        }

        if (isNullorEmpty(pmpo_price)) {
            showAlert('Please Enter PMPO Price');
            return false;
        }

        if (isNullorEmpty(pmpo_time)) {
            showAlert('Please Select Time at which PMPO Service can be performed');
            return false;
        }
    }

    cust_inactive = true;
    customer_id = createUpdateCustomer(customer_id);

    return true;
}

function validate(status) {

    var companyName = $('#company_name').val();
    var abn = $('#abn').val();
    var zee = $('#zee option:selected').val();
    var status = $('#status option:selected').val();
    var account_email = $('#account_email').val();
    var account_phone = $('#account_phone').val();
    var daytodayemail = $('#daytodayemail').val();
    var daytodayphone = $('#daytodayphone').val();
    var industry = $('#industry option:selected').val();

    // var survey1 = $('#survey1 option:selected').val();
    // var survey2 = $('#survey2 option:selected').val();
    // var survey3 = $('#survey3 option:selected').val();


    var leadsource = $('#leadsource option:selected').val();

    var return_value = true;

    var alertMessage = ''

    if (isNullorEmpty(companyName)) {
        alertMessage += 'Please Enter the Company Name</br>';
        return_value = false;
    }

    if (!isNullorEmpty(abn)) {
        return_value = verify_abn(abn);
    }

    if (isNullorEmpty(industry)) {
        alertMessage += 'Please Select an Industry</br>';
        return_value = false;
    }
    // 
    if (isNullorEmpty(leadsource)) {
        alertMessage += 'Please Select an Lead Source</br>';
        return_value = false;
    }

    // if (isNullorEmpty(survey1)) {
    //     alertMessage += 'Please Answer Survey Information "Using AusPost for Mail & Parcel?" </br>';
    //     return_value = false;
    // }
    // if (isNullorEmpty(survey2)) {
    //     alertMessage += 'Please Answer Survey Information "Using AusPost Outlet?"</br>';
    //     return_value = false;
    // }
    // if (isNullorEmpty(survey3)) {
    //     alertMessage += 'Please Answer Survey Information "Is this Auspost outlet a LPO?"</br>';
    //     return_value = false;
    // }

    if (isNullorEmpty(zee) || zee == 0) {
        alertMessage += 'Please select a Franchisee to which the customer Belongs</br>';
        return_value = false;
    }

    if (isNullorEmpty(status) || status == 0) {
        alertMessage += 'Please select a Status</br>';
        return_value = false;
    }

    // if (isNullorEmpty(account_email) && isNullorEmpty(daytodayemail)) {
    //     alertMessage += 'Please Enter either Account Email or Day-To-Day Email</br>';
    //     return_value = false;
    // }

    if (!isNullorEmpty(account_email)) {
        var email_test = /.+@.+\..+/;
        if (email_test.test(account_email) === false) {
            alertMessage += 'Please check Account Email </br>';
            return_value = false;
        }
    }

    if (!isNullorEmpty(daytodayemail)) {
        var email_test = /.+@.+\..+/;
        if (email_test.test(daytodayemail) === false) {
            alertMessage += 'Please check Day-To-Day Email</br>';
            return_value = false;
        }
    }

    // if (isNullorEmpty(account_phone) && isNullorEmpty(daytodayphone)) {
    //     alertMessage += 'Please Enter either Account Phone or Day-To-Day Phone</br>';
    //     return_value = false;
    // } else {
    if (!isNullorEmpty(account_phone)) {
        var result = validatePhone(account_phone);

        if (!isNullorEmpty(result)) {
            alertMessage += result;
        }
    }

    if (!isNullorEmpty(daytodayphone)) {
        var result = validatePhone(daytodayphone)
        if (!isNullorEmpty(result)) {
            alertMessage += result;
        }
    }
    // } else {
    //     alertMessage += 'Please Enter Day-To-Day Phone</br>';
    //     return_value = false;
    // }

    // }

    if (return_value == false) {
        showAlert(alertMessage);

    }
    return return_value;
}

function createUpdateCustomer(customer_id, update_status) {

    if (isNullorEmpty(customer_id)) {

        var customerRecord = nlapiCreateRecord('customer');

        var update_required = true;

    } else {
        var update_required = false;

        var customerRecord = nlapiLoadRecord('customer', customer_id);

        customerRecord.setFieldValue('entitystatus', $('#status option:selected').val());
        customerRecord.setFieldValue('custentity_date_lead_entered', getDate());
        if (cust_inactive == true) {
            customerRecord.setFieldValue('isinactive', 'F');

        }

        if ($('#status option:selected').val() == 57) {
            customerRecord.setFieldValue('custentity_hotleads', 'T');
        }

        nlapiSetFieldValue('status_id', $('#status option:selected').val());

        if (!isNullorEmpty(update_status) && update_status == 'T') {

            var customerRecordId = nlapiSubmitRecord(customerRecord);

            return customerRecordId;
        }

    }
    if ($('#previous_zee option:selected').val() != $('#previous_zee').attr('data-oldvalue')){
        update_required = true;
    }

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

    if (!isNullorEmpty($('#survey1 option:selected').val()) && !isNullorEmpty($('#survey2 option:selected').val()) && !isNullorEmpty($('#survey3 option:selected').val())) {
        update_required = true;
    }

    if (!isNullorEmpty($('#multisite option:selected').val()) || !isNullorEmpty($('#website').val())) {
        update_required = true;
    }

    if ($('#min_b4').val() != $('#min_b4').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#min_c5').val() != $('#min_c5').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#min_dl').val() != $('#min_dl').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#min_1kg').val() != $('#min_1kg').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#min_3kg').val() != $('#min_3kg').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#min_5kg').val() != $('#min_5kg').attr('data-oldvalue')) {
        update_required = true;
    }



    if (update_required == true) {

        customerRecord.setFieldValue('companyname', $('#company_name').val());
        if (role == 1000) {
            customerRecord.setFieldValue('isinactive', 'T');
        }

        customerRecord.setFieldValue('vatregnumber', $('#abn').val());

        console.log(role);
        console.log(ctx.getUser());

        if (role == 1000) {
            // customerRecord.setFieldValue('partner', ctx.getUser());
        } else {
            customerRecord.setFieldValue('partner', $('#zee option:selected').val());
            customerRecord.setFieldValue('custentity_lead_entered_by', ctx.getUser());
        }

        customerRecord.setFieldValue('email', $('#account_email').val());

        customerRecord.setFieldValue('altphone', $('#account_phone').val());
        if (!isNullorEmpty($('#daytodayemail').val())) {
            customerRecord.setFieldValue('custentity_email_service', $('#daytodayemail').val());
        } else {
            customerRecord.setFieldValue('custentity_email_service', 'abc@abc.com');
        }


        var multisite = $('#multisite option:selected').val();
        var zee_visit = $('#zee_visit option:selected').val();

        console.log(multisite);

        if (isNullorEmpty(multisite)) {
            multisite = 'F';
        } else {
            if (multisite == 1) {
                multisite = 'T';
            } else {
                multisite = 'F';
            }
        }

        if (isNullorEmpty(zee_visit)) {
            zee_visit = 'F';
        } else {
            if (zee_visit == 1) {
                zee_visit = 'T';
            } else {
                zee_visit = 'F';
            }
        }
        console.log(multisite)
        customerRecord.setFieldValue('custentity_category_multisite', multisite);
        customerRecord.setFieldValue('custentity_ap_mail_parcel', $('#survey1').val());
        customerRecord.setFieldValue('custentity_customer_express_post', $('#survey2').val());
        customerRecord.setFieldValue('custentity_customer_local_couriers', $('#survey3').val());
        customerRecord.setFieldValue('custentity_customer_po_box', $('#survey4').val());
        customerRecord.setFieldValue('custentity_customer_bank_visit', $('#survey5').val());
        customerRecord.setFieldValue('custentity_lead_type', $('#survey6').val());
        customerRecord.setFieldValue('custentity_mp_toll_zeevisit', zee_visit);
        customerRecord.setFieldValue('custentity_category_multisite_link', $('#website').val());
        customerRecord.setFieldValue('custentity_industry_category', $('#industry option:selected').val());
        if (!isNullorEmpty($('#daytodayphone').val())) {
            customerRecord.setFieldValue('phone', $('#daytodayphone').val());
        } else {
            customerRecord.setFieldValue('phone', '1300656595');
        }
        customerRecord.setFieldValue('leadsource', $('#leadsource option:selected').val());
        customerRecord.setFieldValue('custentity_previous_zee', $('#previous_zee option:selected').val());
        customerRecord.setFieldValue('custentity_customer_pricing_notes', $('#pricing_notes').val());
        customerRecord.setFieldValue('custentity_ampo_service_price', $('#ampo_price').val());
        customerRecord.setFieldValue('custentity_ampo_service_time', $('#ampo_time option:selected').val());
        customerRecord.setFieldValue('custentity_pmpo_service_price', $('#pmpo_price').val());
        customerRecord.setFieldValue('custentity_pmpo_service_time', $('#pmpo_time option:selected').val());
        customerRecord.setFieldValue('custentity_mpex_dl_float', $('#min_b4').val());
        customerRecord.setFieldValue('custentity_mpex_b4_float', $('#min_c5').val());
        customerRecord.setFieldValue('custentity_mpex_1kg_float', $('#min_dl').val());
        customerRecord.setFieldValue('custentity_mpex_c5_float', $('#min_1kg').val());
        customerRecord.setFieldValue('custentity_mpex_3kg_float', $('#min_3kg').val());
        customerRecord.setFieldValue('custentity_mpex_5kg_float', $('#min_5kg').val());

        var customerRecordId = nlapiSubmitRecord(customerRecord);

        var customerRecordId = createUpdateCustomer(customerRecordId, 'T');
        return customerRecordId;
    } else {
        return customer_id;
    }
}

function validatePhone(val) {

    var digits = val.replace(/[^0-9]/g, '');
    var australiaPhoneFormat = /^(\+\d{2}[ \-]{0,1}){0,1}(((\({0,1}[ \-]{0,1})0{0,1}\){0,1}[2|3|7|8]{1}\){0,1}[ \-]*(\d{4}[ \-]{0,1}\d{4}))|(1[ \-]{0,1}(300|800|900|902)[ \-]{0,1}((\d{6})|(\d{3}[ \-]{0,1}\d{3})))|(13[ \-]{0,1}([\d \-]{5})|((\({0,1}[ \-]{0,1})0{0,1}\){0,1}4{1}[\d \-]{8,10})))$/;
    var phoneFirst6 = digits.substring(0, 6);

    var message = null;

    //Check if all phone characters are numerals
    if (val != digits) {
        console.log('Contain Numbers only');
        message = 'Phone numbers should contain numbers only.\n\nPlease re-enter the phone number without spaces or special characters.';
        return message;
    } else if (digits.length != 10) {
        console.log('10 Numbers only');
        //Check if phone is not blank, need to contains 10 digits
        message = 'Please enter a 10 digit phone number with area code.</br>';
        return message;
    } else if (!(australiaPhoneFormat.test(digits))) {
        console.log('Australian Format Numbers only');
        //Check if valid Australian phone numbers have been entered
        message = 'Please enter a valid Australian phone number.\n\nNote: 13 or 12 numbers are not accepted';
        return message;
    } else if (digits.length == 10) {
        //Check if all 10 digits are the same numbers using checkDuplicate function
        if (checkDuplicate(digits)) {
            console.log('Valid 10 Numbers only');
            message = 'Please enter a valid 10 digit phone number.';
            return message;
        }
    }

    return message;
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

$("textarea").keydown(function(event) {
    console.log(event.keyCode)
    if (event.keyCode == 13) {
        event.preventDefault();
        var s = $(this).val();
        $(this).val(s + "\n");
        return false;
    }
});

// /**
//  * [description] - On click of the Add button
//  */
// $(document).on('click', '.add_class', function(event) {

//     var resultSet_service = null;
//     var serviceResult = null;

//     if (!isNullorEmpty(customer_id)) {
//         var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_smc_services');

//         var newFilters_service = new Array();
//         newFilters_service[newFilters_service.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', parseInt(nlapiGetFieldValue('custpage_customer_id')));

//         serviceSearch.addFilters(newFilters_service);

//         resultSet_service = serviceSearch.runSearch();

//         serviceResult = resultSet_service.getResults(0, 1);
//     }


//     var service_price = $(this).closest('tr').find('.service_price_class').val();
//     var service_time = $(this).closest('tr').find('.service_price_class').val();


//     var el = $(this).closest('tr').find('.service_type');

//     if (el.find('option:selected').length == 0) {
//         showAlert('Please Select Service');

//         $(this).closest('tr').find('.services_selected_class').focus();
//         return false;
//     }



//     if (isNullorEmpty(service_price)) {
//         // alert('Please enter Package Name');
//         showAlert('Please enter Service Price');

//         $(this).closest('tr').find('.service_price_class').focus();
//         return false;
//     }
//     if (isNullorEmpty(service_time)) {
//         // alert('Please enter Package Name');
//         showAlert('Please enter Delivery/Pickup Time');

//         $(this).closest('tr').find('.service_time_class').focus();
//         return false;
//     }



//     var row_count = $('#service tr').length;

//     row_count++;

//     var inlineQty = '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" type="button" data-toggle="tooltip" data-placement="right" title="Add Expected Service"></button><input type="hidden" class="delete_service" value="F" /></td>';
//     inlineQty += '<td><select class="form-control service_type" id="service_type">';

//     var service_type_search = serviceTypeSearch(null, [1]);

//     for (var x = 0; x < service_type_search.length; x++) {
//         inlineQty += '<option value="' + service_type_search[x].getValue('internalid') + '">' + service_type_search[x].getValue('name') + '</option>';
//     }


//     inlineQty += '</select></td>';

//     inlineQty += '<td><div class="service_price_div"><input class="form-control service_price_class"  name="service_price[' + row_count + ']" step="any" pattern="^\d*(\.\d{2}$)?" type="number" /></div></td>';
//     inlineQty += '<td><div class="service_time_div"><input class="form-control service_time_class"  name="service_time[' + row_count + ']" type="time" /></div></td></tr>';



//     $('#service tr:last').after(inlineQty);


//     $(this).toggleClass('btn-warning btn-success')
//     $(this).toggleClass('glyphicon-pencil glyphicon-plus');
//     $(this).toggleClass('edit_class add_class');
//     $(this).closest('tr').find('.service_type').prop('disabled', function(i, v) {
//         return !v;
//     });
//     $(this).closest('tr').find('.service_price_class').prop('disabled', function(i, v) {
//         return !v;
//     });
//     $(this).closest('tr').find('.service_time_class').prop('disabled', function(i, v) {
//         return !v;
//     });


//     $(this).closest('tr').find('.first_col').append('<button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button><br>');

//     $(function() {
//         $('[data-toggle="tooltip"]').tooltip()
//     })

// });

// /**
//  * [description] - On the click of the edit button
//  */
// $(document).on('click', '.edit_class', function(event) {

//     var service_price = $(this).closest('tr').find('.service_price_class').val();
//     var service_time = $(this).closest('tr').find('.service_time_class').val();


//     var el = $(this).closest('tr').find('.service_type');


//     $(this).toggleClass('btn-warning btn-success')
//     $(this).toggleClass('glyphicon-pencil glyphicon-ok');
//     $(this).closest('tr').find('.service_type').prop('disabled', function(i, v) {
//         return !v;
//     });
//     $(this).closest('tr').find('.service_price_class').prop('disabled', function(i, v) {
//         return !v;
//     });
//     $(this).closest('tr').find('.service_time_class').prop('disabled', function(i, v) {
//         return !v;
//     });


// });

// /**
//  * [description] - On click of the delete button
//  */
// $(document).on('click', '.remove_class', function(event) {

//     if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

//         $(this).closest('tr').find('.delete_service').val("T");
//         $(this).closest("tr").hide();
//     }



// });

function getDate() {
    var date = new Date();
    // if (date.getHours() > 6) {
    //     date = nlapiAddDays(date, 1);
    // }
    date = nlapiDateToString(date);
    return date;
}