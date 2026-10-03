# Hostel Management System — Full-Stack Development Prompt

Build a complete, modern, responsive **Hostel Management System** for college students and hostel staff.

The system must be production-style, role-based, secure, responsive and easy to maintain.

## 1. Technology Stack

### Frontend
- React.js
- Vite
- React Router
- Tailwind CSS
- Axios
- Recharts for analytics
- Responsive design for desktop, tablet and mobile

### Backend
- Node.js
- Express.js
- REST APIs
- Middleware for authentication and authorization

### Database / Backend Services
- Supabase
- Supabase PostgreSQL database
- Supabase Authentication
- Supabase Storage for images
- Supabase Row Level Security (RLS)

### Payment
- UPI payment integration
- Support online payment status verification
- Support manual cash payment

### Development
- Git
- GitHub
- Environment variables
- Clean component architecture
- Error handling
- Form validation
- Loading states
- Empty states
- Toast notifications

---

# 2. User Roles

Create five main user roles plus Admin.

1. Student
2. Problem Solving Worker
3. Laundry & Item Worker
4. Cook / Chef
5. Accountant / Payment Collection Worker
6. Admin

Each role must have a separate dashboard and permissions.

Use Role-Based Access Control (RBAC).

A user must never be able to access another role's dashboard by manually changing the URL.

Example routes:

- Student: `/student/dashboard`
- Problem Worker: `/worker/problems`
- Laundry Worker: `/worker/laundry`
- Cook: `/cook/dashboard`
- Accountant: `/accountant/dashboard`
- Admin: `/admin/dashboard`

---

# 3. Authentication

Create a complete authentication system.

Pages:
- Login
- Student Registration
- Forgot Password
- Reset Password
- Profile

Use Supabase Authentication.

After login, retrieve the user's role from the users/profile table and redirect them to the correct dashboard.

Store:
- User ID
- Name
- Email
- Phone
- Room Number
- Role
- Account status
- Created date

Account status:
- Active
- Inactive
- Blocked

Blocked/inactive users must not be allowed to use the system.

---

# 4. Student Dashboard

Create a modern student dashboard.

Display:
- Student name
- Room number
- Notifications
- Pending problems
- Laundry status
- Item requests
- Food menu
- Electricity bill
- Pending hostel fees

Dashboard cards:
- My Problems
- My Laundry
- My Item Requests
- Electricity Bill
- Hostel Fees
- Food Menu

---

# 5. Hostel Problem Management

Students must be able to report hostel problems.

## Student Problem Form

Fields:
- Room Number
- Problem Category
- Problem Description
- Optional Image
- Priority

Categories:
- Electrical
- Plumbing
- Fan
- Light
- AC
- Furniture
- Bathroom
- Water
- Internet
- Other

Priority:
- Low
- Medium
- High
- Emergency

Student clicks **Submit Problem**.

## Problem Worker Dashboard

Display all assigned/reported problems.

Columns:
- Problem ID
- Student
- Room Number
- Category
- Description
- Priority
- Image
- Created Date
- Status
- Actions

Status flow:

`Pending -> Accepted -> In Progress -> Solved -> Student Confirmation -> Closed`

Worker can:
- Accept problem
- Start work
- Update progress
- Mark as solved
- Add worker note
- Upload completion image

When worker marks a problem as solved, notify the student.

## Student Confirmation

When status becomes `Solved`, student sees:

- Problem Solved / Confirm
- Problem Not Solved

If confirmed:

`Solved -> Closed`

If not solved:

`Solved -> Reopened`

The problem must appear again in the worker dashboard.

Student can add a reason when reopening.

Maintain complete problem history.

---

# 6. Hostel Item Request Management

Students can request hostel items.

Example items:
- Bucket
- Pillow
- Bedsheet
- Mattress
- Blanket
- Chair
- Table
- Hanger
- Dustbin
- Other

Form:
- Room Number
- Item Name
- Quantity
- Reason
- Optional Image

Worker dashboard:
- Request ID
- Room
- Student
- Item
- Quantity
- Reason
- Status
- Date
- Actions

Status:

`Pending -> Accepted -> Preparing -> Delivered -> Student Confirmed`

When delivered, notify the student.

Student must click **Confirm Received**.

After confirmation:

`Delivered -> Completed`

---

# 7. Laundry Management

The Laundry Worker manages student clothes.

## Laundry Collection

Worker enters:
- Room Number
- Student
- Clothes details
- Quantity
- Collection date
- Collection time
- Clothes photograph

Example:
- T-Shirt: 2
- Shirt: 3
- Pant: 2
- Jeans: 1

The photograph must be uploaded to Supabase Storage.

Store the image URL in the database.

## Laundry Status

`Collected -> Washing -> Ready -> Delivered -> Student Confirmed -> Completed`

Worker can update status.

When clothes are delivered, the Student Dashboard must display:
- Laundry ID
- Room
- Collection date
- Clothes list
- Clothes photo
- Delivery date
- Status

Student clicks **Confirm Received**.

After confirmation:

`Delivered -> Completed`

Maintain laundry history.

---

# 8. Cook / Chef Management

The Cook manages daily food menus.

## Cook Dashboard

Allow cook to create/update:
- Breakfast
- Lunch
- Dinner

Example:
- Breakfast: Poha + Tea
- Lunch: Dal + Rice + Roti + Sabji
- Dinner: Paneer + Roti + Dal

Menu fields:
- Date
- Breakfast
- Lunch
- Dinner
- Special notes

Students must see today's menu automatically on their dashboard.

Students should also be able to view previous menus.

---

# 9. Food Query and Complaint System

Students can submit:
- Food Query
- Food Complaint
- Food Suggestion

Fields:
- Type
- Message
- Optional Image

The complaint automatically appears on the Cook Dashboard.

Cook can:
- View complaint
- Add response
- Mark as In Progress
- Mark as Resolved

Status:

`Pending -> In Progress -> Resolved -> Closed`

Students can view the cook's response.

---

# 10. Accountant / Payment Collection Worker

Create a separate **Accountant Dashboard**.

This worker manages:
1. Monthly electricity bills
2. Student hostel fees
3. Online UPI payments
4. Cash payments
5. Payment history
6. Pending balances

---

# 11. Electricity Bill Management

The Accountant can create monthly electricity bills.

Fields:
- Student
- Room Number
- Billing Month
- Electricity Units
- Amount
- Due Date
- Status

Example:
- Room: 205
- Month: October 2026
- Units: 82
- Electricity Bill: ₹640
- Due Date: 10/10/2026
- Status: Pending

Student Dashboard:

- Electricity Bill
- Billing Month
- Amount
- Due Date
- Status
- Pay Now button

Students should only see their own bills.

---

# 12. UPI Online Payment

Implement an integrated UPI payment flow.

Student clicks **Pay Now**.

Display:
- Electricity Bill
- Amount
- UPI payment option
- Cash payment option

For UPI:
- Create a payment transaction
- Generate/use UPI payment flow
- Store transaction ID
- Store payment amount
- Store student ID
- Store bill ID
- Store timestamp
- Verify payment status on the backend
- Do not trust payment status directly from the frontend
- Update bill status only after successful verification

Successful payment:

`Pending -> Payment Completed`

Display:
- Payment Successful
- Transaction ID
- Amount
- Date

Provide a printable/downloadable payment receipt.

---

# 13. Cash Payment

Students who want to pay by cash can give payment to the Accountant.

The Accountant Dashboard must provide **Mark Cash Payment**.

Fields:
- Student
- Room Number
- Bill
- Amount
- Payment Date
- Payment Note

After confirmation:

- Payment Method: Cash
- Status: Payment Completed

The accountant must be able to see who paid by cash and who paid online.

---

# 14. Payment Dashboard

Create a complete Accountant Dashboard.

Cards:
- Total Students
- Total Fees
- Total Collected
- Total Pending
- Electricity Bills
- Pending Electricity Bills
- Online Payments
- Cash Payments

Example:
- Total Fees: ₹8,50,000
- Collected: ₹6,80,000
- Pending: ₹1,70,000
- Electricity Bills: ₹75,000
- Collected: ₹61,000
- Pending: ₹14,000

Add charts using Recharts:
- Monthly collection
- Pending fees
- Online vs Cash
- Electricity bill collection
- Student payment history

---

# 15. Student Fee Management

Accountant must manage student hostel fee records.

For every student store:
- Student
- Room Number
- Total Fees
- Amount Paid
- Pending Balance
- Due Date
- Payment Status

Formula:

`Pending Balance = Total Fees - Amount Paid`

Statuses:
- Paid
- Partially Paid
- Pending
- Overdue

Student Dashboard should display:
- Total Fees
- Paid
- Pending
- Status

---

# 16. Payment History

Student can view only their own payment history.

Example:

| Date | Type | Amount | Method |
|---|---|---:|---|
| 01/08/26 | Hostel Fee | ₹10,000 | UPI |
| 01/09/26 | Hostel Fee | ₹10,000 | Cash |
| 03/10/26 | Electricity | ₹640 | UPI |

Accountant can view all students' payment records.

Add filters:
- Student
- Room
- Date
- Payment type
- Payment method
- Status

---

# 17. Admin Dashboard

Admin has complete system control.

Dashboard:
- Total Students
- Total Workers
- Active Workers
- Pending Problems
- Pending Laundry
- Pending Item Requests
- Food Complaints
- Pending Fees
- Pending Electricity Bills
- Total Collection

Admin can manage:

### Students
- Add
- Edit
- Delete
- Block
- Activate
- View

### Workers
- Add
- Edit
- Disable
- Assign role

Worker roles:
- Problem Worker
- Laundry & Item Worker
- Cook
- Accountant

Admin can also manage:
- Rooms
- Hostel buildings
- Fee structure
- Item list
- Problem categories
- System settings

---

# 18. Notification System

Create a notification system.

Student notifications:
- Problem solved
- Laundry collected
- Laundry delivered
- Item delivered
- Food menu updated
- Food complaint resolved
- Electricity bill generated
- Payment successful
- Fee reminder

Worker notifications:
- New problem
- New item request
- New laundry request
- New food complaint
- New payment/cash request

Use Supabase real-time functionality where appropriate.

---

# 19. Database Tables

Create a properly normalized Supabase PostgreSQL database.

Suggested tables:

- profiles
- rooms
- problems
- problem_updates
- item_requests
- laundry_orders
- laundry_items
- food_menus
- food_complaints
- electricity_bills
- hostel_fees
- payments
- notifications
- worker_assignments
- audit_logs

Use foreign keys and indexes properly.

---

# 20. Supabase Storage

Create storage buckets for:
- problem-images
- laundry-images
- item-images
- payment-receipts
- profile-images

Do not expose private files publicly unless required.

Use secure access policies.

---

# 21. Supabase Row Level Security

Implement RLS carefully.

Students can:
- Read their own profile
- Read/create their own problems
- Read their own laundry records
- Read/create their own item requests
- Read food menus
- Create/read their own food complaints
- Read their own electricity bills
- Read their own fees
- Read their own payments
- Read their own notifications

Workers can access only records required for their assigned role.

Admin has full authorized access.

Never rely only on frontend role checking.

---

# 22. API Structure

Create clean REST APIs.

Examples:

```text
POST   /api/auth/profile

GET    /api/problems
POST   /api/problems
GET    /api/problems/:id
PATCH  /api/problems/:id
POST   /api/problems/:id/reopen

GET    /api/items/requests
POST   /api/items/requests
PATCH  /api/items/requests/:id

GET    /api/laundry
POST   /api/laundry
PATCH  /api/laundry/:id

GET    /api/menu
POST   /api/menu
PATCH  /api/menu/:id

GET    /api/food-complaints
POST   /api/food-complaints
PATCH  /api/food-complaints/:id

GET    /api/electricity-bills
POST   /api/electricity-bills
PATCH  /api/electricity-bills/:id

GET    /api/fees
POST   /api/fees
PATCH  /api/fees/:id

POST   /api/payments/create
POST   /api/payments/verify
POST   /api/payments/cash

GET    /api/payments/history

GET    /api/notifications
PATCH  /api/notifications/:id/read
```

---

# 23. Security Requirements

Implement:
- Supabase authentication
- Role-based authorization
- Supabase RLS
- Input validation
- API validation
- File type validation
- File size validation
- Secure environment variables
- No secret keys in frontend
- Payment verification on backend
- Error handling
- Rate limiting where appropriate
- Audit logging for important actions

Never expose:
- `SUPABASE_SERVICE_ROLE_KEY`
- Payment secret keys
- Private API keys

in frontend code.

---

# 24. UI Design

Create a professional college-hostel management UI.

Style:
- Modern
- Clean
- Professional
- Responsive
- Easy navigation
- Sidebar dashboard
- Cards
- Tables
- Modals
- Status badges
- Search
- Filters
- Pagination
- Toast notifications

Do not make the UI look like a basic college CRUD project.

---

# 25. Dashboard Sidebars

## Student
- Dashboard
- My Problems
- Item Requests
- Laundry
- Food Menu
- Food Complaints
- Electricity Bill
- Hostel Fees
- Payment History
- Notifications
- Profile
- Logout

## Problem Worker
- Dashboard
- Problems
- Pending
- In Progress
- Solved
- History
- Notifications
- Profile
- Logout

## Laundry/Item Worker
- Dashboard
- Laundry
- Item Requests
- Collected
- Washing
- Delivered
- History
- Notifications
- Profile
- Logout

## Cook
- Dashboard
- Today's Menu
- Menu History
- Food Queries
- Food Complaints
- Notifications
- Profile
- Logout

## Accountant
- Dashboard
- Electricity Bills
- Student Fees
- Payments
- Cash Payments
- Online Payments
- Pending Payments
- Reports
- Notifications
- Profile
- Logout

## Admin
- Dashboard
- Students
- Workers
- Rooms
- Problems
- Laundry
- Items
- Food
- Electricity Bills
- Fees
- Payments
- Reports
- Notifications
- Settings
- Logout

---

# 26. Reports

Admin and Accountant should be able to generate reports.

Reports:
- Monthly fee collection
- Electricity collection
- Pending payments
- Student payment history
- Problem resolution report
- Laundry report
- Food complaint report
- Worker activity report

Allow CSV/PDF export where appropriate.

---

# 27. Audit Log

Create an audit log for important actions.

Examples:
- Admin created student
- Accountant updated electricity bill
- Worker solved problem
- Student reopened problem
- Laundry worker marked clothes delivered
- Student confirmed laundry
- Accountant marked cash payment completed
- Cook updated food menu

Store:
- user_id
- action
- entity
- entity_id
- timestamp

---

# 28. Important Business Rules

1. Students can only see their own personal records.
2. Students cannot change payment status themselves.
3. Students cannot mark a bill as paid.
4. Online payment status must be verified server-side.
5. Cash payments can only be marked completed by the Accountant.
6. Only the Problem Worker can change problem worker statuses.
7. Students can reopen a solved problem if it was not actually solved.
8. Only the Laundry Worker can update laundry operational statuses.
9. Students must confirm laundry delivery.
10. Only the Cook can update the food menu.
11. Students can submit food queries/complaints.
12. Only the Accountant can manage fee and bill records.
13. Admin can manage users and worker roles.
14. Every important status change should be recorded.
15. Notifications should be generated when important statuses change.

---

# 29. Folder Structure

Use a clean scalable structure:

```text
hostel-management/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── problem-worker/
│   │   │   ├── laundry-worker/
│   │   │   ├── cook/
│   │   │   ├── accountant/
│   │   │   └── admin/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

# 30. Development Order

Build the project in this order:

### Phase 1
Authentication + Supabase setup

### Phase 2
User roles + RBAC + protected routes

### Phase 3
Student dashboard

### Phase 4
Problem management

### Phase 5
Item request management

### Phase 6
Laundry management + image upload

### Phase 7
Cook + food menu + complaints

### Phase 8
Accountant + electricity bills

### Phase 9
Hostel fee management

### Phase 10
UPI payment + cash payment

### Phase 11
Notifications + real-time updates

### Phase 12
Admin dashboard + analytics

### Phase 13
Reports + audit logs

### Phase 14
Testing + security + responsive UI

### Phase 15
Deployment

---

# 31. Final Requirement

Do not create a simple demo or static UI.

Build the application as a **real-world full-stack Hostel Management System** with:

- Real database
- Real authentication
- Real role-based authorization
- Real CRUD operations
- Real image uploads
- Real payment workflow
- Real payment records
- Real status workflows
- Real notifications
- Real dashboards
- Responsive UI
- Proper error handling
- Secure Supabase RLS
- Production-ready architecture

First create the database schema and authentication architecture, then implement backend APIs, and finally build the React dashboards.

Make every feature functional end-to-end rather than creating buttons that only change frontend state.
