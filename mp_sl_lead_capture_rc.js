    /**
     * Module Description
     * 
     * NSVersion    Date                        Author         
     * 1.00         2019-03-27 10:04:32         ankith.ravindran
     *
     * Description: Lead Capture / Customer Details Page        
     * 
     * @Last Modified by:   Raphael
     * @Last Modified time: 2020-04-07 15:25:00
     *
     */


    var baseURL = 'https://1048144.app.netsuite.com';
    if (nlapiGetContext().getEnvironment() == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }

    // Define variables here.

    function leadForm(request, response) {
        if (request.getMethod() == "GET") {
            var form = nlapiCreateForm('Lead Capture'); // See conditions before.
            // TODO : Get field values
            form.setScript('customscript_cl_lead_capture_rc');
            response.writePage(form);
        } else {
            // TODO : Sent field values
        }
    }