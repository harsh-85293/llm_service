# Design Document

## Overview

The Employee Escalation Token feature adds a visual interface to the admin dashboard that displays all employees (users with admin or super_admin roles) and randomly assigns an escalation token to one employee. This token indicates which employee is currently responsible for handling escalated tickets. The feature integrates seamlessly with the existing ticket management system and provides both manual and automatic token reassignment capabilities.

## Architecture

### Component Structure

```
AdminDashboard
├── EmployeeInterface (new)
│   ├── EmployeeCard (new)
│   │   ├── Employee Info Display
│   │   ├── Token Badge (conditional)
│   │   └── Status Indicator
│   └── Token Controls
│       └── Reassign Button
```

### Data Flow

1. **Initial Load**: AdminDashboard fetches all users with admin/super_admin roles from the API
2. **Token Assignment**: Client-side random selection algorithm assigns token to one employee
3. **Token Storage**: Token holder ID stored in React state (ephemeral, resets on page reload)
4. **Manual Reassignment**: User clicks "Reassign Token" button → new random selection → UI updates
5. **Optional Auto-Reassignment**: Timer-based reassignment every 24 hours (configurable)

### Integration Points

- **AuthContext**: Provides user authentication and role information
- **API Layer**: Fetches employee list from existing user endpoints
- **AdminDashboard**: Parent component that hosts the new EmployeeInterface
- **Existing Ticket System**: Token holder information can be referenced when assigning escalated tickets

## Components and Interfaces

### 1. EmployeeInterface Component

**Purpose**: Main container component that manages employee list and token assignment logic

**Props**:
```typescript
interface EmployeeInterfaceProps {
  // No props needed - fetches data internally
}
```

**State**:
```typescript
interface EmployeeInterfaceState {
  employees: Employee[];
  tokenHolderId: string | null;
  loading: boolean;
  error: string | null;
  lastAssignedAt: Date | null;
}
```

**Key Methods**:
- `fetchEmployees()`: Fetches all admin/super_admin users from API
- `assignRandomToken()`: Randomly selects an employee and assigns token
- `reassignToken()`: Manually triggers token reassignment
- `startAutoReassignment()`: Initializes 24-hour timer for automatic reassignment

### 2. EmployeeCard Component

**Purpose**: Displays individual employee information with token indicator

**Props**:
```typescript
interface EmployeeCardProps {
  employee: Employee;
  hasToken: boolean;
  isOnline: boolean;
}
```

**Visual States**:
- **Normal**: Standard card with employee info
- **Token Holder**: Highlighted card with badge, distinct border/background
- **Online/Offline**: Status indicator dot (green/gray)

### 3. Employee Interface Type

```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  last_login: string;
}
```

## Data Models

### Employee Data Structure

The feature uses the existing User model from AuthContext:

```typescript
interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  last_login: string;
}
```

**Filtering Logic**: Query users where `role === 'admin' OR role === 'super_admin'`

### Token Assignment State

```typescript
interface TokenState {
  holderId: string;           // ID of employee with token
  assignedAt: Date;           // Timestamp of assignment
  expiresAt: Date | null;     // Optional expiration for auto-reassignment
}
```

**Storage**: React state (component-level, not persisted)

**Rationale**: Token assignment is ephemeral and resets on page reload. This is intentional to keep the system simple and avoid database complexity for a UI-only feature.

## UI/UX Design

### Layout

**Desktop (≥768px)**:
- Grid layout with 3 columns
- Cards with equal width and height
- Responsive spacing (gap-6)

**Mobile (<768px)**:
- Single column layout
- Full-width cards
- Stacked vertically

### Visual Hierarchy

1. **Section Header**: "Employee Escalation Token" with icon
2. **Token Controls**: Reassign button prominently displayed
3. **Employee Grid**: Cards arranged in responsive grid
4. **Token Holder**: Visually distinct with:
   - Gold/yellow border (border-yellow-500)
   - Badge with "🎯 Token Holder" text
   - Subtle background highlight (bg-yellow-50)
   - Larger card size or elevated shadow

### Color Scheme

- **Token Holder**: Yellow/Gold theme (bg-yellow-50, border-yellow-500, text-yellow-700)
- **Online Status**: Green dot (bg-green-500)
- **Offline Status**: Gray dot (bg-gray-400)
- **Cards**: White background (bg-white) with gray border (border-gray-200)
- **Dark Mode**: Slate backgrounds (bg-slate-800) with appropriate contrast

### Accessibility

- Semantic HTML elements (section, article for cards)
- ARIA labels for token badge and status indicators
- Keyboard navigation support for reassign button
- Sufficient color contrast ratios (WCAG AA compliant)
- Screen reader announcements for token reassignment

## Random Selection Algorithm

### Implementation

```typescript
function selectRandomEmployee(employees: Employee[]): Employee {
  const randomIndex = Math.floor(Math.random() * employees.length);
  return employees[randomIndex];
}
```

### Fairness Guarantee

- Uses JavaScript's `Math.random()` for uniform distribution
- Each employee has equal probability: `1 / total_employees`
- No weighting or bias factors
- Simple and transparent algorithm

### Edge Cases

- **Single Employee**: Token assigned to only employee
- **No Employees**: Display message "No employees available"
- **Reassignment to Same Employee**: Allowed (re-roll until different employee optional)

## API Integration

### Endpoints Used

**GET /api/users** (or equivalent endpoint)
- Fetches all users from the system
- Client-side filtering for admin/super_admin roles

**Response Format**:
```typescript
{
  users: User[]
}
```

### Caching Strategy

- **Cache Duration**: 5 minutes
- **Cache Key**: 'employees_list'
- **Invalidation**: Manual refresh or cache expiration
- **Implementation**: React state with timestamp check

### Error Handling

- **Network Error**: Display "Unable to load employees. Please try again."
- **Empty Response**: Display "No employees found in the system."
- **Timeout**: 3-second timeout with retry option
- **Fallback**: Show cached data if available

## State Management

### Component State (React useState)

```typescript
const [employees, setEmployees] = useState<Employee[]>([]);
const [tokenHolderId, setTokenHolderId] = useState<string | null>(null);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
```

### State Updates

1. **Initial Load**: 
   - Set loading = true
   - Fetch employees
   - Assign random token
   - Set loading = false

2. **Manual Reassignment**:
   - Call selectRandomEmployee()
   - Update tokenHolderId
   - Update lastAssignedAt timestamp

3. **Auto Reassignment** (optional):
   - Check if 24 hours elapsed
   - Trigger reassignment
   - Reset timer

### No Global State Needed

The feature is self-contained within the AdminDashboard and doesn't require Redux, Context, or other global state management.

## Error Handling

### User-Facing Errors

1. **Failed to Load Employees**
   - Message: "Unable to load employees. Please try again."
   - Action: Retry button
   - Fallback: Show empty state

2. **Network Timeout**
   - Message: "Request timed out. Check your connection."
   - Action: Automatic retry after 5 seconds
   - Fallback: Use cached data if available

3. **No Employees Found**
   - Message: "No employees available for token assignment."
   - Action: None (informational only)
   - Display: Empty state illustration

### Developer Errors

- Console logging for debugging
- Error boundaries to prevent app crashes
- Graceful degradation (hide component if critical error)

### Retry Logic

- Maximum 3 retry attempts
- Exponential backoff: 1s, 2s, 4s
- User notification after final failure

## Testing Strategy

### Unit Tests

1. **Random Selection Algorithm**
   - Test uniform distribution over 1000 iterations
   - Test single employee edge case
   - Test empty array handling

2. **Component Rendering**
   - Test EmployeeCard renders correctly
   - Test token badge appears for token holder
   - Test online/offline status indicator

3. **State Management**
   - Test initial token assignment
   - Test manual reassignment
   - Test state updates correctly

### Integration Tests

1. **API Integration**
   - Mock API responses
   - Test successful employee fetch
   - Test error handling
   - Test caching behavior

2. **User Interactions**
   - Test reassign button click
   - Test token holder updates in UI
   - Test loading states

### Manual Testing Checklist

- [ ] Verify employees load on dashboard mount
- [ ] Verify one employee has token on initial load
- [ ] Click "Reassign Token" and verify new employee gets token
- [ ] Verify visual distinction of token holder
- [ ] Test responsive layout on mobile and desktop
- [ ] Test with 1, 3, 5, and 10+ employees
- [ ] Test error states (network failure, no employees)
- [ ] Verify accessibility with screen reader
- [ ] Test dark mode appearance

### Performance Considerations

- Employee list fetch should complete within 3 seconds
- Token reassignment should update UI within 1 second
- No memory leaks from timers (cleanup on unmount)
- Efficient re-renders (React.memo for EmployeeCard)

## Implementation Notes

### Phase 1: Core Functionality
- Create EmployeeInterface component
- Implement employee fetching and filtering
- Implement random token assignment
- Create EmployeeCard component with token indicator
- Integrate into AdminDashboard

### Phase 2: Enhanced Features
- Add manual reassign button
- Implement caching strategy
- Add loading and error states
- Responsive design implementation

### Phase 3: Optional Enhancements
- Auto-reassignment timer (24 hours)
- Token assignment history log
- Integration with ticket assignment workflow
- Analytics/metrics for token holder performance

### Technical Decisions

**Why client-side token assignment?**
- Simplifies implementation (no backend changes)
- Ephemeral nature fits use case (UI-only feature)
- Fast and responsive (no API latency)
- Easy to extend later if persistence needed

**Why not persist token in database?**
- Feature is primarily for visualization
- Token resets on page reload is acceptable
- Reduces backend complexity
- Can be added later if business requirements change

**Why 5-minute cache?**
- Balances freshness with performance
- Employees don't change frequently
- Reduces unnecessary API calls
- Short enough to reflect recent changes

## Future Enhancements

1. **Token Persistence**: Store token holder in database for cross-session consistency
2. **Token History**: Track token assignments over time for analytics
3. **Smart Assignment**: Weight selection based on workload or availability
4. **Notifications**: Alert token holder when assigned
5. **Integration**: Auto-assign escalated tickets to token holder
6. **Metrics Dashboard**: Show token holder performance statistics
7. **Multi-Token Support**: Multiple tokens for different ticket categories
