# Implementation Plan

- [x] 1. Create EmployeeCard component


  - Create a new file `src/components/EmployeeCard.tsx` that displays individual employee information
  - Implement props interface with employee data, hasToken boolean, and isOnline boolean
  - Add visual styling for normal state with employee name, email, role, and online status indicator
  - Add conditional rendering for token holder state with gold/yellow border, badge with "🎯 Token Holder" text, and highlighted background
  - Implement responsive card layout that works on mobile and desktop
  - Add dark mode support using Tailwind's dark: classes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.3, 2.4, 4.1, 4.4_



- [ ] 2. Create EmployeeInterface component with employee fetching
  - Create a new file `src/components/EmployeeInterface.tsx` as the main container component
  - Implement state management for employees array, tokenHolderId, loading, and error states
  - Write fetchEmployees function that calls the API to get all users and filters for admin/super_admin roles
  - Implement 5-minute caching logic using lastFetchTime state and timestamp comparison
  - Add loading indicator that displays while fetching employee data
  - Add error handling with user-friendly error messages and retry button

  - Implement empty state display when no employees are found
  - _Requirements: 1.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3. Implement random token assignment logic
  - Write selectRandomEmployee function that uses Math.random() to select one employee from the array
  - Implement assignRandomToken function that calls selectRandomEmployee and updates tokenHolderId state
  - Add logic to automatically assign token on initial component mount after employees are fetched
  - Handle edge case when there is only one employee (assign token to that employee)

  - Handle edge case when there are no employees (set tokenHolderId to null)
  - Ensure equal probability for all employees (1 / total_employees)
  - _Requirements: 2.1, 2.5, 3.4_

- [ ] 4. Add manual token reassignment functionality
  - Create reassignToken function that calls selectRandomEmployee and updates the tokenHolderId state
  - Add "Reassign Token" button in the EmployeeInterface component UI
  - Implement button click handler that calls reassignToken

  - Add visual feedback during reassignment (brief loading state or animation)
  - Update lastAssignedAt timestamp when token is reassigned
  - Ensure UI updates within 1 second of reassignment as per requirements
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5. Implement responsive grid layout for employee cards
  - Create grid container in EmployeeInterface that displays EmployeeCard components
  - Implement responsive grid with 3 columns on desktop (≥768px) using Tailwind grid classes
  - Implement single column layout on mobile (<768px)



  - Add consistent spacing between cards using gap utilities
  - Map over employees array and render EmployeeCard for each employee
  - Pass hasToken prop by comparing employee.id with tokenHolderId
  - Pass isOnline prop based on last_login timestamp (online if logged in within last 15 minutes)
  - _Requirements: 1.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Integrate EmployeeInterface into AdminDashboard
  - Import EmployeeInterface component in `src/components/AdminDashboard.tsx`
  - Add EmployeeInterface component to the AdminDashboard render method
  - Position the component below the stats cards and above the ticket list
  - Add section header "Employee Escalation Token" with appropriate icon
  - Ensure the component fits within the existing layout and styling
  - Test that the component renders correctly in the admin dashboard
  - _Requirements: 4.5_

- [ ]* 7. Add accessibility features
  - Add ARIA labels to token badge ("Escalation token holder")
  - Add ARIA labels to online/offline status indicators
  - Ensure reassign button has proper focus states and keyboard navigation
  - Add semantic HTML elements (section for container, article for cards)
  - Test with screen reader to ensure proper announcements
  - Verify color contrast ratios meet WCAG AA standards
  - _Requirements: 2.2, 2.3, 2.4_

- [ ]* 8. Implement optional auto-reassignment timer
  - Create startAutoReassignment function that sets up a 24-hour interval timer
  - Store timer reference in useRef to prevent memory leaks
  - Implement cleanup function in useEffect to clear timer on component unmount
  - Add configuration option to enable/disable auto-reassignment
  - Update lastAssignedAt timestamp on auto-reassignment
  - Add visual indicator showing time until next auto-reassignment
  - _Requirements: 3.5_
