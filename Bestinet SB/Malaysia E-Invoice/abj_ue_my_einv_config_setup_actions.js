/***************************************************************************************
 ** Copyright (c) 2020 ABJ Cloud Solutions, Inc.
 ** A1-13-2 Arcoris Business Suite, 10, Jalan Kiara, Mont Kiara, 50480 Kuala Lumpur, Malaysia
 ** All Rights Reserved.
 ** This software is the confidential and proprietary information of ABJ Cloud Solutions. ("Confidential Information").
 ** You shall not disclose such Confidential Information and shall use it only in accordance with the terms of the license agreement you entered into with ABJ Cloud Solutions.                   
 ***************************************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * Task          Date                Author                                         Remarks
 * doc status  04/07/2024      sayyad@abjcloudsolutions.com    
 */
define(['N/redirect','N/search','N/record'],

    function (redirect, search, record) {

        function beforeLoad(context) {
            try {
                if (context.type == "view") {
                    redirect.toSuitelet({
                        scriptId: "customscript_su_my_einv_con_setup",
                        deploymentId: "customdeploy_su_my_einv_con_setup",
                        parameters: {
                            custom_config_id: context.newRecord.id
                        }
                    });
                } else if (context.type == "create") {
                    redirect.toSuitelet({
                        scriptId: "customscript_su_my_einv_con_setup",
                        deploymentId: "customdeploy_su_my_einv_con_setup",
                        parameters: {
                            mode: "createnew"
                        }
                    });
                } else if (context.type == "edit") {
                    redirect.toSuitelet({
                        scriptId: "customscript_su_my_einv_con_setup",
                        deploymentId: "customdeploy_su_my_einv_con_setup",
                        parameters: {
                            mode: "edit",
                            custom_config_id: context.newRecord.id
                        }
                    });
                }

            } catch (ex) {
                log.error(ex.name, ex);
            }
        }

        function afterSubmit(context) {
            try {
                if (context.type == "create") {
                    var configSetupSearch = search.create({
                        type: 'customrecord_my_einv_con_setup',
                        columns: [
                            'internalid',
                            'custrecord_my_e_inv_clientid',
                            'custrecord_my_e_inv_client_secret',
                            'custrecord_my_e_inv_client_secret2',
                            'custrecord_my_e_invoice_base_url',
                            'custrecord_my_e_invoice_subsidiary',
                            'custrecord_my_e_inv_tin',
                            'custrecord_my_e_inv_brn',
                            'custrecord_my_e_inv_tin_validstatus'
                        ],
                        filters: []
                    }).run().getRange(0, 1000);
                    //get document status deployment creation for new subsidiary
                    var initialGetStatusDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_get_doc_status"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);

                    //get document status deployment creation for new subsidiary
                    var inProgressStatusDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_get_doc_inprgss"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);


                    //get document status deployment creation for new subsidiary
                    var submittedStatusDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_get_doc_submitted"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);

                    if(configSetupSearch.length == 1){
                        var initialStatusScriptRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:initialGetStatusDeploymentSearch[0].getValue("internalid")});
                        initialStatusScriptRec.setValue("custscript_einv_status_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        initialStatusScriptRec.save();

                        var inProgressStatusDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:inProgressStatusDeploymentSearch[0].getValue("internalid")});
                        inProgressStatusDeploymentRec.setValue("custscript_einv_status_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        inProgressStatusDeploymentRec.save();

                        var submittedStatusDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submittedStatusDeploymentSearch[0].getValue("internalid")});
                        submittedStatusDeploymentRec.setValue("custscript_einv_status_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submittedStatusDeploymentRec.save();
                    }else {
                        var initialStatusScriptRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:initialGetStatusDeploymentSearch[0].getValue("internalid")});
                        initialStatusScriptRec.setValue("custscript_einv_status_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        initialStatusScriptRec.setValue("status","NOTSCHEDULED");
                        initialStatusScriptRec.save();

                        var inProgressStatusDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:inProgressStatusDeploymentSearch[0].getValue("internalid")});
                        inProgressStatusDeploymentRec.setValue("custscript_einv_status_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        inProgressStatusDeploymentRec.setValue("status","NOTSCHEDULED");
                        inProgressStatusDeploymentRec.save();

                        var submittedStatusDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submittedStatusDeploymentSearch[0].getValue("internalid")});
                        submittedStatusDeploymentRec.setValue("custscript_einv_status_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submittedStatusDeploymentRec.setValue("status","NOTSCHEDULED");
                        submittedStatusDeploymentRec.save();
                    }


                    
                    //submit document deployment creation for new subsidiary
                    //invoice
                    var submitINVDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_submt_aprvd_inv"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);

                    //debit note
                    var submitDNDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_submt_aprvd_dn"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);

                    //credit note
                    var submitCNDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_submt_aprvd_cn"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);

                    //self billed invoice
                    var submitSBIDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_submt_aprvd_sbi"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);


                    //Refund note
                    var submitRFNDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_submt_aprvd_rn"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);


                    //self billed credit note
                    var submitSBCNDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_submt_aprvd_sbc"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);

                    //self billed Debit Note
                    var submitSBDNDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_submt_aprvd_sbd"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);

                    //self billed Refund Note
                    var submitSBRFNDeploymentSearch  = search.create({
                        type: "scriptdeployment",
                        filters: [
                            ["scriptid", "is", "customdeploy_mr_einv_submt_aprvd_sbr"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    }).run().getRange(0,1);


                    if(configSetupSearch.length == 1){
                        var submitINVDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submitINVDeploymentSearch[0].getValue("internalid")});
                        submitINVDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitINVDeploymentRec.save();

                        var submitDNDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submitDNDeploymentSearch[0].getValue("internalid")});
                        submitDNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitDNDeploymentRec.save();

                        var submitCNDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submitCNDeploymentSearch[0].getValue("internalid")});
                        submitCNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitCNDeploymentRec.save();

                        var submitSBIDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submitSBIDeploymentSearch[0].getValue("internalid")});
                        submitSBIDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitSBIDeploymentRec.save();

                        var submitRFNDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submitRFNDeploymentSearch[0].getValue("internalid")});
                        submitRFNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitRFNDeploymentRec.save();

                        var submitSBCNDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submitSBCNDeploymentSearch[0].getValue("internalid")});
                        submitSBCNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitSBCNDeploymentRec.save();

                        var submitSBDNDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submitSBDNDeploymentSearch[0].getValue("internalid")});
                        submitSBDNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitSBDNDeploymentRec.save();

                        var submitSBRFNDeploymentRec = record.load({type:record.Type.SCRIPT_DEPLOYMENT,id:submitSBDNDeploymentSearch[0].getValue("internalid")});
                        submitSBRFNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitSBRFNDeploymentRec.save();

                    }else {
                        var submitINVDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submitINVDeploymentSearch[0].getValue("internalid")});
                        submitINVDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitINVDeploymentRec.setValue("status","NOTSCHEDULED");
                        submitINVDeploymentRec.save();

                        var submitDNDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submitDNDeploymentSearch[0].getValue("internalid")});
                        submitDNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitDNDeploymentRec.setValue("status","NOTSCHEDULED");
                        submitDNDeploymentRec.save();

                        var submitCNDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submitCNDeploymentSearch[0].getValue("internalid")});
                        submitCNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitCNDeploymentRec.setValue("status","NOTSCHEDULED");
                        submitCNDeploymentRec.save();

                        var submitSBIDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submitSBIDeploymentSearch[0].getValue("internalid")});
                        submitSBIDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitSBIDeploymentRec.setValue("status","NOTSCHEDULED");
                        submitSBIDeploymentRec.save();

                        var submitRFNDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submitRFNDeploymentSearch[0].getValue("internalid")});
                        submitRFNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitRFNDeploymentRec.save();

                        var submitSBCNDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submitSBCNDeploymentSearch[0].getValue("internalid")});
                        submitSBCNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitSBCNDeploymentRec.save();

                        var submitSBDNDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submitSBDNDeploymentSearch[0].getValue("internalid")});
                        submitSBDNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitSBDNDeploymentRec.save();

                        var submitSBRFNDeploymentRec = record.copy({type:record.Type.SCRIPT_DEPLOYMENT,id:submitSBDNDeploymentSearch[0].getValue("internalid")});
                        submitSBRFNDeploymentRec.setValue("custscript_einv_submit_subsidiary",context.newRecord.getValue("custrecord_my_e_invoice_subsidiary"));
                        submitSBRFNDeploymentRec.save();
                    }

                }

            } catch (ex) {
                log.error(ex.name, ex);
            }
        }

        function beforeSubmit(context) {
            if (context.type == "create") {
                var configSetupSearch = search.create({
                    type: 'customrecord_my_einv_con_setup',
                    columns: [
                        'internalid',
                        'custrecord_my_e_inv_clientid',
                        'custrecord_my_e_inv_client_secret',
                        'custrecord_my_e_inv_client_secret2',
                        'custrecord_my_e_invoice_base_url',
                        'custrecord_my_e_invoice_subsidiary',
                        'custrecord_my_e_inv_tin',
                        'custrecord_my_e_inv_brn',
                        'custrecord_my_e_inv_tin_validstatus'
                    ],
                    filters: [
                        ["custrecord_my_e_invoice_subsidiary", "anyof", context.newRecord.getValue("custrecord_my_e_invoice_subsidiary")]
                    ]
                }).run().getRange(0, 1000);
                if (configSetupSearch.length > 1) {
                    throw {
                        name: "DUPLICATE_SUBSIDIARY_CONFIG_NOT_ALLOWED",
                        message: "Duplicate subsidiary not allowed to setup connection."
                    }
                }

                if (configSetupSearch.length == 50) {
                    throw {
                        name: "ONLY_50_SUBSIDIARYS_ARE_ALLOWED",
                        message: "You cannot add more than 50 subsidiaries to the connection."
                    }
                }
            }
        }

        return {
            beforeLoad: beforeLoad,
            afterSubmit: afterSubmit,
            beforeSubmit: beforeSubmit
        }
    }
)