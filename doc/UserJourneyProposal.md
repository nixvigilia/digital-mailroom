# **User Journey Proposal**

---

## **1. User Types**

### **External Users**

1. **Individual User** — personal account for mail handling.
2. **Business User / Team Member** — accesses shared mailbox for company operations.
3. **Remote Worker / Traveler** — individual user with higher mobility needs.

### **Internal Users**

4. **Mailroom Operator** — handles physical mail (scanning, opening, routing, forwarding, shredding).
5. **System Admin** — platform administrator managing system, storage, access, and compliance.
6. **Business Account Owner / Admin** — manages team members, mailbox access, and billing.

---

## **2. Mandatory KYC & Authorization Rules**

### **External Users**

- Must complete **KYC verification (ID + consent)** before mailbox assignment.
- Mail can only be received for the **account holder name** or a **pre-authorized sender**.
- Users cannot bypass KYC to start subscription or receive mail.
- Consent for mail opening/scanning is documented digitally.

### **Business Accounts**

- Company account requires verification of the business entity.
- Authorized representatives must be verified.
- Mail can be received from employees or pre-authorized senders.

---

## **3. Capabilities by User Type**

### **Individual User**

- Receive mail digitally once KYC is approved
- View envelope scans
- Request full document scans
- Download files, tag, categorize, archive
- Request physical actions: Open & Scan, Forward, Shred, Hold
- Cannot access other users’ mail or create sub-accounts

### **Business User / Team Member**

- All Individual User capabilities
- Access shared inbox / assigned mail items
- Forward to colleagues or departments
- Tag and comment for collaboration
- Cannot manage company billing or staff

### **Business Account Owner / Admin**

- All Team Member capabilities
- Manage team members and permissions
- Create shared mailboxes (Finance, HR, Legal)
- Set mail routing rules
- Manage billing and API integrations
- Cannot access internal operational tools reserved for Mailroom Operators

### **Remote Worker / Traveler**

- Same as Individual User
- Emphasis on mobile access, forwarding, and notifications

### **Mailroom Operator**

- Receive mail and assign lockers
- Scan envelope and update system
- Open and scan content **only with documented consent**
- Forward or shred mail based on verified requests
- Cannot access user dashboard or billing

### **System Admin**

- Monitor system health, audit logs, storage
- Manage internal staff accounts
- Configure security, compliance, and retention
- Access mail content only for troubleshooting or compliance

---

## **4. Mailroom & Locker Rules**

- Structure: **Mailroom → Multiple Lockers → Mail Items**
- Each locker is assigned to a verified account.
- Mail under a different name **cannot be accepted** unless pre-authorized.
- Mail is only scanned, forwarded, or shredded after identity verification.

---

## **5. User Journeys**

### **Journey A: Individual User**

1. Signup → Complete KYC → Payment → Account activation
2. Assigned digital mailbox
3. Mail arrives → scanned envelope → notification
4. User chooses action: Open & Scan / Forward / Shred / Hold
5. Scanned documents uploaded → download / tagging / archiving

### **Journey B: Business Account Owner**

1. Create company account → verify entity → add team members
2. Create shared mailboxes (Finance, HR, Legal)
3. Incoming mail automatically assigned to departments
4. Team members request scans, downloads, forwards
5. Admin manages permissions, audit logs, and billing

### **Journey C: Remote Worker / Traveler**

1. Signup → KYC → subscription
2. Digital mailbox assigned
3. Mail received → scan notifications
4. Requests forwarding to temporary addresses while traveling

### **Journey D: Mailroom Operator**

1. Receive mail → assign locker to verified account
2. Scan envelope → upload system → mark “received”
3. Await user instructions → process Open & Scan / Forward / Shred
4. Exception handling: unauthorized sender or damaged mail → flag for admin

### **Journey E: System Admin**

1. Monitor system: storage, scan queue, audit logs
2. Manage internal users and permissions
3. Compliance: retention, secure shredding, incident handling

---

## **6. Anti-Fraud / Mail Abuse Considerations**

Since your service **only handles documents**, anti-fraud focuses on:

- **Unauthorized mail:** Mail must be from verified account or authorized sender.
- **Impersonation:** Users cannot receive mail under someone else’s name without authorization.
- **Unauthorized forwarding:** Mail can only be forwarded to verified addresses.
- **Fake accounts:** System prevents duplicate/fake accounts.

Users **cannot misuse the mailbox for illegal activities**, and operators verify identity and consent before scanning, forwarding, or shredding.

---

## **7. Summary Table — Actions & Permissions**

| User Type         | View Mail   | Request Scan | Download | Tags + Organize | Forward / Shred     | Manage Users | Billing | Physical Scanning | KYC / Consent      |
| ----------------- | ----------- | ------------ | -------- | --------------- | ------------------- | ------------ | ------- | ----------------- | ------------------ |
| Individual User   | ✔           | ✔            | ✔        | ✔               | ✔                   | ✖            | ✔       | ✖                 | ✔                  |
| Business User     | ✔           | ✔            | ✔        | ✔               | ✔                   | ✖            | ✖       | ✖                 | ✔                  |
| Business Admin    | ✔           | ✔            | ✔        | ✔               | ✔                   | ✔            | ✔       | ✖                 | ✔                  |
| Remote Worker     | ✔           | ✔            | ✔        | ✔               | ✔                   | ✖            | ✔       | ✖                 | ✔                  |
| Mailroom Operator | ✖ (content) | ✖            | ✖        | ✖               | ✔ (perform actions) | ✖            | ✖       | ✔                 | ✔ (verify consent) |
| System Admin      | Limited\*   | ✖            | ✖        | ✖               | ✖                   | ✔            | ✔       | ✖                 | ✔ (verify consent) |

\*System Admin accesses content **only when required for compliance or troubleshooting**.
