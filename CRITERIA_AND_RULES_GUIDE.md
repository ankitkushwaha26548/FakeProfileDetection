# FPDetection System - Complete Criteria & Rules Guide

## Overview
This document provides a comprehensive inventory of ALL criteria, rules, scoring systems, and validation logic used throughout the FPDetection system.

---

## 1. RISK SCORING & CLASSIFICATION SYSTEM

### Source: `riskCalculator.js`

**Purpose:** Calculate overall risk score from multiple risk factors

**Risk Score Calculation:**

| Risk Factor | Condition | Score Added | Reason |
|------------|-----------|------------|--------|
| Activity Score | `activityScore > 70` | +25 | Abnormal activity rate |
| IP Risk - HIGH | `ipRisk === "HIGH"` | +25 | High-risk IP detected |
| IP Risk - MEDIUM | `ipRisk === "MEDIUM"` | +15 | Suspicious IP pattern |
| Behavior Risk - HIGH | `behaviorRisk === "HIGH"` | +30 | Bot-like behavior detected |
| Behavior Risk - MEDIUM | `behaviorRisk === "MEDIUM"` | +15 | Unusual behavior pattern |
| Device Risk - HIGH | `deviceRisk === "HIGH"` | +20 | Multiple device switching |

**Classification Levels:**

| Total Score | Classification | Description |
|------------|----------------|-------------|
| 0-39 | GENUINE | Low risk user |
| 40-69 | SUSPICIOUS | Moderate risk - requires monitoring |
| 70+ | FAKE | High risk - likely fraudulent account |

**Maximum Possible Score:** 125 (all conditions met)

---

## 2. FAKE DETECTION CRITERIA

### Source: `fakeDetection.js`

**Purpose:** Comprehensive detection of fake/bot accounts through multiple behavioral and structural indicators

**Detection Criteria & Scoring:**

### 2.1 Profile Completeness Check
- **Criteria:** `profileCompleteness < 50`
- **Score Added:** +20
- **Triggered When:** Profile incomplete
- **Reason:** "Incomplete profile"

### 2.2 Activity Volume Analysis
- **Low Activity Threshold:** `totalActivities < 3`
  - **Score Added:** +15
  - **Reason:** "Very low activity"
  
- **High Activity Threshold:** `totalActivities > 50`
  - **Score Added:** +15
  - **Reason:** "Unusual high activity"

### 2.3 Login Frequency Detection (BOT-LIKE BEHAVIOR)
- **Condition:** Last 5 logins within `< 10 minutes` (600,000 milliseconds)
- **Score Added:** +25
- **Reason:** "High login frequency (bot-like)"
- **Logic:** 
  ```
  if (logins.length >= 5) {
    timeDiff = logs[0].createdAt - logs[4].createdAt
    if (timeDiff < 10 minutes) → TRIGGERED
  }
  ```

### 2.4 IP Change Pattern Detection
- **Condition:** `≥3 unique IPs` in last 10 logins
- **Score Added:** +20
- **Reason:** "Frequent IP changes"
- **Analysis Window:** Last 10 login records

### 2.5 New Account with Suspicious Activity
- **Conditions (ALL must be true):**
  - Account age: `< 2 days old`
  - Activity level: `> 10 activities`
- **Score Added:** +25
- **Reason:** "New account with high activity"

**Final Classification in fakeDetection:**

| Total Score | Level | Description |
|------------|-------|-------------|
| 0-29 | GENUINE | Low risk |
| 30-59 | SUSPICIOUS | Medium risk |
| 60+ | FAKE | High risk |

**Data Source:** Profile, Activity, LoginLog collections (last 10 records used)

---

## 3. ANOMALY DETECTION CRITERIA

### Source: `anomalyDetector.js`

**Purpose:** Detect unusual behavioral patterns indicating automated/bot activity

**Analysis Window:** Last 50 activities per user

**Minimum Threshold:** At least 10 activities required (otherwise returns LOW risk)

### 3.1 Rapid Action Frequency Detection

**Criteria:** Actions performed within `< 2 seconds` of each other

- **High Risk Threshold:** `≥ 10 rapid actions` (< 2 seconds between consecutive actions)
  - **Risk Level:** HIGH
  
- **Medium Risk Threshold:** `≥ 5 rapid actions` (< 2 seconds between consecutive actions)
  - **Risk Level:** MEDIUM

### 3.2 Repetitive Action Pattern Detection

**Criteria:** Same activity type repeated consecutively

- **Condition:** First activity type appears `≥ 15 times` in sequence
- **Risk Level:** HIGH
- **Example:** Liking 15+ posts in rapid succession

**Possible Activity Types:** `POST`, `LIKE_POST`, `COMMENT`

**Risk Classification:**

| Condition | Risk Level |
|-----------|-----------|
| `rapidActions >= 10` OR `sameActions >= 15` | HIGH |
| `rapidActions >= 5` | MEDIUM |
| Otherwise | LOW |

---

## 4. IP RISK ASSESSMENT

### Source: `ipTracker.js`

**Purpose:** Evaluate risk based on IP address changes and patterns

**Analysis Window:** Last 10 login records

### 4.1 Multiple IPs Detection

- **High Risk:** `≥ 5 unique IPs` in last 10 logins
  - **Risk Level:** HIGH
  
- **Medium Risk:** `≥ 3 unique IPs` in last 10 logins
  - **Risk Level:** MEDIUM

### 4.2 Rapid IP Switching Detection

- **Condition:** 3+ logins within `< 5 minutes` from different IPs
- **Risk Level:** HIGH
- **Logic:**
  ```
  if (logs.length >= 3) {
    timeDiff = logs[0].createdAt - logs[2].createdAt
    if (timeDiff < 5 minutes) → HIGH
  }
  ```

**IP Risk Classification:**

| Condition | Risk Level |
|-----------|-----------|
| `uniqueIPs >= 5` OR rapid switching | HIGH |
| `uniqueIPs >= 3` | MEDIUM |
| Otherwise | LOW |

---

## 5. PROFILE COMPLETENESS SCORING

### Source: `profileScore.js`

**Purpose:** Calculate profile completion percentage based on profile fields

**Maximum Score:** 80 (can be normalized to 100)

### Scoring Breakdown:

| Profile Field | Points | Status | Cumulative |
|--------------|--------|--------|-----------|
| Bio | 20 | Presence | 20 |
| Profile Image | 25 | Presence | 45 |
| Phone | 20 | Presence | 65 |
| Location | 15 | Presence | 80 |

**Calculation:** Simple addition of field presence (binary: field exists or doesn't)

**Formula:**
```javascript
score = (bio ? 20 : 0) + (profileImage ? 25 : 0) + (phone ? 20 : 0) + (location ? 15 : 0)
```

**Profile Completeness Ranges:**

| Score | Completeness | Status |
|-------|-------------|--------|
| 0-20 | 0-25% | Very incomplete |
| 21-45 | 26-56% | Incomplete |
| 46-65 | 57-81% | Mostly complete |
| 66-80 | 82-100% | Complete |

---

## 6. ACTIVITY LOGGING CRITERIA

### Source: `activityLogger.js` and `postController.js`

**Purpose:** Track and log all user actions for analysis

### 6.1 Loggable Activity Types

**Activity Type Enum (Models/Activity.js):**
- `POST` - User creates a new post
- `LIKE_POST` - User likes another post
- `COMMENT` - User comments on a post
- `LOGIN` - User logs into account (registered in LoginLog)
- `REGISTER` - User creates new account

### 6.2 Activity Logging Points

Activities are logged automatically at these events:

| Event | Activity Type | Metadata Logged |
|-------|---------------|-----------------|
| Register | REGISTER | IP, User-Agent |
| Login | LOGIN | IP, User-Agent |
| Create Post | POST | Post ID |
| Like Post | LIKE_POST | Post ID |
| Comment | COMMENT | Post ID |

### 6.3 Activity Analysis Thresholds (used in Fake Detection)

| Metric | Threshold | Risk Implication |
|--------|-----------|-----------------|
| Total Activities | < 3 | Very low activity (score +15) |
| Total Activities | > 50 | Unusually high activity (score +15) |
| Activity Window | Last 50 records | For anomaly detection |

---

## 7. LOGIN VALIDATION CRITERIA

### Source: `authController.js`

### 7.1 Registration Validation

**Required Fields:**
- `name` (string, required)
- `email` (string, required, must be unique)
- `password` (string, required)

**Validation Rules:**

| Rule | Condition | Action |
|------|-----------|--------|
| All fields present | Missing name/email/password | Return 400 error |
| Unique email | Email already exists | Return 400 error |
| Password hashing | Bcrypt salt: 10 rounds | Stored securely |
| Role assignment | `email.endsWith('@admin.com')` | Assigned 'admin' role; else 'user' |

**Post-Registration Actions:**
- Create LoginLog entry
- Run fake detection
- Log activity (REGISTER)

### 7.2 Login Validation

**Required Fields:**
- `email` (string, required)
- `password` (string, required)

**Validation Rules:**

| Rule | Condition | Action |
|------|-----------|--------|
| Email exists | User not found | Return 400 error |
| Password match | Password doesn't match hash | Return 400 error via `bcrypt.compare()` |
| Token generation | Valid credentials | JWT signed with 7-day expiration |

**Post-Login Actions:**
- Create LoginLog entry
- Run fake detection
- Log activity (LOGIN)

### 7.3 JWT Token Details

- **Header:** `Authorization: Bearer <token>`
- **Payload:** `{ id: user._id }`
- **Expiration:** 7 days
- **Secret:** `JWT_SECRET` from environment (default: 'FPDFPDFPDFPD')

### 7.4 TokenValidation

**Error Cases:**

| Condition | HTTP Status | Message |
|-----------|------------|---------|
| No token provided | 401 | "No token, authorization denied" |
| Invalid token format | 401 | "Token is not valid" |
| Expired token | 401 | "Token is not valid" |
| User not found | 401 | "User not found" |

---

## 8. RATE LIMITING RULES

### Source: `middleware/rateLimiter.js`

**Purpose:** Prevent bot-like behavior and abuse

### 8.1 General API Limiter

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Applied To:** General API endpoints
- **Error Message:** "Too many requests. Please try again later."

### 8.2 Auth Limiter (Login/Register Protection)

- **Window:** 15 minutes
- **Max Requests:** 10 per IP
- **Applies To:** `/register`, `/login` endpoints
- **Error Message:** "Too many auth attempts. Try again later."
- **Purpose:** Prevent brute-force attacks and credential stuffing

### 8.3 Bot-Like Behavior Limiter

- **Window:** 1 minute
- **Max Requests:** 30 actions per IP
- **Applies To:** Action endpoints (POST, LIKE, COMMENT)
- **Error Message:** "Suspicious activity detected. Slow down."
- **Purpose:** Detect and throttle rapid automated behavior

**Rate Limit Detection:**
- Rapid repetition = potential bot (> 30 actions/minute)
- Brute force attempts = (> 10 login attempts/15 min)

---

## 9. AUTHORIZATION & AUTHENTICATION RULES

### Source: `middleware/authMiddleware.js` and `middleware/adminMiddleware.js`

### 9.1 Protected Route Requirements (`protect` middleware)

**All Protected Routes Require:**
1. Valid Authorization header with format: `Bearer <token>`
2. Valid JWT token
3. Token user exists in database
4. Token must not be expired

**Token Verification:**
- Decoded from JWT using `JWT_SECRET`
- User fetched from database (excluding password field)
- User attached to `req.user`

### 9.2 Role-Based Authorization (`authorize` middleware)

**Usage:** `authorize('role1', 'role2', ...)`

**Validation Logic:**

| Condition | HTTP Status | Message |
|-----------|------------|---------|
| User not authenticated | 401 | "Not authenticated" |
| User role not in allowed list | 403 | `"User role ${userRole} is not authorized to access this route"` |
| Role matches | 200 | Proceed to route |

### 9.3 Admin-Only Routes

**Admin Middleware Rules:**

| Condition | HTTP Status | Message |
|-----------|------------|---------|
| User not authenticated | 401 | "Not authenticated" |
| `req.user.role !== "admin"` | 403 | "Admin access only" |
| Is admin | 200 | Proceed to route |

**Admin Identification:**
- Email ends with `@admin.com` → Assigned 'admin' role at registration
- Manual role assignment via database

---

## 10. BOT-LIKE BEHAVIOR DETECTION CRITERIA

**Combined Detection (from multiple sources):**

| Behavior Pattern | Detection Method | Score Impact | Risk Level |
|-----------------|-----------------|-------------|-----------|
| High login frequency | fakeDetection: 5 logins < 10 min | +25 | TRIGGERS HIGH RISK |
| Rapid actions | anomalyDetector: 10+ actions < 2 sec | Sets HIGH | Clear indicator |
| Repetitive actions | anomalyDetector: 15+ same type | Sets HIGH | Bot pattern |
| Rapid IP switching | ipTracker: 3+ logins < 5 min | HIGH | Location spoofing |
| Frequent IP changes | ipTracker: 5+ unique IPs | HIGH | Proxy/VPN abuse |

---

## 11. ADMIN FUNCTIONS & CONTROLS

### Source: `controllers/adminController.js`

### 11.1 Dashboard Statistics

**Available Metrics:**
- Total user count
- Total activity count
- Genuine user count (GENUINE level)
- Suspicious user count (SUSPICIOUS level)
- Fake user count (FAKE level)

### 11.2 User Risk Management

**Get Users With Risk:** Returns all users and their risk profiles with full details

**Filter by Risk Level:**
- `getFakeUsers()` - Returns all users marked as FAKE
- `getSuspiciousUsers()` - Returns all users marked as SUSPICIOUS

**Manual User Flagging:**

| Action | Effect |
|--------|--------|
| Flag user as FAKE | Sets `level = "FAKE"` |
| | Sets `score = 100` |
| | Adds reason: "Manually flagged by admin" |
| | Saves to database |

### 11.3 Login Log Monitoring

- Returns all login logs across all users
- Includes user details (name, email)
- Sorted by most recent first
- Can track IP addresses, user agents, devices

---

## 12. PROFILE UPDATE VALIDATION

### Source: `controllers/profileController.js`

### 12.1 Profile Update Process

**Fields That Can Be Updated:**
- `bio` (string)
- `profileImage` (string/URL)
- `phone` (string)
- `location` (string)

**Update Logic:**
1. Find existing profile or create new
2. Update only provided fields (others retain current values)
3. Recalculate `profileCompleteness` score
4. Re-run fake detection immediately
5. Save to database

**Trigger:** Each profile update triggers re-evaluation of risk score

---

## 13. DATA MODELS & VALIDATION

### 13.1 User Model Validation

| Field | Type | Constraints |
|-------|------|-----------|
| name | String | Required |
| email | String | Required, Unique |
| password | String | Required (stored hashed) |
| role | Enum | ['user', 'admin'], default: 'user' |
| isVerified | Boolean | Default: false |
| createdAt | Date | Auto-generated |

### 13.2 Profile Model Structure

| Field | Type | Default |
|-------|------|---------|
| user | ObjectId | Required (User ref) |
| bio | String | '' |
| profileImage | String | '' |
| phone | String | '' |
| location | String | '' |
| profileCompleteness | Number | 0 |
| createdAt | Date | Current date |

### 13.3 Activity Model Structure

| Field | Type | Constraints |
|-------|------|-----------|
| user | ObjectId | User reference |
| type | String | Enum: ['POST', 'LIKE_POST', 'COMMENT'] |
| targetId | ObjectId | Optional (post reference) |
| metadata | Object | Optional (additional data) |
| createdAt | Date | Auto-generated |

### 13.4 RiskScore Model Structure

| Field | Type | Constraints |
|-------|------|-----------|
| user | ObjectId | Required, Unique |
| score | Number | Default: 0 (0-125 range) |
| level | String | Enum: ['GENUINE', 'SUSPICIOUS', 'FAKE'] |
| reasons | Array | String array of detection reasons |
| lastUpdated | Date | Auto-generated/updated |

### 13.5 LoginLog Model Structure

| Field | Type | Purpose |
|-------|------|---------|
| user | ObjectId | User reference |
| ip | String | Login IP address |
| userAgent | String | Browser/device info |
| device | String | Device identifier |
| createdAt | Date | Login timestamp |

---

## 14. DETECTION FLOW SUMMARY

### Risk Assessment Pipeline:

```
User Action (Login/Register/Activity) 
    ↓
Log Activity + Create LoginLog Entry
    ↓
Run fakeDetection() with 5 main criteria:
    ├─ Profile completeness check
    ├─ Activity volume analysis
    ├─ Login frequency analysis
    ├─ IP change pattern check
    └─ New account with high activity check
    ↓
Create/Update RiskScore with:
    ├─ Score (0-125)
    ├─ Level (GENUINE/SUSPICIOUS/FAKE)
    └─ Reasons array
    ↓
Saved to Database for Admin/User Review
```

### Score Calculation:
- **riskCalculator:** Combines activity, IP, behavior, device scores
- **fakeDetection:** Direct scoring based on 5 key criteria
- **anomalyDetector:** Provides behavior risk input to riskCalculator
- **ipTracker:** Provides IP risk input to riskCalculator

---

## 15. SUMMARY OF ALL THRESHOLDS & CONSTANTS

| Component | Threshold/Constant | Value | Criteria |
|-----------|------------------|-------|----------|
| Risk Score - FAKE | Lower bound | 70 | Score >= 70 → FAKE |
| Risk Score - SUSPICIOUS | Lower bound | 40 | Score 40-69 → SUSPICIOUS |
| Fake Detection - FAKE | Lower bound | 60 | Score >= 60 → FAKE |
| Fake Detection - SUSPICIOUS | Lower bound | 30 | Score >= 30 → SUSPICIOUS |
| Profile Completeness | Low threshold | 50 | < 50 → Risk +20 |
| Activity Volume | Low threshold | 3 | < 3 → Risk +15 |
| Activity Volume | High threshold | 50 | > 50 → Risk +15 |
| Login Frequency | Time window | 10 mins | 5 logins in < 10 min → Risk +25 |
| IP Changes | Count threshold | 3 | >= 3 unique IPs → Risk +20 |
| Account Age | Threshold | 2 days | < 2 days + > 10 activities → Risk +25 |
| Rapid Actions | Time threshold | 2 seconds | Actions < 2 sec apart |
| Rapid Actions | High threshold | 10 | >= 10 rapid actions → HIGH risk |
| Rapid Actions | Medium threshold | 5 | >= 5 rapid actions → MEDIUM risk |
| Repetitive Actions | Threshold | 15 | 15+ same type → HIGH risk |
| IP Risk - Multiple | High | 5 | >= 5 unique IPs → HIGH |
| IP Risk - Multiple | Medium | 3 | >= 3 unique IPs → MEDIUM |
| IP Risk - Switching | Threshold | 5 mins | 3 logins < 5 min → HIGH |
| Auth Rate Limit | Window | 15 mins | 10 attempts per IP |
| General API Limit | Window | 15 mins | 100 requests per IP |
| Bot Limiter | Window | 1 min | 30 actions per IP |
| JWT Expiration | Duration | 7 days | Token validity period |
| Password Hash | Rounds | 10 | Bcrypt salt rounds |

---

## 16. DETECTION REASONS (Standard Messages)

| Reason | Triggered By | Points |
|--------|-------------|--------|
| Abnormal activity rate | activityScore > 70 | +25 |
| High-risk IP detected | ipRisk === HIGH | +25 |
| Suspicious IP pattern | ipRisk === MEDIUM | +15 |
| Bot-like behavior detected | behaviorRisk === HIGH | +30 |
| Unusual behavior pattern | behaviorRisk === MEDIUM | +15 |
| Multiple device switching | deviceRisk === HIGH | +20 |
| Incomplete profile | profileCompleteness < 50 | +20 |
| Very low activity | totalActivities < 3 | +15 |
| Unusual high activity | totalActivities > 50 | +15 |
| High login frequency (bot-like) | 5 logins < 10 min | +25 |
| Frequent IP changes | 3+ unique IPs in 10 logins | +20 |
| New account with high activity | age < 2 days && activities > 10 | +25 |
| Manually flagged by admin | Admin action | Variable |

---

**Document Version:** 1.0
**Last Updated:** Analysis of complete codebase
**Scope:** All criteria, rules, and scoring systems in FPDetection application
