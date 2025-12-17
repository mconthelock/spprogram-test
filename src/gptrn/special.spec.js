import path from "path";
import { test, expect } from "@playwright/test";
import { getTestData } from "../readexcel.js";

test("Create functional traning form", async ({ page }) => {
  const data = await getTestData(
    path.resolve(__dirname, "./file/functional.xlsx")
  );
  await page.goto(
    "http://amecwebtest.mitsubishielevatorasia.co.th/form/gpform/GP-TRN/training?sr=1&no=15&orgNo=030101&y=25&empno=12069&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/gpform/create.asp"
  );
  {
    await page
      .locator("#trainingList div")
      .filter({ hasText: "Support Specific" })
      .first()
      .click();

    await page.locator("#funcTrainingSubject").fill(data.Subject);
    await page.locator("#funcDateFrom").fill(data.From);
    await page.locator("#funcDateTo").fill(data.End);
    await page.locator("#funcLocation").fill(data.Location);
    await page.locator("#funcInstitute").fill(data.Institute);

    //Objective List
    const myObjectives = data.Objective;
    if (myObjectives !== undefined) {
      const objectiveList = page.locator("#funcObjectiveList");
      const addButton = objectiveList.locator("button.add-objective").first();
      const objectiveInputs = objectiveList.locator(
        'input[name="funcObjective[]"]'
      );

      if (typeof myObjectives === "string") {
        objectiveInputs.nth(0).fill(myObjectives);
      } else {
        for (let i = 0; i < myObjectives.length; i++) {
          const currentInput = objectiveInputs.nth(i);
          await currentInput.fill(myObjectives[i]);
          if (i < myObjectives.length - 1) {
            await addButton.click();
          }
        }
      }
    }

    //Benefit List
    const myBenefit = data.Benefit;
    if (myBenefit !== undefined) {
      const benefitList = page.locator("#funcExpectationList");
      const addButton2 = benefitList.locator("button.add-expectation").first();
      const benefitInputs = benefitList.locator(
        'input[name="funcExpectation[]"]'
      );

      if (typeof myBenefit === "string") {
        await benefitInputs.nth(0).fill(myBenefit);
      } else {
        for (let i = 0; i < myBenefit.length; i++) {
          const currentInput = benefitInputs.nth(i);
          await currentInput.fill(myBenefit[i]);
          if (i < myBenefit.length - 1) {
            await addButton2.click();
          }
        }
      }
    }

    await page.locator("#funcTraineeCode").fill(data.Trainee.toString());
    await page.waitForLoadState("networkidle");
    await page.locator("#funcJdName").fill(data.JdName || "");
    await page.locator("#funcJdRelation").fill(data.JdRelation);
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.locator("#funcJdFiles").click(),
    ]);
    await fileChooser.setFiles([path.resolve(__dirname, "./file/book1.xlsx")]);

    await page.locator('input[name="funcExpenseOption"]').first().check();
    await page.locator('input[name="funcReason"]').last().check();
    await page.locator("#funcAmountInput").fill(data.AmountInput.toString());
    await page.locator("#funcAmountNote").fill(data.AmountNote);

    const [fileChooserExtra] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.locator("#funcOtherFiles").click(),
    ]);

    await fileChooserExtra.setFiles([
      path.resolve(__dirname, "./file/book1.xlsx"),
    ]);
    await page.locator("#funcRemark").fill(data.Remark);
    await page.waitForLoadState("networkidle");
    // await page.pause();
    await page.locator("#sendFuncFormBtn").click();
    await page.pause();
  }
});
