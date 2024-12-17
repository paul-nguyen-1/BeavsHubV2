import { test } from "@playwright/test";
import { config } from "dotenv";
import { closeDB, connectDB } from "../mongo/mongo";

config();

test("mongo test suite", async ({ page }) => {
  const db = await connectDB();
  const collection = db.collection("courses");
  await page.goto(`${process.env.PORT}/courses/google-sheets/update`)
  await closeDB();
});
