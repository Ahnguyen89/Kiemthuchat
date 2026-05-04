# Canvas Sharing & Collaboration Guide

## 🎯 Overview

Your platform now has a complete sharing system similar to AFFiNE, allowing you to:
- Generate shareable links for your canvases
- Collaborate with others in real-time
- Control access (public/private)

## 🔗 How Sharing Works

### 1. **Generate a Share Link**

**From Your Canvas:**
1. Open any canvas you own
2. Click the **"Share"** button (top-right, next to collaboration)
3. In the dialog, click **"Generate Share Link"**
4. A unique URL is created: `https://yoursite.com/canvas/shared/abc123xyz`

**What Happens:**
- Canvas becomes publicly accessible
- Anyone with the link can view and collaborate
- Link is permanent until revoked

### 2. **Share the Link**

**Copy & Share:**
- Click the **copy** button (📋) next to the link
- Share via email, Slack, Discord, etc.
- Recipients don't need an account to view!

**Public Access:**
- No login required
- Can view and edit the canvas
- See real-time updates from all users

### 3. **Revoke Access**

**Stop Sharing:**
1. Open the share dialog again
2. Click **"Revoke Link"**
3. Canvas becomes private again
4. Old links stop working

## 🤝 Collaboration Flow

### **Scenario 1: Team Project**

**Owner (Alice):**
1. Creates "Team Brainstorming" canvas
2. Adds some initial sticky notes
3. Clicks **"Share"** → **"Generate Share Link"**
4. Copies link and sends to team in Slack

**Team Members (Bob, Carol):**
1. Click the shared link
2. Land on canvas without logging in
3. Click **"Enable Collaboration"** to see others
4. Start adding their own ideas
5. See Alice's cursor moving in real-time

**Result:**
- All three see each other's cursors (colored)
- Changes sync instantly
- Productive collaboration session! 🎨

### **Scenario 2: Public Portfolio**

**Designer:**
1. Creates beautiful canvas showcase
2. Shares link on Twitter/LinkedIn
3. Visitors can view the canvas
4. No account needed

### **Scenario 3: Client Review**

**Freelancer:**
1. Creates project proposal canvas
2. Shares link with client
3. Client views and adds comments (sticky notes)
4. Real-time feedback session

## 🎨 UI Components

### **Share Dialog**

```
┌─────────────────────────────────────┐
│ Share "My Canvas"                   │
├─────────────────────────────────────┤
│ Status:                             │
│ 🌐 Public Link Active               │
│ Anyone with the link can view/edit  │
│                                     │
│ Share Link:                         │
│ ┌──────────────────────┬─────┐     │
│ │ https://...          │ 📋  │     │
│ └──────────────────────┴─────┘     │
│                                     │
│ [ 🔒 Revoke Link ]                 │
└─────────────────────────────────────┘
```

### **Public Canvas Banner**

When visiting a shared link:
```
┌──────────────────────────────────────────────┐
│ 👁️ Viewing shared canvas by Alice           │
│ You're viewing a public canvas - changes     │
│ are visible to everyone                      │
│                           [ Sign In to Create ] │
└──────────────────────────────────────────────┘
```

### **Public Badge**

On the canvas (if shared):
```
[ 🌐 Publicly Shared Canvas ]
```

## 🔐 Access Control

### **Private Canvas (Default)**
- ✅ Only owner can access
- ✅ Not visible to others
- ✅ Secure and private

### **Shared Canvas**
- ✅ Owner can access
- ✅ Anyone with link can access
- ✅ No account required for viewers
- ✅ Real-time collaboration enabled

## 🚀 API Endpoints

### Backend (NestJS)

**Generate Share Link:**
```typescript
POST /flows/:id/share
Authorization: Bearer {token}

Response:
{
  success: true,
  data: {
    id: "flow123",
    shareToken: "abc123xyz...",
    isPublic: true,
    ...
  }
}
```

**Revoke Share Link:**
```typescript
DELETE /flows/:id/share
Authorization: Bearer {token}

Response:
{
  success: true,
  data: {
    id: "flow123",
    shareToken: null,
    isPublic: false,
    ...
  }
}
```

**Access Shared Canvas:**
```typescript
GET /flows/shared/:shareToken
No Authorization Required

Response:
{
  success: true,
  data: {
    id: "flow123",
    name: "My Canvas",
    nodes: [...],
    edges: [...],
    user: {
      id: "user123",
      name: "Alice",
      avatar: "..."
    }
  }
}
```

### Frontend (React)

**Generate Link:**
```typescript
const response = await apiClient.generateShareLink(flowId);
const shareToken = response.data.shareToken;
const shareUrl = `${window.location.origin}/canvas/shared/${shareToken}`;
```

**Revoke Link:**
```typescript
await apiClient.revokeShareLink(flowId);
```

**Access Shared:**
```typescript
const response = await apiClient.getSharedFlow(shareToken);
const flow = response.data;
```

## 🔄 Collaboration + Sharing

### **Combined Features**

When both sharing and collaboration are enabled:

1. **Owner shares link** → Others can access
2. **Multiple users open the link** → All see each other
3. **Someone clicks "Enable Collaboration"** → Their cursor appears
4. **Everyone edits** → Changes sync to all users
5. **Beautiful real-time experience!** ✨

### **User Scenarios**

| User Type | Can Access? | Can Edit? | Needs Login? | See Cursors? |
|-----------|-------------|-----------|--------------|--------------|
| Owner | ✅ | ✅ | ✅ | ✅ (if enabled) |
| Shared Link User | ✅ | ✅ | ❌ | ✅ (if enabled) |
| Random Visitor | ❌ | ❌ | ❌ | ❌ |

## 🎯 Best Practices

### **When to Share**

✅ **Share When:**
- Collaborating with team
- Getting client feedback
- Teaching/presenting
- Showcasing work publicly

❌ **Don't Share:**
- Sensitive/confidential info
- Internal company docs
- Personal notes
- Work in progress (unless intentional)

### **Security Tips**

1. **Revoke When Done** - Revoke links after projects complete
2. **Use Private by Default** - Only share when needed
3. **Monitor Access** - Check who's online in user list
4. **Disable When Not Needed** - Turn off collaboration when working solo

## 🔧 Technical Implementation

### **Database Fields** (Already in Prisma schema)

```prisma
model Flow {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  nodes       Json
  edges       Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  isPublic    Boolean  @default(false)  // ← Share flag
  shareToken  String?  @unique          // ← Unique token
  user        User     @relation(...)
}
```

### **Security**

- **Share Token**: 32-character random hex (cryptographically secure)
- **Unique Index**: Database ensures no duplicate tokens
- **Revocable**: Owner can revoke anytime
- **Public Flag**: Double-check before showing content

### **Performance**

- **Token Generation**: O(1) - random bytes
- **Lookup**: O(1) - indexed database query
- **Caching**: No caching (ensures fresh data)

## 📱 User Experience

### **Share Dialog Flow**

```
Step 1: Click "Share" button
   ↓
Step 2: Dialog opens showing:
   - Current status (Private/Public)
   - Generate or Revoke button
   ↓
Step 3: Generate Link
   - Button click
   - Loading state
   - Success toast
   - Link appears in input
   ↓
Step 4: Copy & Share
   - Click copy button
   - "Link copied" toast
   - Share anywhere!
```

### **Shared Canvas Access Flow**

```
Visitor clicks link
   ↓
Public canvas page loads
   ↓
Shows banner: "Viewing shared canvas by {Owner}"
   ↓
Canvas loads with all content
   ↓
Optional: Enable collaboration to see others
   ↓
Start collaborating!
```

## 🎉 Result

You now have a complete sharing system!

### **For Canvas Owners:**
- ✅ One-click share link generation
- ✅ Copy-paste ready URLs
- ✅ Easy revoke access
- ✅ Public/private status clearly shown

### **For Shared Link Users:**
- ✅ No login required
- ✅ Full canvas access
- ✅ Real-time collaboration
- ✅ Professional viewing experience

### **Like AFFiNE:**
- ✅ Public sharing via links
- ✅ Real-time collaboration
- ✅ Beautiful share dialog
- ✅ Clear access indicators

## 🔮 Future Enhancements

Potential additions:

- [ ] **Permission Levels**: View-only vs Edit access
- [ ] **Expiring Links**: Time-limited access
- [ ] **Password Protection**: Require password for access
- [ ] **Usage Analytics**: See who accessed and when
- [ ] **Embed Codes**: Embed canvases in websites
- [ ] **QR Codes**: Generate QR for easy mobile access

---

**Your platform now supports full sharing and collaboration!** 🚀

Test it: Create a canvas, share it, open in incognito mode, and collaborate with yourself!

