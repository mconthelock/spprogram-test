// @ts-check
import { test, expect } from "@playwright/test";
import path from "path";

test("has title", async ({ browser, page }) => {
  await page.goto("http://localhost:8080/spprogram/mar/inquiry/create/");
  await page.locator("#project-no").fill("SAJ-4918");
  await page.locator("#project-no").blur();
  await page.locator("#inquiry-no").fill("T-MLS-25-A001");
  await page.locator("#inquiry-no").blur();

  await page.locator("#addRowBtn").click();

  await page.locator(".carno").fill("01");
  await page.locator(".carno").blur();
  await page.waitForTimeout(1000);

  await page.locator(".itemno").fill("101");
  await page.locator(".itemno").blur();
  await page.waitForTimeout(1000);
  //Elmes Table
  await page.locator("#select-dt-rows-all").click();
  //   await page.waitForTimeout(1000);
  await page.locator("#elmes-confirm").click();
  //await page.locator("#elmes-cancel").click();
  //await expect(page).toHaveTitle(/SP Program/);
  await page.pause();
});

test("Upload tsv file", async ({ browser, page }) => {
  await page.goto("http://localhost:8080/spprogram/mar/inquiry/create/");
  //await page.locator("#uploadRowBtn").click();
  const fileInput = await page.locator("#import-tsv");
  await fileInput.setInputFiles(
    path.resolve(__dirname, "Import_inquiry_template.xlsx")
  );
  await page.pause();
});
