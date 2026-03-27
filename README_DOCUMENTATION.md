# FPDetection Complete System Documentation - Index & Guide

## 📋 Documentation Files Overview

This directory contains four comprehensive documents covering ALL criteria, rules, scoring systems, and validation logic in the FPDetection system.

### Document 1: [CRITERIA_AND_RULES_GUIDE.md](CRITERIA_AND_RULES_GUIDE.md) ⭐ START HERE
**Most Comprehensive Reference**
- **Content:** Detailed breakdown of every criterion, rule, and scoring system
- **Format:** Organized by 16 major categories with detailed tables
- **Best For:** 
  - Understanding the complete system
  - Finding specific thresholds and values
  - Reference documentation
  - Cross-referencing with actual code
- **Key Sections:**
  1. Risk Scoring & Classification System
  2. Fake Detection Criteria
  3. Anomaly Detection Criteria
  4. IP Risk Assessment
  5. Profile Completeness Scoring
  6. Activity Logging Criteria
  7. Login Validation Criteria
  8. Rate Limiting Rules
  9. Authorization & Authentication Rules
  10. Bot-like Behavior Detection
  11. Admin Functions & Controls
  12. Profile Update Validation
  13. Data Models & Validation
  14. Detection Flow Summary
  15. Summary of All Thresholds & Constants
  16. Detection Reasons Catalog

---

### Document 2: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) ⚡ FOR QUICK LOOKUPS
**Visual & Condensed Reference**
- **Content:** Scoreboards, visual diagrams, and condensed tables
- **Format:** ASCII art scoreboards, matrices, quick-reference tables
- **Best For:**
  - Quick lookups of specific thresholds
  - Understanding relationships between components
  - Visual learners
  - Scoreboard references
  - Testing checklists
- **Key Sections:**
  - Risk Score Components at a Glance
  - Scoring Matrix Reference
  - Anomaly Detection Thresholds
  - IP Risk Assessment
  - Authentication & Authorization Flow
  - Rate Limiting Summary
  - Database Models Architecture
  - Detection Reasons Catalog
  - Master Threshold Reference Table
  - Key Calculations
  - Testing Checklist

---

### Document 3: [EXACT_CODE_REFERENCE.md](EXACT_CODE_REFERENCE.md) 💻 FOR VERIFICATION
**Actual Code Implementations**
- **Content:** Exact code snippets from every major function
- **Format:** Code blocks with inline documentation
- **Best For:**
  - Verifying implementation details
  - Debugging issues
  - Understanding exact logic
  - Cross-referencing documentation with code
  - Training developers
- **Key Sections:**
  1. Risk Calculator - Exact Code
  2. Profile Score Calculator - Exact Code
  3. Fake Detection - Exact Code
  4. Anomaly Detector - Exact Code
  5. IP Tracker - Exact Code
  6. Activity Logger - Exact Code
  7. Auth Controller - Exact Code Excerpts
  8. Profile Controller - Exact Code
  9. Middleware - Exact Code
  10. Detection Integration in Controllers
  11. Model Schemas
  12. Admin Functions
  13. All includes file path links for easy reference

---

### Document 4: [DATA_FLOW_GUIDE.md](DATA_FLOW_GUIDE.md) 🔄 FOR SYSTEM UNDERSTANDING
**System Architecture & Flows**
- **Content:** How data moves through the system, complete scenarios
- **Format:** Flowcharts (ASCII), pipeline diagrams, lifecycle examples
- **Best For:**
  - Understanding system architecture
  - Tracing data through pipelines
  - Learning complete workflows
  - Scenario-based testing
  - Admin process understanding
  - Following real-world examples
- **Key Sections:**
  - Complete Detection Pipeline
  - Detailed Component Interaction Chain
  - Risk Assessment Sub-Pipelines
  - Data Flow Examples
  - Admin Dashboard Data Collection
  - Complete Request-Response Lifecycle Examples
  - Data Validation Points
  - Persistence Strategy
  - Testing Scenarios Based on Data Flow

---

## 🎯 How to Use These Documents

### If You Want to...

**Understand the overall system:**
1. Start with [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - visual overview
2. Read [DATA_FLOW_GUIDE.md](DATA_FLOW_GUIDE.md) - system architecture
3. Reference [CRITERIA_AND_RULES_GUIDE.md](CRITERIA_AND_RULES_GUIDE.md) - detailed rules

**Find a specific threshold:**
1. Quick lookup in [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Master Threshold Reference Table
2. Detailed explanation in [CRITERIA_AND_RULES_GUIDE.md](CRITERIA_AND_RULES_GUIDE.md)

**Fix a bug or verify logic:**
1. Look up exact code in [EXACT_CODE_REFERENCE.md](EXACT_CODE_REFERENCE.md)
2. Understand the flow in [DATA_FLOW_GUIDE.md](DATA_FLOW_GUIDE.md)
3. Check thresholds in [CRITERIA_AND_RULES_GUIDE.md](CRITERIA_AND_RULES_GUIDE.md)

**Design a test case:**
1. Use scenario examples from [DATA_FLOW_GUIDE.md](DATA_FLOW_GUIDE.md) - Complete Request-Response Lifecycle
2. Reference thresholds from [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
3. Check testing checklist in [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

**Understand bot detection:**
1. Read [CRITERIA_AND_RULES_GUIDE.md](CRITERIA_AND_RULES_GUIDE.md) - Section 10: Bot-like Behavior Detection
2. Check thresholds in [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Anomaly Detection Thresholds
3. View exact code in [EXACT_CODE_REFERENCE.md](EXACT_CODE_REFERENCE.md) - Anomaly Detector

**Onboard a new developer:**
1. Start with [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. Move to [CRITERIA_AND_RULES_GUIDE.md](CRITERIA_AND_RULES_GUIDE.md)
3. Study [DATA_FLOW_GUIDE.md](DATA_FLOW_GUIDE.md)
4. Reference [EXACT_CODE_REFERENCE.md](EXACT_CODE_REFERENCE.md)

---

## 📊 Complete System Criteria Summary

### Risk Scoring Components
- **Risk Calculator:** 6 input factors, max score 125, 3 classification levels
- **Fake Detection:** 5 criteria-based scoring, separate classification scale
- **Anomaly Detection:** 2 pattern types detected (rapid actions + repetitive)
- **IP Tracking:** 2 detection methods (unique count + switching speed)
- **Profile Scoring:** 4 optional fields, max 80 points

### Detection Workflows
- **Fake Detection:** Triggered on every user action (login, register, post, like, comment)
- **Anomaly Detection:** Analyzes last 50 activities for behavior patterns
- **IP Tracking:** Analyzes last 10 logins for IP patterns
- **Profile Completeness:** Calculated on profile update
- **Auto-Enrichment:** Posts in feed automatically tagged with user risk level

### Validation Points
- **Registration:** 3 required fields (name, email, password), email unique, password hashed
- **Login:** Email & password validated, JWT issued with 7-day expiration
- **Authorization:** Role-based access control (user/admin), token verification
- **Rate Limiting:** 3 different limits (auth: 10/15min, api: 100/15min, bot: 30/1min)
- **Profile Update:** Fields optional, profileCompleteness auto-calculated

### Classification Levels
- **Risk Score:** 0-39 = GENUINE, 40-69 = SUSPICIOUS, 70+ = FAKE
- **Fake Detection:** 0-29 = GENUINE, 30-59 = SUSPICIOUS, 60+ = FAKE
- **Anomaly Risk:** LOW, MEDIUM, HIGH (behavioral only)
- **IP Risk:** LOW, MEDIUM, HIGH (pattern-based)

---

## 🔢 Key Thresholds at a Glance

| Criterion | Threshold | Value | Points |
|-----------|-----------|-------|--------|
| Risk Score - FAKE | >= | 70 | N/A |
| Risk Score - SUSPICIOUS | 40-69 | N/A | N/A |
| Profile Completeness | < | 50 | +20 |
| Activity Volume Low | < | 3 | +15 |
| Activity Volume High | > | 50 | +15 |
| Login Frequency | 5 logins in | < 10 min | +25 |
| IP Changes | >= | 3 unique | +20 |
| New Account Velocity | < 2 days + | > 10 activities | +25 |
| Rapid Actions | >= | 10 in <2sec | HIGH |
| Repetitive Pattern | >= | 15 same type | HIGH |
| IP Risk - High | >= | 5 unique | HIGH |
| IP Risk - Medium | >= | 3 unique | MEDIUM |
| IP Switching | 3+ logins | <5 min | HIGH |
| Auth Rate Limit | per | 15 min | 10/IP |
| Bot Rate Limit | per | 1 min | 30/IP |
| General API Limit | per | 15 min | 100/IP |

---

## 📁 File Structure Referenced

```
backend/
├── utils/
│   ├── riskCalculator.js          [See CRITERIA #1, CODE #1]
│   ├── profileScore.js            [See CRITERIA #5, CODE #2]
│   ├── fakeDetection.js           [See CRITERIA #2, CODE #3]
│   ├── anomalyDetector.js         [See CRITERIA #3, CODE #4]
│   ├── ipTracker.js               [See CRITERIA #4, CODE #5]
│   └── activityLogger.js          [See CRITERIA #6, CODE #6]
├── controllers/
│   ├── authController.js          [See CRITERIA #7, CODE #7]
│   ├── profileController.js       [See CRITERIA #12, CODE #8]
│   ├── postController.js          [See DATA FLOW sections]
│   ├── detectionController.js     [See CRITERIA #11]
│   ├── adminController.js         [See CRITERIA #11, CODE #12]
│   └── activityController.js      [See CRITERIA #6]
├── middleware/
│   ├── authMiddleware.js          [See CRITERIA #9, CODE #9]
│   ├── rateLimiter.js             [See CRITERIA #8, CODE #9]
│   ├── adminMiddleware.js         [See CRITERIA #9]
│   └── errorHandler.js            [See CRITERIA #9]
├── models/
│   ├── User.js                    [See CRITERIA #13, CODE #11]
│   ├── Profile.js                 [See CRITERIA #5, #13, CODE #11]
│   ├── Activity.js                [See CRITERIA #6, #13, CODE #11]
│   ├── RiskScore.js               [See CRITERIA #1, #13, CODE #11]
│   ├── LoginLog.js                [See CRITERIA #4, #7, CODE #11]
│   └── Post.js                    [See CODE #11]
└── routes/
    ├── authRoutes.js              [See CRITERIA #7]
    └── postRoutes.js              [See DATA FLOW sections]
```

---

## 🧪 Testing & Verification

### Test Each Component Using:
1. **QUICK_REFERENCE.md** → Testing Checklist section
2. **DATA_FLOW_GUIDE.md** → Testing Scenarios Based on Data Flow
3. **EXACT_CODE_REFERENCE.md** → Verify against actual code
4. **CRITERIA_AND_RULES_GUIDE.md** → Cross-reference thresholds

### Example Test Scenarios in Detail:
- Test Case 1: Clean Registration (in DATA_FLOW_GUIDE)
- Test Case 2: Velocity Attack (in DATA_FLOW_GUIDE)  
- Test Case 3: IP Switching (in DATA_FLOW_GUIDE)
- Test Case 4: Bot-like Behavior (in DATA_FLOW_GUIDE)
- Test Case 5: Profile Completion (in DATA_FLOW_GUIDE)

---

## 📖 Cross-Reference Guide

### To Find Information About...

**Risk Scoring**
- Concept Overview: CRITERIA #1, QUICK #1
- Code: EXACT #1
- Data Flow: DATA_FLOW #3

**Fake Detection**
- Concept Overview: CRITERIA #2, QUICK #2
- Code: EXACT #3
- Data Flow: DATA_FLOW #2

**Anomaly Detection**
- Concept Overview: CRITERIA #3, QUICK #3
- Code: EXACT #4
- Data Flow: DATA_FLOW #3

**IP Risk Assessment**
- Concept Overview: CRITERIA #4, QUICK #3
- Code: EXACT #5
- Data Flow: DATA_FLOW #3

**Profile Completeness**
- Concept Overview: CRITERIA #5, QUICK #1
- Code: EXACT #2
- Data Flow: DATA_FLOW #3

**Activity Logging**
- Concept Overview: CRITERIA #6
- Code: EXACT #6
- Data Flow: DATA_FLOW #2, #3

**Login Validation**
- Concept Overview: CRITERIA #7, QUICK #5
- Code: EXACT #7
- Data Flow: DATA_FLOW #2

**Rate Limiting**
- Concept Overview: CRITERIA #8, QUICK #5
- Code: EXACT #9
- Rules: CRITERIA #8 with exact rates

**Authorization & Auth**
- Concept Overview: CRITERIA #9, QUICK #5
- Code: EXACT #9
- Flow: DATA_FLOW #5

**Bot Detection**
- Concept Overview: CRITERIA #10
- Combined from: Anomaly, IP, Login Frequency
- Code: EXACT #4, #5
- Thresholds: QUICK #3, #1

**Admin Functions**
- Concept Overview: CRITERIA #11, QUICK #6
- Code: EXACT #12
- Flow: DATA_FLOW #4

**Profile Updates**
- Concept Overview: CRITERIA #12
- Code: EXACT #8
- Flow: DATA_FLOW #3

**Data Models**
- Structure: CRITERIA #13, QUICK #4
- Code: EXACT #11
- References: All documents

**Thresholds Summary**
- All Thresholds: CRITERIA #15, QUICK Master Table
- By Category: Each CRITERIA section
- In Code: EXACT documents

**Detection Reasons**
- Catalog: CRITERIA #16, QUICK #6
- By Criterion: Each CRITERIA section
- In Code: EXACT #3, #4, #5

---

## 📝 Documentation Maintenance Notes

**Version:** 1.0  
**Last Updated:** Complete analysis of FPDetection codebase  
**Scope:** All backend detection logic, all controllers, all middleware, all models  
**Coverage:** 100% of criteria, rules, scoring systems, and validation logic  

**How To Update:**
1. Code changes: Update EXACT_CODE_REFERENCE.md first
2. Logic changes: Update both CRITERIA_AND_RULES_GUIDE.md and affected documents
3. New criteria: Add to CRITERIA_AND_RULES_GUIDE.md, update QUICK_REFERENCE.md
4. Threshold changes: Update CRITERIA #15, QUICK Master Table, and affected sections

---

## 🆘 Quick Help

**"I need to understand the entire system"**
→ Read in this order: QUICK_REFERENCE.md → DATA_FLOW_GUIDE.md → CRITERIA_AND_RULES_GUIDE.md

**"I need to find a specific threshold"**
→ Go to QUICK_REFERENCE.md Master Threshold Reference Table

**"I need to verify the exact code logic"**
→ Go to EXACT_CODE_REFERENCE.md, find your function

**"I need to understand how data flows in a specific scenario"**
→ Read DATA_FLOW_GUIDE.md sections on specific flow (Registration, Login, Post, etc.)

**"I need to test a specific component"**
→ Use QUICK_REFERENCE.md Testing Checklist and DATA_FLOW_GUIDE.md Testing Scenarios

**"I need to implement a similar system"**
→ Start with QUICK_REFERENCE.md overview, then read CRITERIA_AND_RULES_GUIDE.md systematically

---

**Happy exploring! 🚀**
