import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, getFirestore } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Initialize Firestore
const db = getFirestore()
const storage = getStorage()

export interface PayslipItem {
  label: string
  amount: number
  type: "earning" | "deduction"
}

export interface Payslip {
  id: string
  employeeId: string
  period: {
    month: number
    year: number
  }
  issueDate: string
  grossSalary: number
  netSalary: number
  items: PayslipItem[]
  pdfUrl?: string
  status: "draft" | "published"
  viewedByEmployee: boolean
}

export const createPayslip = async (payslipData: Omit<Payslip, "id" | "viewedByEmployee">): Promise<Payslip> => {
  try {
    const payslipsRef = collection(db, "payslips")
    const newPayslipRef = doc(payslipsRef)

    const newPayslip: Payslip = {
      ...payslipData,
      id: newPayslipRef.id,
      viewedByEmployee: false,
    }

    await setDoc(newPayslipRef, newPayslip)
    return newPayslip
  } catch (error) {
    console.error("Error creating payslip:", error)
    throw error
  }
}

export const getPayslipById = async (id: string): Promise<Payslip | null> => {
  try {
    const payslipRef = doc(db, "payslips", id)
    const payslipSnap = await getDoc(payslipRef)

    if (payslipSnap.exists()) {
      return payslipSnap.data() as Payslip
    }

    return null
  } catch (error) {
    console.error("Error getting payslip:", error)
    throw error
  }
}

export const getPayslipsByEmployeeId = async (employeeId: string): Promise<Payslip[]> => {
  try {
    const payslipsRef = collection(db, "payslips")
    const q = query(
      payslipsRef,
      where("employeeId", "==", employeeId),
      where("status", "==", "published"),
      orderBy("period.year", "desc"),
      orderBy("period.month", "desc"),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Payslip)
  } catch (error) {
    console.error("Error getting payslips by employee ID:", error)
    throw error
  }
}

export const getAllPayslips = async (status?: "draft" | "published"): Promise<Payslip[]> => {
  try {
    const payslipsRef = collection(db, "payslips")
    let q = query(payslipsRef, orderBy("period.year", "desc"), orderBy("period.month", "desc"))

    if (status) {
      q = query(q, where("status", "==", status))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Payslip)
  } catch (error) {
    console.error("Error getting all payslips:", error)
    throw error
  }
}

export const updatePayslip = async (id: string, payslipData: Partial<Payslip>): Promise<Payslip> => {
  try {
    const payslipRef = doc(db, "payslips", id)
    await setDoc(payslipRef, payslipData, { merge: true })

    const updatedPayslip = await getPayslipById(id)
    if (!updatedPayslip) {
      throw new Error("Payslip not found after update")
    }

    return updatedPayslip
  } catch (error) {
    console.error("Error updating payslip:", error)
    throw error
  }
}

export const markPayslipAsViewed = async (id: string): Promise<void> => {
  try {
    const payslipRef = doc(db, "payslips", id)
    await setDoc(payslipRef, { viewedByEmployee: true }, { merge: true })
  } catch (error) {
    console.error("Error marking payslip as viewed:", error)
    throw error
  }
}

export const uploadPayslipPdf = async (id: string, file: File | Blob): Promise<string> => {
  try {
    const storageRef = ref(storage, `payslips/${id}.pdf`)
    await uploadBytes(storageRef, file)

    const downloadURL = await getDownloadURL(storageRef)

    // Update payslip with PDF URL
    await updatePayslip(id, { pdfUrl: downloadURL })

    return downloadURL
  } catch (error) {
    console.error("Error uploading payslip PDF:", error)
    throw error
  }
}

export const publishPayslip = async (id: string): Promise<Payslip> => {
  try {
    return await updatePayslip(id, { status: "published" })
  } catch (error) {
    console.error("Error publishing payslip:", error)
    throw error
  }
}
