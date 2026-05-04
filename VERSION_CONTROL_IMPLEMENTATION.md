# Canvas Version Control & Audit Log Implementation

## Overview

A comprehensive audit logging and version control system has been successfully implemented for the canvas feature. This allows users to track all changes, view detailed history, compare versions, and revert to any previous state.

## Features Implemented

### 1. Database Schema
- **FlowVersion** table: Stores version snapshots with auto-incrementing version numbers
- **FlowAuditLog** table: Stores detailed audit entries for all actions
- Proper indexing for performance on flowId, createdAt, and timestamp fields
- Foreign key relationships to Flow and User tables

### 2. Backend Services

#### FlowVersionService
- `createVersion()`: Creates version snapshots on manual saves
- `getVersions()`: Retrieves all versions (excluding auto-saves)
- `getVersion()`: Gets a specific version with details
- `revertToVersion()`: Reverts canvas to a previous version
- `compareVersions()`: Compares two versions and returns diff
- `compareWithCurrent()`: Compares a version with current state
- `getLatestVersion()`: Gets the most recent version

#### FlowAuditService
- `logSave()`: Logs manual save operations
- `logChange()`: Logs individual changes (node/edge add/update/delete)
- `getAuditLog()`: Retrieves audit logs with pagination
- `getChangesBetweenVersions()`: Gets all changes between two versions
- `logRevert()`: Logs revert operations
- `detectAndLogChanges()`: Automatically detects and logs changes

### 3. API Endpoints

#### Version Control
- `GET /flows/:id/versions` - List all versions
- `GET /flows/:id/versions/:versionId` - Get specific version
- `POST /flows/:id/revert/:versionId` - Revert to version
- `GET /flows/:id/versions/:versionId/compare` - Compare version with current
- `GET /flows/:id/compare/:v1/:v2` - Compare two versions
- `GET /flows/:id/audit-log` - Get audit log (with pagination)

#### Modified Endpoints
- `PATCH /flows/:id` - Now supports `isManualSave` flag to trigger version creation

### 4. Real-time Collaboration Integration
- Canvas Gateway enhanced to log individual changes during collaboration
- Tracks node updates, additions, deletions, and edge changes
- Non-blocking audit logging (failures don't disrupt collaboration)

### 5. Frontend Components

#### VersionHistory Component
- Lists all versions with metadata (creator, timestamp, description)
- Shows current version indicator
- Revert button with confirmation dialog
- Compare button to view differences
- Displays node/edge counts per version

#### VersionComparison Component
- Two view modes: Diff View and Side-by-Side
- Color-coded changes:
  - Green: Added items
  - Red: Removed items
  - Yellow: Modified items
- Detailed breakdown of all changes
- Summary statistics

#### AuditLog Component
- Timeline view grouped by date
- User avatars and action badges
- Expandable details for each entry
- Filter by action type
- Pagination support
- Color-coded action types

### 6. Pages & Routes

#### Version History Page
- `/dashboard/canvas/[id]/versions`
- Tabbed interface (History / Compare)
- Full-page version history view
- Integrated comparison view
- Revert functionality with confirmation

#### Audit Log Page
- `/dashboard/canvas/[id]/audit-log`
- Dedicated full-page audit log view
- Load more pagination
- Filtering capabilities

#### Canvas Page Updates
- Version indicator badge showing current version number
- "Version History" button in toolbar
- "Audit Log" button in toolbar
- Integrates seamlessly with existing canvas UI

### 7. Hooks & API Client

#### useCanvas Hook Extensions
- `useFlowVersions()`: Query hook for versions
- `compareVersionsQuery()`: Query hook for comparisons
- `useAuditLog()`: Query hook for audit logs
- `revertToVersion()`: Mutation for reverting

#### API Client Methods
- `getFlowVersions()`
- `getFlowVersion()`
- `revertToVersion()`
- `compareVersionWithCurrent()`
- `compareVersions()`
- `getFlowAuditLog()`

## Key Design Decisions

### Version Creation Strategy
- **Manual Saves Only**: Versions are created only when user explicitly saves (not on auto-save)
- **Auto-increment Version Numbers**: Each flow has sequential version numbers (1, 2, 3, ...)
- **Revert Creates New Version**: Reverting to a previous version creates a new version, maintaining full history

### Audit Logging Strategy
- **Two-Level Logging**:
  1. Save-level: Logs each manual save with summary
  2. Change-level: Logs individual node/edge changes during collaboration
- **Non-blocking**: Audit log failures don't interrupt user workflow
- **Comprehensive Details**: Each entry includes action type, user, timestamp, and full details

### Change Detection
- Compares nodes/edges arrays by ID
- Detects:
  - Added: Present in new, not in old
  - Removed: Present in old, not in new
  - Modified: Same ID but different properties
- Uses JSON string comparison for property changes

### Performance Optimizations
- Indexed database queries on flowId and timestamps
- Pagination for audit logs (default 50 entries)
- Lazy loading of version details
- Query caching with React Query

### Security & Access Control
- Users can only access versions/audit logs for flows they own or have access to
- Revert requires ownership or EDIT permission
- Audit logs show user info only for authorized users

## Usage

### For Users
1. **Viewing Version History**: Click "Version History" button on canvas
2. **Comparing Versions**: Select a version and click "Compare"
3. **Reverting**: Click "Revert" on any version, confirm in dialog
4. **Viewing Audit Log**: Click "Audit Log" button for detailed timeline
5. **Filtering Logs**: Use action filter dropdown in audit log view

### For Developers
1. **Creating Versions**: Versions are automatically created on manual saves
2. **Logging Custom Actions**: Use `FlowAuditService.logChange()`
3. **Querying Versions**: Use `useFlowVersions()` hook
4. **Comparing**: Use `compareVersionsQuery()` hook

## Files Modified/Created

### Backend
- ✅ `apps/api/prisma/schema.prisma` - Added FlowVersion and FlowAuditLog models
- ✅ `apps/api/prisma/migrations/[timestamp]_add_version_control/migration.sql`
- ✅ `apps/api/src/flow/flow-version.service.ts` - New service
- ✅ `apps/api/src/flow/flow-audit.service.ts` - New service
- ✅ `apps/api/src/flow/flow.service.ts` - Updated for version control
- ✅ `apps/api/src/flow/flow.controller.ts` - Added version endpoints
- ✅ `apps/api/src/flow/flow.module.ts` - Registered new services
- ✅ `apps/api/src/flow/dto/update-flow.dto.ts` - Added isManualSave field
- ✅ `apps/api/src/flow/dto/create-version.dto.ts` - New DTO
- ✅ `apps/api/src/flow/dto/revert-version.dto.ts` - New DTO
- ✅ `apps/api/src/flow/dto/index.ts` - Updated exports
- ✅ `apps/api/src/canvas/canvas.gateway.ts` - Enhanced for audit logging
- ✅ `apps/api/src/canvas/canvas.module.ts` - Imported FlowModule

### Frontend
- ✅ `apps/web/src/lib/api.ts` - Added version control methods
- ✅ `apps/web/src/hooks/use-canvas.ts` - Added version control hooks
- ✅ `apps/web/src/components/canvas/version-history.tsx` - New component
- ✅ `apps/web/src/components/canvas/version-comparison.tsx` - New component
- ✅ `apps/web/src/components/canvas/audit-log.tsx` - New component
- ✅ `apps/web/src/app/dashboard/canvas/[id]/versions/page.tsx` - New page
- ✅ `apps/web/src/app/dashboard/canvas/[id]/audit-log/page.tsx` - New page
- ✅ `apps/web/src/app/dashboard/canvas/[id]/page.tsx` - Updated with version UI

## Testing Recommendations

1. **Version Creation**: Test that versions are created only on manual saves
2. **Revert Functionality**: Test reverting to various versions
3. **Comparison**: Test diff view with various scenarios (add, remove, modify)
4. **Audit Log Accuracy**: Verify all actions are logged correctly
5. **Permissions**: Test with owner vs shared users
6. **Performance**: Test with many versions (100+)
7. **Collaboration**: Test version control during active collaboration
8. **Pagination**: Test audit log pagination with large datasets

## Future Enhancements

Possible improvements for future iterations:
- Version descriptions/comments from users
- Branch/merge functionality for parallel editing
- Version tagging/labeling
- Export version history
- Diff visualization on canvas (overlay mode)
- Undo/redo stack integration with versions
- Automatic version creation on major changes
- Version search/filtering
- Collaborative conflict resolution

## Summary

The implementation successfully provides:
✅ Complete version control with manual save detection
✅ Comprehensive audit logging at two levels
✅ Beautiful UI components for history and comparison
✅ Full integration with existing canvas workflow
✅ Real-time collaboration support
✅ Performance optimizations
✅ Proper security and access control

All features work both in solo editing and during collaboration, providing users with complete visibility and control over their canvas history.
