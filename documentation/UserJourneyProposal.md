

# **User Journey Proposal — Digital Mailroom Service**

## **1. User Types**

### **Primary Users**

1. **Individual User**
2. **Business User (Team / Multi-User Account)**
3. **Remote Worker / Traveler**
   _(Functionally similar to Individual but with increased mobility needs)_

### **Internal Users**

4. **Mailroom Operator**
   (Handles incoming mail physically; scanning, opening, routing)
5. **System Admin**
   (Manages platform, accounts, staff, access rules)
6. **Business Account Owner / Admin**
   (Manages team members, permissions, billing)

---

# **2. Capabilities by User Type**

## **Individual User (Personal Account)**

**Can Do:**

- Receive mail digitally
- View envelope scans
- Request full document scan
- Download digital files (PDF, image)
- Tag, categorize, archive items
- Request physical actions:

  - Forward
  - Hold
  - Shred

- Update preferences (notifications, forwarding address)
- Manage billing & subscription

**Cannot Do:**

- Access other users’ mail
- Create additional sub-accounts

---

## **Business User (Team Member in a Company Account)**

**Can Do:**

- All actions available to Individual Users
- Access mail items assigned to their role or shared inbox
- Collaborate on documents (comments, tags)
- Forward to departments/colleagues
- View audit log related to items they can access

**Cannot Do:**

- Manage company-wide billing or staff (unless elevated)
- View mail not assigned or shared with their role/group

---

## **Business Account Owner / Admin**

**Can Do:**

- All Business User capabilities
- Manage team members

  - Add/remove users
  - Assign permissions
  - Create shared mailboxes (e.g., “Finance”, “HR”)

- Set mail routing rules
  (e.g., “Invoices → Finance inbox automatically”)
- Manage company billing
- Manage API/Integrations (future)

**Cannot Do:**

- Access staff-only operational tools (mailroom scanning backend)

---

## **Remote Worker / Traveler**

**Capabilities identical to Individual User**, with stronger emphasis on:

- Mobile-friendly workflows
- Real-time notifications
- Frequent forwarding requests

---

## **Mailroom Operator (Internal)**

**Can Do:**

- Receive incoming physical mail
- Label and intake into system
- Scan envelope
- Open and scan document (when requested)
- Assign mail to correct user/account
- Update scan status (received → scanned → processed)
- Trigger physical actions (forward, shred)

**Cannot Do:**

- Access users’ digital dashboard beyond operational pages
- Change user-level settings or billing info

---

## **System Admin (Internal / Platform Administrator)**

**Can Do:**

- Full access to mail system (not content unless needed for troubleshooting)
- Manage internal staff accounts
- Monitor system health, logs, audit trails
- Manage storage, retention policies, integrations
- Handle escalations (lost mail, mis-routed mail)
- Configure security, compliance rules

**Cannot Do:**

- Interact with mail content unnecessarily
  _(Content access only for compliance, error resolution, or required audits)_

---

# **3. User Journeys**

---

## **Journey A: Individual User**

### **1. Sign Up / Account Creation**

- Visits website → chooses plan
- Provides personal details + ID verification
- Receives assigned mailing address

### **2. Mail Arrives**

- Mailroom operator receives mail → scans envelope
- System uploads envelope image
- User is notified: “New mail received”

### **3. User Action**

- User views item in dashboard
- Options: _Open & Scan_, _Forward_, _Shred_, _Hold_

### **4. Full Scan Request**

- Selects **“Open & Scan”**
- Operator opens mail, scans contents
- System updates status → User notified

### **5. Manage Mail**

- User downloads files, tags them (“Bills”, “Legal”), archives them
- Optionally sets automation rules (future):

  - “Scan all mail automatically”
  - “Forward all checks to bank deposit service”

---

## **Journey B: Business Account Owner**

### **1. Account Creation**

- Creates business account
- Sets up team (e.g., CEO, Finance, HR)
- Creates shared mailboxes:

  - finance@
  - hr@
  - legal@

### **2. Mail Routing**

- Incoming mail is assigned manually or automatically:

  - Invoices → finance
  - Employee documents → HR
  - Contracts → Legal

### **3. Team Access**

- Team members get notifications only for relevant items
- Admin can restrict sensitive documents or log access

### **4. Actions**

- Team members request scans, downloads
- Admin oversees operations and billing

---

## **Journey C: Remote Worker**

### **1. Onboarding**

- Receives digital address
- Sets forwarding rules based on travel

### **2. While Abroad**

- Receives scan of envelope → Requests full scan
- Downloads PDF to handle remotely
- Requests forwarding (e.g., to a temporary address) only when needed

---

## **Journey D: Mailroom Operator**

### **1. Intake**

- Physical mail comes in
- Operator logs item into system
- Scans envelope → uploads → marks “received”

### **2. Await User Instructions**

- Holds mail in secure storage
- When requested:

  - Scans interior
  - Forwards mail physically
  - Places in shred bin & logs it

### **3. Exception Handling**

- “Unreadable sender” → flag for admin review
- “Damaged mail” → log incident

---

## **Journey E: System Admin**

### **1. Monitoring**

- Checks system dashboard (storage, scanning queue, audit logs)
- Ensures uptime and security posture

### **2. Managing Internal Users**

- Adds/removes mailroom staff
- Monitors permissions and access logs

### **3. Compliance Tasks**

- Oversees secure shredding
- Enforces retention policies
- Handles verification for lost mail claims

---

# **4. Summary Table — User Types & Actions**

| User Type         | View Mail   | Request Scan | Download | Tags + Organize | Forward / Shred     | Manage Users | Billing | Physical Scanning | System Config |
| ----------------- | ----------- | ------------ | -------- | --------------- | ------------------- | ------------ | ------- | ----------------- | ------------- |
| Individual User   | ✔           | ✔            | ✔        | ✔               | ✔                   | ✖            | ✔       | ✖                 | ✖             |
| Business User     | ✔           | ✔            | ✔        | ✔               | ✔                   | ✖            | ✖       | ✖                 | ✖             |
| Business Admin    | ✔           | ✔            | ✔        | ✔               | ✔                   | ✔            | ✔       | ✖                 | ✖             |
| Remote Worker     | ✔           | ✔            | ✔        | ✔               | ✔                   | ✖            | ✔       | ✖                 | ✖             |
| Mailroom Operator | ✖ (content) | ✖            | ✖        | ✖               | ✔ (perform actions) | ✖            | ✖       | ✔                 | ✖             |
| System Admin      | Limited\*   | ✖            | ✖        | ✖               | ✖                   | ✔            | ✔       | ✖                 | ✔             |

\*System Admin views content only for troubleshooting/compliance, not routine use.

---
