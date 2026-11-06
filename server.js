// Sashi's Blood Bank — Express API connected to MySQL.
// Required tables: Donors, Blood_Stock, Blood_Requests.
const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "shashi18",
  database: process.env.DB_NAME || "BloodBankDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Ping endpoint: helps quickly check whether the API can reach MySQL.
app.get("/api/health", (req, res) => {
  db.query("SELECT 1 AS ok", (err) => {
    if (err) return res.status(503).json({ ok: false, message: "MySQL connection failed", detail: err.message });
    res.json({ ok: true, message: "API and MySQL are connected" });
  });
});

// GET all donors from MySQL.
app.get("/api/donors", (req, res) => {
  db.query("SELECT donor_id, donor_name, age, gender, blood_group, phone, city, last_donation_date FROM Donors ORDER BY donor_id DESC", (err, rows) => {
    if (err) {
      console.error("GET /api/donors:", err.message);
      return res.status(500).json({ message: "Could not read the Donors table. Check the table and database name.", detail: err.message });
    }
    res.json(rows);
  });
});

// POST a donor into MySQL using parameterized SQL.
app.post("/api/donors", (req, res) => {
  const donor_name = typeof req.body.donor_name === "string" ? req.body.donor_name.trim() : "";
  const age = Number(req.body.age);
  const gender = typeof req.body.gender === "string" && req.body.gender.trim() ? req.body.gender.trim() : null;
  const blood_group = typeof req.body.blood_group === "string" ? req.body.blood_group.trim().toUpperCase() : "";
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  const city = typeof req.body.city === "string" ? req.body.city.trim() : "";
  const lastDonation = typeof req.body.last_donation_date === "string" && req.body.last_donation_date ? req.body.last_donation_date : null;
  const validGroups = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);

  if (!donor_name || donor_name.length > 100 || !Number.isInteger(age) || age < 18 || age > 65 ||
      !validGroups.has(blood_group) || !phone || phone.length > 18 || !city || city.length > 50) {
    return res.status(400).json({ message: "Please check the name, age (18–65), blood group, phone, and city fields." });
  }
  if (lastDonation && !/^\d{4}-\d{2}-\d{2}$/.test(lastDonation)) {
    return res.status(400).json({ message: "Last donation date must use a valid date." });
  }

  const sql = `INSERT INTO Donors
    (donor_name, age, gender, blood_group, phone, city, last_donation_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [donor_name, age, gender, blood_group, phone, city, lastDonation], (err, result) => {
    if (err) {
      console.error("POST /api/donors:", err.message);
      return res.status(500).json({ message: "MySQL could not save this donor. Verify the Donors table columns.", detail: err.message });
    }
    res.status(201).json({ message: "Donor saved successfully to MySQL.", donor_id: result.insertId });
  });
});

// GET blood stock.
app.get("/api/blood-stock", (req, res) => {
  db.query("SELECT stock_id, blood_group, units_available, last_updated FROM Blood_Stock ORDER BY FIELD(blood_group, 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')", (err, rows) => {
    if (err) {
      console.error("GET /api/blood-stock:", err.message);
      return res.status(500).json({ message: "Could not read Blood_Stock. Verify table and column names.", detail: err.message });
    }
    res.json(rows);
  });
});

// GET blood requests.
app.get("/api/blood-requests", (req, res) => {
  db.query("SELECT request_id, patient_name, blood_group, units_required, hospital_name, request_date, request_status FROM Blood_Requests ORDER BY request_id DESC", (err, rows) => {
    if (err) {
      console.error("GET /api/blood-requests:", err.message);
      return res.status(500).json({ message: "Could not read Blood_Requests. Verify table and column names.", detail: err.message });
    }
    res.json(rows);
  });
});

// POST a blood request into MySQL.
app.post("/api/blood-requests", (req, res) => {
  const patient_name = typeof req.body.patient_name === "string" ? req.body.patient_name.trim() : "";
  const blood_group = typeof req.body.blood_group === "string" ? req.body.blood_group.trim().toUpperCase() : "";
  const units_required = Number(req.body.units_required);
  const hospital_name = typeof req.body.hospital_name === "string" && req.body.hospital_name.trim() ? req.body.hospital_name.trim() : null;
  const request_date = typeof req.body.request_date === "string" ? req.body.request_date : "";
  const validGroups = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
  if (!patient_name || patient_name.length > 100 || !validGroups.has(blood_group) ||
      !Number.isInteger(units_required) || units_required < 1 || units_required > 100 ||
      (hospital_name && hospital_name.length > 100) || !/^\d{4}-\d{2}-\d{2}$/.test(request_date)) {
    return res.status(400).json({ message: "Please enter valid patient, blood group, units, hospital, and request date." });
  }
  const sql = `INSERT INTO Blood_Requests
    (patient_name, blood_group, units_required, hospital_name, request_date, request_status)
    VALUES (?, ?, ?, ?, ?, 'Pending')`;
  db.query(sql, [patient_name, blood_group, units_required, hospital_name, request_date], (err, result) => {
    if (err) {
      console.error("POST /api/blood-requests:", err.message);
      return res.status(500).json({ message: "MySQL could not save this request. Verify Blood_Requests columns.", detail: err.message });
    }
    res.status(201).json({ message: "Blood request saved successfully.", request_id: result.insertId });
  });
});

app.listen(PORT, () => {
  console.log(`Sashi's Blood Bank server running at http://localhost:${PORT}`);
  db.query("SELECT 1", err => {
    if (err) console.error("MySQL connection check failed:", err.message);
    else console.log(`MySQL connected: database "${process.env.DB_NAME || "BloodBankDB"}"`);
  });
});
