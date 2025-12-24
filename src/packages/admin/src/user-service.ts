import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getFirestore,
  orderBy,
} from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

// Initialize Firestore and Auth
const db = getFirestore()
const auth = getAuth()

export interface User {
  id: string
  email: string
  displayName: string
  role: string
  status: "active" | "inactive" | "suspended"
  createdAt: string
  lastLogin?: string
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users")
    const querySnapshot = await getDocs(usersRef)

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as User,
    )
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User
    }

    return null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    throw error
  }
}

export const createUser = async (userData: Omit<User, "id" | "createdAt"> & { password: string }): Promise<User> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)

    // Store additional user data in Firestore
    const now = new Date().toISOString()
    const newUser: Omit<User, "id"> = {
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      status: userData.status,
      createdAt: now,
    }

    await setDoc(doc(db, "users", userCredential.user.uid), newUser)

    return {
      id: userCredential.user.uid,
      ...newUser,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, userData)

    const updatedUser = await getUserById(userId)
    if (!updatedUser) {
      throw new Error("User not found after update")
    }

    return updatedUser
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Delete from Firestore first
    await deleteDoc(doc(db, "users", userId))

    // Then attempt to delete from Firebase Auth if possible
    // Note: This operation may fail if the user is not currently signed in or accessible
    try {
      // This would require admin SDK in a real app, but we're simplifying for this example
      // In a real application, this would be handled by a secure backend service
      console.log(`User ${userId} should be deleted from Firebase Auth via admin SDK`)
    } catch (authError) {
      console.error("Error deleting user from Firebase Auth:", authError)
      // We still consider the operation successful if Firestore deletion worked
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

export const getUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("role", "==", role), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as User,
    )
  } catch (error) {
    console.error(`Error getting users by role ${role}:`, error)
    throw error
  }
}

export const getActiveUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("status", "==", "active"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as User,
    )
  } catch (error) {
    console.error("Error getting active users:", error)
    throw error
  }
}
