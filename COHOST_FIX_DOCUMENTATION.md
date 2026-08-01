# Co-Host Controls Not Working - Fix Documentation

## Issue Summary

**Problem:** Users with pre-assigned co-host role were seeing guest controls (Raise Hand button instead of Record/End buttons, disabled mic/camera) despite:
- ✅ Participants panel correctly showing "Co-host" badge
- ✅ `canPublish: true` in LiveKit token
- ❌ `isCohost: false` in ControlBar component

## Root Cause Analysis

The `isCohost` state in `RoomContext` was only being set by the `participant:became-cohost` socket event, which fires when a user is promoted to co-host during a session. However, for users who were **pre-assigned** as co-hosts before joining:

1. They already had `role: COHOST` in the database
2. They received a LiveKit token with `canPublish: true` on initial connection
3. The `participant:became-cohost` event was NOT firing (they were already co-hosts)
4. The sync effect that checks `socket.participants` for co-host role wasn't matching correctly

### Identity Mismatch

The sync logic in `RoomContext` was trying to match the user's LiveKit identity with participant records, but:
- LiveKit identity format: Could be user ID, email, or guest_identity
- Participant record format: `user?.id` or `userId` from socket
- These didn't always match, causing the lookup to fail

## Solution

### 1. Added Multiple Identity Sources

Modified the sync effect in `RoomContext.tsx` to try multiple identity sources:

```typescript
// Try multiple identity sources in order of preference:
1. myIdentityRef.current (LiveKit identity from socket events)
2. liveKit.roomRef.current?.localParticipant?.identity (LiveKit participant identity)
3. user?.id (Auth store user ID - ADDED AS FALLBACK)
```

### 2. Enhanced Participant Matching

```typescript
// First try: Match by LiveKit identity
let me = socket.participants.find(
  (p) => (p.user?.id ?? p.userId) === myIdentity,
);

// Second try: If not found and we have auth user ID, try that
if (!me && user?.id) {
  me = socket.participants.find(
    (p) => (p.user?.id ?? p.userId) === user.id,
  );
}
```

### 3. Added Comprehensive Debug Logging

Added logging at key points to diagnose the issue:

**RoomContext.tsx:**
```typescript
console.log('[RoomContext] Syncing isCohost from participants:', {
  myIdentity,
  participantsCount: socket.participants.length,
  participants: socket.participants.map(p => ({ 
    id: p.user?.id ?? p.userId, 
    role: p.role,
    name: p.name || p.user?.name
  })),
});

console.log('[RoomContext] Found me in participants:', { 
  found: !!me, 
  myRole: me?.role,
  myIdentity,
  authUserId: user?.id,
  participantIds: socket.participants.map(p => p.user?.id ?? p.userId)
});
```

**ControlBar.tsx:**
```typescript
console.log('[ControlBar Debug]', {
  isHost,
  isCohost,
  isSpeaker,
  canPublish,
  recordingEnabled,
  canManage: isHost || isCohost,
});
```

**useLiveKit.ts:**
```typescript
console.log('[useLiveKit] Token from API, canPublish:', publish, 
  'isHost:', data.isHost, 'isGuest:', data.isGuest);
```

### 4. Added Dependency Tracking

Added `user?.id` as a dependency to the sync effect to ensure it re-runs when auth state is available:

```typescript
}, [socket.participants, liveKit.roomRef.current?.localParticipant?.identity, user?.id]);
```

## Files Modified

1. **src/contexts/RoomContext.tsx**
   - Added `useAuthStore` import
   - Enhanced `isCohost` sync effect with multiple identity sources
   - Added comprehensive debug logging

2. **src/components/session/ControlBar.tsx**
   - Added debug logging for props

3. **src/hooks/useLiveKit.ts**
   - Added debug logging for token generation

4. **src/hooks/session/useRoomSession.ts**
   - Added debug logging for state values

## Debug Console Output

When the fix is working correctly, you should see:

```
[useLiveKit] Token from API, canPublish: true isHost: false isGuest: false
[RoomContext] Syncing isCohost from participants: {
  myIdentity: "user_id_here",
  participantsCount: 3,
  participants: [...]
}
[RoomContext] Found me in participants: {
  found: true,
  myRole: "COHOST",
  myIdentity: "user_id_here",
  authUserId: "user_id_here",
  participantIds: ["host_id", "user_id_here", "guest_id"]
}
[RoomContext] Setting isCohost to TRUE based on participant role
[ControlBar Debug] {
  isHost: false,
  isCohost: true,  // ← NOW CORRECT!
  isSpeaker: false,
  canPublish: true,
  recordingEnabled: true,
  canManage: true
}
```

## Control Bar Behavior

With the fix, co-hosts now see the correct controls:

| Control | Guest | Co-Host | Host |
|---------|-------|---------|------|
| Mic/Camera | Disabled if settings restrict | ✅ Enabled | ✅ Enabled |
| Raise Hand | ✅ Shows | ❌ Hidden | ❌ Hidden |
| Record | ❌ Hidden | ✅ Shows | ✅ Shows |
| End Session | ❌ Hidden | ✅ Shows | ✅ Shows |
| People/Chat | ✅ Shows | ✅ Shows | ✅ Shows |

## Testing Checklist

- [ ] Pre-assigned co-host sees Record button
- [ ] Pre-assigned co-host sees End Session button
- [ ] Pre-assigned co-host can use mic/camera
- [ ] Co-host badge shows in Participants panel
- [ ] Host controls still work correctly
- [ ] Guest controls still restricted correctly
- [ ] Promoting a guest to co-host still works via socket event

## Related Code Flow

```
User Joins Room
    ↓
useLiveKit hook fetches token with canPublish: true (backend checks DB role)
    ↓
socket connects and receives room:participants list
    ↓
RoomContext sync effect runs, tries to find user in participants
    ↓
Tries: LiveKit identity → Auth user ID fallback
    ↓
If role === "COHOST", sets isCohost(true)
    ↓
ControlBar receives isCohost=true, shows co-host controls
```

## Backend Integration

This fix assumes the backend correctly:
1. Stores co-host role in database when pre-assigning
2. Includes co-hosts in `room:participants` socket event with `role: COHOST`
3. Generates LiveKit tokens with `canPublish: true` for co-hosts

## Notes

- The `canPublish` flag from LiveKit is separate from `isCohost` state
- `canPublish` enables mic/camera functionality
- `isCohost` enables UI controls (Record, End Session)
- Both need to be `true` for full co-host experience
- The fix ensures `isCohost` is correctly synced even when socket events don't fire
