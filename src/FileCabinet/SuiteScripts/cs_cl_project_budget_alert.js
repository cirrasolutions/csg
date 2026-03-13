/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(["N/search", "N/currentRecord", "N/ui/dialog"], function (
  search,
  currentRecord,
  dialog,
) {
  function getBudgetAmount(itemId, project) {
    var categoryIds = [];

    // STEP 1 - Get categories for project
    var catSearch = search.create({
      type: "customrecord_budget_category",
      filters: [
        [
          "custrecord_bud_cat_parent_project_budget.custrecord_prj_bud_project",
          "anyof",
          project,
        ],
      ],
      columns: ["internalid"],
    });

    catSearch.run().each(function (res) {
      categoryIds.push(res.getValue("internalid"));
      return true;
    });

    if (categoryIds.length === 0) return 0;

    var budgetAmount = 0;

    // STEP 2 - Get budget amount
    var budgetSearch = search.create({
      type: "customrecord_budget_line",
      filters: [
        ["custrecord_budget_item", "anyof", itemId],
        "AND",
        ["custrecord_budget_category", "anyof", categoryIds],
      ],
      columns: ["custrecord_budget_amount"],
    });

    budgetSearch.run().each(function (result) {
      budgetAmount = result.getValue("custrecord_budget_amount");
      return false;
    });

    return Number(budgetAmount);
  }

  function validateLine(context) {
    if (context.sublistId !== "item") return true;

    var rec = currentRecord.get();

    var itemId = rec.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "item",
    });

    var amount = rec.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "amount",
    });

    var project = rec.getValue({
      fieldId: "custbody_sd_kh_project",
    });

    if (!itemId || !project) return true;

    var budgetAmount = getBudgetAmount(itemId, project);

    if (budgetAmount && amount > budgetAmount) {
      dialog.alert({
        title: "Budget Exceeded",
        message:
          "PO item exceeds the defined project budget." +
          "<br>" +
          "Budget Amount : " +
          budgetAmount +
          "<br>" +
          "Current PO Line Amount : " +
          amount,
      });

      return false;
    }

    return true;
  }

  function saveRecord(context) {
    var rec = currentRecord.get();

    var project = rec.getValue({
      fieldId: "custbody_sd_kh_project",
    });

    if (!project) return true;

    var lineCount = rec.getLineCount({
      sublistId: "item",
    });

    var exceededLines = []; // ARRAY TO STORE FAILED LINES

    for (var i = 0; i < lineCount; i++) {
      var itemId = rec.getSublistValue({
        sublistId: "item",
        fieldId: "item",
        line: i,
      });

      var amount = rec.getSublistValue({
        sublistId: "item",
        fieldId: "amount",
        line: i,
      });

      var budgetAmount = getBudgetAmount(itemId, project);

      if (budgetAmount && amount > budgetAmount) {
        exceededLines.push(
          "Line " +
            (i + 1) +
            " | Budget: " +
            budgetAmount +
            " | PO Line Amount: " +
            amount,
        );
      }
    }

    // IF ANY LINES FAILED
    if (exceededLines.length > 0) {
      dialog.alert({
        title: "Budget Exceeded",
        message:
          "Budget exceeded for the following lines:" +
          "<br><br>" +
          exceededLines.join("<br>"),
      });

      return false;
    }

    return true;
  }

  return {
    validateLine: validateLine,
    saveRecord: saveRecord,
  };
});
