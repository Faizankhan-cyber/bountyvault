# 🔐 BountyVault

> A decentralized bounty escrow platform built on the **Algorand blockchain** for secure and transparent bounty payments.

BountyVault is a blockchain-based escrow system that helps connect **bounty creators and contributors** through a transparent and decentralized payment workflow.

The project was developed as a team during a blockchain hackathon using the **Algorand Testnet**.

---

## 🎯 Problem

Traditional bounty platforms rely on centralized systems to manage payments between clients and contributors.

This can create problems such as:

* Lack of payment transparency
* Trust issues between parties
* Delayed payments
* Centralized control over escrow funds
* Limited visibility into transaction history

---

## 💡 Solution

**BountyVault** uses a blockchain-based escrow mechanism to make bounty payments more transparent and secure.

The system allows bounty creators to deposit funds into an escrow smart contract and release the payment when the bounty conditions are fulfilled.

Blockchain transactions provide a verifiable record of the escrow activity.

---

## 🏗️ How It Works

```text
┌──────────────────┐
│  Bounty Creator  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Frontend      │
│   Web Interface  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Backend API   │
│  Node.js/Express │
└────────┬─────────┘
         │
         ├──────────────► SQLite Database
         │
         ▼
┌──────────────────┐
│ Algorand Testnet │
│ Smart Contract   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Pera Wallet    │
└──────────────────┘
```

---

## ✨ Key Features

* 🔐 Blockchain-based bounty escrow
* 💰 Secure handling of bounty funds
* 📜 Transparent transaction history
* 🔗 Algorand Testnet integration
* 👛 Pera Wallet integration
* 🌐 Web-based interface
* ⚙️ Backend API for application logic
* 🗄️ SQLite database for application data

---

## 🛠️ Tech Stack

### Blockchain

* **Algorand Testnet**
* **AlgoKit**
* **ARC4 Smart Contracts**
* **Python**

### Backend

* **Node.js**
* **Express.js**
* **SQLite**

### Frontend

* **HTML**
* **CSS**
* **JavaScript**

### Wallet

* **Pera Wallet**

### Deployment

* **Render** – Backend
* **Vercel** – Frontend

---

## 👨‍💻 My Role

### Backend Lead

I worked primarily on the **backend and application logic** of BountyVault.

My responsibilities included:

* Designing and developing backend API endpoints
* Connecting the frontend with backend services
* Managing application data using SQLite
* Integrating backend functionality with the blockchain layer
* Handling API communication and application flow
* Debugging backend issues during development
* Supporting deployment and integration of the application

Working as part of a team also involved coordinating with the smart contract, frontend, and testing members.

---

## 🚀 Deployment

**Frontend:** Deployed using Vercel

**Backend:** Deployed using Render

**Blockchain:** Algorand Testnet

> The project uses the Algorand Testnet for development and demonstration purposes.

---

## 🧠 What I Learned

Through BountyVault, I gained practical experience with:

* Building a backend for a real application
* REST API development
* Database integration
* Blockchain application architecture
* Algorand development and Testnet deployment
* Wallet integration
* Working with a team under hackathon time constraints
* Debugging and integrating multiple parts of a system

---

## 🔮 Future Improvements

Potential improvements include:

* Enhanced authentication and authorization
* Improved transaction tracking
* Automated bounty verification
* Better dispute handling
* More robust smart contract security
* Production-ready blockchain deployment
* Improved user experience
* Comprehensive automated testing

---

## 🏆 Hackathon Project

**BountyVault** was developed as a team Block Rookies during a blockchain hackathon using the **Algorand ecosystem**.

The project demonstrates how blockchain-based escrow can be used to create a more transparent bounty payment workflow.

---

## 📄 License

This project is licensed under the **MIT License**.
