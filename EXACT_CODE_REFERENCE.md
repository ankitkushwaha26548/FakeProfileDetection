# FPDetection System - Exact Code Implementation Reference

## 1. RISK CALCULATOR - EXACT CODE

**File:** [backend/utils/riskCalculator.js](backend/utils/riskCalculator.js)

```javascript
export default function riskCalculator({ activityScore, ipRisk, behaviorRisk, deviceRisk }) {
  let score = 0;
  let reasons = [];

  // Activity based risk
  if (activityScore > 70) {
    score += 25;
    reasons.push("Abnormal activity rate");
  }

  // IP risk
  if (ipRisk === "HIGH") {
    score += 25;
    reasons.push("High-risk IP detected");
  } else if (ipRisk === "MEDIUM") {
    score += 15;
    reasons.push("Suspicious IP pattern");
  }

  // Behavior risk
  if (behaviorRisk === "HIGH") {
    score += 30;
    reasons.push("Bot-like behavior detected");
  } else if (behaviorRisk === "MEDIUM") {
    score += 15;
    reasons.push("Unusual behavior pattern");
  }

  // Device risk
  if (deviceRisk === "HIGH") {
    score += 20;
    reasons.push("Multiple device switching");
  }

  // Classification
  let level = "GENUINE";

  if (score >= 70) level = "FAKE";
  else if (score >= 40) level = "SUSPICIOUS";

  return {score, level, reasons};
}
```

**Scoring Rules:**
- Activity > 70 = +25 points
- IP HIGH = +25 points, IP MEDIUM = +15 points
- Behavior HIGH = +30 points, MEDIUM = +15 points
- Device HIGH = +20 points
- **Classification:** Score >= 70 → FAKE, 40-69 → SUSPICIOUS, < 40 → GENUINE

---

## 2. PROFILE SCORE CALCULATOR - EXACT CODE

**File:** [backend/utils/profileScore.js](backend/utils/profileScore.js)

```javascript
export const calculateProfileScore = (profile) => {
    let score = 0;

    if (profile.bio) score += 20;
    if (profile.profileImage) score += 25;
    if (profile.phone) score += 20;
    if (profile.location) score += 15;

    return score; //max = 80 (can normalize to 100 later)
};
```

**Field Points:**
- Bio: 20 points (if exists)
- Profile Image: 25 points (if exists)
- Phone: 20 points (if exists)
- Location: 15 points (if exists)
- **Maximum:** 80 points (not normalized to 100)

---

## 3. FAKE DETECTION - EXACT CODE

**File:** [backend/utils/fakeDetection.js](backend/utils/fakeDetection.js)

```javascript
import Profile from '../models/Profile.js';
import Activity from '../models/Activity.js';
import RiskScore from '../models/RiskScore.js';
import LoginLog from '../models/LoginLog.js';

const runDetection = async (userId) => {
    try {
        let score = 0;
        let reasons = [];

        // 1. PROFILE COMPLETENESS
        const profile = await Profile.findOne({ user: userId });

        if (!profile || (profile.profileCompleteness || 0) < 50) {
            score += 20;
            reasons.push("Incomplete profile");
        }

        // 2. ACTIVITY BEHAVIOR
        const totalActivities = await Activity.countDocuments({ user: userId });

        if (totalActivities < 3) {
            score += 15;
            reasons.push("Very low activity");
        }

        if (totalActivities > 50) {
            score += 15;
            reasons.push("Unusual high activity");
        }

        // 3. LOGIN FREQUENCY
        const logins = await LoginLog.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10);

        if (logins.length >= 5) {
            const timeDiff =
                new Date(logins[0].createdAt) -
                new Date(logins[4].createdAt);

            if (timeDiff < 10 * 60 * 1000) {
                score += 25;
                reasons.push("High login frequency (bot-like)");
            }
        }

        // 4. IP CHANGE PATTERN
        const recentIPs = logins.map(log => log.ip);
        const uniqueIPs = [...new Set(recentIPs)];

        if (uniqueIPs.length >= 3) {
            score += 20;
            reasons.push("Frequent IP changes");
        }

        // 5. ACCOUNT AGE
        const accountAgeDays =
            (Date.now() - new Date(profile?.createdAt || Date.now())) /
            (1000 * 60 * 60 * 24);

        if (accountAgeDays < 2 && totalActivities > 10) {
            score += 25;
            reasons.push("New account with high activity");
        }

        // FINAL CLASSIFICATION
        let level = "GENUINE";
        if (score >= 60) level = "FAKE";
        else if (score >= 30) level = "SUSPICIOUS";

        // SAVE / UPDATE
        let risk = await RiskScore.findOne({ user: userId });

        if (!risk) {
            risk = await RiskScore.create({
                user: userId,
                score,
                level,
                reasons
            });
        } else {
            risk.score = score;
            risk.level = level;
            risk.reasons = reasons;
            risk.lastUpdated = new Date();
            await risk.save();
        }

        return risk;

    } catch (error) {
        console.error("Detection error:", error.message);
        return null;
    }
};

export default runDetection;
```

**Scoring Breakdown:**
1. Profile Completeness < 50 = +20
2. Activity < 3 = +15
3. Activity > 50 = +15
4. Login frequency: 5 logins within < 10 min = +25
5. IP changes: ≥ 3 unique IPs = +20
6. New account (< 2 days) with > 10 activities = +25

**Classification:**
- Score >= 60 → FAKE
- Score 30-59 → SUSPICIOUS
- Score < 30 → GENUINE

---

## 4. ANOMALY DETECTOR - EXACT CODE

**File:** [backend/utils/anomalyDetector.js](backend/utils/anomalyDetector.js)

```javascript
import Activity from '../models/Activity.js'

export default async function anomalyDetector(userId) {
  const activities = await Activity.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50);

  let risk = "LOW";

  if (activities.length < 10) return risk;

  // Frequency analysis
  let rapidActions = 0;
  for (let i = 0; i < activities.length - 1; i++) {
    const diff = new Date(activities[i].createdAt) - new Date(activities[i + 1].createdAt);
    if (diff < 2000) rapidActions++; // actions within 2 seconds
  }

  if (rapidActions >= 10) {
    risk = "HIGH";
  } else if (rapidActions >= 5) {
    risk = "MEDIUM";
  }

  // Pattern detection (repetitive actions)
  const types = activities.map(a => a.type);
  const sameActions = types.filter(t => t === types[0]).length;

  if (sameActions >= 15) {
    risk = "HIGH";
  }

  return risk;
}
```

**Detection Criteria:**
- **Rapid Actions:** Actions within 2 seconds (< 2000ms)
  - >= 10 rapid actions = HIGH
  - >= 5 rapid actions = MEDIUM
  
- **Repetitive Pattern:** Same action type consecutive count
  - >= 15 same type = HIGH

- **Minimum Requirement:** At least 10 activities needed (otherwise returns LOW)
- **Analysis Window:** Last 50 activities

---

## 5. IP TRACKER - EXACT CODE

**File:** [backend/utils/ipTracker.js](backend/utils/ipTracker.js)

```javascript
import LoginLog from '../models/LoginLog.js'

export default async function ipTracker(userId, ip) {
  const logs = await LoginLog.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

  let risk = "LOW";

  // Multiple IPs in short time
  const uniqueIps = new Set(logs.map(l => l.ip));
  if (uniqueIps.size >= 5) {
    risk = "HIGH";
  } else if (uniqueIps.size >= 3) {
    risk = "MEDIUM";
  }

  // Rapid IP switching
  if (logs.length >= 3) {
    const timeDiff = new Date(logs[0].createdAt) - new Date(logs[2].createdAt);
    if (timeDiff < 5 * 60 * 1000) { // 5 minutes
      risk = "HIGH";
    }
  }

  return risk;
}
```

**IP Risk Assessment:**
1. **Unique IP Count (last 10 logins):**
   - >= 5 unique IPs = HIGH
   - >= 3 unique IPs = MEDIUM
   - < 3 = LOW

2. **Rapid Switching:**
   - 3+ logins within < 5 minutes = HIGH

---

## 6. ACTIVITY LOGGER - EXACT CODE

**File:** [backend/utils/activityLogger.js](backend/utils/activityLogger.js)

```javascript
import Activity from "../models/Activity.js";

// Log user activity
export const logActivity = async (userId, type, targetId=null, metadata = {}) => {
    try {
        await Activity.create({
            user: userId,
            type,
            targetId,
            metadata
        });
    } catch (error) {
        console.error("Activity log error:", error.message);
    }
};
```

**Activity Types:** POST, LIKE_POST, COMMENT, LOGIN, REGISTER

**Parameters:**
- userId: User reference
- type: Activity type (enum)
- targetId: Optional post/target reference
- metadata: Optional additional data object

---

## 7. AUTH CONTROLLER - EXACT CODE EXCERPTS

**File:** [backend/controllers/authController.js](backend/controllers/authController.js)

### Registration Validation:
```javascript
export const registerUser = async (req, res) => {
    try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    //check if user exists
    let user = await User.findOne({ email });
    if(user) {
        return res.status(400).json({ message: 'User already exists' });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user
    user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: email.endsWith('@admin.com') ? 'admin' : 'user'
    });
```

**Validation Rules:**
- name, email, password all required
- email must be unique
- Password hashed with bcrypt (10 rounds)
- Email ends with '@admin.com' → admin role, else user role

### Login Validation:
```javascript
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        //check if user exists
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        //check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
```

**Validation Rules:**
- email and password required
- User must exist
- Password must match hash via bcrypt.compare()
- JWT token expires in 7 days

---

## 8. PROFILE CONTROLLER - EXACT CODE

**File:** [backend/controllers/profileController.js](backend/controllers/profileController.js)

```javascript
export const createOrUpdateProfile = async (req, res) => {
    try {
        const { bio, profileImage, phone, location } = req.body;

        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            //update 
            profile.bio = bio || profile.bio;
            profile.profileImage = profileImage || profile.profileImage;
            profile.phone = phone || profile.phone;
            profile.location = location || profile.location;

        }
        else {
            //create new profile
            profile = new Profile({
                user: req.user._id,
                bio,
                profileImage,
                phone,
                location
            });
        }
        //calculate profile completeness
        profile.profileCompleteness = calculateProfileScore(profile);

        await profile.save();
        await runDetection(req.user._id);

        res.json({
            message: "Profile Saved",
            profile
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

**Profile Update Logic:**
- Find or create profile
- Update individual fields only if provided
- Recalculate profileCompleteness score
- Re-run fake detection immediately
- Save to database

---

## 9. MIDDLEWARE - EXACT CODE

### Auth Middleware
**File:** [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js)

```javascript
export const protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
     } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
     }  
    };

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    }; 
};
```

**Token Requirements:**
- Format: `Authorization: Bearer <token>`
- JWT verified with JWT_SECRET
- User must exist in database
- Token expiration: 7 days

### Rate Limiter Middleware
**File:** [backend/middleware/rateLimiter.js](backend/middleware/rateLimiter.js)

```javascript
// Auth limiter (login/register protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login/register attempts
  message: {
    message: "Too many auth attempts. Try again later."
  }
});

// Bot-like behavior limiter
export const botLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 actions per minute
  message: {
    message: "Suspicious activity detected. Slow down."
  }
});

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: {
    message: "Too many requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});
```

**Rate Limits:**
- Auth: 10 attempts per 15 minutes
- Bot: 30 actions per 1 minute
- General: 100 requests per 15 minutes

---

## 10. DETECTION INTEGRATION IN CONTROLLERS

**Auto-Detection Trigger Points:**

### Post Creation
**File:** [backend/controllers/postController.js](backend/controllers/postController.js) - Line 9-12
```javascript
await logActivity(req.user._id, "POST", post._id);
await runDetection(req.user._id);
```

### Like Post
**File:** [backend/controllers/postController.js](backend/controllers/postController.js) - Line 26-27
```javascript
await logActivity(req.user._id, "LIKE_POST", post._id);
await runDetection(req.user._id);
```

### Comment Post
**File:** [backend/controllers/postController.js](backend/controllers/postController.js) - Line 39-40
```javascript
await logActivity(req.user._id, "COMMENT", post._id);
await runDetection(req.user._id);
```

### Profile Update
**File:** [backend/controllers/profileController.js](backend/controllers/profileController.js) - Line 28
```javascript
profile.profileCompleteness = calculateProfileScore(profile);
await profile.save();
await runDetection(req.user._id);
```

---

## 11. MODEL SCHEMAS - EXACT DEFINITIONS

### User Model
**File:** [backend/models/User.js](backend/models/User.js)
```javascript
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
```

### Activity Model
**File:** [backend/models/Activity.js](backend/models/Activity.js)
```javascript
const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['POST', 'LIKE_POST', 'COMMENT'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: Object },
    createdAt: { type: Date, default: Date.now }
});
```

### RiskScore Model
**File:** [backend/models/RiskScore.js](backend/models/RiskScore.js)
```javascript
const riskScoreSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    score: { type: Number, default: 0 },
    level: { type: String, enum: ['GENUINE', 'SUSPICIOUS', 'FAKE'], default: 'GENUINE' },
    reasons: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now }
});
```

### LoginLog Model
**File:** [backend/models/LoginLog.js](backend/models/LoginLog.js)
```javascript
const loginLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ip: { type: String, required: true },
  userAgent: { type: String },
  device: { type: String },
  createdAt: { type: Date, default: Date.now }
});
```

---

## 12. ADMIN FUNCTIONS - EXACT CODE

**File:** [backend/controllers/adminController.js](backend/controllers/adminController.js)

### Manual User Flagging:
```javascript
export const flagUser = async (req, res) => {
  try {
    const risk = await RiskScore.findOne({ user: req.params.userId });

    if (!risk) {
      return res.status(404).json({ message: "Risk profile not found" });
    }

    risk.level = "FAKE";
    risk.score = 100;
    risk.reasons.push("Manually flagged by admin");
    await risk.save();

    res.json({ message: "User flagged as FAKE" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Manual Flag Effects:**
- Sets level = "FAKE"
- Sets score = 100
- Adds reason "Manually flagged by admin"
- Immediate persistence to database

---

**Code Reference Version:** 1.0
**All code is from the actual application files as of the codebase snapshot**
