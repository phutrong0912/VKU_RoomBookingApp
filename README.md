# VKU Campus Study Room & Lab Booking App (Mini-Project 2)

An interactive, responsive mobile application for booking campus study rooms and laboratories at **VKU (Vietnam - Korea University of Information and Communication Technology)**. Built strictly following the project specifications, wireframe mockup, and architecture guidelines.

---

## 📱 Features & Highlights

### 1. Browse Rooms Feed & Multi-Parameter Filter Chips (Wireframe Match)
- **Top Search Bar**: Real-time debounced search by room name, code, campus building, description, and amenities.
- **Filter Chips**:
  - **Building**: Building A3, Main Library, IT Center, Building B1, Innovation Hub.
  - **Room Type**: Lab, Quiet Study, Discussion Room, Seminar Room.
  - **Capacity**: Any size, 10+ seats, 30+ seats, 50+ seats.
  - **Status**: Available vs Occupied.
  - **Amenities**: Computers, Projector, Whiteboard, Air Conditioning, Power Outlets, Conference Camera, High-speed LAN.
- **60fps FlatList Optimization**:
  - `React.memo` component memoization with specialized prop equality checks.
  - Fixed card heights with `getItemLayout` for immediate scroll measurement and zero layout churn.
  - Tuned windowing parameters (`windowSize: 5`, `maxToRenderPerBatch: 8`, `initialNumToRender: 6`, `removeClippedSubviews`).
  - Pull-to-refresh with `RefreshControl` tied to TanStack Query.
- **Room Cards**:
  - Room photo with smooth cached loading.
  - Room code & title (e.g. **Lab A3-101**, **Library Zone B**).
  - 📍 Building & floor.
  - 👥 Capacity badge (e.g. 30 seats, 50 seats).
  - Availability status pill (✅ **Available** in emerald green / 🔴 **Occupied** in crimson red).

### 2. Time-Slot Selector & Conflict Prevention Engine
- **Horizontal Date Selector**: Select between Today, Tomorrow, and upcoming 7 calendar days.
- **Discrete Time Slots**: Campus booking blocks categorized into Morning, Afternoon, and Evening.
- **Conflict Prevention Engine**:
  1. **Slot-Level Lock**: Occupied slots are visually locked (grayed out with lock icon) and non-interactive.
  2. **User Schedule Overlap**: Prevents students from booking two different rooms during the same time window.
  3. **Daily Quota Enforcement**: Enforces university policy limiting each student to a configurable quota (default: 3 active slots per day).
  4. **Immediate Conflict Alert Banner**: Real-time feedback if any overlap occurs.
- **Reservation Modal**: Select purpose (Group Study, Software Project, Exam Prep, etc.), set attendee count, and confirm reservation.

### 3. My Bookings & Digital Pass
- Segmented view for **Active & Upcoming** vs **History & Cancelled** reservations.
- **Digital Access Pass**: Displays student badge, room details, and simulated QR check-in code.
- **Real-Time Cancellation**: Cancel active bookings with immediate slot release back into the campus pool.

### 4. Student Profile & Campus Lab Policies
- Student information: Student ID, Department, Email, Avatar.
- Interactive **Daily Booking Quota** progress bar.
- Notification toggles for booking confirmations and 15-minute check-in reminders.
- Campus room policies & IT helpdesk contact info.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Details |
|---|---|---|
| **Framework** | **React Native + Expo** | Managed Workflow (Expo SDK 57 - Latest iOS & Android compatible) |
| **Language** | **TypeScript** | Strict mode (`"strict": true`, zero compilation errors) |
| **Backend / DB** | **Firebase Firestore** | Modular Firebase v12 SDK (`rooms` and `bookings` collections with auto-seeder) |
| **Navigation** | **React Navigation 7** | Stack (`@react-navigation/native-stack`) + Bottom Tabs (`@react-navigation/bottom-tabs`) |
| **Client State** | **Zustand** | Stores for filters, draft bookings, and user quota |
| **Server State** | **TanStack Query** | `@tanstack/react-query` with caching, optimistic updates, and cache invalidation |
| **Icons & Styling** | **@expo/vector-icons** | Ionicons, custom responsive palette with VKU brand colors |

---

## 📂 Project Structure

```
VKU-Room-Booking-App/
├── App.tsx                     # Entry point: QueryClientProvider, NavigationContainer
├── app.json                    # Expo configuration
├── package.json
├── tsconfig.json               # Strict TypeScript config
├── scripts/
│   └── verify-logic.ts         # Automated verification test script
└── src/
    ├── types/
    │   ├── room.ts             # Room, Filter, Building, Amenity types
    │   ├── booking.ts          # Slot, Booking, User, Conflict types
    │   └── navigation.ts       # React Navigation 7 types
    ├── api/
    │   ├── mockData.ts         # VKU campus rooms and slots dataset
    │   ├── roomApi.ts          # Room queries and slot cache
    │   └── bookingApi.ts       # Booking mutations and slot release
    ├── store/
    │   ├── useFilterStore.ts   # Zustand filter store
    │   ├── useBookingStore.ts  # Zustand booking draft store
    │   └── useUserStore.ts     # Zustand user profile & quota store
    ├── hooks/
    │   ├── useRooms.ts         # TanStack Query hooks for rooms & slots
    │   └── useBookings.ts      # TanStack Query hooks for bookings & mutations
    ├── navigation/
    │   ├── RootNavigator.tsx   # React Navigation 7 Stack
    │   └── BottomTabNavigator.tsx # Bottom Tabs: Browse Rooms, My Bookings, Profile
    ├── screens/
    │   ├── BrowseRoomsScreen.tsx   # Feed, search, filter chips, 60fps FlatList
    │   ├── RoomDetailScreen.tsx    # Room details, time-slot grid, conflict prevention
    │   ├── MyBookingsScreen.tsx    # Reservation list, cancellation, QR digital pass
    │   ├── ProfileScreen.tsx       # Student profile, daily quota tracker
    │   └── BookingSuccessScreen.tsx # Reservation success screen
    ├── components/
    │   ├── common/
    │   │   ├── SearchInput.tsx     # Search bar + Filter button matching wireframe
    │   │   ├── FilterChip.tsx      # Pill filter chips
    │   │   └── StatusBadge.tsx     # Available / Occupied status pill matching wireframe
    │   ├── room/
    │   │   ├── RoomCard.tsx        # 60fps memoized room card matching wireframe
    │   │   └── FilterModal.tsx     # Multi-parameter filter modal
    │   └── booking/
    │       ├── DateSelector.tsx    # Horizontal date picker
    │       ├── TimeSlotGrid.tsx    # Interactive time slot grid with conflict indicators
    │       ├── ConflictAlertBanner.tsx # Visual conflict feedback
    │       └── BookingSummaryModal.tsx # Booking confirmation sheet
    ├── constants/
    │   ├── colors.ts               # VKU campus brand colors
    │   └── theme.ts                # Typography, spacing, shadows
    └── utils/
        ├── dateUtils.ts            # Date formatting and day generators
        └── conflictValidator.ts    # Conflict detection engine
```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch on Web (Fastest for testing)
```bash
npm run web
# or: npx expo start --web
```

### 3. Launch on iOS or Android (Expo Go)
```bash
npx expo start
```
Scan the displayed QR code with the **Expo Go** mobile app on your iPhone or Android phone.

### 4. Run TypeScript Check
```bash
npx tsc --noEmit
```

### 5. Run Core Logic & Conflict Engine Verification
```bash
npx tsc scripts/verify-logic.ts --outDir dist --module commonjs --target es2020 --esModuleInterop true --skipLibCheck && node dist/scripts/verify-logic.js
```

