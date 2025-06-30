# law-swipe

A mobile-first React Progressive Web App that connects clients with vetted attorneys via a Tinder-style swipe interface. Clients submit case details, receive AI-ranked matches, swipe to select attorneys, then chat, video-call, book, pay, and review?all in one secure platform.

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Architecture](#architecture)  
4. [Installation](#installation)  
5. [Environment Variables](#environment-variables)  
6. [Available Scripts](#available-scripts)  
7. [Usage Examples](#usage-examples)  
8. [Component Reference](#component-reference)  
9. [Dependencies](#dependencies)  
10. [DevOps & Deployment](#devops--deployment)  
11. [Missing Essentials](#missing-essentials)  
12. [Contributing](#contributing)  
13. [License](#license)  

---

## Overview

1. **Client flow**  
   - Sign up / log in (email, phone, social, MFA)  
   - Multi-step case intake ? AI/NLP ranking microservice  
   - Browse ranked attorney cards via swipe deck + filters  
   - Mutual right-swipe ? encrypted chat, video calls  
   - In-app booking with calendar, Stripe payments  
   - Post-engagement ratings & reviews  

2. **Lawyer flow**  
   - Profile creation / availability management  
   - Lead dashboard, subscription & billing  

3. **Admin flow**  
   - User moderation, subscription oversight  
   - Analytics dashboard (Prometheus/Grafana)  

---

## Features

- User authentication (email/phone, password reset, MFA, social)  
- AI-ranked attorney match suggestions  
- Tinder-style swipe deck with filter panel  
- Encrypted real-time chat (Socket.IO) & WebRTC video (Twilio)  
- In-app booking & calendar sync  
- Stripe payment processing (+ webhooks)  
- Push (FCM), email & SMS (Twilio) notifications  
- Rating & review system  
- Client, Lawyer & Admin dashboards  
- CI/CD with GitHub Actions, containerized (Docker, Kubernetes)  
- Monitoring (Prometheus/Grafana), logging (ELK), error tracking (Sentry)  

---

## Architecture

### Frontend (React PWA)

- Entry: `src/index.js`  
- Root: `src/app.jsx` (React Router v6, Redux Toolkit, React Query)  
- API layer: `src/services/apiclient.js` (Axios w/ interceptors)  
- Services:  
  - Auth: `authservice.js`  
  - Case analysis: `caseanalysisservice.js`  
  - Matching: `matchservice.js`  
  - Chat: `chatservice.js`  
  - Booking: `bookingservice.js`  
  - Payment: `paymentservice.js`  
  - Notifications: `notificationservice.js`  
  - Reviews: `reviewservice.js`  
  - Admin: `adminservice.js`  
- Components: see [Component Reference](#component-reference)  
- Styling: Tailwind CSS (`tailwind.config.js`)  
- State: Redux Toolkit (`store.js`)  
- Data fetching: React Query (inside `hooks/`)  
- PWA: Service worker & manifest  

### Backend & Microservices

- Node.js + Express REST API  
- Python FastAPI AI/NLP microservice  
- PostgreSQL (transactions), MongoDB (profiles, chat logs)  
- Socket.IO server for real-time chat  
- WebRTC/Twilio for video calls  
- Stripe for payments, webhooks  
- Firebase Cloud Messaging & Twilio SMS  

### DevOps

- Dockerfile + Kubernetes manifests (`k8s/deployment.yml`, `k8s/service.yml`)  
- GitHub Actions CI/CD (`.github/workflows/ci.yml`)  
- Monitoring: Prometheus/Grafana  
- Logging: ELK stack  
- Error tracking: Sentry  

---

## Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-org/law-swipe.git
   cd law-swipe
   ```

2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure env vars**  
   Copy `.env.example` ? `.env` and fill in keys (API URLs, Stripe, Firebase, Twilio, Sentry, etc.)

4. **Start development server**  
   ```bash
   npm run dev
   # app available at http://localhost:3000
   ```

5. **Build for production**  
   ```bash
   npm run build
   npm run serve
   ```

---

## Environment Variables

```bash
# .env
REACT_APP_API_URL=https://api.law-swipe.com
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxx
REACT_APP_FIREBASE_CONFIG={...}
REACT_APP_TWILIO_ACCOUNT_SID=ACxxx
REACT_APP_SENTRY_DSN=https://xxx.ingest.sentry.io/?
# Add other secrets as needed
```

---

## Available Scripts

- `npm run dev` ? Run dev server with HMR  
- `npm run build` ? Create a production build  
- `npm run serve` ? Serve the production build locally  
- `npm test` ? Run tests  
- `npm run lint` ? Lint codebase  
- `npm run format` ? Prettier format  

---

## Usage Examples

### Sign Up / Login

```jsx
import { signup, login } from './services/authservice';

await signup({ email, password, phone });
await login({ email, password });
```

### Submit Case & Get Matches

```jsx
import { analyzeCase } from './services/caseanalysisservice';
import { getMatches, swipeRight } from './services/matchservice';

const { rankedLawyerIds } = await analyzeCase(caseData);
const matches = await getMatches({ filters });
await swipeRight(lawyerId);
```

### Real-Time Chat

```jsx
import { initSocket, sendMessage } from './services/chatservice';

const socket = initSocket(API_URL, token);
socket.on('message', handleIncoming);
sendMessage(toUserId, encryptedPayload);
```

---

## Component Reference

? **authAxiosInstance** (src/services/apiclient.js)  
  Centralized Axios instance with JWT injection & error interceptors.

? **authFlowManager** (src/services/authservice.js)  
  Signup, login, logout, token refresh flows.

? **caseIntakeAiLawyerRanker** (src/services/caseanalysisservice.js)  
  Sends case data to AI microservice ? returns ranked lawyer IDs.

? **matchSuggestionManager** (src/services/matchservice.js)  
  Fetches & caches matches, handles swipe actions & mutual match events.

? **encryptedSocketIoClient** (src/services/chatservice.js)  
  Initializes Socket.IO client for encrypted messaging.

? **slotBookingSync** (src/services/bookingservice.js)  
  Fetches availability, books slots, syncs calendars.

? **stripeCheckoutSessionManager** (src/services/paymentservice.js)  
  Creates Stripe checkout sessions & handles webhooks.

? **fcmTwilioNotifier** (src/services/notificationservice.js)  
  Sends push (FCM), SMS & email (Twilio) notifications.

? **engagementReviewProcessor** (src/services/reviewservice.js)  
  Submits & moderates reviews, aggregates lawyer ratings.

? **userModerationSubscriptionAnalyticsApi** (src/services/adminservice.js)  
  Admin APIs for user moderation, subscription control & analytics.

? **swipeProfileCardStack** (src/components/SwipeDeck.jsx)  
  Renders swipeable stack of `ProfileCard` with gestures.

? **filterAttorneyProfiles** (src/components/FilterPanel.jsx)  
  UI for filtering attorney matches by practice area, fee, rating.

? **attorneyProfileCard** (src/components/ProfileCard.jsx)  
  Displays attorney summary: photo, specialties, fee, rating.

? **BookingCalendar**, **ChatWindow**, **VideoCallComponent**, **PaymentForm**, **RatingForm**, **ReviewList**, **AdminConsole**, **AnalyticsDashboard**, etc.  
  See `src/components/` for details.

---

## Dependencies

Core:

- react, react-dom, react-router-dom  
- @reduxjs/toolkit, react-redux  
- react-query  
- axios, socket.io-client  
- @stripe/stripe-js  
- tailwindcss, postcss, autoprefixer  
- react-swipeable  

Notifications & Services:

- firebase  
- twilio  

Dev & Build:

- webpack/vite  
- babel  
- eslint, prettier  

See `package.json` for full list.

---

## DevOps & Deployment

- **Docker**: `Dockerfile` for container image  
- **Kubernetes**: Manifests under `k8s/`  
- **CI/CD**: GitHub Actions in `.github/workflows/ci.yml`  
- **Monitoring**: Prometheus (`prometheus.yml`), Grafana (`grafana.ini`)  
- **Logging**: ELK stack  
- **Error Tracking**: Sentry (`sentry.config.js`)  

---

## Missing Essentials

- Centralized environment-variable management (Vault, AWS Secrets)  
- Global React error boundary  
- Accessibility audit & remediation reports  
- PWA manifest & service-worker configuration  

---

## Contributing

1. Fork the repo & create a feature branch  
2. Run tests & lint before submitting a PR  
3. Follow the coding standards & include documentation  

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT ? Your Company Name