# Complete Collaboration & Sharing System

## 🎉 What's Been Implemented

Your canvas platform now has **automatic real-time collaboration** with **permission-based sharing**, just like AFFiNE!

## ✨ Key Features

### 1. **Automatic Collaboration** ✅
- ❌ **REMOVED**: Manual "Enable Collaboration" button
- ✅ **NEW**: Collaboration auto-enables when canvas opens
- ✅ See other users immediately
- ✅ Cursor tracking always on
- ✅ Live updates automatic

### 2. **Permission-Based Sharing** ✅
- 👁️ **VIEW Only** - Users can see but not edit
- ✏️ **EDIT Access** - Users can view and collaborate
- Choose permission when generating link
- Cannot change after sharing (must revoke and regenerate)

### 3. **Share Link System** ✅
- Generate secure shareable URLs
- Copy link with one click
- Share via email, Slack, etc.
- No account required for recipients
- Revoke access anytime

### 4. **Real-Time Presence** ✅
- See who's online (top-right avatars)
- Colored cursors for each user
- User count indicator
- Live cursor tracking
- Auto-sync all changes

## 🎯 User Experience

### **Scenario: Team Collaboration**

**Step 1: Owner Creates & Shares**
1. Alice creates "Team Brainstorm" canvas
2. Clicks **"Share"** button
3. Selects **"Can Edit"** permission
4. Clicks **"Generate Share Link"**
5. Copies link and sends to team

**Step 2: Team Members Join**
1. Bob clicks the shared link
2. Canvas opens instantly (no login!)
3. Sees banner: "Collaborating on shared canvas by Alice"
4. Collaboration is **already active**
5. Sees Alice's avatar and cursor immediately

**Step 3: Real-Time Collaboration**
1. Both users see each other's cursors (colored!)
2. Bob adds sticky notes → Alice sees instantly
3. Alice moves shapes → Bob sees in real-time
4. Both edit together seamlessly
5. All changes sync automatically ✨

### **Scenario: View-Only Sharing**

**Step 1: Share Read-Only**
1. Alice shares canvas
2. Selects **"View Only"** permission
3. Sends link to client

**Step 2: Client Views**
1. Client clicks link
2. Sees banner: "View-only mode - You can see but not edit"
3. **👁️ "View Only"** badge in header
4. Can see canvas but:
   - ❌ Can't drag nodes
   - ❌ Can't add nodes (no toolbar)
   - ❌ Can't edit content
   - ❌ Can't connect edges
   - ✅ Can zoom and pan
   - ✅ Can see live updates from others

## 🎨 UI Elements

### **Share Dialog**

Before sharing:
```
┌─────────────────────────────────────┐
│ Share "My Canvas"                   │
├─────────────────────────────────────┤
│ Status: 🔒 Private Canvas           │
│ Only you can access this canvas     │
│                                     │
│ Access Permission:                  │
│ ┌─────────────────────────────┐    │
│ │ 👁️ View Only               │    │
│ │ ✏️ Can Edit (selected)     │    │
│ └─────────────────────────────┘    │
│                                     │
│ [ Generate Share Link ]             │
└─────────────────────────────────────┘
```

After sharing:
```
┌─────────────────────────────────────┐
│ Share "My Canvas"                   │
├─────────────────────────────────────┤
│ Status: 🌐 Public Link Active       │
│ Anyone with the link can edit       │
│                                     │
│ Share Link:                         │
│ ┌────────────────────────┬─────┐   │
│ │ https://...            │ 📋  │   │
│ └────────────────────────┴─────┘   │
│ ✏️ Can edit and collaborate         │
│                                     │
│ [ 🔒 Revoke Link ]                 │
└─────────────────────────────────────┘
```

### **Canvas Header (Owner)**

```
┌────────────────────────────────────────────┐
│ 📄 My Canvas                               │
│                                            │
│ [🟢 2 online] [Share] [Save]              │
└────────────────────────────────────────────┘
```

### **Canvas Header (View-Only Guest)**

```
┌────────────────────────────────────────────┐
│ 📄 My Canvas                               │
│                                            │
│ [👁️ View Only]                            │
└────────────────────────────────────────────┘
```

### **Shared Canvas Banner**

Edit mode:
```
┌──────────────────────────────────────────────────┐
│ 👥 Collaborating on shared canvas by Alice      │
│ ✏️ Edit mode - You can collaborate              │
│                           [Sign In to Create Own]│
└──────────────────────────────────────────────────┘
```

View-only mode:
```
┌──────────────────────────────────────────────────┐
│ 👁️ Viewing shared canvas by Alice               │
│ 👁️ View-only mode - You can see but not edit    │
│                           [Sign In to Create Own]│
└──────────────────────────────────────────────────┘
```

## 🔐 Permissions Explained

### **VIEW Permission**
- ✅ Can view the entire canvas
- ✅ Can zoom and pan
- ✅ Can see other users' cursors
- ✅ Can see live updates
- ❌ **Cannot** drag nodes
- ❌ **Cannot** edit content
- ❌ **Cannot** add/delete nodes
- ❌ **Cannot** create connections
- ❌ **No** toolbar visible

**Use Cases:**
- Client presentations
- Portfolio showcase
- Public demonstrations
- Read-only documentation

### **EDIT Permission**
- ✅ Can do everything in VIEW mode
- ✅ **Can** drag nodes
- ✅ **Can** edit content
- ✅ **Can** add/delete nodes
- ✅ **Can** create connections
- ✅ **Full** toolbar access
- ✅ Real-time collaboration

**Use Cases:**
- Team collaboration
- Pair programming/design
- Workshop sessions
- Joint brainstorming

## 🚀 How to Use

### **As Canvas Owner:**

**Share with Edit Access:**
1. Open your canvas
2. Click **"Share"** button
3. Select **"Can Edit"**
4. Click **"Generate Share Link"**
5. Copy and send to collaborators
6. They can edit together in real-time!

**Share View-Only:**
1. Open your canvas
2. Click **"Share"** button
3. Select **"View Only"**
4. Click **"Generate Share Link"**
5. Copy and send to viewers
6. They can see but not touch!

**Revoke Access:**
1. Click **"Share"** again
2. Click **"Revoke Link"**
3. Link stops working immediately

### **As Shared Link User:**

**With Edit Access:**
1. Click shared link
2. Canvas opens immediately
3. **Collaboration auto-enabled!**
4. See owner and other users
5. Start editing together
6. All changes sync in real-time

**With View-Only Access:**
1. Click shared link
2. Canvas opens in read-only mode
3. **"View Only" badge** shows
4. See the canvas and cursors
5. No editing tools available
6. Watch others work live

## 📊 Technical Details

### **Database Schema**

```prisma
model Flow {
  id              String          @id @default(cuid())
  userId          String
  name            String
  description     String?
  nodes           Json
  edges           Json
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  isPublic        Boolean         @default(false)
  shareToken      String?         @unique
  sharePermission SharePermission @default(VIEW)  // ← NEW!
  user            User            @relation(...)
}

enum SharePermission {
  VIEW    // Read-only
  EDIT    // Full collaboration
}
```

### **API Endpoints**

**Generate Share Link:**
```typescript
POST /flows/:id/share
Body: { permission: 'VIEW' | 'EDIT' }

Response: {
  id: "...",
  shareToken: "abc123...",
  isPublic: true,
  sharePermission: "EDIT"
}
```

**Access Shared Canvas:**
```typescript
GET /flows/shared/:shareToken

Response: {
  ...flow,
  sharePermission: "VIEW",
  user: {
    id: "...",
    name: "Alice",
    avatar: "..."
  }
}
```

### **Frontend Routes**

- **Owner's Canvas**: `/dashboard/canvas/:id`
- **Shared Canvas**: `/canvas/shared/:shareToken`

### **Collaboration Flow**

```
User 1 (Owner)              Backend              User 2 (Shared Link)
     │                         │                         │
     ├─ Open Canvas ──────────>│                         │
     ├─ Auto-join WS ─────────>│                         │
     │<─ Connected ─────────────┤                         │
     │                         │                         │
     │                         │<─ Open Shared Link ─────┤
     │                         │<─ Auto-join WS ─────────┤
     │<─ User Joined ───────────┤                         │
     │                         ├─ User Joined ──────────>│
     │                         │                         │
     ├─ Move Cursor ───────────>│                         │
     │                         ├─ Cursor Update ────────>│
     │                         │                         │
     ├─ Edit Node ─────────────>│                         │
     │                         ├─ Canvas Sync ──────────>│
     │                         │                         │
     │<─ Edit Node ─────────────┤<─ Edit Node ───────────┤
     │                         │                         │
```

## 🎯 What Changed

### Removed:
- ❌ "Enable Collaboration" toggle button
- ❌ Manual collaboration activation
- ❌ Collaboration on/off states

### Added:
- ✅ **Automatic collaboration** on canvas open
- ✅ **Permission system** (VIEW/EDIT)
- ✅ **Read-only mode** enforcement
- ✅ **Online user count** indicator
- ✅ **Permission badges** and visual hints
- ✅ **Public canvas page** route
- ✅ **Share dialog** with permission selector

## 🔄 Migration Applied

```sql
-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW', 'EDIT');

-- AlterTable
ALTER TABLE "flows" 
  ADD COLUMN "sharePermission" "SharePermission" 
  NOT NULL DEFAULT 'VIEW';
```

✅ **Migration successful!** Database updated.

## 💡 Usage Examples

### Example 1: Team Brainstorming (EDIT)
```
Owner: "Let's brainstorm together!"
1. Share link with EDIT permission
2. Everyone opens the link
3. All see each other's cursors
4. Everyone adds sticky notes
5. Real-time collaboration! 🎨
```

### Example 2: Client Presentation (VIEW)
```
Designer: "Here's the final design"
1. Share link with VIEW permission
2. Client opens link
3. Client sees the canvas
4. Cannot make changes
5. Professional presentation! 📊
```

### Example 3: Public Portfolio (VIEW)
```
Artist: "Check out my work!"
1. Share link with VIEW on Twitter
2. Visitors browse the canvas
3. No edits possible
4. Clean showcase! 🖼️
```

## 🎨 Visual Indicators

### **Online Status**
- **Green dot** pulsing
- **User count**: "2 online"
- **Avatars**: Stacked in top-right
- **Cursors**: Colored and labeled

### **Permission Indicators**
- **VIEW**: 👁️ "View Only" badge
- **EDIT**: ✏️ Full toolbar visible
- **Header**: Different icon (eye vs users)
- **Banner**: Different message

## 🔒 Security Features

### **Implemented:**
- ✅ Secure random tokens (32 characters)
- ✅ Permission enforcement on backend
- ✅ Owner-only share management
- ✅ Token uniqueness guaranteed
- ✅ Read-only mode on frontend

### **Access Control:**
| User Type | View? | Edit? | Share? | Revoke? |
|-----------|-------|-------|--------|---------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Edit Link Guest | ✅ | ✅ | ❌ | ❌ |
| View Link Guest | ✅ | ❌ | ❌ | ❌ |
| Random Visitor | ❌ | ❌ | ❌ | ❌ |

## 🎯 Comparison with AFFiNE

| Feature | AFFiNE | Your Platform |
|---------|--------|---------------|
| Auto-collaboration | ✅ | ✅ **Complete** |
| Real-time cursors | ✅ | ✅ **Complete** |
| User presence | ✅ | ✅ **Complete** |
| Share links | ✅ | ✅ **Complete** |
| Permission levels | ✅ | ✅ **Complete** |
| View-only mode | ✅ | ✅ **Complete** |
| Public sharing | ✅ | ✅ **Complete** |
| No login required | ✅ | ✅ **Complete** |

## 🔧 How It Works

### **For Canvas Owner:**
1. Open canvas → Collaboration auto-starts
2. Click "Share" → Choose permission
3. Copy link → Send to others
4. See everyone online in real-time
5. All collaborate together

### **For Shared Link Users:**

**EDIT Permission:**
1. Click link → Canvas opens
2. Collaboration auto-enabled
3. See owner's cursor immediately
4. Full editing tools available
5. Changes sync to everyone

**VIEW Permission:**
1. Click link → Canvas opens
2. Collaboration auto-enabled (for viewing)
3. See others' cursors
4. **No editing allowed**
5. Watch the canvas evolve

## 🚦 No More Infinite Loops!

### **Problems Fixed:**
- ✅ Removed circular dependencies
- ✅ Proper useEffect dependencies
- ✅ Debounced WebSocket emissions
- ✅ Remote update flag
- ✅ Stable function references

### **Performance:**
- ⚡ 200ms debounce on sync
- ⚡ 300ms for remote updates
- ⚡ Throttled cursor updates
- ⚡ Efficient event handling

## 📱 Testing Guide

### **Test 1: Solo Editing**
1. Open a canvas
2. See collaboration connect automatically
3. Edit normally
4. Everything works!

### **Test 2: Edit Collaboration**
1. Create a canvas
2. Click "Share" → Select "Can Edit"
3. Copy link
4. Open in **incognito window**
5. Both windows: See each other!
6. Edit in one → Appears in other
7. Perfect sync! ✨

### **Test 3: View-Only**
1. Share with "View Only"
2. Open in incognito
3. See "View Only" badge
4. Try to edit → Nothing happens
5. See others editing → Updates appear
6. Read-only works! 👁️

### **Test 4: Multiple Users**
1. Share edit link
2. Open in 3+ browsers/devices
3. All see each other's cursors (different colors!)
4. All edit together
5. Amazing collaboration! 🎉

## 🎁 Bonus Features

### **Online User Counter**
- Shows "X online" in green badge
- Pulsing green dot
- Updates in real-time

### **Colored User System**
- 8 unique colors assigned
- Cursor matches avatar border
- Easy to identify who's who

### **Smart Banners**
- Different message for VIEW vs EDIT
- Different icon for each mode
- Clear permission indication

## 📝 Summary of Changes

### **Files Modified:**
1. ✅ `apps/api/prisma/schema.prisma` - Added SharePermission enum
2. ✅ `apps/api/src/flow/flow.service.ts` - Share link generation with permissions
3. ✅ `apps/api/src/flow/flow.controller.ts` - Share endpoints
4. ✅ `apps/web/src/components/canvas/canvas-board.tsx` - Auto-collaboration, read-only mode
5. ✅ `apps/web/src/components/canvas/share-dialog.tsx` - Permission selector
6. ✅ `apps/web/src/app/canvas/shared/[shareToken]/page.tsx` - Public canvas page
7. ✅ `apps/web/src/lib/api.ts` - Share API methods
8. ✅ `packages/shared/src/types/flow.types.ts` - Type definitions

### **Features:**
- ✅ Auto-collaboration (no button needed)
- ✅ Permission-based sharing (VIEW/EDIT)
- ✅ Read-only mode enforcement
- ✅ Public canvas access
- ✅ Real-time presence
- ✅ Colored cursors
- ✅ Share link management

## 🎉 Result

Your platform now has:

### **Professional Collaboration**
- Like Google Docs/Figma/AFFiNE
- Real-time, no lag
- Beautiful cursors
- Clear permissions

### **Easy Sharing**
- One-click link generation
- Copy-paste ready
- Choose who can edit
- Revoke anytime

### **Great UX**
- Auto-collaboration (no manual toggle!)
- Clear visual indicators
- Smooth animations
- Professional polish

## 🚀 Ready to Use!

1. **Create a canvas**
2. **Click "Share"**
3. **Choose permission**
4. **Copy link**
5. **Share with anyone**
6. **Collaborate in real-time!**

---

**Your AFFiNE-inspired collaboration system is complete!** 🎨✨

No more manual enabling, automatic collaboration, permission-based sharing, and beautiful real-time cursors - just like the pros! 🚀

