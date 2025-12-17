import path from "path";
import { test, expect } from "@playwright/test";
import { getTestData } from "../readexcel.js";

test.skip("Create Legal  traning form", async ({ page }) => {
  const data = await getTestData(path.resolve(__dirname, "./file/legal.xlsx"));
  await page.goto(
    "http://amecwebtest.mitsubishielevatorasia.co.th/form/gpform/GP-TRN/training?sr=1&no=15&orgNo=030101&y=25&empno=12069&bp=http://webflow.mitsubishielevatorasia.co.th/formtest/gpform/create.asp"
  );
  {
    await page
      .locator("#trainingList div")
      .filter({ hasText: "Legal" })
      .first()
      .click();

    await page.locator("#legalTrainingSubject").fill(data.Subject);
    await page.locator("#legalDateFrom").fill(data.From);
    await page.locator("#legalDateTo").fill(data.End);
    await page.locator("#legalLocation").fill(data.Location);
    await page.locator("#legalInstitute").fill(data.Institute);
    await page.locator("#legalConcernLaw").fill(data.Law);

    //Objective List
    const myObjectives = data.Objective;
    if (myObjectives !== undefined) {
      const objectiveList = page.locator("#legalObjectiveList");
      const addButton = objectiveList.locator("button.add-objective").first();
      const objectiveInputs = objectiveList.locator(
        'input[name="legalObjective[]"]'
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
      const benefitList = page.locator("#legalExpectationList");
      const addButton2 = benefitList.locator("button.add-expectation").first();
      const benefitInputs = benefitList.locator(
        'input[name="legalExpectation[]"]'
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

    //ข้อมูลผู้เข้ารับการฝึกอบรม
    const trainee = data.Trainee;
    const addTraineeButton = page.locator("#add-participant");
    const traineeCode = page.locator('input[name="legalTraineecode[]"]');
    const traineeCost = page.locator('input[name="legalTraineecost[]"]');

    if (typeof trainee === "string") {
      await traineeCode.nth(0).fill(trainee);
      await traineeCost.nth(0).fill("520");
    } else {
      for (let t = 0; t < trainee.length; t++) {
        await traineeCode.nth(t).fill(String(trainee[t]));
        await traineeCost.nth(t).fill("520");
        if (t < trainee.length - 1) {
          await addTraineeButton.click();
        }
      }
    }
    await page.locator('input[name="legalExpenseOption"]').first().check();
    await page.locator('input[name="legalReason"]').nth(1).check();
    await page.locator("#legalReasonOtherText").fill(data.AmountNote || "");
    const remark =
      typeof data.Remark == "string" ? data.Remark : data.Remark[0];
    await page.locator("#legalRemark").fill(remark);
    await page.waitForLoadState("networkidle");
    await page.locator("#sendLegalFormBtn").click();
    await page.pause();
  }
});
