# FPDetection System - Quick Reference & Visual Guide

## Risk Score Components at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│          RISK CALCULATION PIPELINE                          │
└─────────────────────────────────────────────────────────────┘

User Activity → Detection Engine → Risk Assessment → Classification

Detection Components:
├─ anomalyDetector()     → Behavior Risk (HIGH/MEDIUM/LOW)
├─ ipTracker()           → IP Risk (HIGH/MEDIUM/LOW)
├─ fakeDetection()       → Direct Score + Reasons
└─ riskCalculator()      → Final Score & Level
```

## Scoring Matrix Reference

### Risk Calculator Scoring Breakdown
```
┌─────────────────────────┬────────────┬──────────────────────┐
│ Risk Factor             │ Points     │ Trigger              │
├─────────────────────────┼────────────┼──────────────────────┤
│ Activity Score HIGH     │ +25        │ activityScore > 70   │
│ IP Risk - HIGH          │ +25        │ Multiple/Rapid IPs   │
│ IP Risk - MEDIUM        │ +15        │ Medium risk pattern  │
│ Behavior HIGH (Bot)     │ +30        │ Rapid/Repetitive     │
│ Behavior MEDIUM         │ +15        │ Unusual patterns     │
│ Device Switching        │ +20        │ Multiple devices     │
├─────────────────────────┼────────────┼──────────────────────┤
│ TOTAL POSSIBLE          │ 125+       │ All conditions met   │
└─────────────────────────┴────────────┴──────────────────────┘

Classification:
Score < 40          → GENUINE
Score 40-69         → SUSPICIOUS  
Score 70+           → FAKE
```

## Fake Detection Criteria Summary

```
PROFILE COMPLETENESS SCORE
┌──────────────────────────┐
│ Bio:            +20 pts  │
│ Profile Image:  +25 pts  │
│ Phone:          +20 pts  │
│ Location:       +15 pts  │
├──────────────────────────┤
│ TOTAL MAX:       80 pts  │
│ THRESHOLD:       < 50    │
│ RISK IF LOW:    +20 pts  │
└──────────────────────────┘

ACTIVITY PATTERNS
┌──────────────────────────┐
│ Total < 3:      +15 pts  │
│ Total > 50:     +15 pts  │
│ Optimal:         3-50    │
└──────────────────────────┘

LOGIN FREQUENCY (BOT DETECTION)
┌──────────────────────────┐
│ Window:        10 mins   │
│ Logins:        5 login   │
│ TRIGGER:       < 10 min  │
│ RISK SCORE:    +25 pts   │
└──────────────────────────┘

IP CHANGES
┌──────────────────────────┐
│ Unique IPs:    3 or more │
│ Window:        10 logins │
│ RISK SCORE:    +20 pts   │
└──────────────────────────┘

NEW ACCOUNT VELOCITY
┌──────────────────────────┐
│ Account Age:   < 2 days  │
│ Activities:    > 10      │
│ RISK SCORE:    +25 pts   │
└──────────────────────────┘

Fake Detection Classification:
Score < 30      → GENUINE
Score 30-59     → SUSPICIOUS
Score 60+       → FAKE
```

## Anomaly Detection Thresholds

```
RAPID ACTION DETECTION
┌──────────────────────────────┐
│ Time Threshold:   2 seconds  │
│                              │
│ 10+ rapid actions → HIGH     │
│ 5-9 rapid actions → MEDIUM   │
│ < 5 rapid actions → LOW      │
└──────────────────────────────┘

REPETITIVE PATTERN DETECTION
┌──────────────────────────────┐
│ Pattern:    Same action type │
│ Threshold:  15+ consecutive  │
│ Risk Level: HIGH             │
│                              │
│ Example: Like same post 15+  │
│         times in short span  │
└──────────────────────────────┘

Analysis Window: Last 50 activities
Minimum Activities: 10 required for analysis
```

## IP Risk Assessment

```
UNIQUE IP COUNT (Last 10 logins)
┌──────────────────────┐
│ 5+ IPs  → HIGH       │
│ 3-4 IPs → MEDIUM     │
│ <3 IPs  → LOW        │
└──────────────────────┘

RAPID IP SWITCHING
┌──────────────────────┐
│ Time Window: 5 min   │
│ Condition: 3+ logins │
│ Result:    HIGH RISK │
└──────────────────────┘
```

## Authentication & Authorization Flow

```
┌─ REQUEST ARRIVES ─────────────────────┐
│                                        │
├─ CHECK TOKEN ────────────────────────┤
│  ├─ Header: "Authorization: Bearer X" │
│  ├─ JWT valid? (not expired)         │
│  └─ User exists? (in database)       │
│                                        │
├─ CHECK AUTHORIZATION ────────────────┤
│  ├─ Is user? (201 role)              │
│  ├─ Is admin? (admin role)           │
│  └─ Check role restrictions          │
│                                        │
└─ PROCEED / DENY ─────────────────────┘

JWT Details:
├─ Expiration: 7 days
├─ Secret: JWT_SECRET env var
└─ Payload: { id: user._id }
```

## Rate Limiting Summary

```
┌─────────────────────────┬──────────┬────────────┬─────────────┐
│ Limiter Type            │ Window   │ Max        │ Purpose     │
├─────────────────────────┼──────────┼────────────┼─────────────┤
│ Auth (login/register)   │ 15 min   │ 10 per IP  │ Brute force │
│ General API             │ 15 min   │ 100 per IP │ DoS prevent │
│ Bot Detection           │ 1 min    │ 30 per IP  │ Automation  │
└─────────────────────────┴──────────┴────────────┴─────────────┘
```

## Database Models Architecture

```
USER
├─ _id (PK)
├─ name (required)
├─ email (unique, required)
├─ password (hashed)
├─ role (user | admin)
└─ createdAt

PROFILE (1:1 with User)
├─ _id
├─ user (FK → User)
├─ bio (max 20 pts)
├─ profileImage (max 25 pts)
├─ phone (max 20 pts)
├─ location (max 15 pts)
├─ profileCompleteness (0-80)
└─ createdAt

ACTIVITY (1:N with User)
├─ _id
├─ user (FK → User)
├─ type (POST | LIKE_POST | COMMENT)
├─ targetId (post ref)
├─ metadata (object)
└─ createdAt

RISKSCORE (1:1 with User)
├─ _id
├─ user (FK → User, unique)
├─ score (0-125)
├─ level (GENUINE | SUSPICIOUS | FAKE)
├─ reasons (array of strings)
└─ lastUpdated

LOGINLOG (1:N with User)
├─ _id
├─ user (FK → User)
├─ ip (required)
├─ userAgent
├─ device
└─ createdAt

POST
├─ _id
├─ user (FK → User)
├─ content (required)
├─ likes (array of user refs)
├─ comments (array of comments)
└─ createdAt
```

## Detection Reasons Catalog

```
Profile-Related:
├─ "Incomplete profile" (+20)
├─ "New account with high activity" (+25)

Activity-Related:
├─ "Very low activity" (+15)
├─ "Unusual high activity" (+15)
├─ "Abnormal activity rate" (+25)

Login-Related:
├─ "High login frequency (bot-like)" (+25)
├─ "Frequent IP changes" (+20)

IP-Related:
├─ "High-risk IP detected" (+25)
├─ "Suspicious IP pattern" (+15)

Behavior-Related:
├─ "Bot-like behavior detected" (+30)
├─ "Unusual behavior pattern" (+15)
├─ "Multiple device switching" (+20)

Admin-Related:
└─ "Manually flagged by admin" (variable)
```

## Master Threshold Reference Table

```
┌──────────────────────────┬────────────┬──────────────────────┐
│ Threshold                │ Value      │ Unit                 │
├──────────────────────────┼────────────┼──────────────────────┤
│ Risk Score - FAKE        │ >= 70      │ Points               │
│ Risk Score - SUSPICIOUS  │ 40-69      │ Points               │
│ Profile Completeness Min │ 50         │ Points (0-80)        │
│ Activity Volume Low      │ < 3        │ Total activities     │
│ Activity Volume High     │ > 50       │ Total activities     │
│ Login Frequency Window   │ 10         │ Minutes              │
│ Login Frequency Count    │ 5          │ Logins               │
│ IP Changes Threshold     │ 3          │ Unique IPs           │
│ Account Age Threshold    │ 2          │ Days                 │
│ Rapid Action Time        │ 2          │ Seconds              │
│ Rapid Action Threshold   │ 10         │ Count                │
│ Repetitive Action        │ 15         │ Same type count      │
│ IP Risk High             │ 5          │ Unique IPs           │
│ IP Risk Medium           │ 3          │ Unique IPs           │
│ Auth Rate Limit          │ 10         │ Per 15 minutes       │
│ Bot Rate Limit           │ 30         │ Per 1 minute         │
│ JWT Expiration           │ 7          │ Days                 │
└──────────────────────────┴────────────┴──────────────────────┘
```

## Key Calculations at a Glance

### Profile Completeness Score
```python
score = (bio ? 20 : 0) + (profileImage ? 25 : 0) + 
        (phone ? 20 : 0) + (location ? 15 : 0)
# Max = 80
# Threshold for risk = score < 50
```

### Fake Detection Score
```python
score = 0
if profileCompleteness < 50: score += 20
if totalActivities < 3: score += 15
if totalActivities > 50: score += 15
if 5_logins_within_10min: score += 25
if 3plus_unique_ips: score += 20
if account_age < 2_days and activities > 10: score += 25
# Classification: < 30 = GENUINE, 30-59 = SUSPICIOUS, 60+ = FAKE
```

### Risk Calculator Score
```python
score = 0
if activityScore > 70: score += 25
if ipRisk == "HIGH": score += 25
elif ipRisk == "MEDIUM": score += 15
if behaviorRisk == "HIGH": score += 30
elif behaviorRisk == "MEDIUM": score += 15
if deviceRisk == "HIGH": score += 20
# Classification: < 40 = GENUINE, 40-69 = SUSPICIOUS, 70+ = FAKE
```

### Anomaly Risk
```python
risk = "LOW"
if rapidActions >= 10: risk = "HIGH"
elif rapidActions >= 5: risk = "MEDIUM"
if sameActions >= 15: risk = "HIGH"
# # of rapid actions = consecutive actions < 2 seconds apart
# sameActions = consecutive activities of same type
```

---

## Admin Functions Quick Reference

```
DASHBOARD METRICS
├─ Total Users Count
├─ Total Activities Count
├─ Genuine Users (GENUINE level)
├─ Suspicious Users (SUSPICIOUS level)
└─ Fake Users (FAKE level)

MONITORING
├─ Get All Users With Risk Scores
├─ View Fake Users Only
├─ View Suspicious Users Only
├─ Monitor All Login Logs (sorted by date)

MANUAL ACTIONS
├─ Flag User as FAKE
│  ├─ Sets level = "FAKE"
│  ├─ Sets score = 100
│  ├─ Adds admin reason
│  └─ Saves immediately
```

## Testing Checklist for Each Component

```
✓ Profile Score: Test all 4 field combinations
✓ Fake Detection: Test each of 5 criteria independently
✓ Anomaly Detector: Test rapid actions & repetition
✓ IP Tracker: Test unique IP counts & rapid switching
✓ Risk Calculator: Test all risk combinations
✓ Rate Limiters: Hit limits for auth/bot/general
✓ Auth Flow: Valid/invalid tokens, expired tokens
✓ Admin: Verify role check & manual flagging
```

---

**Quick Reference Version:** 1.0
**For detailed information:** See CRITERIA_AND_RULES_GUIDE.md
