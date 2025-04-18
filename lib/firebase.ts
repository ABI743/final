import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, enableIndexedDbPersistence } from "firebase/firestore"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
let db

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)

  // Enable offline persistence when possible
  if (typeof window !== "undefined") {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Persistence failed - multiple tabs open")
      } else if (err.code === "unimplemented") {
        console.warn("Persistence not available in this browser")
      }
    })
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
}

// Passwords for read and write access
// In a real app, these would be stored securely in Firestore
const PASSWORDS = {
  read: "ABIN1john",
  write: "THEPOTATO@006",
}

// Interface for entry data
interface EntryData {
  name: string
  message: string
  signature: string
  timestamp: string
}

// Save a new entry to Firestore with better error handling
export async function saveEntry(entryData: EntryData) {
  if (!db) {
    throw new Error("Firebase not initialized")
  }

  try {
    console.log("Attempting to save entry to Firestore...")
    const entriesCollection = collection(db, "entries")
    const docRef = await addDoc(entriesCollection, entryData)
    console.log("Document written with ID: ", docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error("Error adding document: ", error)

    // More detailed error information
    if (error.code === "permission-denied") {
      throw new Error("Firebase permission denied. Please check your Firestore rules.")
    } else {
      throw error
    }
  }
}

// Get all entries from Firestore with better error handling
export async function getEntries() {
  if (!db) {
    throw new Error("Firebase not initialized")
    return []
  }

  try {
    console.log("Fetching entries from Firestore...")
    const entriesCollection = collection(db, "entries")
    const querySnapshot = await getDocs(entriesCollection)
    const entries: any[] = []

    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    console.log(`Retrieved ${entries.length} entries`)

    // Sort entries by timestamp (newest first)
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("Error getting documents: ", error)
    throw error
  }
}

// Verify password for read or write access
export async function verifyPassword(mode: "read" | "write", password: string) {
  // In a real app, you would verify against passwords stored in Firestore
  // For this example, we're using hardcoded passwords
  return password === PASSWORDS[mode]
}
