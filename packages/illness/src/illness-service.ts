import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  getFirestore,
  orderBy,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Initialize Firestore
const db = getFirestore()
const storage = getStorage()

export type IllnessStatus = "active" | "recovered" | "chronic"
export type IllnessType = "sick_leave" | "work_accident" | "long_term" | "other"

export interface IllnessRecord {
  id: string
  employeeId: string
  type: IllnessType
  status: IllnessStatus
  startDate: string
  endDate?: string
  description: string
  medicalCertificateUrl?: string
  medicalCertificateExpiry?: string
  followUpDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
  documents?: {
    id: string
    name: string
    url: string
    uploadDate: string
    type: string
  }[]
}

export const createIllnessRecord = async (
  illnessData: Omit<IllnessRecord, "id" | "createdAt" | "updatedAt">,
): Promise<IllnessRecord> => {
  try {
    const illnessRef = collection(db, "illnessRecords")
    const newIllnessRef = doc(illnessRef)

    const now = new Date().toISOString()

    const newIllnessRecord: IllnessRecord = {
      ...illnessData,
      id: newIllnessRef.id,
      createdAt: now,
      updatedAt: now,
    }

    await setDoc(newIllnessRef, newIllnessRecord)
    return newIllnessRecord
  } catch (error) {
    console.error("Error creating illness record:", error)
    throw error
  }
}

export const getIllnessRecordById = async (id: string): Promise<IllnessRecord | null> => {
  try {
    const illnessRef = doc(db, "illnessRecords", id)
    const illnessSnap = await getDoc(illnessRef)

    if (illnessSnap.exists()) {
      return illnessSnap.data() as IllnessRecord
    }

    return null
  } catch (error) {
    console.error("Error getting illness record:", error)
    throw error
  }
}

export const getIllnessRecordsByEmployeeId = async (employeeId: string): Promise<IllnessRecord[]> => {
  try {
    const illnessRef = collection(db, "illnessRecords")
    const q = query(illnessRef, where("employeeId", "==", employeeId), orderBy("startDate", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as IllnessRecord)
  } catch (error) {
    console.error("Error getting illness records by employee ID:", error)
    throw error
  }
}

export const updateIllnessRecord = async (
  id: string,
  illnessData: Partial<IllnessRecord> & { updatedBy: string },
): Promise<IllnessRecord> => {
  try {
    const illnessRef = doc(db, "illnessRecords", id)

    const updateData = {
      ...illnessData,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(illnessRef, updateData)

    const updatedIllness = await getIllnessRecordById(id)
    if (!updatedIllness) {
      throw new Error("Illness record not found after update")
    }

    return updatedIllness
  } catch (error) {
    console.error("Error updating illness record:", error)
    throw error
  }
}

export const getAllActiveIllnessRecords = async (): Promise<IllnessRecord[]> => {
  try {
    const illnessRef = collection(db, "illnessRecords")
    const q = query(illnessRef, where("status", "==", "active"), orderBy("startDate", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as IllnessRecord)
  } catch (error) {
    console.error("Error getting active illness records:", error)
    throw error
  }
}

export const uploadMedicalCertificate = async (
  illnessId: string,
  file: File | Blob,
  fileName: string,
  updatedBy: string,
): Promise<string> => {
  try {
    // Get the illness record to get the employee ID
    const illnessRecord = await getIllnessRecordById(illnessId)
    if (!illnessRecord) {
      throw new Error("Illness record not found")
    }

    const employeeId = illnessRecord.employeeId
    const storageRef = ref(storage, `employees/${employeeId}/medical/${illnessId}/${fileName}`)
    await uploadBytes(storageRef, file)

    const downloadURL = await getDownloadURL(storageRef)

    // Update the illness record with the certificate URL
    await updateIllnessRecord(illnessId, {
      medicalCertificateUrl: downloadURL,
      updatedBy,
    })

    return downloadURL
  } catch (error) {
    console.error("Error uploading medical certificate:", error)
    throw error
  }
}

export const getIllnessStatistics = async (): Promise<{
  totalActive: number
  totalRecovered: number
  totalChronic: number
  byType: Record<IllnessType, number>
}> => {
  try {
    const illnessRef = collection(db, "illnessRecords")
    const querySnapshot = await getDocs(illnessRef)

    const records = querySnapshot.docs.map((doc) => doc.data() as IllnessRecord)

    const totalActive = records.filter((record) => record.status === "active").length
    const totalRecovered = records.filter((record) => record.status === "recovered").length
    const totalChronic = records.filter((record) => record.status === "chronic").length

    const byType: Record<IllnessType, number> = {
      sick_leave: 0,
      work_accident: 0,
      long_term: 0,
      other: 0,
    }

    records.forEach((record) => {
      byType[record.type]++
    })

    return {
      totalActive,
      totalRecovered,
      totalChronic,
      byType,
    }
  } catch (error) {
    console.error("Error getting illness statistics:", error)
    throw error
  }
}
