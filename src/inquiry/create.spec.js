// @ts-check
import { test, expect } from "@playwright/test";
import path from "path";

test.skip("Create inquiry", async ({ browser, page }) => {
  await page.goto("http://localhost:8080/spprogram/mar/inquiry/create/");
  await page.locator("#project-no").fill("SAJ-4918");
  await page.locator("#project-no").blur();
  await expect(page.getByRole("textbox", { name: "Project Name" })).toHaveValue(
    "SAD AL AMMAR BUILDING - MAKKAH"
  );
  await page.locator("#inquiry-no").fill("T-MLS-25-A001");
  await page.locator("#inquiry-no").blur();
  await expect(page.locator("#select2-trader-container")).toContainText(
    "MELCO"
  );
  await page.locator("#addRowBtn").click();
  await page.locator(".carno").first().fill("01");
  await page.locator(".carno").first().blur();
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".mfgno").first()).toContainText("EX2H20010");

  await page.locator(".itemno").first().fill("101");
  await page.locator(".itemno").first().blur();
  await page.waitForLoadState("networkidle");

  await page.locator("#select-dt-rows-all").click();
  await page.locator("#elmes-confirm").click();
  await page.locator("#send-de").click();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#inquiry-title")).toContainText("T-MLS-25-A001");
  await page.pause();
});

test.skip("Upload tsv file", async ({ browser, page }) => {
  await page.goto("http://localhost:8080/spprogram/mar/inquiry/create/");
  const fileInput = await page.locator("#import-tsv");
  await fileInput.setInputFiles(
    path.resolve(__dirname, "file/Import_inquiry_template.xlsx")
  );
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("textbox", { name: "Project No" })).toHaveValue(
    "GR251-25A"
  );
  await expect(page.getByRole("textbox", { name: "Project Name" })).toHaveValue(
    "Dionysiou Areopagitou house"
  );
  await expect(page.locator(".mfgno").first()).toContainText("EXS822014");
  await page.locator("#send-de").click();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#inquiry-title")).toContainText("T-MET-25-A0002");
});

test.skip("Create inquiry and attach file", async ({ browser, page }) => {
  await page.goto("http://localhost:8080/spprogram/mar/inquiry/create/");
  await page.locator("#project-no").fill("1580-3004(T)");
  await page.locator("#project-no").blur();
  await expect(page.getByRole("textbox", { name: "Project Name" })).toHaveValue(
    "BEIJING JIN GANG BUILDING"
  );
  await page.locator("#inquiry-no").fill("T-MLS-25-A003");
  await page.locator("#inquiry-no").blur();
  await expect(page.locator("#select2-trader-container")).toContainText(
    "MELCO"
  );
  await page.locator("#addRowBtn").click();
  await page.locator(".carno").first().fill("01");
  await page.locator(".carno").first().blur();
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".mfgno").first()).toContainText("EXCD85010");

  await page.locator(".itemno").first().fill("125");
  await page.locator(".carno").first().blur();
  await page.locator(".partname").first().fill("P1000-CO-105,18S/O");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.locator("#add-attachment").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([
    path.resolve(__dirname, "./file/Import_inquiry_template.xlsx"),
    path.resolve(__dirname, "./file/SP_AG-MELCO_R2025-1333_20250730190508.txt"),
  ]);
  await page.waitForLoadState("networkidle");
  await page.pause();
  await page.locator("#send-de").click();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#inquiry-title")).toContainText("T-MLS-25-A003");
});
// await page.pause();
