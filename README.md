🍽️ Smart Canteen — Pre-Order System

Skip the queue. Order ahead. Pick up when it's ready.

A full-stack web application that digitises college canteen ordering — students pre-order food from their phones, kitchen staff manage orders in real time, and a display board shows token numbers when food is ready.
📱 What It Does
ScreenWho Uses ItPurposeindex.htmlStudentsBrowse menu, add to cart, pay online or cash, get token numberadmin.htmlCanteen OwnerRevenue stats, all orders, menu editor, PIN-protectedkitchen.htmlKitchen StaffLive incoming orders, mark as preparing / ready, PIN-protecteddisplay.htmlEveryoneBig screen showing ready token numbers

✨ Features
Student Ordering

🛒 Browse menu by category (Snacks, Beverages, Meals, Desserts)
💳 Pay online via Razorpay or choose cash at counter
🎫 Get a token number after ordering
❤️ Save favourite items — shown at top next time
📦 Order history with one-tap reorder
🔔 PWA push notification when order is ready
⏱️ Dynamic pickup time slot selection
👥 Group order support

Kitchen Dashboard

🔒 PIN-protected access
🔥 Live order feed — new orders appear automatically
Filter by status: New → Preparing → Ready → Done
One-tap status updates

Admin Dashboard

🔒 PIN-protected access
📊 Total orders, revenue, average order value, most popular item
🍽️ Menu Editor — add, edit, delete items, toggle sold out
✅ Onboarding checklist for new canteens
⚙️ Settings — change Admin PIN, Kitchen PIN, canteen name

Display Board

📺 Shows token numbers when orders are ready
Designed for a large screen or TV facing students


🛠️ Tech Stack
LayerTechnologyFrontendHTML, CSS, Vanilla JavaScriptBackendNode.js + ExpressDatabaseMongoDB (via Mongoose)PaymentsRazorpayDeploymentVercelMobile AppCapacitor (Android)

⚡ Getting Started
Prerequisites

Node.js v18+
MongoDB (local or Atlas)
Razorpay account (for online payments)

Installation
bash# Clone the repo
git clone https://github.com/bhanuprathap06/SmartCanteenPreOrderSystem.git
cd SmartCanteenPreOrderSystem

Install dependencies
npm install

Create environment file
cp .env.example .env
Fill in your MongoDB URI and Razorpay keys

Start the server
npm start
Then open http://localhost:3000 in your browser.
Environment Variables
envMONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=3000

🏫 Setting Up a New Canteen

Open admin.html and enter the default PIN: 1234
Go to Settings → change your Admin and Kitchen PINs
Go to Menu Editor → add all your food items
Open kitchen.html on a tablet near the stove
Put display.html on a TV or large screen at the counter
Share the main URL with students

The Setup Checklist inside Admin guides you through all of this step by step.

📂 Project Structure
SmartCanteenPreOrderSystem/
├── public/
│   ├── index.html        # Student ordering page
│   ├── admin.html        # Admin dashboard
│   ├── kitchen.html      # Kitchen dashboard
│   ├── display.html      # Token display board
│   ├── script.js         # Main ordering logic
│   ├── admin.js          # Admin data & stats
│   ├── kitchen.js        # Kitchen order management
│   ├── display.js        # Display board logic
│   ├── style.css         # Shared styles
│   └── images/           # Food images
├── routes/               # Express API routes
├── models/               # Mongoose schemas
├── server.js             # Entry point
└── package.json

🔌 API Endpoints
MethodEndpointDescriptionGET/api/foodsGet all menu itemsPOST/api/foods/bulkUpdate menu (admin)POST/api/ordersPlace a new orderGET/api/ordersGet all orders (admin)PATCH/api/orders/:id/statusUpdate order status (kitchen)POST/api/payment/create-orderCreate Razorpay orderPOST/api/payment/verifyVerify payment signature

📄 License
MIT License — free to use and modify.


Built with ❤️ to solve a real problem at our college canteen.
