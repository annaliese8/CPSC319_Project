# Surrey Food Bank Appointment and Registration System

## Project Description
This web application allows prospective clients of The Surrey Food bank to book a registration appointment, and staff at the Surrey Food Bank to manage the appointments.

## Features
- Applicants can create an account, complete a registration form, and book an appointment
- Applicants can reschedule or cancel their appointments and edit their registration form
- Staff can access the application through a secure login portal
- Staff can easily view and manage appointments on a weekly calendar
- Staff can book, change, and cancel appointments on behalf of applicants
- Staff can browse and search a database of registered applicants
- Appointment time slots can be blocked by staff to mark unavailability

## Tech Stack
| Layer        | Technology           |
| :----------- | :---                 |
| Runtime*     | Node.js + Express.js |
| Language     | JavaScript           |
| Frontend     | Vite + React + MUI   |
| Database*    | PostgreSQL           |
| HTTP Client* | Axios / Fetch API    |
| CI/CD        | GitHub Actions       |
| Hosting      | GitHub Pages         |

*Not yet implemented. The app is temporarily using localStorage to store data.

## Quick Start

### Option 1: Visit the Deployed App
The app is hosted on GitHub Pages and can be accessed directly at:
[https://annaliese8.github.io/CPSC319_Project/](https://annaliese8.github.io/CPSC319_Project/)

### Option 2: Running Locally
> Requires Node.js v20+. Check with `node -v` or [download here](https://nodejs.org/en/download)

1. Clone the repository
```bash
   git clone https://github.com/annaliese8/CPSC319_Project.git
```
2. Navigate to the frontend folder
```bash
   cd surrey-foodbank/frontend
```
3. Install dependencies
```bash
   npm install
```
4. Set up environment variables
```bash
   touch .env
```
   Add the following to your `.env` file:
```
   VITE_STAFF_BASE=your_secret_url_base
   VITE_STAFF_USERNAME=your_staff_username
   VITE_STAFF_PASSWORD=your_staff_password
```
5. Start the development server
```bash
   npm run dev
```
6. Visit the app:
   - **Applicant side:** [http://localhost:5173/CPSC319_Project/](http://localhost:5173/CPSC319_Project/)
   - **Staff side:** `http://localhost:5173/CPSC319_Project/#/{VITE_STAFF_BASE}/login`

## Testing
Navigate to the frontend folder and run:
```bash
npm run test
```

## Development Team
Our team is named **AllCookiesNoCash**! We are creating this project as part of our CPSC 319 Software Engineering Project course at the University of British Columbia. All members of our five-person team equally contribute to development, but our official roles for the course are as follows:
| Name                   | Role |
| :--------------------- | :--------------- |
| Mehrshad Esmaeilzadeh  | Project Manager  |
| Annaliese Ferchau      | Client Liaison   |
| Ishan Singh            | QA Tester        |
| Nina Trochtchanovitch  | Graphic Designer |
| Kathrina Pillay        | Technical Writer |

## AI Disclosure
Generative AI tools were used to suggest code snippets and debugging ideas. The team reviewed all output, adapted it to our codebase, and validated it through testing and code review.
