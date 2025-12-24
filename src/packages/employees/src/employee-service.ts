import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, getFirestore } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Initialize Firestore
const db = getFirestore()
const storage = getStorage()

export interface Employee {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  position: string
  department: string
  hireDate: string
  phone?: string
  address?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  profilePicture?: string
  documents?: {
    id: string
    name: string
    url: string
    uploadDate: string
    type: string
  }[]
}

export const createEmployee = async (employeeData: Omit<Employee, "id">): Promise<Employee> => {
  try {
    const employeesRef = collection(db, "employees")
    const newEmployeeRef = doc(employeesRef)

    const newEmployee: Employee = {
      ...employeeData,
      id: newEmployeeRef.id,
    }

    await setDoc(newEmployeeRef, newEmployee)
    return newEmployee
  } catch (error) {
    console.error("Error creating employee:", error)
    throw error
  }
}

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const employeeRef = doc(db, "employees", id)
    const employeeSnap = await getDoc(employeeRef)

    if (employeeSnap.exists()) {
      return employeeSnap.data() as Employee
    }

    return null
  } catch (error) {
    console.error("Error getting employee:", error)
    throw error
  }
}

export const getEmployeeByUserId = async (userId: string): Promise<Employee | null> => {
  try {
    const employeesRef = collection(db, "employees")
    const q = query(employeesRef, where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Employee
    }

    return null
  } catch (error) {
    console.error("Error getting employee by user ID:", error)
    throw error
  }
}

export const updateEmployee = async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
  try {
    const employeeRef = doc(db, "employees", id)
    await updateDoc(employeeRef, employeeData)

    const updatedEmployee = await getEmployeeById(id)
    if (!updatedEmployee) {
      throw new Error("Employee not found after update")
    }

    return updatedEmployee
  } catch (error) {
    console.error("Error updating employee:", error)
    throw error
  }
}

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const employeesRef = collection(db, "employees")
    const querySnapshot = await getDocs(employeesRef)

    return querySnapshot.docs.map((doc) => doc.data() as Employee)
  } catch (error) {
    console.error("Error getting all employees:", error)
    throw error
  }
}

export const uploadEmployeeDocument = async (
  employeeId: string,
  file: File | Blob,
  fileName: string,
  fileType: string,
): Promise<string> => {
  try {
    const storageRef = ref(storage, `employees/${employeeId}/documents/${fileName}`)
    await uploadBytes(storageRef, file)

    const downloadURL = await getDownloadURL(storageRef)

    // Update employee document record
    const employee = await getEmployeeById(employeeId)
    if (employee) {
      const documents = employee.documents || []
      const newDocument = {
        id: Date.now().toString(),
        name: fileName,
        url: downloadURL,
        uploadDate: new Date().toISOString(),
        type: fileType,
      }

      await updateEmployee(employeeId, {
        documents: [...documents, newDocument],
      })
    }

    return downloadURL
  } catch (error) {
    console.error("Error uploading document:", error)
    throw error
  }
}
