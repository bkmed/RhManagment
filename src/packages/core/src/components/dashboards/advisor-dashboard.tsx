"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Users, FileText, Calendar, AlertCircle } from "lucide-react-native"
import { getAllEmployees } from "../../../../employees/src/employee-service"
import { getPendingLeaveRequests } from "../../../../leave/src/leave-service"
import { getAllActiveIllnessRecords } from "../../../../illness/src/illness-service"
import type { Employee } from "../../../../employees/src/employee-service"
import type { LeaveRequest } from "../../../../leave/src/leave-service"
import type { IllnessRecord } from "../../../../illness/src/illness-service"

interface AdvisorDashboardProps {
  onNavigate: (screen: string, params?: any) => void
}

export const AdvisorDashboard = ({ onNavigate }: AdvisorDashboardProps) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [illnessRecords, setIllnessRecords] = useState<IllnessRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [fetchedEmployees, fetchedLeaveRequests, fetchedIllnessRecords] = await Promise.all([
          getAllEmployees(),
          getPendingLeaveRequests(),
          getAllActiveIllnessRecords(),
        ])

        setEmployees(fetchedEmployees)
        setLeaveRequests(fetchedLeaveRequests)
        setIllnessRecords(fetchedIllnessRecords)
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
        <Text style={styles.welcomeTitle}>Welcome, {user?.displayName || "Advisor"}</Text>
        <Text style={styles.welcomeSubtitle}>HR Advisor Dashboard</Text>
      </Card>
    )
  }

  const renderStatCards = () => {
    const stats = [
      {
        title: "Employees",
        value: employees.length,
        icon: <Users size={24} color="#4299e1" />,
        color: "#ebf8ff",
        onPress: () => onNavigate("Employees"),
      },
      {
        title: "Pending Leaves",
        value: leaveRequests.length,
        icon: <FileText size={24} color="#ed8936" />,
        color: "#fffaf0",
        onPress: () => onNavigate("LeaveApprovals"),
      },
      {
        title: "Active Illnesses",
        value: illnessRecords.length,
        icon: <AlertCircle size={24} color="#e53e3e" />,
        color: "#fed7d7",
        onPress: () => onNavigate("IllnessManagement"),
      },
      {
        title: "Calendar",
        value: "View",
        icon: <Calendar size={24} color="#38a169" />,
        color: "#f0fff4",
        onPress: () => onNavigate("Calendar"),
      },
    ]

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <Card key={`stat-${index}`} style={[styles.statCard, { backgroundColor: stat.color }]} onPress={stat.onPress}>
            <View style={styles.statIconContainer}>{stat.icon}</View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </Card>
        ))}
      </View>
    )
  }

  const renderPendingLeaveRequests = () => {
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Pending Leave Requests</Text>
          <Button
            title="View All"
            variant="outline"
            onPress={() => onNavigate("LeaveApprovals")}
            style={styles.viewAllButton}
          />
        </View>

        {leaveRequests.length === 0 ? (
          <Text style={styles.emptyText}>No pending leave requests</Text>
        ) : (
          leaveRequests.slice(0, 5).map((leave) => {
            const employee = employees.find((e) => e.userId === leave.employeeId)

            return (
              <View key={leave.id} style={styles.leaveItem}>
                <View style={styles.leaveInfo}>
                  <Text style={styles.employeeName}>
                    {employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}
                  </Text>
                  <Text style={styles.leaveType}>{leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave</Text>
                  <Text style={styles.leaveDates}>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.leaveActions}>
                  <Button
                    title="Review"
                    variant="outline"
                    onPress={() => onNavigate("LeaveDetail", { leaveId: leave.id })}
                    style={styles.reviewButton}
                  />
                </View>
              </View>
            )
          })
        )}
      </Card>
    )
  }

  const renderActiveIllnesses = () => {
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Active Illnesses</Text>
          <Button
            title="View All"
            variant="outline"
            onPress={() => onNavigate("IllnessManagement")}
            style={styles.viewAllButton}
          />
        </View>

        {illnessRecords.length === 0 ? (
          <Text style={styles.emptyText}>No active illness records</Text>
        ) : (
          illnessRecords.slice(0, 5).map((illness) => {
            const employee = employees.find((e) => e.userId === illness.employeeId)

            return (
              <View key={illness.id} style={styles.illnessItem}>
                <View style={styles.illnessInfo}>
                  <Text style={styles.employeeName}>
                    {employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}
                  </Text>
                  <Text style={styles.illnessType}>
                    {illness.type.replace("_", " ").charAt(0).toUpperCase() + illness.type.replace("_", " ").slice(1)}
                  </Text>
                  <Text style={styles.illnessDates}>Since {new Date(illness.startDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.illnessActions}>
                  <Button
                    title="View"
                    variant="outline"
                    onPress={() => onNavigate("IllnessDetail", { illnessId: illness.id })}
                    style={styles.reviewButton}
                  />
                </View>
              </View>
            )
          })
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
      {renderStatCards()}
      {renderPendingLeaveRequests()}
      {renderActiveIllnesses()}
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
    backgroundColor: "#ed8936",
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
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginBottom: 16,
  },
  statCard: {
    width: "calc(50% - 16px)",
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748",
  },
  statTitle: {
    fontSize: 14,
    color: "#4a5568",
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
  employeeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
  },
  leaveType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4a5568",
  },
  leaveDates: {
    fontSize: 14,
    color: "#718096",
  },
  leaveActions: {
    marginLeft: 8,
  },
  reviewButton: {
    minWidth: 80,
  },
  illnessItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  illnessInfo: {
    flex: 1,
  },
  illnessType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e53e3e",
  },
  illnessDates: {
    fontSize: 14,
    color: "#718096",
  },
  illnessActions: {
    marginLeft: 8,
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
