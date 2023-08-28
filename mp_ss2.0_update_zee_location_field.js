/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * Schedule Script to update the Franchisee Location field under the Operations tab in the customer record with the location of the franchisee.
 * 
 * @Last Modified by:   Ankith Ravindran
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/https', 'N/email', 'N/url'],
    function (runtime, search, record, log, task, currentRecord, format, https, email, url) {
        var zee = 0;
        var role = runtime.getCurrentUser().role;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.envType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        function main() {

            var today = new Date();
            today.setHours(today.getHours() + 17);

            //Search Name: Customer List - Signed - Update Franchisee Location Field
            var customerListSearch = search.load({
                id: 'customsearch_cust_list_zee_location_upda',
                type: 'customer',
            });

            var count = customerListSearch.runPaged().count;

            customerListSearch.run().each(function (searchResult) {

                var customer_id = searchResult.getValue('internalid');
                var zeeLocationID = searchResult.getValue({
                    name: "location",
                    join: "partner"
                });

                var customer_record = record.load({
                    type: record.Type.CUSTOMER,
                    id: customer_id,
                    isDynamic: true
                });

                customer_record.setValue({
                    fieldId: 'custentity_cust_zee_location',
                    value: zeeLocationID
                });

                var customerRecordId = customer_record.save({
                    ignoreMandatoryFields: true
                });

                var reschedule = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: 'customscript_ss2_upd_zee_location',
                    deploymentId: 'customdeploy1',
                    params: null
                });

                var reschedule_id = reschedule.submit();

                return true;
            });

        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            execute: main
        }
    }
);