Traveloop is a modern full-stack travel planning platform built with Next.js and PostgreSQL that helps users create personalized multi-city itineraries, manage budgets, organize activities, maintain travel journals, track packing lists, and share trips publicly.

Built for the Odoo Hackathon as a scalable and developer-friendly travel management application.

---

# ✨ Features

- 🔐 User Authentication (Credentials + optional Google OAuth)
- 🧳 Create and manage multi-city trips
- 📍 Interactive itinerary builder
- 💰 Budget tracking and expense management
- 📊 Budget visualization with charts
- 📝 Travel notes and journal entries
- 🎒 Packing checklist management
- 🌍 Public trip sharing via shareable links
- 👥 Community feed for public trips
- 📈 Admin analytics dashboard
- 🗺 Optional map integration using OpenStreetMap

---

# 🛠 Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Recharts

## Backend

- Next.js Server Actions
- Route Handlers
- NextAuth.js
- Prisma ORM

## Database

- PostgreSQL 16
- NeonDB / Local PostgreSQL support

## Dev Tools

- pnpm
- ESLint
- Vercel

---

# 📂 Project Structure

```bash
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── server/
│   └── styles/
├── public/
├── docs/
├── .env.example
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd traveloop
```

---

## 2️⃣ Install Dependencies

Using pnpm:

```bash
pnpm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/traveloop"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 4️⃣ Setup Database

Run Prisma migrations:

```bash
pnpm prisma migrate dev
```

Seed the database:

```bash
pnpm prisma db seed
```

---

## 5️⃣ Start Development Server

```bash
pnpm dev
```

Application will run at:

```bash
http://localhost:3000
```

---

# 🧩 Core Modules

| Module | Description |
|---|---|
| Authentication | Secure login and registration |
| Dashboard | User overview and recent trips |
| Trip Builder | Create and organize itineraries |
| Budget Manager | Expense tracking and visualization |
| Packing Checklist | Organize travel essentials |
| Notes & Journal | Save travel memories and notes |
| Community | Explore public trips |
| Admin Panel | Monitor analytics and users |

---

# 🗃 Database Models

Main Prisma models used in the project:

- User
- Trip
- Stop
- Activity
- StopActivity
- City
- PackingItem
- Note
- Expense
- Image

---

# 📊 MVP Scope

The MVP focuses on:

- User Authentication
- Trip Creation
- Multi-city itinerary planning
- Budget breakdown
- Trip sharing
- Dashboard and trip management

Additional features like community feed, expenses, and advanced profile management are planned post-MVP.

---

# 🔐 Authentication

Authentication is implemented using:

- Credentials Provider
- JWT-based sessions
- Optional Google OAuth (future enhancement)

Protected routes are managed using App Router layouts and server-side authentication checks.

---

# 📈 Budget Visualization

Traveloop provides budget analytics using:

- Pie Charts
- Expense Distribution
- Per-city spending analysis
- Daily cost breakdowns

Powered by Recharts.

---

# 🌍 Deployment

Recommended deployment stack:

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Database | NeonDB |

Deploy with:

```bash
vercel
```

---

# 🧪 Verification Checklist

Before deployment ensure:

- ✅ `pnpm build` passes
- ✅ `pnpm lint` passes
- ✅ `pnpm tsc --noEmit` passes
- ✅ Authentication flow works
- ✅ Trip CRUD works
- ✅ Public sharing works
- ✅ Database migrations are successful

---

# 🔮 Future Enhancements

- AI-based travel recommendations
- Real-time collaboration
- Expense PDF export
- Offline support
- Mobile app version
- Advanced analytics dashboard
- Social interactions and trip likes

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 📜 License

This project was developed for educational and hackathon purposes.

---

# 👨‍💻 Team Notes

- Full-stack monorepo architecture
- Server Components first approach
- Minimal client-side state management
- Prisma for strongly typed database operations
- Clean and scalable folder structure