import { initializeApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
import { firebaseConfig } from "./firebase-config"
import type { UserRole } from "../../core/src/types/roles"

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
}

export interface SignUpData {
  email: string
  password: string
  displayName?: string
  role?: UserRole
}

export interface SignInData {
  email: string
  password: string
}

// Convert Firebase User to our AuthUser type
const mapUserToAuthUser = async (user: User | null): Promise<AuthUser | null> => {
  if (!user) return null

  // Get additional user data from Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid))
  const userData = userDoc.data()

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: (userData?.role as UserRole) || "employee",
  }
}

// Sign up a new user
export const signUp = async ({ email, password, displayName, role = "employee" }: SignUpData): Promise<AuthUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      displayName: displayName || null,
      role,
      createdAt: new Date().toISOString(),
    })

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName || userCredential.user.displayName,
      role,
    }
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

// Sign in an existing user
export const signIn = async ({ email, password }: SignInData): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const authUser = await mapUserToAuthUser(userCredential.user)

    if (!authUser) {
      throw new Error("Failed to get user data")
    }

    return authUser
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign out the current user
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: AuthUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, async (user) => {
    const authUser = await mapUserToAuthUser(user)
    callback(authUser)
  })
}

// Get the current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const user = auth.currentUser
  return await mapUserToAuthUser(user)
}

// Update user role
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  try {
    await setDoc(doc(db, "users", userId), { role }, { merge: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

// Get user role
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole
    }
    return null
  } catch (error) {
    console.error("Error getting user role:", error)
    throw error
  }
}
