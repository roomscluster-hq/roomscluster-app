# RoomsCluster

**🔗 This is the source code for RoomsCluster. The live product is at [roomscluster.com](https://roomscluster.com).**

RoomsCluster is a virtual webinar and classroom platform built for training organizations and academies — structured enrollment, access control, live sessions, and recording, with Naira billing via Paystack.

This repository contains the frontend application. The backend API is maintained in a separate, private repository.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **State management:** Zustand, TanStack Query
- **Real-time:** Socket.IO
- **Video infrastructure:** LiveKit
- **Icons:** Lucide

## Key Features

- Organization and team management with role-based access (Owner, Admin, Host, Member)
- Groups and enrollment-based access control for structured classes
- A dedicated Member Portal for enrolled learners
- Live video sessions with chat, Q&A, polls, hand-raising, and screen sharing
- Session recording (audio/video) with AI-generated transcripts
- Custom subdomains and branding per organization
- Subscription billing via Paystack

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/roomscluster-hq/roomscluster-app.git
cd roomscluster-app
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

*(Add any other environment variables your local setup actually requires — this list reflects only what's been confirmed in development so far.)*

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## License

All rights reserved. This repository is public for visibility purposes; it is not licensed for reuse, modification, or redistribution without explicit permission.

## Contact

Questions? Reach out at [hello@roomscluster.com](mailto:hello@roomscluster.com), or visit [roomscluster.com/contact](https://roomscluster.com/contact).
