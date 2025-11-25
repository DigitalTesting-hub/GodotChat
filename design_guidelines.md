# Design Guidelines: Godot Game Chat Interface

## Design Approach

**Selected Approach**: Design System - Gaming UI Pattern  
**Reference Systems**: Discord chat patterns, Steam overlay, in-game chat interfaces  
**Justification**: This is a utility-focused overlay for active gameplay. The chat must be efficient, non-distracting, and immediately familiar to gamers while maintaining excellent readability in various game contexts.

## Core Design Principles

1. **Minimal Footprint**: Chat should occupy minimal screen space when collapsed, maximum clarity when active
2. **Gaming Native**: Visual language should feel native to game environments
3. **Instant Recognition**: Players should understand the chat system within 2 seconds
4. **Performance First**: Lightweight animations, optimized for game contexts

## Typography

**Font Selection**: 
- Primary: Inter or Roboto (via Google Fonts CDN)
- Fallback: System sans-serif stack

**Hierarchy**:
- Player names: text-sm font-semibold (14px, weight 600)
- Chat messages: text-sm font-normal (14px, weight 400)
- Input placeholder: text-sm font-normal (14px, weight 400)
- Header title: text-base font-bold (16px, weight 700)
- System messages: text-xs font-medium (12px, weight 500)

## Layout System

**Spacing Primitives**: Use Tailwind units of 1, 2, 3, 4, 6, 8, 12  
Common patterns:
- Component padding: p-3, p-4
- Message spacing: space-y-2, space-y-3
- Input areas: p-3
- Icon/button sizes: h-8 w-8, h-10 w-10

**Chat Container**:
- Collapsed: Fixed position bottom-right, w-12 h-12 (toggle button only)
- Expanded Desktop: w-80 h-96 (320px × 384px)
- Expanded Mobile: Full screen overlay (w-full h-full)
- Border radius: rounded-lg (8px) for desktop, rounded-none for mobile

**Message Layout** (Critical - User Specified):
- Own messages: Align LEFT (self-start)
- Others' messages: Align RIGHT (self-end)
- Message bubbles: max-w-[75%] to prevent full-width messages
- Avatar indicators: Small circular indicators (w-6 h-6) on appropriate sides

## Component Library

### Chat Toggle Button (Collapsed State)
- Size: w-12 h-12 (48px circle)
- Position: fixed bottom-4 right-4
- Icon: Chat bubble icon from Heroicons (via CDN)
- State indicator: Small badge showing unread count (absolute top-0 right-0)

### Chat Container (Expanded State)

**Header Section**:
- Height: h-12
- Layout: Flex row, items-center, justify-between
- Left: "Live Chat" title (text-base font-bold)
- Right: Close button (w-8 h-8, hover:opacity-75 transition)
- Border bottom: border-b

**Name Entry Screen** (Initial State):
- Centered flex column layout
- Welcome message: text-lg font-semibold mb-2
- Instruction text: text-sm mb-6
- Input field: w-full px-4 py-2.5, rounded-md, border
- Start button: w-full px-4 py-3, rounded-md, font-semibold
- Vertical spacing: space-y-4

**Messages Area**:
- Flex column, flex-1 (fills available space)
- Overflow: overflow-y-auto
- Padding: p-4
- Message spacing: space-y-3
- Scroll behavior: Auto-scroll to bottom on new messages

**Message Bubbles**:
- Own messages (LEFT aligned):
  - Self-start alignment
  - Padding: px-3 py-2
  - Rounded: rounded-2xl, rounded-bl-sm (speech bubble effect)
  - Max width: max-w-[75%]
  
- Others' messages (RIGHT aligned):
  - Self-end alignment  
  - Padding: px-3 py-2
  - Rounded: rounded-2xl, rounded-br-sm (speech bubble effect)
  - Max width: max-w-[75%]
  - Player name above message: text-xs mb-1

**Input Area**:
- Height: h-14
- Layout: Flex row, gap-2
- Padding: p-3
- Border top: border-t
- Input field: flex-1, px-3 py-2, rounded-full, border
- Send button: w-10 h-10, rounded-full, flex items-center justify-center
- Send icon: Heroicons arrow or paper plane (w-5 h-5)

### System Messages
- Centered text with reduced opacity
- Font: text-xs italic
- Padding: py-2
- Use for: "Player joined", "Connection status", etc.

### Loading/Typing Indicator
- Three dots animation (●●●)
- Aligned right (as "others" message)
- Subtle pulse animation (animate-pulse)

## Responsive Behavior

**Desktop (≥768px)**:
- Fixed positioned overlay (bottom-right)
- Maintains w-80 h-96 dimensions
- Subtle drop shadow for depth

**Mobile (<768px)**:
- Full screen overlay when expanded
- Header with back/close button
- Input area fixed to bottom
- Messages area uses remaining space
- Prevent body scroll when chat active

## Accessibility

- Focus management: Auto-focus input when chat opens
- Keyboard navigation: Enter to send, Escape to close
- ARIA labels: All interactive elements properly labeled
- Sufficient contrast ratios throughout
- Screen reader announcements for new messages

## Animation Constraints

**Allowed (Minimal)**:
- Chat expand/collapse: scale and fade (150ms)
- Message appearance: fadeIn + translateY (200ms)
- Typing indicator: pulse animation (1.5s infinite)
- Button hover: opacity transition (150ms)

**Forbidden**:
- Scrolling animations
- Background effects
- Particle effects
- Complex transitions

## Mobile Specific Considerations

- Touch targets: Minimum 44px × 44px
- Input area: Use native mobile keyboard
- Viewport handling: Use vh units carefully, prefer fixed positioning
- Gesture support: Swipe down to close on mobile

## Integration Notes for Godot

- Chat widget should be lightweight HTML/CSS/JS
- API polling: Every 2-3 seconds when chat active
- Message format: JSON with `{name, message, timestamp, isOwn}`
- Name fetching: Godot passes player name on chat initialization
- Connection status: Show indicator when backend unreachable

## Images

No images required for this chat interface. All UI elements are text and icon-based for optimal performance in game contexts.