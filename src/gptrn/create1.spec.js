// @ts-check
import { test, expect } from "@playwright/test";
import path from "path";
const exceljs = require("exceljs");

/**
 * @typedef {Object} TestData
 * @property {string} Subject
 * @property {string} From
 * @property {string} End
 * @property {string} Location
 * @property {string} Institute
 * @property {string} Objective
 * @property {string} Benefit
 * @property {string} Trainee
 * @property {string} JdName
 * @property {string} JdRelation
 * @property {string} AmountInput
 * @property {string} AmountNote
 * @property {string} Remark
 */

/**
 * Reads test data from an Excel file
 * @param {string} filePath - Path to the Excel file
 * @param {number} [dataRow=2] - Row number to read data from
 * @returns {Promise<TestData>} Test data object
 */
async function getTestData(filePath, dataRow = 2) {
  let data = {};
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet("data");
  if (!worksheet) {
    throw new Error(`Sheet "data" not found in ${filePath}`);
  }

  const headers = worksheet.getRow(1).values;
  const row = worksheet.getRow(dataRow).values;

  const headersArray = Array.isArray(headers) ? headers : [];
  const rowArray = Array.isArray(row) ? row : [];
  for (let i = 1; i < headersArray.length; i++) {
    const header = String(headersArray[i]).trim();
    let value = rowArray[i];
    if (value instanceof Date) {
      value = value.toISOString().split("T")[0];
    }

    if (
      value &&
      typeof value === "object" &&
      "richText" in value &&
      value.richText
    ) {
      value = value.richText.map((rt) => rt.text).join("\n");
    }

    if (typeof value === "string") {
      // แปลงค่าที่มี \n ให้เป็น Array
      if (value.includes("\n")) {
        //data[header] = value.split("\n").filter(Boolean); // filter(Boolean)
        data = { ...data, [header]: value.split("\n").filter(Boolean) };
      } else {
        data = { ...data, [header]: value };
      }
    } else {
      //data[header] = value;
      data = { ...data, [header]: value };
    }
  }
  // @ts-ignore
  return data;
}

test("Create functional traning form via saft data", async ({ page }) => {
  const data = await getTestData(
    path.resolve(__dirname, "./file/TestData.xlsx")
  );
  await page.goto(
    "http://amecwebtest.mitsubishielevatorasia.co.th/form/gpform/GP-TRN/training?sr=1&no=15&orgNo=030101&y=25&empno=12069&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/gpform/create.asp"
  );
  //prettier-ignore
  {
    await page.locator("#trainingList div")
        .filter({ hasText: "📘 Support Specific" })
        .first().click();

    const funcform = await page.locator("#form_functional");
    await funcform.locator('#funcTrainingSubject').fill(data.Subject);
    await funcform.locator('#funcDateFrom').fill(data.From);
    await funcform.locator('#funcDateTo').fill(data.End);
    await funcform.locator('#funcLocation').fill(data.Location);
    await funcform.locator('#funcInstitute').fill(data.Institute);
    const myObjectives = data.Objective;
    const objectiveList = page.locator('#funcObjectiveList');
    const addButton = objectiveList.locator('button.add-objective').first();
    const objectiveInputs = objectiveList.locator('input[name="funcObjective[]"]');

    for (let i = 0; i < myObjectives.length; i++) {
        const currentInput = objectiveInputs.nth(i);
        await currentInput.fill(myObjectives[i]);
        if (i < myObjectives.length - 1) {
            await addButton.click();
        }
    }

    const myBenefit = data.Benefit;
    const benefitList = page.locator('#funcExpectationList');
    const addButton2 = benefitList.locator('button.add-expectation').first();
    const benefitInputs = benefitList.locator('input[name="funcExpectation[]"]');

    for (let i = 0; i < myBenefit.length; i++) {
        const currentInput = benefitInputs.nth(i);
        await currentInput.fill(myBenefit[i]);
        if (i < myBenefit.length - 1) {
            await addButton2.click();
        }
    }

    await funcform.locator('#funcTraineeCode').fill(data.Trainee.toString());
    await funcform.locator('#funcJdName').fill(data.JdName);
    await funcform.locator('#funcJdRelation').fill(data.JdRelation);

    const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        funcform.locator("#funcJdFiles").click()
    ]);
    await fileChooser.setFiles([
        path.resolve(__dirname, "./file/book1.xlsx")
    ]);

    await funcform.locator('input[name="funcExpenseOption"]').first().check();
    await funcform.locator('input[name="funcReason"]').last().check();
    await funcform.locator('#funcAmountInput').fill(data.AmountInput.toString());
    await funcform.locator('#funcAmountNote').fill(data.AmountNote);

    const [fileChooserExtra] = await Promise.all([
        page.waitForEvent('filechooser'),
        funcform.locator("#funcOtherFiles").click()
    ]);

    await fileChooserExtra.setFiles([
        path.resolve(__dirname, "./file/book1.xlsx")
    ]);
    await page.pause();
    await funcform.locator('#funcRemark').fill(data.Remark);
    await funcform.locator('#sendFuncFormBtn').click();
    await page.waitForLoadState("networkidle");
    }
  await page.pause();
});

test.skip("Create Legal traning form via saft data", async ({
  browser,
  page,
}) => {
  await page.goto(
    "http://amecwebtest.mitsubishielevatorasia.co.th/form/gpform/GP-TRN/training?sr=1&no=15&orgNo=030101&y=25&empno=12069&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/gpform/create.asp"
  );
  await page.locator("#trainingType").selectOption("legal");
  await page.getByRole("button", { name: "Go to Form" }).click();
  await page.getByRole("textbox", { name: "Request By" }).fill("12069");
  await page
    .getByRole("textbox", { name: "หัวข้อฝึกอบรม" })
    .fill("Lorem Ipsum");
  await page.locator("#legalDateFrom").fill("2026-01-01");
  await page.locator("#legalDateTo").fill("2025-01-02");
  await page
    .getByRole("textbox", { name: "สถานที่" })
    .fill("What is Lorem Ipsum");
  await page
    .getByRole("textbox", { name: "สถาบันฝึกอบรม" })
    .fill("Lorem Ipsum is simply dummy");
  await page.locator("#legalConcernLaw").fill("ชื่อกฎหมายที่เกี่ยวข้อง");
  await page
    .getByRole("textbox", { name: "ระบุวัตถุประสงค์" })
    .fill("ระบุวัตถุประสงค์");

  await page
    .locator("#legalObjectiveList")
    .getByRole("button", { name: "+" })
    .click();

  await page
    .getByRole("textbox", { name: "ระบุวัตถุประสงค์" })
    .nth(1)
    .fill("ระบุวัตถุประสงค์ 2");

  await page
    .locator("#legalObjectiveList")
    .getByRole("button", { name: "+" })
    .click();

  await page
    .getByRole("textbox", { name: "ระบุวัตถุประสงค์" })
    .nth(2)
    .fill("ระบุวัตถุประสงค์ 2");

  await page
    .getByRole("textbox", { name: "ระบุความคาดหวัง / ประโยชน์" })
    .fill("44444444");
  await page
    .locator("#legalExpectationList")
    .getByRole("button", { name: "+" })
    .click();
  await page
    .locator("#legalExpectationList")
    .getByRole("button", { name: "+" })
    .click();
  await page
    .locator("#legalExpectationList")
    .getByRole("button", { name: "+" })
    .click();
  await page
    .locator("#legalExpectationList")
    .getByRole("button", { name: "+" })
    .click();
  await page
    .locator("#legalExpectationList")
    .getByRole("button", { name: "+" })
    .click();
  await page
    .getByRole("textbox", { name: "ระบุความคาดหวัง / ประโยชน์" })
    .nth(1)
    .fill("44444444");
  await page
    .getByRole("textbox", { name: "ระบุความคาดหวัง / ประโยชน์" })
    .nth(2)
    .fill("44444444");
  await page
    .getByRole("textbox", { name: "ระบุความคาดหวัง / ประโยชน์" })
    .nth(3)
    .fill("44444444");
  await page
    .getByRole("textbox", { name: "ระบุความคาดหวัง / ประโยชน์" })
    .nth(4)
    .fill("44444444");
  await page
    .getByRole("textbox", { name: "ระบุความคาดหวัง / ประโยชน์" })
    .nth(5)
    .fill("44444444");
  await page.getByRole("button", { name: "+ เพิ่มผู้เข้าอบรม" }).click();
  await page.getByRole("button", { name: "+ เพิ่มผู้เข้าอบรม" }).click();
  await page.getByRole("button", { name: "+ เพิ่มผู้เข้าอบรม" }).click();
  await page.getByRole("button", { name: "+ เพิ่มผู้เข้าอบรม" }).click();

  await page.getByRole("textbox", { name: "รหัส" }).nth(0).fill("15111");
  await page.getByRole("textbox", { name: "รหัส" }).nth(1).fill("12069");
  await page.getByRole("textbox", { name: "รหัส" }).nth(2).fill("15234");
  await page.getByRole("textbox", { name: "รหัส" }).nth(3).fill("15199");
  await page.getByRole("textbox", { name: "รหัส" }).nth(4).fill("24008");

  await page.getByRole("radio", { name: "ไม่มีการเปรียบเทียบราคา" }).check();
  await page.getByRole("radio", { name: "เหตุผลอื่น:" }).check();
  await page
    .locator("#legalReasonText")
    .fill(
      "It is a long established fact that a reader will be distracted by the readable content of a page"
    );
  await page.locator("#legalAmountInput").fill("0");
  await page.getByRole("button", { name: "📤 Send Form" }).click();
  await page.waitForLoadState("networkidle");
  await page.pause();
  //     const fileChooserPromise = page.waitForEvent("filechooser");
  //   const fileChooser = await fileChooserPromise;
});
