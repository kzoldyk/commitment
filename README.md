<div align="center">
  <img src="https://raw.githubusercontent.com/kzoldyk/commitment/main/screenshot.png" alt="Commitment App Screenshot" width="800" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"/>
  
  <br />
  
  # Commitment

  **Make a promise. Prove your progress. Face the consequence.**
</div>

---

**Commitment** is a digital accountability contract platform where users enter enforceable, measurable agreements with accountability partners. It features customizable rules, deadlines, lives, recovery mechanics, and proof submissions.

## ✨ Features

- 🤝 **Accountability Contracts**: Set targets with a designated accountability partner.
- ❤️ **Finite Lives & Recovery**: Miss a day? Lose a life. Maintain a streak? Earn it back.
- 📆 **Daily Proof Logs**: Submit and verify daily progress with notes and links.
- ⚡️ **Timezone-Aware**: Automatic midnight cutoff and evaluation based on local time.
- ✉️ **Transactional Alerts**: Email notifications for missed days, reminders, and completed contracts.

## 🚀 Quickstart

### Prerequisites
- Node.js 20+ or [Bun](https://bun.sh/) 1.1+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kzoldyk/commitment.git
cd commitment

# 2. Install dependencies
bun install

# 3. Setup database and seed dev users (e.g., 'hitesh' & 'rahul', password: 'password123')
bun run db:migrate
bun run db:seed

# 4. Start the development server
bun run dev
```

The app will be available at `http://localhost:5173`.
*(Tip: Use `bun run server` to run the unified backend and frontend together on port 3000)*

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide
- **Backend**: Hono, Drizzle ORM
- **Database**: Cloudflare D1 / SQLite
- **Deployment**: Cloudflare Workers / Pages
