---
name: react-native-standards
description: Use when writing or reviewing React Native/Expo code. Ensures modern patterns, performance best practices, and consistent architecture.
---

# React Native & Expo Standards

**Philosophy**: Native-first, performant, gesture-driven interfaces.

---

## When to Use

**Trigger conditions:**
- Writing new React Native/Expo components
- Reviewing React Native code
- Debugging performance issues
- Implementing gestures or animations

---

## Core Patterns

### Component Structure

```tsx
// =============================================================================
// IMPORTS
// =============================================================================

// React/React Native
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

// Navigation
import { useNavigation } from '@react-navigation/native'

// Context
import { useAuth } from '@/contexts/AuthContext'

// Components
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Services
import { UserService } from '@/services/user'

// Types
import type { User } from '@/types/user'

// =============================================================================
// TYPES
// =============================================================================

interface UserCardProps {
  userId: string
  onUpdate?: (user: User) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function UserCard({ userId, onUpdate }: UserCardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigation = useNavigation()

  useEffect(() => {
    UserService.get(userId)
      .then(setUser)
      .finally(() => setIsLoading(false))
  }, [userId])

  const handleUpdate = useCallback(() => {
    if (user) onUpdate?.(user)
  }, [user, onUpdate])

  if (isLoading) return <Text>Loading...</Text>
  if (!user) return <Text>Not found</Text>

  return (
    <Card style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
      <Button onPress={handleUpdate} title="Update" />
    </Card>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
})
```

---

## Expo Best Practices

### App Configuration (app.json)

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain"
    },
    "ios": {
      "bundleIdentifier": "com.company.myapp",
      "supportsTablet": false
    },
    "android": {
      "package": "com.company.myapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      }
    }
  }
}
```

### Environment Variables

```typescript
// Use expo-constants for env vars
import Constants from 'expo-constants'

const API_URL = Constants.expoConfig?.extra?.apiUrl

// app.config.ts
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL,
    },
  },
}
```

---

## State Management

### Context API Pattern

```tsx
// =============================================================================
// IMPORTS
// =============================================================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

// =============================================================================
// TYPES
// =============================================================================

interface AuthState {
  user: User | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null)

// =============================================================================
// PROVIDER
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const user = await AuthService.signIn(email, password)
    setState({ user, isLoading: false })
  }, [])

  const signOut = useCallback(async () => {
    await AuthService.signOut()
    setState({ user: null, isLoading: false })
  }, [])

  const value = useMemo(() => ({
    ...state,
    signIn,
    signOut,
  }), [state, signIn, signOut])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// =============================================================================
// HOOK
// =============================================================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## Navigation Patterns

### Stack Navigator

```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

// =============================================================================
// TYPES
// =============================================================================

export type RootStackParamList = {
  Home: undefined
  Profile: { userId: string }
  Settings: undefined
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>

// =============================================================================
// NAVIGATOR
// =============================================================================

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  )
}
```

### Navigation Typing

```tsx
// In screen component
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RootStackScreenProps } from '@/navigation/types'

type Props = RootStackScreenProps<'Profile'>

export function ProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params
  // ...
}

// Or using hooks
export function ProfileScreen() {
  const navigation = useNavigation<Props['navigation']>()
  const route = useRoute<Props['route']>()
  const { userId } = route.params
  // ...
}
```

---

## Performance Patterns

### FlatList Optimization

```tsx
import { FlatList, View, Text } from 'react-native'
import { useCallback, useMemo } from 'react'

interface Item {
  id: string
  title: string
}

export function ItemList({ items }: { items: Item[] }) {
  // Memoize renderItem to prevent re-renders
  const renderItem = useCallback(({ item }: { item: Item }) => (
    <View style={styles.item}>
      <Text>{item.title}</Text>
    </View>
  ), [])

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: Item) => item.id, [])

  // Memoize getItemLayout for fixed-height items
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), [])

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
    />
  )
}

const ITEM_HEIGHT = 60
```

### Image Optimization

```tsx
import { Image } from 'expo-image'

// Use expo-image for better performance
export function OptimizedImage({ uri }: { uri: string }) {
  return (
    <Image
      source={{ uri }}
      style={styles.image}
      contentFit="cover"
      transition={200}
      placeholder={blurhash}
      cachePolicy="memory-disk"
    />
  )
}
```

### Memoization

```tsx
import { memo, useMemo, useCallback } from 'react'

// Memoize expensive components
export const ExpensiveList = memo(function ExpensiveList({ items }: Props) {
  // Component implementation
})

// Memoize derived data
const sortedItems = useMemo(() => {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name))
}, [items])

// Memoize callbacks passed to children
const handlePress = useCallback(() => {
  onItemPress(item.id)
}, [item.id, onItemPress])
```

---

## Gesture Handling

### React Native Gesture Handler

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'

export function SwipeableCard({ onSwipeLeft, onSwipeRight }: Props) {
  const translateX = useSharedValue(0)

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX
    })
    .onEnd((event) => {
      if (event.translationX > 100) {
        runOnJS(onSwipeRight)()
      } else if (event.translationX < -100) {
        runOnJS(onSwipeLeft)()
      }
      translateX.value = withSpring(0)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Card content */}
      </Animated.View>
    </GestureDetector>
  )
}
```

---

## Anti-Patterns to Avoid

### ❌ Common Mistakes

```tsx
// WRONG: Inline styles (recreated every render)
<View style={{ padding: 16, margin: 8 }}>

// CORRECT: Use StyleSheet
<View style={styles.container}>

// WRONG: Anonymous functions in render
<Pressable onPress={() => handlePress(item.id)}>

// CORRECT: Memoized callback
const handleItemPress = useCallback(() => handlePress(item.id), [item.id])
<Pressable onPress={handleItemPress}>

// WRONG: Not using memo for list items
const ListItem = ({ item }: Props) => { ... }

// CORRECT: Memoize list items
const ListItem = memo(({ item }: Props) => { ... })

// WRONG: Blocking the JS thread
const result = heavyComputation() // Blocks UI

// CORRECT: Use InteractionManager or workers
InteractionManager.runAfterInteractions(() => {
  const result = heavyComputation()
})
```

### ❌ Don't Do These

| Pattern | Problem | Fix |
|---------|---------|-----|
| Inline styles | Recreated every render | Use StyleSheet.create |
| Anonymous onPress | New function every render | useCallback |
| Large images | Memory issues | Use expo-image with caching |
| Sync heavy ops | UI freezes | InteractionManager or workers |
| Missing keys in lists | Re-render issues | Stable unique keys |
| Nested ScrollViews | Gesture conflicts | Single scrollable container |

---

## File Structure

```
src/
├── app/                    # Expo Router (if using)
│   ├── (tabs)/            # Tab navigation
│   ├── (auth)/            # Auth screens
│   └── _layout.tsx        # Root layout
├── components/
│   ├── ui/                # Reusable UI components
│   └── [feature]/         # Feature-specific components
├── contexts/              # Context providers
├── hooks/                 # Custom hooks
├── navigation/            # Navigation config (if not using Expo Router)
├── services/              # API services
├── types/                 # TypeScript types
└── utils/                 # Utilities
```

---

## Verification Checklist

When reviewing React Native code:

- [ ] No inline styles (use StyleSheet)
- [ ] FlatList has keyExtractor and optimizations
- [ ] Callbacks are memoized with useCallback
- [ ] Expensive components wrapped with memo
- [ ] Images use expo-image with caching
- [ ] Gestures use react-native-gesture-handler
- [ ] Animations use react-native-reanimated
- [ ] No blocking operations on JS thread
- [ ] Navigation is properly typed

---

**Remember**: Native feel, 60fps animations, responsive gestures.

滑らかに動け - "Move smoothly"
