import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  getFirestore,
  updateDoc,
} from "firebase/firestore"

// Initialize Firestore
const db = getFirestore()

export type NotificationType =
  | "leave_request"
  | "leave_approved"
  | "leave_rejected"
  | "payslip_available"
  | "document_uploaded"
  | "role_changed"
  | "system"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, any>
}

export const createNotification = async (
  notificationData: Omit<Notification, "id" | "read" | "createdAt">,
): Promise<Notification> => {
  try {
    const notificationsRef = collection(db, "notifications")
    const newNotificationRef = doc(notificationsRef)

    const newNotification: Notification = {
      ...notificationData,
      id: newNotificationRef.id,
      read: false,
      createdAt: new Date().toISOString(),
    }

    await setDoc(newNotificationRef, newNotification)
    return newNotification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export const getNotificationById = async (id: string): Promise<Notification | null> => {
  try {
    const notificationRef = doc(db, "notifications", id)
    const notificationSnap = await getDoc(notificationRef)

    if (notificationSnap.exists()) {
      return notificationSnap.data() as Notification
    }

    return null
  } catch (error) {
    console.error("Error getting notification:", error)
    throw error
  }
}

export const getUserNotifications = async (
  userId: string,
  onlyUnread = false,
  limitCount = 50,
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, "notifications")
    let q = query(notificationsRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(limitCount))

    if (onlyUnread) {
      q = query(q, where("read", "==", false))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Notification)
  } catch (error) {
    console.error("Error getting user notifications:", error)
    throw error
  }
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", id)
    await updateDoc(notificationRef, { read: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(notificationsRef, where("userId", "==", userId), where("read", "==", false))

    const querySnapshot = await getDocs(q)

    // Create a batch of updates
    const batch = getFirestore().batch()

    querySnapshot.docs.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, { read: true })
    })

    await batch.commit()
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

export const deleteNotification = async (id: string): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", id)
    await updateDoc(notificationRef, { deleted: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

// Helper functions for common notification types
export const sendLeaveRequestNotification = async (
  adminIds: string[],
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  leaveRequestId: string,
): Promise<void> => {
  try {
    for (const adminId of adminIds) {
      await createNotification({
        userId: adminId,
        type: "leave_request",
        title: "New Leave Request",
        message: `${employeeName} has requested ${leaveType} leave from ${startDate} to ${endDate}`,
        data: { leaveRequestId },
      })
    }
  } catch (error) {
    console.error("Error sending leave request notification:", error)
    throw error
  }
}

export const sendLeaveStatusNotification = async (
  employeeId: string,
  status: "approved" | "rejected",
  leaveType: string,
  startDate: string,
  endDate: string,
  reason?: string,
): Promise<void> => {
  try {
    await createNotification({
      userId: employeeId,
      type: status === "approved" ? "leave_approved" : "leave_rejected",
      title: `Leave Request ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your ${leaveType} leave request from ${startDate} to ${endDate} has been ${status}${
        reason ? `. Reason: ${reason}` : ""
      }`,
      data: { status, leaveType, startDate, endDate },
    })
  } catch (error) {
    console.error("Error sending leave status notification:", error)
    throw error
  }
}

export const sendPayslipNotification = async (
  employeeId: string,
  month: number,
  year: number,
  payslipId: string,
): Promise<void> => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  try {
    await createNotification({
      userId: employeeId,
      type: "payslip_available",
      title: "New Payslip Available",
      message: `Your payslip for ${monthNames[month - 1]} ${year} is now available`,
      data: { payslipId, month, year },
    })
  } catch (error) {
    console.error("Error sending payslip notification:", error)
    throw error
  }
}

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(notificationsRef, where("userId", "==", userId), where("read", "==", false))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.length
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    throw error
  }
}
