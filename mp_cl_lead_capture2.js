/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-09-15T16:59:52+10:00
 * @Filename: mp_cl_lead_capture2.js
 * @Last modified by:   ankithravindran
 * @Last modified time: 2021-11-05T07:02:53+11:00
 */



define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format',
    'N/email', 'N/currentRecord'
  ],
  function(error, runtime, search, url, record, format, email, currentRecord) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
      baseURL = 'https://1048144-sb3.app.netsuite.com';
    }

    var zee = 0;
    var role = runtime.getCurrentUser().role;

    if (role == 1000) { //Franchisee
      zee = runtime.getCurrentUser();
    } else if (role == 3) { //Administrator
      zee = 6; //test
    } else if (role == 1032) { // System Support
      zee = 425904; //test-AR
    }

    var customer_id = null;
    var type = null;
    var cust_inactive = false;

    /**
     * On page initialisation
     */
    function pageInit() {

      $('#alert').hide();
      $('.create_nominate_section').hide();
      $('.customer_section').hide();

      $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
      $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
      $("#body").css("background-color", "#CFE0CE");

      customer_id = $('#customer_id').val();

      var val1 = currentRecord.get();
      var val2 = val1.getValue({
        fieldId: 'script_id',
      });

      var val3 = val1.getValue({
        fieldId: 'deploy_id',
      });

      if (!isNullorEmpty(val2) && !isNullorEmpty(val3)) {
        cust_inactive = true;
      }
      if (role != 1000) {
        if ($('#leadsource option:selected').val() == 202599 || $(
            '#leadsource option:selected').val() == 217602) { //Relocation or COE
          $('.relocation_section').removeClass('hide');
        }
      }

      AddStyle(
        'https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css',
        'head');

      //JQuery to sort table based on click of header. Attached library
      $(document).ready(function() {
        var customer_weekly_usage = $("#customer_weekly_usage").DataTable();
      });

      //JQuery functions that needs to be carried out based on User Interaction

      /**
       * Show the tabs content on click of a tab
       */
      $(".nav-tabs").on("click", "a", function(e) {
        $(this).tab('show');
      });

      /**
       * Close the Alert box on click
       */
      $(document).on('click', '#alert .close', function(e) {
        $(this).parent().hide();
      });

      /**
       * On change of Using Mail / Parcels / Satchels Regularly?
       */
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


      /**
       * On change of Franchisee
       */
      $(document).on("change", ".zee_dropdown", function(e) {
        var zee = $(this).val();
        $('#hiddenzee').val(zee);
        var url = baseURL +
          "/app/site/hosting/scriptlet.nl?script=1060&deploy=1&type=nominate";
        url += "&zee=" + zee + "";
        window.location.href = url;
      });

      /**
       * On change of Lead Source
       */
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

      /**
       * On click of Notify Franchisee
       */
      $(document).on('click', '#sendemail', function(event) {


        var recCustomer = record.load({
          type: record.Type.CUSTOMER,
          id: customer_id
        });

        var zee_id = recCustomer.getValue({
          fieldId: 'partner'
        });

        var zee_record = record.load({
          type: record.Type.PARTNER,
          fieldId: zee_id
        });

        var email = zee_record.getValue({
          fieldId: 'email'
        });

        var dropoff_date = $('#dropoffdate').val();
        var contact_name = $('#contact_name').val();

        var subject_entity = recCustomer.getValue({
          fieldId: 'entityid'
        });

        var subject_comp = recCustomer.getValue({
          fieldId: 'companyname'
        });

        var emailSubject = 'MPEX DROP OFF - ' + subject_entity + ' ' +
          subject_comp;

        var body_entity = recCustomer.getValue({
          fieldId: 'entityid'
        });

        var body_comp = recCustomer.getValue({
          fieldId: 'companyname'
        });

        var emailBody = 'Customer Name: ' + body_entity + ' ' + body_comp;

        emailBody += '</br>Please drop-off the following 10-packs on ' +
          dropoff_date + ': </br>';

        if (!isNullorEmpty(contact_name)) {
          emailBody += '</br>Ordered By: ' + contact_name + ': </br>';
        }

        emailBody += 'B4: ' + $('#drop_b4').val() + ' (10-Packs)</br>';
        emailBody += 'C5: ' + $('#drop_c5').val() + ' (10-Packs)</br>';
        emailBody += 'DL: ' + $('#drop_dl').val() + ' (10-Packs)</br>';
        emailBody += '1KG: ' + $('#drop_1kg').val() + ' (10-Packs)</br>';
        emailBody += '3KG: ' + $('#drop_3kg').val() + ' (10-Packs)</br>';
        emailBody += '5KG: ' + $('#drop_5kg').val() + ' (10-Packs)</br>';

        var bcc = null;
        var records = null;
        var attachments = null;
        var notifySenderOnBounce = true;

        //SEND EMAIL
        email.send({
          author: 112209,
          body: emailBody,
          recipients: email,
          subject: emailSubject,
          attachments: attachments,
          bcc: bcc,
          notifySenderOnBounce: notifySenderOnBounce,
        });

        recCustomer.setValue({
          fieldId: 'custentity_mpex_drop_notified',
          value: 1
        });

        var date_split = dropoff_date.split('-');
        console.log(date_split);

        recCustomer.setValue({
          fieldId: 'custentity_mpex_drop_date',
          value: date_split[2] + '/' + date_split[1] + '/' +
            date_split[0]
        });

        recCustomer.save({
          ignoreMandatoryFields: true
        });

        $('#sendemail').val('FRANCHISEE NOTIFIED');
        $('#sendemail').removeAttr('style');

      });

      /**
       * On Click of Add/Edit Contacts
       */
      $(document).on('click', '#reviewcontacts', function(event) {

        var result = validate('true');
        if (result == false) {
          return false;
        }
        customer_id = createUpdateCustomer(customer_id, null, true);

        var val1 = currentRecord.get();
        var params_script_id = val1.getValue({
          fieldId: 'script_id'
        });

        var params_deploy_id = val1.getValue({
          fieldId: 'deploy_id'
        });

        var params = {
          custid: parseInt(customer_id),
          sales_record_id: null,
          id: 'customscript_sl_lead_capture2',
          deploy: 'customdeploy_sl_lead_capture2',
          callcenter: null,
          scriptid: params_script_id,
          deployid: params_deploy_id,
          type: 'create'
        };

        params = JSON.stringify(params);

        var par = {
          params: params
        }
        var output = url.resolveScript({
          scriptId: 'customscript_sl_conatcts_module',
          deploymentId: 'customdeploy_sl_conatcts_module',
          returnExternalUrl: false,
          params: par
        })
        var upload_url = baseURL + output;
        window.open(upload_url, "_self",
          "height=750,width=650,modal=yes,alwaysRaised=yes");

      });


      /**
       * On click of Add/Edit Address
       */
      $(document).on('click', '#reviewaddress', function(event) {

        var result = validate();
        if (result == false) {
          return false;
        }
        console.log("sjdhksjdh");
        customer_id = createUpdateCustomer(customer_id);
        console.log("hello");
        var val1 = currentRecord.get();
        var params_script_id = val1.getValue({
          fieldId: 'script_id'
        });

        var params_deploy_id = val1.getValue({
          fieldId: 'deploy_id'
        });
        console.log("hello2");
        var params2 = {
          custid: customer_id,
          sales_record_id: null,
          id: 'customscript_sl_lead_capture2',
          deploy: 'customdeploy_sl_lead_capture2',
          callcenter: null,
          scriptid: params_script_id,
          deployid: params_deploy_id,
          type: 'create'
        };
        params2 = JSON.stringify(params2);

        var par = {
          params: params2
        }
        var output = url.resolveScript({
          scriptId: 'customscript_sl_new_address_module',
          deploymentId: 'customdeploy_sl_new_address_module',
          returnExternalUrl: false,
          params: par
        })
        var upload_url = baseURL + output;
        window.open(upload_url, "_self",
          "height=750,width=650,modal=yes,alwaysRaised=yes");
      });

      /**
       * On change of Old Customer ID
       */
      $(document).on('change', '#old_cust', function() {

        var old_zee = search.lookupFields({
          type: search.Type.CUSTOMER,
          id: $('#old_cust').val(),
          columns: ['partner']
        });

        var old_zee_text = search.lookupFields({
          type: search.Type.CUSTOMER,
          id: $('#old_cust').val(),
          columns: ['partner'],
          text: true
        });

        console.log('old_zee', old_zee);
        $('#old_zee').val(old_zee_text);
        $('#old_zee').attr('data-id', old_zee);
      });

      /**
       * On click of Create User Note
       */
      $(document).on('click', '#create_note', function(event) {

        var result = validate('true');
        if (result == false) {
          return false;
        }
        customer_id = createUpdateCustomer(customer_id, null, true);

        var val1 = currentRecord.get();
        var mpex_drop_off = val1.getValue({
          fieldId: 'mpex_drop_off'
        });

        var params2 = {
          custid: customer_id,
          sales_record_id: null,
          id: 'customscript_sl_lead_capture2',
          deploy: 'customdeploy_sl_lead_capture2',
          type: 'create',
          mpex: mpex_drop_off
        };
        params2 = JSON.stringify(params2);
        var par = {
          params: params2
        }
        var output = url.resolveScript({
          scriptId: 'customscript_sl_create_user_note',
          deploymentId: 'customdeploy_sl_create_user_note',
          returnExternalUrl: false,
          params: par
        })
        var upload_url = baseURL + output;
        window.open(upload_url, "_self",
          "height=750,width=650,modal=yes,alwaysRaised=yes");

      });

      $("textarea").keydown(function(event) {
        console.log(event.keyCode)
        if (event.keyCode == 13) {
          event.preventDefault();
          var s = $(this).val();
          $(this).val(s + "\n");
          return false;
        }
      });
      var invoicesDataSet = [];

      var invoice_datatable_inline_html = '<style>';
      invoice_datatable_inline_html +=
        'table#invoices-preview {font-size: 12px;text-align: center;border: none;}';
      invoice_datatable_inline_html +=
        '.dataTables_wrapper {font-size: 14px;}';
      invoice_datatable_inline_html +=
        'table#invoices-preview th {text-align: center;}';
      invoice_datatable_inline_html +=
        'table#invoices-preview thead input {width: 100%;}';
      invoice_datatable_inline_html += '</style>';
      invoice_datatable_inline_html +=
        '<table cellpadding="15" id="invoices-preview" class="table table-responsive table-striped customer tablesorter" cellspacing="0" style="width: 100%;">';
      invoice_datatable_inline_html +=
        '<thead style="color: white;background-color: #607799;">';
      invoice_datatable_inline_html += '</thead>';
      invoice_datatable_inline_html += '<tbody id="result_invoices"></tbody>';
      invoice_datatable_inline_html += '</table>';
      $('#open_invoice_dt_div').html(invoice_datatable_inline_html);

      var invoice_table = $('#invoices-preview').DataTable({
        data: invoicesDataSet,
        columns: [{
          title: "Invoice Date",
          type: "date"
        }, {
          title: "Invoice #"
        }, {
          title: "Status"
        }, {
          title: "Invoice Type"
        }, {
          title: "Amount Due",
          type: "num-fmt"
        }, {
          title: "Total Amount",
          type: "num-fmt"
        }, {
          title: "Overdue"
        }, {
          title: "Invoice ID"
        }, {
          title: "Action"
        }],
        columnDefs: [{
          visible: false,
          targets: -2,
        }, {
          targets: -1,
          data: null,
          render: function(data, type, row, meta) {
            var val1 = currentRecord.get();
            var selector_id = val1.getValue({
              fieldId: 'custpage_selector_id',
            });
            var disabled = (data[7] == selector_id) ? 'disabled' :
              '';
            return '<button class="btn btn-success add_inv glyphicon glyphicon-plus" type="button" data-inv-id="' +
            data[7] +
              '" data-toggle="tooltip" data-placement="right" title="Attach to email" ' +
              disabled + '></button>';
          }
        }]
      });

      $('#invoices-preview thead tr').addClass('text-center');

      // Adapted from https://datatables.net/extensions/fixedheader/examples/options/columnFiltering.html
      // Adds a row to the table head row, and adds search filters to each column.
      $('#invoices-preview thead tr').clone(true).appendTo(
        '#invoices-preview thead');
      $('#invoices-preview thead tr:eq(1) th').each(function(i) {
        var title = $(this).text();
        $(this).html('<input type="text" placeholder="Search ' + title +
          '" />');

        $('input', this).on('keyup change', function() {
          if (invoice_table.column(i).search() !== this.value) {
            invoice_table
              .column(i)
              .search(this.value)
              .draw();
          }
        });
      });

      updateInvoicesDatatable();
      $('#invoices_dropdown').change(function() {
        var invoice_status_filter = $(this, 'option:selected').val();
        if (invoice_status_filter == 'open') {
          var invoice_section_header = 'OPEN INVOICES';
        } else if (invoice_status_filter == 'paidInFull') {
          var invoice_section_header = 'PAID INVOICES';
        }
        $('.open_invoices_header div div h4 span').text(
          invoice_section_header);

        updateInvoicesDatatable();

      });
    }

    /**
     * Show alert message on top of the page with errors
     */
    function showAlert(message) {
      console.log(message)
      $('#alert').html('<button type="button" class="close">&times;</button>' +
        message);
      $('#alert').show();
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0;
      setTimeout(function() {
        $("#alert .close").trigger('click');
      }, 100000);
    }

    /**
     * Displays the invoices linked to the customer into a datatable.
     * @returns {Boolean}   Whether the function worked well or not.
     */
    function updateInvoicesDatatable() {
      var compid = (runtime.EnvType == "SANDBOX") ? '1048144_SB3' : '1048144';
      console.log(customer_id);
      var invoice_status_filter = $('#invoices_dropdown option:selected').val();
      var invoicesSearchResults = loadInvoicesSearch(customer_id,
        invoice_status_filter);

      $('#result_invoices').empty();
      var invoicesDataSet = [];

      if (isNullorEmpty(invoicesSearchResults)) {
        if (isNullorEmpty(customer_id)) {
          // $('#info').text('No customer is associated to this invoice.');
          // $('#info').parent().show();
          return true;
        } else {
          try {
            var customerRecord = record.load({
              type: record.Type.CUSTOMER,
              id: customer_id,
              isDynamic: true
            });
            var customer_name = customerRecord.getValue({
              fieldId: 'altname'
            });
            console.log(customer_name);
            return true;
          } catch (error) {
            if (error instanceof error.SuiteScriptError) {
              if (error.name == "SSS_MISSING_REQD_ARGUMENT") {
                console.log(
                  'Error to load the customer record with customer_id : ' +
                  customer_id);
              }
            }
          }
        }

      }

      var today = new Date;
      invoicesSearchResults.each(function(invoiceResult) {

        var status = invoiceResult.getValue('statusref');

        if (status == invoice_status_filter) {

          var invoice_date = invoiceResult.getValue('trandate');
          invoice_date = invoice_date.split(' ')[0];
          invoice_date = dateCreated2DateSelectedFormat(invoice_date);

          var re = /Invoice #([\w]+)/;
          var invoice_number = invoiceResult.getValue('invoicenum');
          invoice_number = invoice_number.replace(re, '$1');
          var invoice_id = invoiceResult.id;
          var invoice_link = baseURL +
            '/app/accounting/transactions/custinvc.nl?id=' + invoice_id +
            '&compid=' + compid + '&cf=116&whence=';
          invoice_number = '<a href="' + invoice_link + '">' +
            invoice_number + '</a>';

          var status_text = invoiceResult.getText('statusref');
          var invoice_type = invoiceResult.getText('custbody_inv_type');
          var amount_due = invoiceResult.getValue('amountremaining');
          var total_amount = invoiceResult.getValue('total');

          var due_date_string = invoiceResult.getValue('duedate');
          var overdue = '';

          if (!isNullorEmpty(due_date_string)) {
            due_date = stringToDate(due_date_string);
            var days_overdue = Math.ceil((today - due_date) / 86400000);
            if (days_overdue > 0) {
              overdue = days_overdue + ' days (' + due_date_string + ')';
            } else {
              overdue = 'Due date : ' + due_date_string;
            }
          }

          amount_due = financial(amount_due);
          total_amount = financial(total_amount);

          console.log('invoiceResult : ', invoiceResult);
          invoicesDataSet.push([invoice_date, invoice_number, status_text,
            invoice_type, amount_due, total_amount, overdue,
            invoice_id
          ]);

        }
        return true;

      });

      // Update datatable rows.
      var datatable = $('#invoices-preview').dataTable().api();
      datatable.clear();
      datatable.rows.add(invoicesDataSet);
      datatable.draw();

      $('[data-toggle="tooltip"]').tooltip();

      return true;
    }

    /**
     * Load the result set of the invoices records linked to the customer.
     * @param   {String}                customer_id
     * @param   {String}                invoice_status
     * @return  {nlobjSearchResultSet}  invoicesResultSet
     */
    function loadInvoicesSearch(customer_id, invoice_status) {
      var invoicesResultSet;
      if (!isNullorEmpty(customer_id)) {
        var invoicesSearch = search.load({
          id: 'customsearch_mp_ticket_invoices_datatabl',
          type: search.Type.INVOICE
        });
        var invoicesFilterExpression = invoicesSearch.filterExpression;
        invoicesFilterExpression.push('AND');
        invoicesFilterExpression.push(['entity', search.Operator.IS,
          customer_id
        ]);

        // Open Invoices
        if (invoice_status == 'open' || isNullorEmpty(invoice_status)) {
          invoicesFilterExpression.push('AND', ["status", search.Operator.ANYOF,
            "CustInvc:A"
          ]); // Open Invoices
        } else if (invoice_status == 'paidInFull') {
          invoicesFilterExpression.push('AND', ["status", search.Operator.ANYOF,
            "CustInvc:B"
          ]); // Paid in Full

          var today_date = new Date();
          var today_day = today_date.getDate();
          var today_month = today_date.getMonth();
          var today_year = today_date.getFullYear();
          var date_3_months_ago = new Date(Date.UTC(today_year, today_month -
            3, today_day));
          var date_3_months_ago_string = formatDate(date_3_months_ago);
          invoicesFilterExpression.push('AND', ["trandate", search.Operator.AFTER,
            date_3_months_ago_string
          ]);
        }

        invoicesSearch.filterExpression = invoicesFilterExpression;
        invoicesResultSet = invoicesSearch.run();

      }

      return invoicesResultSet;

    }

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
        id: 'customscript_sl_lead_capture2',
        deploy: 'customdeploy_sl_lead_capture2'
      };
      params = JSON.stringify(params);

      var par = {
        params: params
      }
      var output = url.resolveScript({
        scriptId: 'customscript_sl_send_email_module',
        deploymentId: 'customdeploy_sl_send_email_module',
        returnExternalUrl: false,
        params: par
      })
      var upload_url = baseURL + output;
      window.open(upload_url, "_self",
        "height=750,width=650,modal=yes,alwaysRaised=yes");

    }

    /**
     * On click of send referral email button
     */
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
        id: 'customscript_sl_lead_capture2',
        deploy: 'customdeploy_sl_lead_capture2'
      };
      params = JSON.stringify(params);

      var par = {
        params: params
      }
      var output = url.resolveScript({
        scriptId: 'customscript_sl_send_email_module',
        deploymentId: 'customdeploy_sl_send_email_module',
        returnExternalUrl: false,
        params: par
      })
      var upload_url = baseURL + output;
      window.open(upload_url, "_self",
        "height=750,width=650,modal=yes,alwaysRaised=yes");

    }

    /**
     * On click of invite to portal
     */
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
        id: 'customscript_sl_lead_capture2',
        deploy: 'customdeploy_sl_lead_capture2'
      };
      params = JSON.stringify(params);
      var par = {
        params: params
      }
      var output = url.resolveScript({
        scriptId: 'customscript_sl_send_email_module',
        deploymentId: 'customdeploy_sl_send_email_module',
        returnExternalUrl: false,
        params: par
      })
      var upload_url = baseURL + output;
      window.open(upload_url, "_self",
        "height=750,width=650,modal=yes,alwaysRaised=yes");


    }


    /**
     * On click of Invite to Portal(U4)
     */
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
        id: 'customscript_sl_lead_capture2',
        deploy: 'customdeploy_sl_lead_capture2'
      };
      params = JSON.stringify(params);

      var par = {
        params: params
      }
      var output = url.resolveScript({
        scriptId: 'customscript_sl_send_email_module',
        deploymentId: 'customdeploy_sl_send_email_module',
        returnExternalUrl: false,
        params: par
      })
      var upload_url = baseURL + output;
      window.open(upload_url, "_self",
        "height=750,width=650,modal=yes,alwaysRaised=yes");

    }
    /**
     * On click of Send Info
     */
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
        id: 'customscript_sl_lead_capture2',
        deploy: 'customdeploy_sl_lead_capture2'
      };
      params = JSON.stringify(params);

      var par = {
        params: params
      }
      var output = url.resolveScript({
        scriptId: 'customscript_sl_send_email_module',
        deploymentId: 'customdeploy_sl_send_email_module',
        returnExternalUrl: false,
        params: par
      })
      var upload_url = baseURL + output;
      window.open(upload_url, "_self",
        "height=750,width=650,modal=yes,alwaysRaised=yes");

    }


    /**
     * On click Back Button when coming from the Customer List Page
     */
    function onclick_back() {
      var urlVar = baseURL +
        "/app/site/hosting/scriptlet.nl?script=925&deploy=1";
      window.location.href = urlVar;
    }


    /**
     * On click of Save
     * @param {*} context
     */
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

      var val1 = currentRecord.get();
      val1.setValue({
        fieldId: 'custpage_auto_allocate',
        value: auto_allocate
      });

      //If role is Franchisee AND Franchisee is not Brisbane, AMPO Time/Price and PMPO Time/Price are mandatory Fields
      if (role == 1000 && zee != 696179) {
        if (isNullorEmpty(ampo_price)) {
          showAlert('Please Enter AMPO Price');
          return false;
        }

        if (isNullorEmpty(ampo_time)) {
          showAlert(
            'Please Select Time at which AMPO Service can be performed');
          return false;
        }

        if (isNullorEmpty(pmpo_price)) {
          showAlert('Please Enter PMPO Price');
          return false;
        }

        if (isNullorEmpty(pmpo_time)) {
          showAlert(
            'Please Select Time at which PMPO Service can be performed');
          return false;
        }
      }

      //If role is Franchisee and Franchisee is Brisbane, below fields are mandatory
      if (role == 1000 && zee == 696179) {
        if (isNullorEmpty(survey1)) {
          alertMessage +=
            'Please Answer Survey Information "Using Mail / Parcels / Satchels Regularly?" </br>';
          return_value = false;
        } else if (survey1 == 1) {
          if (isNullorEmpty(survey2)) {
            alertMessage +=
              'Please Answer Survey Information "Using Express Post?"</br>';
            return_value = false;
          }

          if (isNullorEmpty(survey3)) {
            alertMessage +=
              'Please Answer Survey Information "Using Local Couriers?"</br>';
            return_value = false;
          }

          if (isNullorEmpty(survey7)) {
            alertMessage +=
              'Please Answer Survey Information "Frequency of Mail / Parcels / Satchels?"</br>';
            return_value = false;
          }
        }
      }

      cust_inactive = true;
      console.log("this should work");
      customer_id = createUpdateCustomer(customer_id);
      console.log("valid customer id");

      if ($('#leadsource option:selected').val() == 202599 || $(
          '#leadsource option:selected').val() == 217602) {
        console.log('old_cust', $('#old_cust').val());
        var old_customer_record = record.load({
          type: record.Type.CUSTOMER,
          id: $('#old_cust').val()
        })

        old_customer_record.setValue({
          fieldId: 'custentity_new_customer',
          value: customer_id
        });

        old_customer_record.setValue({
          fieldId: 'custentity_new_zee',
          value: $('#zee option:selected').val()
        });
        old_customer_record.save({
          ignoreMandatoryFields: true
        });

      }
      return true;

    }

    /**
     * Validate Fields
     * @param {*} status
     */
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

      if (isNullorEmpty(leadsource)) {
        alertMessage += 'Please Select an Lead Source</br>';
        return_value = false;
      }
      var zee = $('#zee option:selected').val();

      if (isNullorEmpty(zee) || zee == 0) {
        alertMessage +=
          'Please select a Franchisee to which the customer Belongs</br>';
        return_value = false;
      }

      if (isNullorEmpty(status) || status == 0) {
        alertMessage += 'Please select a Status</br>';
        return_value = false;
      }

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

      if (return_value == false) {
        showAlert(alertMessage);

      }
      return return_value;
    }

    function createUpdateCustomer(customer_id, update_status, create_contact) {

      console.log("Inside createUpdateCustomer Function");
      //If customer_id is null, create new record else load record.
      if (isNullorEmpty(customer_id)) {
        console.log("Creating New Lead");
        var customerRecord = record.create({
          type: record.Type.LEAD,
        });
        var update_required = true;

      } else {
        console.log("Loading Lead");
        var update_required = false;
        var customerRecord = record.load({
          type: record.Type.CUSTOMER,
          id: customer_id
        });

        customerRecord.setValue({
          fieldId: 'entitystatus',
          value: $('#status option:selected').val()
        });
        console.log($('#status option:selected').val());
        //If not coming from the Customer List Page, update Customer Date - Lead Entered field
        var val1 = currentRecord.get();
        var custListVal = val1.getValue({
          fieldId: 'customer_list'
        });

        console.log('Customer List Page ' + custListVal)
        var date = new Date();
        var dateVal = getDate(date);
        if (isNullorEmpty(custListVal)) {
          customerRecord.setValue({
            fieldId: 'custentity_date_lead_entered',
            value: dateVal
          });
          console.log(dateVal);
        }

        console.log('cust_inactive ' + cust_inactive)
        console.log('create_contact ' + create_contact)

        //Mark the new Lead Entered as inactive = false, when address has been created and all other mandatory fields have been filed.
        if (cust_inactive == true || create_contact == true) {
          customerRecord.setValue({
            fieldId: 'isinactive',
            value: false
          });
          update_required = true;
        }

        //If customer status selected is SUSPECT - Hot Lead
        if ($('#status option:selected').val() == 57) {
          customerRecord.setValue({
            fieldId: 'custentity_hotleads',
            value: true
          });
        }

        var val1 = currentRecord.get();
        val1.setValue({
          fieldId: 'status_id',
          value: $('#status option:selected').val()
        });
        console.log($('#status option:selected').val());
        console.log("update_status" + update_status);

        if (!isNullorEmpty(update_status) && update_status == 'T') {
          var customerRecordId = customerRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
          });
          return customerRecordId;
        }

      }

      if ($('#old_zee option:selected').val() != $('#old_zee').attr(
          'data-oldvalue')) {
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
      if ($('#account_email').val() != $('#account_email').attr(
          'data-oldvalue')) {
        update_required = true;
      }
      if ($('#account_phone').val() != $('#account_phone').attr(
          'data-oldvalue')) {
        update_required = true;
      }
      if ($('#daytodayemail').val() != $('#daytodayemail').attr(
          'data-oldvalue')) {
        update_required = true;
      }
      if ($('#daytodayphone').val() != $('#daytodayphone').attr(
          'data-oldvalue')) {
        update_required = true;
      }
      if (!isNullorEmpty($('#zee_notes').val())) {
        update_required = true;
      }
      if (!isNullorEmpty($('#survey1 option:selected').val()) && !
        isNullorEmpty($('#survey2 option:selected').val()) && !isNullorEmpty(
          $('#survey3 option:selected').val())) {
        update_required = true;
      }
      if (!isNullorEmpty($('#multisite option:selected').val()) || !
        isNullorEmpty($('#website').val())) {
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

      console.log('update_required ' + update_required)

      if (update_required == true) {

        customerRecord.setValue({
          fieldId: 'companyname',
          value: $('#company_name').val()
        });
        console.log($('#company_name').val());

        var val1 = currentRecord.get();
        var custListVal = val1.getValue({
          fieldId: 'customer_list'
        });

        if (isNullorEmpty(custListVal) && isNullorEmpty(create_contact)) {
          customerRecord.setValue({
            fieldId: 'isinactive',
            value: true
          });
        }

        customerRecord.setValue({
          fieldId: 'vatregnumber',
          value: $('#abn').val()
        });
        console.log($('#abn').val());

        if (role == 1000) {

        } else {
          customerRecord.setValue({
            fieldId: 'partner',
            value: $('#zee option:selected').val()
          });
          console.log($('#zee option:selected').val());

          var val1 = currentRecord.get();
          var custListVal = val1.getValue({
            fieldId: 'customer_list'
          });

          if (isNullorEmpty(custListVal)) {
            customerRecord.setValue({
              fieldId: 'custentity_lead_entered_by',
              value: runtime.getCurrentUser().id
            });
            console.log(runtime.getCurrentUser().id);

          }
        }

        customerRecord.setValue({
          fieldId: 'email',
          value: $('#account_email').val()
        });
        console.log($('#account_email').val());

        customerRecord.setValue({
          fieldId: 'altphone',
          value: $('#account_phone').val()
        });
        console.log($('#account_phone').val());


        if (!isNullorEmpty($('#daytodayemail').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_email_service',
            value: $('#daytodayemail').val()
          });
          console.log($('#daytodayemail').val());

        } else {
          customerRecord.setValue({
            fieldId: 'custentity_email_service',
            value: 'abc@abc.com'
          });
          console.log("kk");

        }

        var multisite = $('#multisite option:selected').val();
        var zee_visit = $('#zee_visit option:selected').val();


        if (isNullorEmpty(multisite)) {
          multisite = false;
        } else {
          if (multisite == 1) {
            multisite = true;
          } else {
            multisite = false;
          }
        }

        if (isNullorEmpty(zee_visit)) {
          zee_visit = false;
        } else {
          if (zee_visit == 1) {
            zee_visit = true;
          } else {
            zee_visit = false;
          }
        }

        customerRecord.setValue({
          fieldId: 'custentity_category_multisite',
          value: multisite
        });

        if (!isNullorEmpty($('#survey1').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_ap_mail_parcel',
            value: $('#survey1').val(),
          });
        }
        if (!isNullorEmpty($('#survey2').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_customer_express_post',
            value: $('#survey2').val(),
          });
        }


        if (!isNullorEmpty($('#survey3').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_customer_local_couriers',
            value: $('#survey3').val()
          });
        }


        if (!isNullorEmpty($('#survey4').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_customer_po_box',
            value: $('#survey4').val()
          });
        }


        if (!isNullorEmpty($('#survey5').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_customer_bank_visit',
            value: $('#survey5').val()
          });
        }


        if (!isNullorEmpty($('#survey6').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_lead_type',
            value: $('#survey6').val()
          });
        }


        customerRecord.setValue({
          fieldId: 'custentity_mp_toll_zeevisit',
          value: zee_visit
        });

        if (!isNullorEmpty($('#website').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_category_multisite_link',
            value: $('#website').val()
          });
        }


        if (!isNullorEmpty($('#zee_notes').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_mp_toll_zeevisit_memo',
            value: $('#zee_notes').val()
          });
        }

        customerRecord.setValue({
          fieldId: 'custentity_industry_category',
          value: $('#industry option:selected').val()
        });

        console.log($('#industry option:selected').val());
        if (!isNullorEmpty($('#daytodayphone').val())) {
          customerRecord.setValue({
            fieldId: 'phone',
            value: $('#daytodayphone').val()
          });
          console.log($('#daytodayphone').val());
        } else {
          customerRecord.setValue({
            fieldId: 'phone',
            value: '1300656595'
          });

        }

        customerRecord.setValue({
          fieldId: 'leadsource',
          value: $('#leadsource option:selected').val()
        });
        console.log($('#leadsource option:selected').val());
        if (role == 1032) {
          customerRecord.setValue({
            fieldId: 'custentity_old_zee',
            value: $('#old_zee').attr('data-id')
          });
          console.log($('#old_zee').val());

          customerRecord.setValue({
            fieldId: 'custentity_old_customer',
            value: $('#old_cust').val()
          });
          console.log($('#old_cust').val());
        }

        customerRecord.setValue({
          fieldId: 'leadsource',
          value: $('#leadsource option:selected').val()
        });

        if (!isNullorEmpty($('#pricing_notes').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_customer_pricing_notes',
            value: $('#pricing_notes').val()
          });
        }


        if (!isNullorEmpty($('#ampo_price').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_ampo_service_price',
            value: $('#ampo_price').val()
          });
        }


        if (!isNullorEmpty($('#ampo_time option:selected').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_ampo_service_time',
            value: $('#ampo_time option:selected').val()
          });
        }


        if (!isNullorEmpty($('#pmpo_price').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_pmpo_service_price',
            value: $('#pmpo_price').val()
          });
        }


        if (!isNullorEmpty($('#pmpo_time option:selected').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_pmpo_service_time',
            value: $('#pmpo_time option:selected').val()
          });
        }


        if (!isNullorEmpty($('#min_b4').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_mpex_dl_float',
            value: $('#min_b4').val()
          });
        }


        if (!isNullorEmpty($('#min_c5').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_mpex_b4_float',
            value: $('#min_c5').val()
          });
        }


        if (!isNullorEmpty($('#min_dl').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_mpex_1kg_float',
            value: $('#min_dl').val()
          });
        }


        if (!isNullorEmpty($('#min_1kg').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_mpex_c5_float',
            value: $('#min_1kg').val()
          });
        }


        if (!isNullorEmpty($('#min_3kg').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_mpex_3kg_float',
            value: $('#min_3kg').val()
          });
        }


        if (!isNullorEmpty($('#min_5kg').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_mpex_5kg_float',
            value: $('#min_5kg').val()
          });
        }

        if (!isNullorEmpty($('#mpex_customer').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_mpex_customer',
            value: $('#mpex_customer').val()
          });
        }

        if (!isNullorEmpty($('#exp_usage').val())) {
          customerRecord.setValue({
            fieldId: 'custentity_exp_mpex_weekly_usage',
            value: $('#exp_usage').val()
          });
        }


        var customerRecordId = customerRecord.save({
          ignoreMandatoryFields: true
        });

        console.log('customerRecordId ' + customerRecordId)

        var customerRecordId = createUpdateCustomer(customerRecordId, 'T');

        return customerRecordId;

      } else {
        console.log("finished");
        return customer_id;
      }
    }


    /**
     * Validate Phone Number Fields
     * @param {*} val
     */
    function validatePhone(val) {

      var digits = val.replace(/[^0-9]/g, '');
      var australiaPhoneFormat =
        /^(\+\d{2}[ \-]{0,1}){0,1}(((\({0,1}[ \-]{0,1})0{0,1}\){0,1}[2|3|7|8]{1}\){0,1}[ \-]*(\d{4}[ \-]{0,1}\d{4}))|(1[ \-]{0,1}(300|800|900|902)[ \-]{0,1}((\d{6})|(\d{3}[ \-]{0,1}\d{3})))|(13[ \-]{0,1}([\d \-]{5})|((\({0,1}[ \-]{0,1})0{0,1}\){0,1}4{1}[\d \-]{8,10})))$/;
      var phoneFirst6 = digits.substring(0, 6);

      var message = null;

      //Check if all phone characters are numerals
      if (val != digits) {
        console.log('Contain Numbers only');
        message =
          'Phone numbers should contain numbers only.\n\nPlease re-enter the phone number without spaces or special characters.';
        return message;
      } else if (digits.length != 10) {
        console.log('10 Numbers only');
        //Check if phone is not blank, need to contains 10 digits
        message = 'Please enter a 10 digit phone number with area code.</br>';
        return message;
      } else if (!(australiaPhoneFormat.test(digits))) {
        console.log('Australian Format Numbers only');
        //Check if valid Australian phone numbers have been entered
        message =
          'Please enter a valid Australian phone number.\n\nNote: 13 or 12 numbers are not accepted';
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

      if (digit01 == digit02 && digit02 == digit03 && digit03 == digit04 &&
        digit04 == digit05 && digit05 == digit06 && digit06 == digit07 &&
        digit07 == digit08 && digit08 == digit09 && digit09 == digit10) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * Validate ABN
     * @param {*} str
     */
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



    function getDate(date) {
      //var date = new Date();
      format.format({
        value: date,
        type: format.Type.DATE,
        timezone: format.Timezone.AUSTRALIA_SYDNEY
      });

      return date;
    }

    function date2String(date) {
      //var date = new Date();
      format.format({
        value: date,
        type: format.Type.DATE,
      });


      return date;
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
    /**
     * Converts the date string in the "invoice_date" table to the format of "date_selected".
     * @param   {String}    invoice_date    ex: '4/6/2020'
     * @returns {String}    date            ex: '2020-06-04'
     */
    function dateCreated2DateSelectedFormat(invoice_date) {
      // date_created = '4/6/2020'
      var date_array = invoice_date.split('/');
      // date_array = ["4", "6", "2020"]
      var year = date_array[2];
      var month = date_array[1];
      if (month < 10) {
        month = '0' + month;
      }
      var day = date_array[0];
      if (day < 10) {
        day = '0' + day;
      }
      return year + '-' + month + '-' + day;
    }

    /**
     * @param   {Number} x
     * @returns {String} The same number, formatted in Australian dollars.
     */
    function financial(x) {
      if (typeof(x) === 'string') {
        x = parseFloat(x);
      }
      if (isNullorEmpty(x)) {
        return "$0.00";
      } else {
        return x.toLocaleString('en-AU', {
          style: 'currency',
          currency: 'AUD'
        });
      }
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

    function stringToDate(val) {
      return format.parse({
        value: val,
        type: format.Type.DATE
      })
    }

    function isNullorEmpty(strVal) {
      return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
        undefined || strVal == 'undefined' || strVal == '- None -');
    }

    return {
      pageInit: pageInit,
      saveRecord: saveRecord,
      onclick_SendEmail: onclick_SendEmail,
      onclick_back: onclick_back,
      onclick_SendReferralEmail: onclick_SendReferralEmail,
      onclick_InviteEmail: onclick_InviteEmail,
      onclick_InviteEmailU4: onclick_InviteEmailU4,
      onclick_SendInfo: onclick_SendInfo
    };
  }

);
