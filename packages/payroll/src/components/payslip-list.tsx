"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Platform } from "react-native"
import { getPayslipsByEmployeeId, getAllPayslips, type Payslip, markPayslipAsViewed } from "../payslip-service"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { FileText, EyeOff } from "lucide-react-native"
import type { AuthUser } from "../../../auth/src/auth-service"
import { hasPermission } from "../../../core/src/types/roles"

interface PayslipListProps {
  user: AuthUser
  employeeId?: string // Optional: if not provided, will use the current user's employee ID
  onViewPayslip: (payslip: Payslip) => void
}

export const PayslipList = ({ user, employeeId, onViewPayslip }: PayslipListProps) => {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canViewAllPayslips =
    hasPermission(user.role, "canViewPayslips") && hasPermission(user.role, "canViewAllEmployees")

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setLoading(true)
        let fetchedPayslips: Payslip[]

        if (canViewAllPayslips) {
          fetchedPayslips = await getAllPayslips("published")
        } else {
          // If employeeId is not provided, we assume it's for the current user
          const targetEmployeeId = employeeId || user.uid
          fetchedPayslips = await getPayslipsByEmployeeId(targetEmployeeId)
        }

        setPayslips(fetchedPayslips)
      } catch (err: any) {
        setError(err.message || "Failed to load payslips")
      } finally {
        setLoading(false)
      }
    }

    fetchPayslips()
  }, [employeeId, user.uid, canViewAllPayslips])

  const handleViewPayslip = async (payslip: Payslip) => {
    // Mark as viewed if it's the employee viewing their own payslip
    if (!payslip.viewedByEmployee && employeeId === user.uid) {
      try {
        await markPayslipAsViewed(payslip.id)
        // Update local state to reflect the change
        setPayslips((prevPayslips) =>
          prevPayslips.map((p) => (p.id === payslip.id ? { ...p, viewedByEmployee: true } : p)),
        )
      } catch (err) {
        console.error("Failed to mark payslip as viewed:", err)
      }
    }

    onViewPayslip(payslip)
  }

  const getMonthName = (month: number): string => {
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
    return monthNames[month - 1] || ""
  }

  const renderPayslipItem = ({ item }: { item: Payslip }) => (
    <Card style={styles.payslipCard}>
      <View style={styles.payslipHeader}>
        <View style={styles.payslipIcon}>
          <FileText size={24} color="#4a5568" />
        </View>
        <View style={styles.payslipInfo}>
          <Text style={styles.payslipPeriod}>
            {getMonthName(item.period.month)} {item.period.year}
          </Text>
          <Text style={styles.payslipDate}>Issued: {new Date(item.issueDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.payslipAmount}>
          <Text style={styles.payslipNetSalary}>{item.netSalary.toFixed(2)} €</Text>
        </View>
      </View>

      <View style={styles.payslipActions}>
        <Button title="View" variant="outline" onPress={() => handleViewPayslip(item)} style={styles.actionButton} />
        {item.pdfUrl && (
          <Button
            title="Download"
            variant="outline"
            onPress={() => {
              if (Platform.OS === "web") {
                window.open(item.pdfUrl, "_blank")
              }
            }}
            style={styles.actionButton}
          />
        )}
        {!item.viewedByEmployee && (
          <View style={styles.unreadBadge}>
            <EyeOff size={16} color="#fff" />
            <Text style={styles.unreadText}>New</Text>
          </View>
        )}
      </View>
    </Card>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading payslips...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (payslips.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPayslipsText}>No payslips available</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payslips</Text>
      <FlatList
        data={payslips}
        renderItem={renderPayslipItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingBottom: 16,
  },
  payslipCard: {
    marginBottom: 12,
    padding: 16,
  },
  payslipHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  payslipIcon: {
    marginRight: 12,
  },
  payslipInfo: {
    flex: 1,
  },
  payslipPeriod: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
  },
  payslipDate: {
    fontSize: 14,
    color: "#718096",
    marginTop: 2,
  },
  payslipAmount: {
    alignItems: "flex-end",
  },
  payslipNetSalary: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
  },
  payslipActions: {
    flexDirection: "row",
    marginTop: 12,
    position: "relative",
  },
  actionButton: {
    marginRight: 8,
  },
  unreadBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#0070f3",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 16,
    textAlign: "center",
  },
  noPayslipsText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
})
