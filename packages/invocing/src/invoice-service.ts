import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
  } from "firebase/firestore"
  
  // Initialize Firestore
  const db = getFirestore()
  
  export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"
  
  export interface InvoiceItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }
  
  export interface Invoice {
    id: string
    invoiceNumber: string
    employeeId: string
    status: InvoiceStatus
    issueDate: string
    dueDate: string
    items: InvoiceItem[]
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
    notes?: string
    createdAt: string
    updatedAt: string
  }
  
  // Generate invoice number
  const generateInvoiceNumber = async (): Promise<string> => {
    const year = new Date().getFullYear().toString().slice(-2)
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0")
  
    // Get count of invoices for this month
    const invoicesRef = collection(db, "invoices")
    const q = query(
      invoicesRef,
      where("invoiceNumber", ">=", `INV-${year}${month}-`),
      where("invoiceNumber", "<", `INV-${year}${month + 1}-`),
    )
  
    const querySnapshot = await getDocs(q)
    const count = querySnapshot.size + 1
  
    return `INV-${year}${month}-${count.toString().padStart(4, "0")}`
  }
  
  // Calculate invoice totals
  const calculateInvoiceTotals = (items: InvoiceItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount
  
    return { subtotal, taxAmount, total }
  }
  
  // Create a new invoice
  export const createInvoice = async (
    employeeId: string,
    items: Omit<InvoiceItem, "id">[],
    taxRate: number,
    dueDate: string,
    notes?: string,
  ): Promise<Invoice> => {
    try {
      const invoicesRef = collection(db, "invoices")
      const invoiceNumber = await generateInvoiceNumber()
      const now = new Date().toISOString()
  
      // Add IDs to items and calculate amounts
      const invoiceItems: InvoiceItem[] = items.map((item, index) => ({
        ...item,
        id: `item-${index + 1}`,
        amount: item.quantity * item.unitPrice,
      }))
  
      const { subtotal, taxAmount, total } = calculateInvoiceTotals(invoiceItems, taxRate)
  
      const newInvoice: Omit<Invoice, "id"> = {
        invoiceNumber,
        employeeId,
        status: "draft",
        issueDate: now.split("T")[0],
        dueDate,
        items: invoiceItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes,
        createdAt: now,
        updatedAt: now,
      }
  
      const docRef = await addDoc(invoicesRef, newInvoice)
  
      return {
        id: docRef.id,
        ...newInvoice,
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
      throw error
    }
  }
  
  // Get invoice by ID
  export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
    try {
      const invoiceRef = doc(db, "invoices", id)
      const invoiceSnap = await getDoc(invoiceRef)
  
      if (invoiceSnap.exists()) {
        return { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice
      }
  
      return null
    } catch (error) {
      console.error("Error getting invoice:", error)
      throw error
    }
  }
  
  // Get invoices by employee ID
  export const getInvoicesByEmployeeId = async (employeeId: string): Promise<Invoice[]> => {
    try {
      const invoicesRef = collection(db, "invoices")
      const q = query(invoicesRef, where("employeeId", "==", employeeId), orderBy("createdAt", "desc"))
  
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Invoice)
    } catch (error) {
      console.error("Error getting invoices by employee ID:", error)
      throw error
    }
  }
  
  // Get all invoices
  export const getAllInvoices = async (): Promise<Invoice[]> => {
    try {
      const invoicesRef = collection(db, "invoices")
      const q = query(invoicesRef, orderBy("createdAt", "desc"))
  
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Invoice)
    } catch (error) {
      console.error("Error getting all invoices:", error)
      throw error
    }
  }
  
  // Update invoice status
  export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<void> => {
    try {
      const invoiceRef = doc(db, "invoices", id)
      await updateDoc(invoiceRef, {
        status,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating invoice status:", error)
      throw error
    }
  }
  
  // Update invoice
  export const updateInvoice = async (
    id: string,
    updates: Partial<Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">>,
  ): Promise<Invoice> => {
    try {
      const invoiceRef = doc(db, "invoices", id)
      const invoice = await getInvoiceById(id)
  
      if (!invoice) {
        throw new Error("Invoice not found")
      }
  
      let updatedInvoice = { ...invoice, ...updates }
  
      // Recalculate totals if items or tax rate changed
      if (updates.items || updates.taxRate !== undefined) {
        const items = updates.items || invoice.items
        const taxRate = updates.taxRate !== undefined ? updates.taxRate : invoice.taxRate
  
        const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate)
  
        updatedInvoice = {
          ...updatedInvoice,
          subtotal,
          taxAmount,
          total,
        }
      }
  
      await updateDoc(invoiceRef, {
        ...updatedInvoice,
        updatedAt: new Date().toISOString(),
      })
  
      return updatedInvoice
    } catch (error) {
      console.error("Error updating invoice:", error)
      throw error
    }
  }
  