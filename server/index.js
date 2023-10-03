import express from "express";
import { google } from "googleapis";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const clientEmail = process.env.CLIENT_EMAIL;

const sheet_id = process.env.SHEET_ID;

const privateKey = process.env.PRIVATE_KEY;

const prisma = new PrismaClient();
const client = new google.auth.JWT(clientEmail, null, privateKey, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

const sheets = google.sheets({ version: "v4", auth: client });

//add new user
app.post("/newUser", async (req, res) => {
  const { name, password, sheetName, sheetCreated } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        username: name,
      },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          username: name,
          password: hashedPassword,
          sheetName: sheetName,
          sheetCreated: sheetCreated,
        },
      });
      const createSheetRequest = {
        spreadsheetId: sheet_id,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      };
      await sheets.spreadsheets.batchUpdate(createSheetRequest);
      const initialRow = ["Date", "Detail", "Category", "Amount", "Type"];
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheet_id,
        range: `${sheetName}!A:E`,
        insertDataOption: "INSERT_ROWS",
        valueInputOption: "RAW",
        requestBody: {
          values: [initialRow],
        },
      });
      res.json(newUser);
    }
  } catch (error) {
    console.error("Error creating user account:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//check for existing user
app.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: userId,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//fetch data
app.get("/fetch-data/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const categoryResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: `${username}!C2:C`,
    });
    const amountResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: `${username}!D2:D`,
    });
    const typeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: `${username}!E2:E`,
    });
    const amountData = amountResponse.data.values.map(Number);
    const categoryData = categoryResponse.data.values.map(String);
    const typeData = typeResponse.data.values.map(String);
    const data = {};
    for (let i = 0; i < categoryData.length; i++) {
      const amount = parseFloat(amountData[i]);
      const category = categoryData[i];
      const type = typeData[i];
      if (!category || isNaN(amount) || amount === 0) {
        continue;
      }
      if (!data[category]) {
        data[category] = {};
      }
      if (!data[category][type]) {
        data[category][type] = [];
      }
      data[category][type].push(amount);
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//push data
app.post("/sheets/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const body = req.body;
    const rows = body.map((row) => [
      row.date,
      row.transactionDetail,
      row.category,
      parseFloat(row.amount),
      row.debitCredit,
    ]);
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheet_id,
      range: `${username}!A:E`,
      insertDataOption: "INSERT_ROWS",
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });
    res.json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
