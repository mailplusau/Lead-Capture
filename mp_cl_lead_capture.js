/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2019-03-27 13:47:56         ankith.ravindran
 *
 * Description: Lead Capture /Customer Details - Client     
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2020-10-06 11:39:33
 *
 */


var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var ctx = nlapiGetContext();
var zee = 0;
var role = ctx.getRole();

if (role == 1000) { //Franchisee
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 6; //test
} else if (role == 1032) { // System Support
    zee = 425904; //test-AR
}

var customer_id = null;
var type = null;
var cust_inactive = false;

//On Page initialisation
function pageInit() {

    $('#alert').hide();
    $('.create_nominate_section').hide();
    $('.customer_section').hide();

    customer_id = $('#customer_id').val();
    console.log(customer_id);

    if (!isNullorEmpty(nlapiGetFieldValue('script_id')) && !isNullorEmpty(nlapiGetFieldValue('deploy_id'))) {
        cust_inactive = true;
    }
    if (role != 1000) {
        if ($('#leadsource option:selected').val() == 202599 || $('#leadsource option:selected').val() == 217602) { //Relocation or COE
            $('.relocation_section').removeClass('hide');
        }
    }

    AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');

    //JQuery to sort table based on click of header. Attached library  
    jQuery(document).ready(function() {
        jQuery("#customer_weekly_usage").bind('dynatable:init', function(e, dynatable) {
            dynatable.sorts.clear();
            //WS Edit: remove sort
            dynatable.sorts.add('weekused', -1) // 1=ASCENDING, -1=DESCENDING
            dynatable.process();
            e.preventDefault();
        }).dynatable();

    });

    $('.dynatable-per-page').css('margin-left', '25%')
    $('.dynatable-record-count').css('margin-left', '25%')
    $('.dynatable-per-page-select').css('margin-left', '25%')
    $('#dynatable-search-customer_weekly_usage').css('margin-right', '25%')
    $('.dynatable-pagination-links').css('margin-right', '25%')
    $('#dynatable-per-page-customer_weekly_usage').val(10)
}

//Show Aler message on top of the page with errors
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

//Show the tabs content on click of a tab
$(".nav-tabs").on("click", "a", function(e) {
    $(this).tab('show');
});

//Close the Alert Box on click
$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});

//On Change of Using Mail / Parcels / Satchels Regularly?
$(document).on('change', '#survey1', function(e) {
    if ($('#survey1 option:selected').val() == 2) {
        $('#survey2').val(2);
        $('#survey2').hide()
        $('.survey2').hide()
        $('#survey3').val(2);
        $('#survey3').hide();
        $('.survey3').hide();
        $('#survey7').val(2);
        $('#survey7').hide();
        $('.survey7').hide();
    } else {
        $('#survey2').val();
        $('#survey2').show()
        $('.survey2').show()
        $('#survey3').val();
        $('#survey3').show();
        $('.survey3').show();
        $('#survey7').val();
        $('#survey7').show();
        $('.survey7').show();
    }
});

//On change of Franchisee
$(document).on("change", ".zee_dropdown", function(e) {

    var zee = $(this).val();

    $('#hiddenzee').val(zee);

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=750&deploy=1&type=nominate";

    url += "&zee=" + zee + "";

    window.location.href = url;
});

//On change of Lead Source
$(document).on("change", "#leadsource", function(e) {
    var lead_source = $('#leadsource option:selected').val();
    console.log('lead_source', lead_source);
    if (lead_source == 202599 || lead_source == 217602) { //Relocation
        $('.relocation_section').removeClass('hide');
    } else {
        $('.relocation_section').addClass('hide');
        $('#old_zee').val('');
        $('#old_cust').val('');
    }
});

//On click of Notify Franchisee
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
    emailBody += '500G: ' + $('#drop_500g').val() + ' (10-Packs)</br>';
    emailBody += '1KG: ' + $('#drop_1kg').val() + ' (10-Packs)</br>';
    emailBody += '3KG: ' + $('#drop_3kg').val() + ' (10-Packs)</br>';
    emailBody += '5KG: ' + $('#drop_5kg').val() + ' (10-Packs)</br>';

    console.log(email)
    console.log(emailSubject)
    console.log(emailBody)
    var bcc = null;
    var records = null;
    var attachments = null;
    var notifySenderOnBounce = true;
    nlapiSendEmail(112209, email, emailSubject, emailBody, null, bcc, records, attachments, notifySenderOnBounce);

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

//On Click of Add/Edit Contacts
$(document).on('click', '#reviewcontacts', function(event) {

    var result = validate('true');
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id, null, true);
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

//On click of Add/Edit Address
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

//On change of Old Customer ID
$(document).on('change', '#old_cust', function() {
    var old_zee = nlapiLookupField('customer', $('#old_cust').val(), 'partner');
    var old_zee_text = nlapiLookupField('customer', $('#old_cust').val(), 'partner', true);
    console.log('old_zee', old_zee);
    $('#old_zee').val(old_zee_text);
    $('#old_zee').attr('data-id', old_zee);
});

//On click of Send Email Button
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

function onclick_SendReferralEmail() {
    var result = validate();
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id);
    var params = {
        custid: customer_id,
        sales_record_id: null,
        invitetoportal: null,
        unity: null,
        sendinfo: null,
        referral: 'T',
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

//On Click of INVITE TO PORTAL
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
        sendinfo: null,
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

//On click of INVITE TO PORTAL(U4)
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
        sendinfo: null,
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

//On click of Send Info
function onclick_SendInfo() {
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
        sendinfo: 'T',
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture'
    };
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

//On Click of Create User Note
$(document).on('click', '#create_note', function(event) {

    var result = validate('true');
    if (result == false) {
        return false;
    }
    customer_id = createUpdateCustomer(customer_id, null, true);
    // if (!isNullorEmpty($('#note').val())) {
    //     createUserNote(customer_id);
    // }

    var mpex_drop_off = nlapiGetFieldValue('mpex_drop_off');

    var params2 = {
        custid: customer_id,
        sales_record_id: null,
        id: 'customscript_sl_lead_capture',
        deploy: 'customdeploy_sl_lead_capture',
        type: 'create',
        mpex: mpex_drop_off
    };
    params2 = JSON.stringify(params2);
    var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_create_user_note', 'customdeploy_sl_create_user_note') + '&params=' + params2;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

});

//On click Back Button when coming from the Customer List Page
function onclick_back() {
    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=925&deploy=1";
    window.location.href = url;
}

//On Click of Save
function saveRecord(context) {

    var type = $('#type').val();
    var pricing_notes = $('#pricing_notes').val();

    var ampo_price = $('#ampo_price').val();
    var ampo_time = $('#ampo_time option:selected').val();
    var pmpo_price = $('#pmpo_price').val();
    var pmpo_time = $('#pmpo_time').val();

    var zee = $('#zee option:selected').val();

    var survey1 = $('#survey1 option:selected').val();
    var survey2 = $('#survey2 option:selected').val();
    var survey3 = $('#survey3 option:selected').val();
    var survey7 = $('#survey7 option:selected').val();

    var auto_allocate = $('#auto_allocate option:selected').val();

    console.log(auto_allocate)

    nlapiSetFieldValue('custpage_auto_allocate', auto_allocate);

    //If role is Franchisee AND Franchisee is not Brisbane, AMPO Time/Price and PMPO Time/Price are mandatory Fields
    if (role == 1000 && zee != 696179) {
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

    //If role is Franchisee and Franchisee is Brisbane, below fields are mandatory
    if (role == 1000 && zee == 696179) {
        if (isNullorEmpty(survey1)) {
            alertMessage += 'Please Answer Survey Information "Using Mail / Parcels / Satchels Regularly?" </br>';
            return_value = false;
        } else if (survey1 == 1) {
            if (isNullorEmpty(survey2)) {
                alertMessage += 'Please Answer Survey Information "Using Express Post?"</br>';
                return_value = false;
            }

            if (isNullorEmpty(survey3)) {
                alertMessage += 'Please Answer Survey Information "Using Local Couriers?"</br>';
                return_value = false;
            }

            if (isNullorEmpty(survey7)) {
                alertMessage += 'Please Answer Survey Information "Frequency of Mail / Parcels / Satchels?"</br>';
                return_value = false;
            }
        }
    }

    cust_inactive = true;
    customer_id = createUpdateCustomer(customer_id);

    if ($('#leadsource option:selected').val() == 202599 || $('#leadsource option:selected').val() == 217602) {
        console.log('old_cust', $('#old_cust').val());
        var old_customer_record = nlapiLoadRecord('customer', $('#old_cust').val());
        old_customer_record.setFieldValue('custentity_new_customer', customer_id);
        old_customer_record.setFieldValue('custentity_new_zee', $('#zee option:selected').val());
        nlapiSubmitRecord(old_customer_record);
    }
    return true;
}

//Validate Fields
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

    var zee = $('#zee option:selected').val();



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

function createUpdateCustomer(customer_id, update_status, create_contact) {

    //If customer_id is null, create new record else load record. 
    if (isNullorEmpty(customer_id)) {
        var customerRecord = nlapiCreateRecord('lead');
        var update_required = true;
    } else {
        var update_required = false;

        var customerRecord = nlapiLoadRecord('customer', customer_id);
        customerRecord.setFieldValue('entitystatus', $('#status option:selected').val());

        //If not coming from the Customer List Page, update Customer Date - Lead Entered field
        if (isNullorEmpty(nlapiGetFieldValue('customer_list'))) {
            customerRecord.setFieldValue('custentity_date_lead_entered', getDate());
        }

        //Mark the new Lead Entered as inactive = false, when address has been created and all other mandatory fields have been filed. 
        if (cust_inactive == true || create_contact == true) {
            customerRecord.setFieldValue('isinactive', 'F');
            update_required = true;
        }

        //If customer status selected is SUSPECT - Hot Lead
        if ($('#status option:selected').val() == 57) {
            customerRecord.setFieldValue('custentity_hotleads', 'T');
        }

        nlapiSetFieldValue('status_id', $('#status option:selected').val());

        if (!isNullorEmpty(update_status) && update_status == 'T') {
            var customerRecordId = nlapiSubmitRecord(customerRecord);
            return customerRecordId;
        }

    }

    if ($('#old_zee option:selected').val() != $('#old_zee').attr('data-oldvalue')) {
        update_required = true;
    }
    if ($('#old_cust').val() != $('#old_cust').attr('data-oldvalue')) {
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

    if (!isNullorEmpty($('#zee_notes').val())) {
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
    if ($('#min_500g').val() != $('#min_500g').attr('data-oldvalue')) {
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
        if (isNullorEmpty(nlapiGetFieldValue('customer_list')) && isNullorEmpty(create_contact)) {
            customerRecord.setFieldValue('isinactive', 'T');
        }

        customerRecord.setFieldValue('vatregnumber', $('#abn').val());

        if (role == 1000) {
            // customerRecord.setFieldValue('partner', ctx.getUser());
        } else {
            customerRecord.setFieldValue('partner', $('#zee option:selected').val());
            if (isNullorEmpty(nlapiGetFieldValue('customer_list'))) {
                customerRecord.setFieldValue('custentity_lead_entered_by', ctx.getUser());
            }
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

        customerRecord.setFieldValue('custentity_category_multisite', multisite);
        customerRecord.setFieldValue('custentity_ap_mail_parcel', $('#survey1').val());
        customerRecord.setFieldValue('custentity_customer_express_post', $('#survey2').val());
        customerRecord.setFieldValue('custentity_customer_local_couriers', $('#survey3').val());
        customerRecord.setFieldValue('custentity_customer_po_box', $('#survey4').val());
        customerRecord.setFieldValue('custentity_customer_bank_visit', $('#survey5').val());
        customerRecord.setFieldValue('custentity_lead_type', $('#survey6').val());
        customerRecord.setFieldValue('custentity_mp_toll_zeevisit', zee_visit);
        customerRecord.setFieldValue('custentity_category_multisite_link', $('#website').val());
        customerRecord.setFieldValue('custentity_mp_toll_zeevisit_memo', $('#zee_notes').val());
        customerRecord.setFieldValue('custentity_industry_category', $('#industry option:selected').val());
        if (!isNullorEmpty($('#daytodayphone').val())) {
            customerRecord.setFieldValue('phone', $('#daytodayphone').val());
        } else {
            customerRecord.setFieldValue('phone', '1300656595');
        }
        customerRecord.setFieldValue('leadsource', $('#leadsource option:selected').val());
        customerRecord.setFieldValue('custentity_old_zee', $('#old_zee').attr('data-id'));
        customerRecord.setFieldValue('custentity_old_customer', $('#old_cust').val());
        customerRecord.setFieldValue('leadsource', $('#leadsource option:selected').val());
        customerRecord.setFieldValue('custentity_customer_pricing_notes', $('#pricing_notes').val());
        customerRecord.setFieldValue('custentity_ampo_service_price', $('#ampo_price').val());
        customerRecord.setFieldValue('custentity_ampo_service_time', $('#ampo_time option:selected').val());
        customerRecord.setFieldValue('custentity_pmpo_service_price', $('#pmpo_price').val());
        customerRecord.setFieldValue('custentity_pmpo_service_time', $('#pmpo_time option:selected').val());
        customerRecord.setFieldValue('custentity_mpex_dl_float', $('#min_b4').val());
        customerRecord.setFieldValue('custentity_mpex_b4_float', $('#min_c5').val());
        customerRecord.setFieldValue('custentity_mpex_500g_float', $('#min_500g').val());
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

//Validate Phone Number fields
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

//Validate ABN
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

function getDate() {
    var date = new Date();
    // if (date.getHours() > 6) {
    //     date = nlapiAddDays(date, 1);
    // }
    date = nlapiDateToString(date);
    return date;
}

/**
 * [AddJavascript description] - Add the JS to the postion specified in the page.
 * @param {[type]} jsname [description]
 * @param {[type]} pos    [description]
 */
function AddJavascript(jsname, pos) {
    var tag = document.getElementsByTagName(pos)[0];
    var addScript = document.createElement('script');
    addScript.setAttribute('type', 'text/javascript');
    addScript.setAttribute('src', jsname);
    tag.appendChild(addScript);
}

/**
 * [AddStyle description] - Add the CSS to the position specified in the page
 * @param {[type]} cssLink [description]
 * @param {[type]} pos     [description]
 */
function AddStyle(cssLink, pos) {
    var tag = document.getElementsByTagName(pos)[0];
    var addLink = document.createElement('link');
    addLink.setAttribute('type', 'text/css');
    addLink.setAttribute('rel', 'stylesheet');
    addLink.setAttribute('href', cssLink);
    tag.appendChild(addLink);
}