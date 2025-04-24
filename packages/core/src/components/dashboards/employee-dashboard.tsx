"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Calendar, DollarSign, Clock, Bell } from "lucide-react-native"
import { getEmployeeByUserId } from "../../../../employees/src/employee-service"
import { getLeaveRequestsByEmployeeId } from "../../../../leave/src/leave-service"
import { getPayslipsByEmployeeId } from "../../../../payroll/src/payslip-service"
import { getUnreadNotificationCount } from "../../../../notifications/src/notification-service"
import type { Employee } from "../../../../employees/src/employee-service"
import type { LeaveRequest } from "../../../../leave/src/leave-service"
import type { Payslip } from "../../../../payroll/src/payslip-service"

interface EmployeeDashboardProps {
  onNavigate: (screen: string, params?: any) => void
}

export const EmployeeDashboard = ({ onNavigate }: EmployeeDashboardProps) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch employee data
        const employeeData = await getEmployeeByUserId(user.uid)
        setEmployee(employeeData)

        if (employeeData) {
          // Fetch leave requests
          const leaveData = await getLeaveRequestsByEmployeeId(user.uid)
          setLeaveRequests(leaveData)

          // Fetch payslips
          const payslipData = await getPayslipsByEmployeeId(user.uid)
          setPayslips(payslipData)
        }

        // Fetch notification count
        const notifCount = await getUnreadNotificationCount(user.uid)
        setNotificationCount(notifCount)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const renderWelcomeCard = () => {
    return (
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          Welcome, {employee ? `${employee.firstName} ${employee.lastName}` : user?.displayName || "Employee"}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          {employee?.position || "Employee"} • {employee?.department || "Department"}
        </Text>
      </Card>
    )
  }

  const renderQuickActions = () => {
    return (
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <Button
            title="Request Leave"
            leftIcon={<Calendar size={16} color="#fff" />}
            onPress={() => onNavigate("Leave")}
            style={styles.actionButton}
          />
          <Button
            title="View Payslips"
            leftIcon={<DollarSign size={16} color="#fff" />}
            onPress={() => onNavigate("Payroll")}
            style={styles.actionButton}
          />
          <Button
            title="View Calendar"
            leftIcon={<Clock size={16} color="#fff" />}
            onPress={() => onNavigate("Calendar")}
            style={styles.actionButton}
          />
          <Button
            title={`Notifications ${notificationCount > 0 ? `(${notificationCount})` : ""}`}
            leftIcon={<Bell size={16} color="#fff" />}
            onPress={() => onNavigate("Notifications")}
            style={styles.actionButton}
          />
        </View>
      </Card>
    )
  }

  const renderLeaveRequests = () => {
    const pendingLeaves = leaveRequests.filter((leave) => leave.status === "pending")

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Leave Requests</Text>
          <Button title="View All" variant="outline" onPress={() => onNavigate("Leave")} style={styles.viewAllButton} />
        </View>

        {pendingLeaves.length === 0 ? (
          <Text style={styles.emptyText}>No pending leave requests</Text>
        ) : (
          pendingLeaves.slice(0, 3).map((leave) => (
            <View key={leave.id} style={styles.leaveItem}>
              <View style={styles.leaveInfo}>
                <Text style={styles.leaveType}>{leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave</Text>
                <Text style={styles.leaveDates}>
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.leaveStatus}>
                <Text style={styles.pendingStatus}>Pending</Text>
              </View>
            </View>
          ))
        )}
      </Card>
    )
  }

  const renderRecentPayslips = () => {
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Payslips</Text>
          <Button
            title="View All"
            variant="outline"
            onPress={() => onNavigate("Payroll")}
            style={styles.viewAllButton}
          />
        </View>

        {payslips.length === 0 ? (
          <Text style={styles.emptyText}>No payslips available</Text>
        ) : (
          payslips.slice(0, 3).map((payslip) => (
            <View key={payslip.id} style={styles.payslipItem}>
              <View style={styles.payslipInfo}>
                <Text style={styles.payslipPeriod}>
                  {payslip.period.month}/{payslip.period.year}
                </Text>
                <Text style={styles.payslipDate}>Issued: {new Date(payslip.issueDate).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.payslipAmount}>{payslip.netSalary.toFixed(2)} €</Text>
            </View>
          ))
        )}
      </Card>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading dashboard...</Text>
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

  return (
    <ScrollView style={styles.container}>
      {renderWelcomeCard()}
      {renderQuickActions()}
      <View style={styles.row}>
        <View style={styles.column}>{renderLeaveRequests()}</View>
        <View style={styles.column}>{renderRecentPayslips()}</View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7fafc",
  },
  welcomeCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: "#0070f3",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
  },
  viewAllButton: {
    height: 32,
    paddingHorizontal: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginHorizontal: -4,
  },
  actionButton: {
    margin: 4,
    flex: 1,
    minWidth: "45%",
  },
  row: {
    flexDirection: "row",
    marginHorizontal: -8,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
  },
  leaveItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  leaveInfo: {
    flex: 1,
  },
  leaveType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
  },
  leaveDates: {
    fontSize: 14,
    color: "#718096",
  },
  leaveStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#feebc8",
  },
  pendingStatus: {
    fontSize: 12,
    fontWeight: "500",
    color: "#c05621",
  },
  payslipItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  payslipInfo: {
    flex: 1,
  },
  payslipPeriod: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
  },
  payslipDate: {
    fontSize: 14,
    color: "#718096",
  },
  payslipAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
  },
  emptyText: {
    textAlign: "center",
    color: "#a0aec0",
    padding: 16,
  },
  errorText: {
    color: "#e53e3e",
    textAlign: "center",
  },
})
