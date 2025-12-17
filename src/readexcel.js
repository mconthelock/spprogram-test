const exceljs = require("exceljs");
export async function getTestData(filePath, dataRow = 2) {
  let data = {};
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet("data");
  if (!worksheet) {
    throw new Error(`Sheet "data" not found in ${filePath}`);
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const key = row.getCell(1).value;
    let value = row.getCell(2).value;
    if (!key) return;

    const keyStr = String(key).trim();
    // Handle Date values
    if (value instanceof Date) {
      value = value.toISOString().split("T")[0];
    }

    // Handle rich text
    if (
      value &&
      typeof value === "object" &&
      "richText" in value &&
      value.richText
    ) {
      value = value.richText.map((rt) => rt.text).join("\n");
    }

    // Handle string values with newlines
    if (typeof value === "string") {
      if (value.includes("\n")) {
        data[keyStr] = value.split("\n").filter(Boolean);
      } else {
        data[keyStr] = value;
      }
    } else {
      data[keyStr] = value;
    }
  });
  return data;
}
