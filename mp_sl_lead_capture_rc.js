    /**
     * Module Description
     * 
     * NSVersion    Date                        Author         
     * 1.00         2019-03-27 10:04:32         ankith.ravindran
     *
     * Description: Lead Capture / Customer Details Page        
     * 
     * @Last Modified by:   Ankith
     * @Last Modified time: 2020-04-06 10:15:03
     *
     */


    var baseURL = 'https://1048144.app.netsuite.com';
    if (nlapiGetContext().getEnvironment() == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }