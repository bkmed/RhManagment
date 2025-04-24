"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native"
import {
  getAllInvoices,
  getInvoicesByEmployeeId,
  updateInvoiceStatus,
  type Invoice,
  type InvoiceStatus,
} from "../invoice-service"
import { Card } from "../../../core/src/components/ui/card"
import { Badge } from "../../../core/src/components/ui/badge"
import { Button } from "../../../core/src/components/ui/button"
import { isAdmin, isAdvisor, type AuthUser } from "../../../auth/src/auth-service"

interface InvoiceListProps {
  currentUser: AuthUser
  employeeId?: string // Optional: if provided, only show invoices for this employee
  onViewInvoice: (invoiceId: string) => void
}

export const InvoiceList = ({ currentUser, employeeId, onViewInvoice }: InvoiceListProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        setError(null)

        let fetchedInvoices: Invoice[]

        // If admin/advisor, fetch all invoices unless employeeId is specified
        if ((isAdmin(currentUser) || isAdvisor(currentUser)) && !employeeId) {
          fetchedInvoices = await getAllInvoices()
        } else {
          // For employees or when employeeId is specified
          const targetEmployeeId = employeeId || currentUser.uid
          fetchedInvoices = await getInvoicesByEmployeeId(targetEmployeeId)
        }

        setInvoices(fetchedInvoices)
      } catch (err: any) {
        setError(err.message || "Failed to load invoices")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [currentUser, employeeId])

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      await updateInvoiceStatus(invoiceId, newStatus)

      // Update local state
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice)),
      )
    } catch (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  const getStatusBadgeVariant = (status: InvoiceStatus): "primary" | "success" | "warning" | "danger" | "secondary" => {
    switch (status) {
      case "draft":
        return "secondary"
      case "sent":
        return "primary"
      case "paid":
        return "success"
      case "overdue":
        return "danger"
      case "cancelled":
        return "warning"
      default:
        return "secondary"
    }
  }

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <Pressable onPress={() => onViewInvoice(item.id)}>
      <Card style={styles.invoiceItem}>
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Badge text={item.status} variant={getStatusBadgeVariant(item.status)} />
        </View>

        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceDetail}>
            <Text style={styles.detailLabel}>Issue Date:</Text>
            <Text style={styles.detailValue}>{item.issueDate}</Text>
          </View>

          <View style={styles.invoiceDetail}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>{item.dueDate}</Text>
          </View>

          <View style={styles.invoiceDetail}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.totalValue}>{item.total.toFixed(2)}</Text>
          </View>
        </View>

        {(isAdmin(currentUser) || isAdvisor(currentUser)) && (
          <View style={styles.actionButtons}>
            {item.status === "draft" && (
              <Button
                title="Mark as Sent"
                variant="outline"
                onPress={() => handleStatusChange(item.id, "sent")}
                style={styles.actionButton}
              />
            )}

            {item.status === "sent" && (
              <>
                <Button
                  title="Mark as Paid"
                  variant="outline"
                  onPress={() => handleStatusChange(item.id, "paid")}
                  style={styles.actionButton}
                />
                <Button
                  title="Mark as Overdue"
                  variant="outline"
                  onPress={() => handleStatusChange(item.id, "overdue")}
                  style={styles.actionButton}
                />
              </>
            )}

            {(item.status === "draft" || item.status === "sent") && (
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => handleStatusChange(item.id, "cancelled")}
                style={styles.actionButton}
              />
            )}
          </View>
        )}
      </Card>
    </Pressable>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading invoices...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    )
  }

  if (invoices.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No invoices found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoices</Text>
      <FlatList data={invoices} renderItem={renderInvoiceItem} keyExtractor={(item) => item.id} style={styles.list} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3748",
  },
  list: {
    flex: 1,
  },
  invoiceItem: {
    marginBottom: 16,
    padding: 16,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
  },
  invoiceDetails: {
    marginBottom: 16,
  },
  invoiceDetail: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: "#718096",
  },
  detailValue: {
    fontSize: 14,
    color: "#2d3748",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    color: "#718096",
    marginTop: 24,
  },
  errorMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#e53e3e",
    marginTop: 24,
  },
})
