# Sashi's Blood Bank Management System — MySQL Connected

A responsive academic project using Node.js, Express, MySQL, HTML, CSS, and JavaScript.

## Features
- Home page with photo-led visual design
- Donor registration saved to MySQL `Donors`
- Donor directory loaded from MySQL with search and blood group filtering
- Blood stock page loaded from `Blood_Stock`
- Blood request form saved to `Blood_Requests`
- Dashboard counts and recent requests loaded from the database
- Express API uses parameterized SQL queries

## Folder structure
```text
Blood-Bank-Management-System/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── donors.html
│   ├── blood-stock.html
│   ├── blood-requests.html
│   ├── about.html
│   ├── css/style.css
│   ├── js/
│   └── images/
├── server.js
├── package.json
├── .env.example
└── README.md
```

## 1. Database
Run your existing SQL setup in MySQL Workbench. The server expects database `BloodBankDB` and these columns:

- `Donors(donor_id, donor_name, age, gender, blood_group, phone, city, last_donation_date)`
- `Blood_Stock(stock_id, blood_group, units_available, last_updated)`
- `Blood_Requests(request_id, patient_name, blood_group, units_required, hospital_name, request_date, request_status)`

If your table names or columns differ, update the queries in `server.js` to match.

## 2. Configure credentials
Copy `.env.example` to a new file named `.env`, then enter the actual local MySQL credentials. Never commit `.env` to GitHub.

Example:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=BloodBankDB
```

## 3. Install and start
Open a terminal in the main project folder:
```bash
npm install
npm start
```
Open `http://localhost:3000` in your browser. Do not open the HTML files directly with `file://`; use the Express server so the `/api/...` endpoints work.

## 4. Test database connection
Open `http://localhost:3000/api/health`. A successful response is:
```json
{"ok":true,"message":"API and MySQL are connected"}
```
If it fails, check MySQL service status, database name, `.env` credentials, and terminal error messages.

## 5. Verify a new donor
Register a donor in the UI, then run in MySQL Workbench:
```sql
USE BloodBankDB;
SELECT * FROM Donors ORDER BY donor_id DESC;
```
The new row should appear. The donor directory fetches data from `/api/donors`.

## Image assets
The design uses photo assets in `public/images/`. If supplied images are absent, the UI can still work but image sections may be blank. These images are for UI demonstration only.

## Scope and safety
This is a student project starter, not a production medical system. Staff authentication, role-based access, auditing, secure deployment, and medical workflows require further implementation. Do not use it for real blood-bank decisions.


## Included visual assets
The `public/images/` folder includes image assets prepared from an AI-generated Sashi's Blood Bank UI concept collage for this student-project demo. For a production or public deployment, replace these illustrative crops with licensed, standalone healthcare photographs.
