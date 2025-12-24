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

// Initialize Firestore
const db = getFirestore()

export type LeaveType = "vacation" | "sick" | "personal" | "other"
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled"

export interface LeaveRequest {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  createdAt: string
  updatedAt: string
  approvedBy?: string
  rejectionReason?: string
}

export const createLeaveRequest = async (
  leaveData: Omit<LeaveRequest, "id" | "status" | "createdAt" | "updatedAt">,
): Promise<LeaveRequest> => {
  try {
    const leaveRequestsRef = collection(db, "leaveRequests")
    const newLeaveRequestRef = doc(leaveRequestsRef)

    const now = new Date().toISOString()

    const newLeaveRequest: LeaveRequest = {
      ...leaveData,
      id: newLeaveRequestRef.id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    }

    await setDoc(newLeaveRequestRef, newLeaveRequest)
    return newLeaveRequest
  } catch (error) {
    console.error("Error creating leave request:", error)
    throw error
  }
}

export const getLeaveRequestById = async (id: string): Promise<LeaveRequest | null> => {
  try {
    const leaveRequestRef = doc(db, "leaveRequests", id)
    const leaveRequestSnap = await getDoc(leaveRequestRef)

    if (leaveRequestSnap.exists()) {
      return leaveRequestSnap.data() as LeaveRequest
    }

    return null
  } catch (error) {
    console.error("Error getting leave request:", error)
    throw error
  }
}

export const getLeaveRequestsByEmployeeId = async (employeeId: string): Promise<LeaveRequest[]> => {
  try {
    const leaveRequestsRef = collection(db, "leaveRequests")
    const q = query(leaveRequestsRef, where("employeeId", "==", employeeId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as LeaveRequest)
  } catch (error) {
    console.error("Error getting leave requests by employee ID:", error)
    throw error
  }
}

export const updateLeaveRequestStatus = async (
  id: string,
  status: LeaveStatus,
  approvedBy?: string,
  rejectionReason?: string,
): Promise<LeaveRequest> => {
  try {
    const leaveRequestRef = doc(db, "leaveRequests", id)

    const updateData: Partial<LeaveRequest> = {
      status,
      updatedAt: new Date().toISOString(),
    }

    if (status === "approved" && approvedBy) {
      updateData.approvedBy = approvedBy
    }

    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    await updateDoc(leaveRequestRef, updateData)

    const updatedLeaveRequest = await getLeaveRequestById(id)
    if (!updatedLeaveRequest) {
      throw new Error("Leave request not found after update")
    }

    return updatedLeaveRequest
  } catch (error) {
    console.error("Error updating leave request status:", error)
    throw error
  }
}

export const getPendingLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const leaveRequestsRef = collection(db, "leaveRequests")
    const q = query(leaveRequestsRef, where("status", "==", "pending"), orderBy("createdAt", "asc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as LeaveRequest)
  } catch (error) {
    console.error("Error getting pending leave requests:", error)
    throw error
  }
}

export const getLeaveRequestsForCalendar = async (startDate: Date, endDate: Date): Promise<LeaveRequest[]> => {
  try {
    const leaveRequestsRef = collection(db, "leaveRequests")
    const q = query(
      leaveRequestsRef,
      where("status", "==", "approved"),
      // Additional filtering will be done client-side
    )

    const querySnapshot = await getDocs(q)
    const leaveRequests = querySnapshot.docs.map((doc) => doc.data() as LeaveRequest)

    // Filter by date range client-side
    return leaveRequests.filter((leave) => {
      const leaveStart = new Date(leave.startDate)
      const leaveEnd = new Date(leave.endDate)

      return (
        (leaveStart >= startDate && leaveStart <= endDate) ||
        (leaveEnd >= startDate && leaveEnd <= endDate) ||
        (leaveStart <= startDate && leaveEnd >= endDate)
      )
    })
  } catch (error) {
    console.error("Error getting leave requests for calendar:", error)
    throw error
  }
}
