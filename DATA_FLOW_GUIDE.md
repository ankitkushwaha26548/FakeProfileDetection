# FPDetection System - Data Flow & Interactions Guide

## Complete Detection Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                     USER TRIGGERS ACTION                     │
│             (Register/Login/Post/Like/Comment)              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ├─→ CREATE LOGIN LOG ENTRY
                            │   └─ Store: ip, userAgent, device, createdAt
                            │
                            ├─→ LOG ACTIVITY
                            │   └─ Store: userId, type, targetId, metadata
                            │
                            └─→ RUN FAKE DETECTION
                                │
                                ├─ FETCH PROFILE DATA
                                │  └─ Get: bio, profileImage, phone, location, createdAt
                                │
                                ├─ COUNT TOTAL ACTIVITIES
                                │  └─ Check: < 3 or > 50 threshold
                                │
                                ├─ FETCH LAST 10 LOGINS
                                │  ├─ Check: 5 logins in < 10 min?
                                │  ├─ Count: unique IPs (>= 3?)
                                │  └─ Get: timestamps for analysis
                                │
                                ├─ CALCULATE ACCOUNT AGE
                                │  └─ Check: < 2 days with > 10 activities?
                                │
                                └─ GENERATE RISK SCORE
                                   ├─ Score breakdown based on 5 criteria
                                   ├─ Classify: GENUINE/SUSPICIOUS/FAKE
                                   └─ SAVE TO RISKSCORE COLLECTION
```

## Detailed Component Interaction Chain

### 1. REGISTRATION FLOW

```
User registers with (name, email, password)
    ↓
authController.registerUser()
    ├─ Validate: All fields required
    ├─ Check: Email unique
    ├─ Hash: Password with bcrypt (10 rounds)
    ├─ Create: User document
    │   └─ Role: admin if @admin.com, else user
    │
    ├─ Create: LoginLog entry
    │   └─ Data: ip, userAgent, device, location
    │
    ├─ Create: Initial Activity log
    │   └─ Type: REGISTER (implicit in code)
    │
    └─ Run: runDetection(userId)
        └─ First detection (likely GENUINE - new profile)
```

### 2. LOGIN FLOW

```
User logs in with (email, password)
    ↓
authController.loginUser()
    ├─ Find: User by email
    ├─ Verify: Password via bcrypt.compare()
    │
    ├─ Create: LoginLog entry
    │   └─ Data: ip, userAgent, device
    │       (This is entry that feeds into logins array)
    │
    ├─ Log: Activity "LOGIN" (implicit)
    │
    └─ Run: runDetection(userId)
        ├─ Fetch: Profile (get profileCompleteness)
        ├─ Count: Total activities
        ├─ Fetch: Last 10 LoginLogs
        │   ├─ Look for: 5 logins in < 10 min
        │   ├─ Count: Unique IPs
        │   └─ Check: Account age
        │
        └─ Generate: RiskScore
            ├─ Store in RiskScore collection
            └─ Update: lastUpdated timestamp
```

### 3. POST/LIKE/COMMENT FLOW

```
User creates Post/Like/Comment
    ↓
postController action (createPost/likePost/commentOnPost)
    ├─ Create/Update: Post document
    │
    ├─ Log: Activity with correct type
    │   ├─ POST: Activity.create({type: "POST"})
    │   ├─ LIKE_POST: Activity.create({type: "LIKE_POST"})
    │   └─ COMMENT: Activity.create({type: "COMMENT"})
    │
    └─ Run: runDetection(userId)
        ├─ Fetch: Profile data
        ├─ Count: Activities (now includes the new one)
        │   ├─ Check: totalActivities < 3? (score +15)
        │   └─ Check: totalActivities > 50? (score +15)
        │
        ├─ Fetch: Last 10 logins
        │   ├─ Timeline of IP changes
        │   └─ Login frequency patterns
        │
        └─ Update: RiskScore document
            └─ Completely replaced with new calculation
```

### 4. PROFILE UPDATE FLOW

```
User updates Profile
    ↓
profileController.createOrUpdateProfile()
    ├─ Find/Create: Profile document
    ├─ Update: bio, profileImage, phone, location
    │
    ├─ Calculate: profileCompleteness score
    │   └─ uses calculateProfileScore(profile)
    │   ├─ bio: +20
    │   ├─ profileImage: +25
    │   ├─ phone: +20
    │   └─ location: +15 (max 80)
    │
    ├─ Save: Updated profile with new completeness score
    │
    └─ Run: runDetection(userId)
        ├─ Fetch: Profile (includes new completeness)
        ├─ Check: profileCompleteness < 50?
        │   └─ If yes, score +20
        │
        └─ Update: RiskScore
            └─ Now includes profile completeness check
```

## Risk Assessment Sub-Pipelines

### FAKE DETECTION PIPELINE

```
runDetection(userId) called
    ↓
    ├─ CRITERION 1: Profile Completeness
    │  └─ Profile.findOne({user: userId})
    │     └─ Check: profileCompleteness < 50
    │        └─ YES → score +20, add reason
    │
    ├─ CRITERION 2: Activity Volume
    │  └─ Activity.countDocuments({user: userId})
    │     ├─ Check: count < 3
    │     │  └─ YES → score +15, add reason
    │     └─ Check: count > 50
    │        └─ YES → score +15, add reason
    │
    ├─ CRITERION 3: Login Frequency
    │  └─ LoginLog.find({user: userId})
    │        .limit(10)
    │        .sort({createdAt: -1})
    │     │
    │     ├─ Require: logins.length >= 5
    │     │
    │     └─ Calculate: logs[0].createdAt - logs[4].createdAt
    │        └─ If < 10 min (600,000ms) → score +25, add reason
    │
    ├─ CRITERION 4: IP Change Pattern
    │  └─ Extract: unique IPs from last 10 logins
    │     └─ If >= 3 unique → score +20, add reason
    │
    ├─ CRITERION 5: New Account Velocity
    │  └─ Calculate: (now - profile.createdAt) / ms_per_day
    │     ├─ If accountAgeDays < 2
    │     └─ AND totalActivities > 10
    │        └─ YES → score +25, add reason
    │
    ├─ CLASSIFY: Based on total score
    │  ├─ If score >= 60 → FAKE
    │  ├─ Else if score >= 30 → SUSPICIOUS
    │  └─ Else → GENUINE
    │
    └─ PERSIST: RiskScore.create() or update()
       └─ Store: score, level, reasons, lastUpdated
```

### ANOMALY DETECTION PIPELINE

```
anomalyDetector(userId) called
    ↓
Activity.find({user: userId})
    .limit(50)
    .sort({createdAt: -1})
    │
    ├─ Minimum check: if length < 10 → return "LOW"
    │
    ├─ RAPID ACTION DETECTION
    │  └─ Loop through consecutive activities:
    │     └─ if (current.createdAt - next.createdAt) < 2000ms
    │        └─ rapidActions++
    │     │
    │     ├─ If rapidActions >= 10 → risk = "HIGH"
    │     └─ Else if rapidActions >= 5 → risk = "MEDIUM"
    │
    ├─ PATTERN DETECTION
    │  └─ Extract all activity types: types.map(a => a.type)
    │     └─ Count first type: sameActions = types.filter(t => t === types[0]).length
    │        │
    │        └─ If sameActions >= 15 → risk = "HIGH"
    │
    └─ RETURN: risk level (HIGH/MEDIUM/LOW)
       └─ Used as behaviorRisk input to riskCalculator
```

### IP RISK PIPELINE

```
ipTracker(userId, ip) called
    ↓
LoginLog.find({user: userId})
    .limit(10)
    .sort({createdAt: -1})
    │
    ├─ UNIQUE IP COUNT
    │  └─ uniqueIps = new Set(logs.map(l => l.ip))
    │     ├─ If uniqueIps.size >= 5 → risk = "HIGH"
    │     ├─ Else if uniqueIps.size >= 3 → risk = "MEDIUM"
    │     └─ Else → risk = "LOW"
    │
    ├─ RAPID IP SWITCHING
    │  └─ Require: logs.length >= 3
    │     └─ Calculate: logs[0].createdAt - logs[2].createdAt
    │        └─ If < 5 min (300,000ms) → risk = "HIGH"
    │
    └─ RETURN: risk level (HIGH/MEDIUM/LOW)
       └─ Used as ipRisk input to riskCalculator
```

### RISK CALCULATOR PIPELINE

```
riskCalculator({activityScore, ipRisk, behaviorRisk, deviceRisk})
    ↓
    ├─ START: score = 0, reasons = []
    │
    ├─ Activity Score Check:
    │  └─ If activityScore > 70 → score += 25
    │
    ├─ IP Risk Check:
    │  ├─ If ipRisk === "HIGH" → score += 25
    │  └─ Else if ipRisk === "MEDIUM" → score += 15
    │
    ├─ Behavior Risk Check:
    │  ├─ If behaviorRisk === "HIGH" → score += 30
    │  └─ Else if behaviorRisk === "MEDIUM" → score += 15
    │
    ├─ Device Risk Check:
    │  └─ If deviceRisk === "HIGH" → score += 20
    │
    ├─ CLASSIFY: Based on final score
    │  ├─ If score >= 70 → level = "FAKE"
    │  ├─ Else if score >= 40 → level = "SUSPICIOUS"
    │  └─ Else → level = "GENUINE"
    │
    └─ RETURN: {score, level, reasons}
```

## Data Flow: Feed Endpoint with Risk Enrichment

```
User requests: GET /api/posts/feed
    ↓
postController.getFeed()
    ├─ Fetch: All posts (sorted by creation date DESC)
    │
    ├─ Extract: All unique user IDs from posts
    │
    ├─ Fetch: RiskScores for each user ID
    │  └─ RiskScore.find({user: {$in: userIds}})
    │
    ├─ Build: Risk map by user
    │  └─ Object: {userId: riskLevel}
    │
    ├─ Enrich: Each post with user risk level
    │  └─ For each post:
    │     ├─ Look up: user's riskLevel from map
    │     ├─ Default: If no risk found, use "GENUINE"
    │     └─ Attach: {...post, user: {...user, riskLevel}}
    │
    └─ RETURN: Posts with risk levels included
       └─ Client can filter/highlight posts from FAKE/SUSPICIOUS users
```

## Admin Dashboard Data Collection

```
Admin requests: GET /admin/dashboard
    ↓
adminController.getDashboardStats()
    ├─ Count: User.countDocuments()
    ├─ Count: Activity.countDocuments()
    ├─ Count: RiskScore.find({level: "GENUINE"})
    ├─ Count: RiskScore.find({level: "SUSPICIOUS"})
    └─ Count: RiskScore.find({level: "FAKE"})
        │
        └─ RETURN: Statistics for dashboard display
```

## Complete Request-Response Lifecycle Example

### SCENARIO: Newly Registered User Performs Suspicious Activity

**Step 1: Registration (Day 0, Hour 0)**
```javascript
POST /auth/register
Body: {name: "John", email: "john@example.com", password: "pass123"}

→ User created (createdAt: Day 0, Hour 0)
→ LoginLog created (ip: 192.168.1.1, createdAt: Day 0, Hour 0)
→ runDetection called
    → Profile incomplete (0 < 50) = +20
    → Activity count: 0 (< 3) = +15
    → Account age: 0 days (< 2) but activities: 0 (not > 10) = 0
    → Score: 35 → SUSPICIOUS
    → Saves: {score: 35, level: "SUSPICIOUS", reasons: [...]}
```

**Step 2: Bulk Activity (Day 0, Hour 1)**
```javascript
User rapidly creates 50 posts within 1 hour

→ Each post triggers:
    ├─ Activity logged
    └─ runDetection called
        → Final detection (after 50 posts):
        ├─ Profile still incomplete (0 < 50) = +20
        ├─ Activity count: 50 (not < 3, but = 50, not > 50) = 0
        ├─ Account age: <1 day but activities: 50 (> 10) = +25
        └─ Score: 45 → SUSPICIOUS (or 55 depending on other factors)
```

**Step 3: Rapid Login Attempts (Day 0, Hour 2)**
```javascript
5 logins from different IPs within 8 minutes

LoginLog entries (in last 10):
- logs[0]: 2:08 AM, IP: 10.20.30.40
- logs[1]: 2:04 AM, IP: 10.20.30.50
- logs[2]: 2:00 AM, IP: 10.20.30.60
- logs[3]: 1:56 AM, IP: 10.20.30.70
- logs[4]: 1:52 AM, IP: 10.20.30.80

runDetection called:
├─ Profile: still 0 = +20
├─ Activity: 50 (or more) = +15 (high)
├─ Login frequency: 5 logins < 10 min
│  └─ logs[0].time - logs[4].time = 2:08 - 1:52 = 16 min > 10 min = 0
├─ IP changes: 5 unique IPs >= 3 = +20
├─ New account with activity: age < 2 days, activities > 10 = +25
│
├─ Score: 20 + 15 + 0 + 20 + 25 = 80
└─ Classification: FAKE (score >= 60)
```

**Step 4: Admin Review (Day 0, Hour 3)**
```javascript
GET /admin/users/risky
→ User appears in FAKE list
→ Admin can view:
   - Risk Score: 80
   - Risk Level: FAKE
   - Reasons: ["Incomplete profile", "Unusual high activity", 
              "Frequent IP changes", "New account with high activity"]
   - Last 10 logins with IPs
   - All activities performed
```

## Data Validation Points

### Input Validation
```
Registration:
├─ name: required, string → res.status(400)
├─ email: required, unique → res.status(400)
└─ password: required, string → bcrypt.hash()

Login:
├─ email: required → res.status(400)
├─ password: required → res.status(400)
└─ Must match existing user

Profile Update:
└─ Fields optional but validated type via schema

Activity:
└─ Type must be in enum: ['POST', 'LIKE_POST', 'COMMENT']

RiskScore:
└─ Level must be enum: ['GENUINE', 'SUSPICIOUS', 'FAKE']
```

### Database Constraints
```
User:
├─ email: unique index
└─ role: enum validation

RiskScore:
└─ user: unique (1 risk score per user)

All models:
└─ createdAt: auto-generated on creation
```

## Persistence Strategy

### How Data Gets Saved

**Immediate Persistence:**
- User registration: Saved immediately to User collection
- Login log: Saved immediately to LoginLog collection
- Activity: Saved immediately to Activity collection
- Profile update: Saved immediately to Profile collection

**Derived & Updated on Trigger:**
- RiskScore: Created/Updated when:
  - User registers
  - User logs in
  - User creates post
  - User likes post
  - User comments
  - User updates profile
  - Admin manually flags

**Never Modified by User:**
- RiskScore: User cannot modify own risk score
- Manual flagging: Only admin can directly modify risk level

## Testing Scenarios Based on Data Flow

### Test Case 1: Clean Registration
- Expected: New user gets GENUINE or SUSPICIOUS (not FAKE without activity)
- Data: Profile empty (20 pts) + low activity (might get 15)
- Verify: RiskScore created, level appropriate

### Test Case 2: Velocity Attack (New Account + High Activity)
- Expected: FAKE classification
- Trigger: < 2 days old + > 10 activities
- Verify: +25 points added, score >= 60

### Test Case 3: IP Switching
- Expected: HIGH IP risk contribution
- Trigger: 5+ unique IPs or 3+ IPs within 5 minutes
- Verify: IP risk fed to riskCalculator

### Test Case 4: Bot-Like Behavior
- Expected: HIGH behavior risk
- Trigger: 10+ rapid actions (< 2 sec) or 15+ same type
- Verify: anomalyDetector returns HIGH

### Test Case 5: Profile Completion
- Expected: Score reduction when profile completed
- Action: Add bio, image, phone, location
- Verify: profileCompleteness increases, detection score decreases

---

**Data Flow Version:** 1.0
**Covers:** All major system flows and interactions
