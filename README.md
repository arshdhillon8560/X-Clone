# X-Clone

*A Twitter-like social media application*

X-Clone is a **social media application** where users can **post, like, retweet, and reply to posts** in a threaded format. The project is built using **Node.js, Express, MongoDB, and Tailwind CSS**, ensuring a smooth and responsive user experience.

## 🚀 Features

✅ **Post Creation** – Users can create posts with text and optional media uploads.  
✅ **Likes & Retweets** – Like or retweet posts effortlessly.  
✅ **Replies & Threaded Conversations** – Engage in discussions with replies displayed in a structured format.  
✅ **Search Functionality** – Find posts using keywords.  
✅ **Responsive UI** – Built with **Tailwind CSS** for a sleek, mobile-friendly experience.  

---

## 📁 Project Structure

```
X-Clone/
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── index.js           # Entry point for testing Node.js setup
├── package.json       # Project dependencies and scripts
├── posts.json         # Sample posts data
├── README.md          # Project documentation
├── server.js          # Backend server implementation
├── public/            # Static files (HTML, CSS, JS)
│   ├── index.html     # Main frontend HTML
├── src/
│   ├── output.css     # Tailwind CSS output
```

---

## ⚡ Installation & Setup

1️⃣ **Clone the Repository**  
```bash
git clone https://github.com/arshdhillon8560/X-Clone.git
cd x-clone
```

2️⃣ **Install Dependencies**  
```bash
npm install
```

3️⃣ **Set Up Environment Variables**  
Create a `.env` file in the project root and add the following:  
```bash
MONGODB_URI=<your-mongodb-uri>
PORT=3000
```

4️⃣ **Start the Development Server**  
```bash
npm run dev
```

5️⃣ **Open in Browser**  
Visit the application at:  
```bash
https://x-clone-bsey.onrender.com/
```

---

## 🔗 API Endpoints

### 📌 Posts

| Method | Endpoint | Description |
|--------|---------|-------------|
| **GET** | `/api/posts` | Fetch all posts |
| **POST** | `/api/posts` | Create a new post |
| **POST** | `/api/posts/:id/like` | Like or unlike a post |
| **POST** | `/api/posts/:id/retweet` | Retweet or undo retweet |
| **POST** | `/api/posts/:id/reply` | Reply to a post |

---

## 🛠 Technologies Used

### **Backend**  
- **Node.js**, **Express**, **MongoDB**, **Mongoose**  

### **Frontend**  
- **HTML**, **Tailwind CSS**  

### **Utilities & Libraries**  
- **Multer** – File uploads  
- **dotenv** – Environment variables  
- **CORS** – Cross-origin resource sharing  

---

## 📜 License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 💙 Acknowledgments
Inspired by Twitter’s design and functionality.  
Built with **love** and **Tailwind CSS**.  
