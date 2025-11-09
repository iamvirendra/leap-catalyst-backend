import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

const SHEET_ID = "1PrFGMJZ_b40_UE5XQDuJ25CpTUJY5ysbRKRRWDMUdnI";
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// ✅ 1. Initialize and authorize the service account
const auth = new google.auth.JWT({
  email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

await auth.authorize(); // 👈 REQUIRED STEP

// ✅ 2. Create sheets client
const sheets = google.sheets({ version: "v4", auth });

// ✅ 3. Route for submission
app.post("/submit", async (req, res) => {
  try {
    const data = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Apply!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          new Date().toLocaleString(),
          data.name,
          data.email,
          data.phone,
          data.linkedin,
          data.company,
          data.website,
          data.revenue,
          data.description,
          data.expectations,
          data.hearAbout,
          data.pitchDeck,
        ]],
      },
    });

    res.json({ success: true, message: "✅ Data saved" });
  } catch (error) {
    console.error("❌ Error saving to Sheets:", error);
    res.status(500).json({ success: false, message: "Failed to save data", error: error.message });
  }
});


app.post("/contact", async (req, res) => {
    try {
      const data = req.body;
  
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Contact!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            new Date().toLocaleString(),
            data.name,
            data.email,
            data.phone,
            data.company,
            data.website,
            data.revenue,
            data.message,
          ]],
        },
      });
  
      res.json({ success: true, message: "✅ Contact saved" });
    } catch (error) {
      console.error("❌ Error saving to Sheets:", error);
      res.status(500).json({ success: false, message: "Failed to save data", error: error.message });
    }
  });

app.get("/", (req, res) => res.send("Backend is running 🚀"));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
