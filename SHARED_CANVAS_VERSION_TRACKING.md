# Shared Canvas Version Tracking Implementation

## Overview

Implemented full version control and audit logging for shared canvas edits. When users edit a canvas via a share link with EDIT permission, their changes are now properly saved to version history and credited to them in the audit log.

## Problem Fixed

Previously, when users edited a canvas via a share link:
- ❌ Changes were only visible in real-time via WebSocket
- ❌ Changes were NOT persisted to the database
- ❌ No version history was created
- ❌ No audit logs tracked who made the changes
- ❌ Canvas owner couldn't see who made what changes

## Solution Implemented

### Backend Changes

#### 1. **FlowVersionService** (`apps/api/src/flow/flow-version.service.ts`)
Added new method `createVersionForCollaborator()`:
- Allows collaborators to create versions without ownership check
- Properly credits the collaborator in version history
- Maintains the same version numbering system

#### 2. **FlowService** (`apps/api/src/flow/flow.service.ts`)
Added new method `updateSharedFlow()`:
- Accepts updates from authenticated collaborators via share token
- Validates EDIT permission on the shared canvas
- Creates version snapshots credited to the collaborator
- Logs changes to audit log with collaborator's userId
- Detects and logs individual node/edge changes

#### 3. **FlowController** (`apps/api/src/flow/flow.controller.ts`)
Added new endpoint:
```typescript
PATCH /flows/shared/:shareToken
- Body: { nodes, edges, isManualSave }
- Auth: Required (JWT)
- Response: Updated flow
```

### Frontend Changes

#### 4. **API Client** (`apps/web/src/lib/api.ts`)
Added `updateSharedFlow()` method:
```typescript
async updateSharedFlow(
  shareToken: string, 
  updates: Partial<Flow> & { isManualSave?: boolean }
): Promise<ApiResponse<Flow>>
```

#### 5. **Shared Canvas Page** (`apps/web/src/app/canvas/shared/[shareToken]/page.tsx`)
Implemented actual save logic in the `onSave` callback:
- Calls `apiClient.updateSharedFlow()` with share token
- Passes `isManualSave: true` to trigger version creation
- Handles errors appropriately

## How It Works

### Flow for Shared Canvas Edits

```
1. User opens shared canvas via link (/canvas/shared/:shareToken)
2. User is authenticated (login required)
3. User makes changes to canvas
4. User clicks "Save" (Ctrl+S)
5. Frontend calls PATCH /flows/shared/:shareToken with nodes/edges
6. Backend validates:
   - Flow exists and is public
   - User has EDIT permission
7. Backend creates version snapshot:
   - Version credited to collaborator userId
   - Version number auto-incremented
8. Backend creates audit logs:
   - SAVE action logged with collaborator's info
   - Individual node/edge changes detected and logged
9. Changes persisted to database
10. Real-time collaboration continues via WebSocket
```

### Version History Display

When viewing version history (`/dashboard/canvas/:id/versions`):
- Owner sees ALL versions, including those created by collaborators
- Each version shows the creator's name and avatar
- Audit log shows detailed changes with collaborator attribution

### Audit Log Display

When viewing audit log (`/dashboard/canvas/:id/audit-log`):
- Shows all changes with timestamps
- Displays collaborator name and avatar for each change
- Includes details about what changed (nodes added/removed/updated)

## Testing

To test the implementation:

1. **As Canvas Owner:**
   - Create a canvas
   - Generate share link with EDIT permission
   - Share the link with another user

2. **As Collaborator:**
   - Open the shared link
   - Sign in (required)
   - Make changes to the canvas
   - Save the changes (Ctrl+S)

3. **Verify as Owner:**
   - Go to Version History
   - See the new version created by collaborator
   - Check that collaborator's name appears as creator
   - Go to Audit Log
   - See detailed changes attributed to collaborator

## Security Considerations

✅ **Authentication Required**: Users must be logged in to edit shared canvases
✅ **Permission Validation**: Backend validates EDIT permission before allowing saves
✅ **Share Token Validation**: Invalid or revoked tokens are rejected
✅ **Ownership Preserved**: Original owner remains unchanged
✅ **Audit Trail**: All changes are tracked with user attribution

## Database Schema

No schema changes required! The existing models support this:

```prisma
model FlowVersion {
  createdBy String  // Can be owner OR collaborator userId
  // ...
}

model FlowAuditLog {
  userId String     // Can be owner OR collaborator userId
  // ...
}
```

## API Endpoints

### New Endpoint

```
PATCH /flows/shared/:shareToken
Authorization: Bearer <token>
Body: {
  nodes: Node[],
  edges: Edge[],
  isManualSave: boolean
}
Response: {
  success: true,
  data: Flow
}
```

### Existing Endpoints (Unchanged)

```
GET /flows/shared/:shareToken          - Get shared canvas
GET /flows/:id/versions                - Get version history
GET /flows/:id/audit-log               - Get audit log
POST /flows/:id/revert/:versionId      - Revert to version
```

## Files Modified

### Backend
- ✅ `apps/api/src/flow/flow-version.service.ts` - Added `createVersionForCollaborator()`
- ✅ `apps/api/src/flow/flow.service.ts` - Added `updateSharedFlow()`
- ✅ `apps/api/src/flow/flow.controller.ts` - Added PATCH endpoint

### Frontend
- ✅ `apps/web/src/lib/api.ts` - Added `updateSharedFlow()` method
- ✅ `apps/web/src/app/canvas/shared/[shareToken]/page.tsx` - Implemented save logic

## Benefits

✅ **Full Collaboration**: Collaborators can now save their work
✅ **Complete Audit Trail**: All changes tracked with proper attribution
✅ **Version Control**: Every save creates a version snapshot
✅ **Accountability**: Clear visibility of who changed what
✅ **Revert Capability**: Can revert to any version, even collaborator-created ones
✅ **Real-time + Persistent**: Combines real-time collaboration with permanent storage

## Real-Time Notifications (IMPLEMENTED)

When a collaborator saves the canvas:
1. **WebSocket Event**: Backend emits `canvas:saved` event to all connected users in the room
2. **Owner Notification**: Owner receives toast notification "Canvas Updated - {collaborator} saved version {X}"
3. **Auto-Refresh**: Owner's canvas automatically refetches to show updated version number
4. **Other Collaborators**: Also receive notifications and auto-refresh

### How It Works
```typescript
// Backend - After successful save
this.canvasGateway.notifyCanvasSaved(
  flowId,
  userId,
  userName,
  versionNumber
);

// Frontend - Listen for event
socket.on('canvas:saved', ({ userName, versionNumber }) => {
  // Refetch flow and versions
  refetch();
  refetchVersions();
  
  // Show notification
  toast({
    title: 'Canvas Updated',
    description: `${userName} saved version ${versionNumber}`
  });
});
```

## Future Enhancements

Potential improvements:
- Add version descriptions when saving
- Allow collaborators to view version history directly
- Track concurrent edits and conflicts
- Add version comparison for collaborator changes
- Show detailed diff notifications
