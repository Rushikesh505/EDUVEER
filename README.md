# 🎓 EduVeer – AI-Powered Learning Platform for Grades 6–10

EduVeer is an AI-powered educational platform designed to provide personalized and interactive learning experiences for students in **Grades 6–10**. The platform leverages **Artificial Intelligence** to simplify learning through an intelligent AI tutor, PDF summarization, personalized study planning, and career guidance.

Built using **Node.js, Express.js, HTML, CSS, JavaScript, and Ollama (Llama 3.2)**, EduVeer delivers fast, curriculum-focused responses while running AI locally for improved privacy and performance.

---

## ✨ Features

- 🤖 **AI Tutor**
  - Ask questions related to school subjects.
  - Get detailed and easy-to-understand explanations.

- 📄 **PDF Summarizer**
  - Upload educational PDFs.
  - Generate summaries, key concepts, formulas, and exam tips.

- 📅 **AI Study Planner**
  - Creates personalized study schedules.
  - Organizes daily learning tasks and revision plans.

- 🎯 **Career Guidance**
  - Provides AI-based career recommendations based on student interests and academic performance.

- 📚 **Interactive Learning**
  - Modern and responsive interface.
  - Curriculum-oriented explanations for Grades 6–10.

- ⚡ **Offline AI**
  - Uses **Ollama (Llama 3.2)** locally.
  - No paid cloud AI API required.

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### AI
- Ollama
- Llama 3.2

### Additional Libraries
- Multer
- REST APIs
- Fetch API

---

## 📂 Project Structure

```text
EduVeer/
│
├── public/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── uploads/
│
├── server.js
├── package.json
├── package-lock.json
└── node_modules/
```

---

## 📋 Prerequisites

Before running the project, install the following:

- Node.js (v18 or above)
- npm
- Ollama

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/EduVeer.git
```

### 2. Navigate to the Project Directory

```bash
cd EduVeer
```

### 3. Install Dependencies

```bash
npm install
```

---

## 🤖 Install Ollama

Download Ollama from:

https://ollama.com/download

After installation, pull the required model:

```bash
ollama pull llama3.2
```

Start the Ollama server:

```bash
ollama serve
```

---

## ▶️ Run the Project

Start the backend server:

```bash
node server.js
```

or

```bash
npm start
```

If using Nodemon:

```bash
nodemon server.js
```

---

## 🌐 Open in Browser

Visit:

```
http://localhost:3000
```

> **Note:** If your project uses a different port, replace `3000` with the port configured in `server.js`.

---

## 🔄 Application Workflow

```text
Student
    │
    ▼
EduVeer Web Interface
(HTML • CSS • JavaScript)
    │
    ▼
REST API Requests
    │
    ▼
Node.js + Express Server
    │
    ▼
Ollama (Llama 3.2)
    │
    ▼
AI Generates Response
    │
    ▼
Response Displayed to Student
```

---

## 📚 Applications

- Personalized Learning
- AI Doubt Resolution
- Smart Study Planning
- PDF Summarization
- Career Guidance
- Exam Preparation
- Self-Learning Assistance

---

## 👨‍💻 Built With

- Node.js
- Express.js
- HTML5
- CSS3
- JavaScript
- Ollama
- Llama 3.2

---

## 📄 License

This project is intended for **educational and learning purposes**.

---

## ⭐ Future Enhancements

- User Authentication
- Student Progress Tracking
- Teacher Dashboard
- Voice-Based AI Tutor
- Multi-language Support
- Quiz & Assessment Module
- Cloud Deployment
- Mobile Application Support
- Performance Analytics
- Parent Dashboard
```
