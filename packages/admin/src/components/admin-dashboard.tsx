"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { Avatar } from "../../../core/src/components/ui/avatar"
import { Badge } from "../../../core/src/components/ui/badge"
import {
  Users,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  ChevronRight,
  UserPlus,
  Clock,
  Settings,
} from "lucide-react-native"
import { getAllEmployees } from "../../../employees/src/employee-service"
import { getPendingLeaveRequests } from "../../../leave/src/leave-service"
import { getAllPayslips } from "../../../payroll/src/payslip-service"
import { getUnreadNotificationCount } from "../../../notifications/src/notification-service"
import type { AuthUser } from "../../../auth/src/auth-service"
import type { Employee } from "../../../employees/src/employee-service"
import type { LeaveRequest } from "../../../leave/src/leave-service"
import type { Payslip } from "../../../payroll/src/payslip-service"

interface AdminDashboardProps {
  user: AuthUser
  onNavigate: (screen: string, params?: any) => void
}

export const AdminDashboard = ({ user, onNavigate }: AdminDashboardProps) => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<LeaveRequest[]>([])
  const [recentPayslips, setRecentPayslips] = useState<Payslip[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [fetchedEmployees, fetchedLeaveRequests, fetchedPayslips, fetchedNotificationCount] = await Promise.all([
          getAllEmployees(),
          getPendingLeaveRequests(),
          getAllPayslips(),
          getUnreadNotificationCount(user.uid),
        ])

        setEmployees(fetchedEmployees)
        setPendingLeaveRequests(fetchedLeaveRequests)

        // Sort payslips by date and take the 5 most recent
        const sortedPayslips = fetchedPayslips
          .sort((a, b) => {
            return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
          })
          .slice(0, 5)

        setRecentPayslips(sortedPayslips)
        setNotificationCount(fetchedNotificationCount)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user.uid])

  const renderStatCards = () => {
    const stats = [
      {
        title: "Total Employees",
        value: employees.length,
        icon: <Users size={24} color="#4299e1" />,
        color: "#ebf8ff",
        onPress: () => onNavigate("Employees"),
      },
      {
        title: "Pending Leaves",
        value: pendingLeaveRequests.length,
        icon: <FileText size={24} color="#ed8936" />,
        color: "#fffaf0",
        onPress: () => onNavigate("LeaveApprovals"),
      },
      {
        title: "Payslips Issued",
        value: recentPayslips.length,
        icon: <DollarSign size={24} color="#48bb78" />,
        color: "#f0fff4",
        onPress: () => onNavigate("Payroll"),
      },
      {
        title: "Notifications",
        value: notificationCount,
        icon: <AlertCircle size={24} color="#9f7aea" />,
        color: "#f8f4ff",
        onPress: () => onNavigate("Notifications"),
      },
    ]

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={`stat-${index}`}
            style={[styles.statCard, { backgroundColor: stat.color }]}
            onPress={stat.onPress}
          >
            <View style={styles.statIconContainer}>{stat.icon}</View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  const renderRecentEmployees = () => {
    // Take the 5 most recent employees
    const recentEmployees = [...employees]
      .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
      .slice(0, 5)

    return (
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Employees</Text>
          <Button
            title="View All"
            variant="outline"
            onPress={() => onNavigate("Employees")}
            style={styles.viewAllButton}
          />
        </View>

        {recentEmployees.length === 0 ? (
          <Text style={styles.emptyText}>No employees found</Text>
        ) : (
          recentEmployees.map((employee) => (
            <TouchableOpacity
              key={employee.id}
              style={styles.employeeItem}
              onPress={() => onNavigate("EmployeeDetails", { employeeId: employee.id })}
            >
              <Avatar
                initials={`${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`}
                src={employee.profilePicture}
                size="md"
              />
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{`${employee.firstName} ${employee.lastName}`}</Text>
                <Text style={styles.employeePosition}>{employee.position}</Text>
              </View>
              <ChevronRight size={20} color="#a0aec0" />
            </TouchableOpacity>
          ))
        )}
      </Card>
    )
  }

  const renderPendingLeaveRequests = () => {
    return (
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Leave Requests</Text>
          <Button
            title="View All"
            variant="outline"
            onPress={() => onNavigate("LeaveApprovals")}
            style={styles.viewAllButton}
          />
        </View>

        {pendingLeaveRequests.length === 0 ? (
          <Text style={styles.emptyText}>No pending leave requests</Text>
        ) : (
          pendingLeaveRequests.slice(0, 5).map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.leaveRequestItem}
              onPress={() => onNavigate("LeaveDetails", { requestId: request.id })}
            >
              <View style={styles.leaveRequestInfo}>
                <Text style={styles.leaveRequestType}>
                  {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                </Text>
                <Text style={styles.leaveRequestDates}>
                  {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                </Text>
              </View>
              <Badge text="Pending" variant="warning" />
            </TouchableOpacity>
          ))
        )}
      </Card>
    )
  }

  const renderQuickActions = () => {
    const actions = [
      {
        title: "Add Employee",
        icon: <UserPlus size={24} color="#4299e1" />,
        onPress: () => onNavigate("AddEmployee"),
      },
      {
        title: "Approve Leaves",
        icon: <FileText size={24} color="#ed8936" />,
        onPress: () => onNavigate("LeaveApprovals"),
      },
      {
        title: "Create Payslip",
        icon: <DollarSign size={24} color="#48bb78" />,
        onPress: () => onNavigate("CreatePayslip"),
      },
      {
        title: "View Calendar",
        icon: <Calendar size={24} color="#9f7aea" />,
        onPress: () => onNavigate("Calendar"),
      },
      {
        title: "Manage Leave",
        icon: <FileText size={24} color="#ed8936" />,
        onPress: () => onNavigate("ManageLeave"),
      },
      {
        title: "Manage Illness",
        icon: <AlertCircle size={24} color="#e53e3e" />,
        onPress: () => onNavigate("ManageIllness"),
      },
      {
        title: "Manage Payroll",
        icon: <DollarSign size={24} color="#48bb78" />,
        onPress: () => onNavigate("ManagePayroll"),
      },
      {
        title: "System Settings",
        icon: <Settings size={24} color="#718096" />,
        onPress: () => onNavigate("Settings"),
      },
    ]

    return (
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity key={`action-${index}`} style={styles.quickActionButton} onPress={action.onPress}>
              <View style={styles.quickActionIcon}>{action.icon}</View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    )
  }

  const renderRecentActivity = () => {
    // Combine recent activities from different sources
    const activities = [
      ...pendingLeaveRequests.map((request) => ({
        id: `leave-${request.id}`,
        type: "leave_request",
        title: `New ${request.type} leave request`,
        timestamp: request.createdAt,
        data: request,
      })),
      ...recentPayslips.map((payslip) => ({
        id: `payslip-${payslip.id}`,
        type: "payslip_created",
        title: `Payslip created for ${payslip.period.month}/${payslip.period.year}`,
        timestamp: payslip.issueDate,
        data: payslip,
      })),
    ]

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return (
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {activities.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity</Text>
        ) : (
          activities.slice(0, 5).map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                {activity.type === "leave_request" ? (
                  <FileText size={20} color="#ed8936" />
                ) : (
                  <DollarSign size={20} color="#48bb78" />
                )}
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <View style={styles.activityMeta}>
                  <Clock size={12} color="#a0aec0" />
                  <Text style={styles.activityTime}>{new Date(activity.timestamp).toLocaleString()}</Text>
                </View>
              </View>
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
      <Text style={styles.welcomeText}>Welcome, {user.displayName || "Admin"}</Text>
      <Text style={styles.dashboardTitle}>Dashboard Overview</Text>

      {renderStatCards()}
      {renderQuickActions()}

      <View style={styles.twoColumnContainer}>
        <View style={styles.column}>{renderPendingLeaveRequests()}</View>
        <View style={styles.column}>{renderRecentEmployees()}</View>
      </View>

      {renderRecentActivity()}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7fafc",
  },
  welcomeText: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 8,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#2d3748",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginRight: "4%",
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#2d3748",
  },
  statTitle: {
    fontSize: 14,
    color: "#718096",
  },
  sectionCard: {
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
  },
  viewAllButton: {
    height: 32,
    paddingHorizontal: 12,
  },
  employeeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  employeeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
  },
  employeePosition: {
    fontSize: 14,
    color: "#718096",
  },
  leaveRequestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  leaveRequestInfo: {
    flex: 1,
  },
  leaveRequestType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
  },
  leaveRequestDates: {
    fontSize: 14,
    color: "#718096",
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  quickActionButton: {
    width: "23%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginRight: "2%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3748",
    textAlign: "center",
  },
  twoColumnContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  column: {
    flex: 1,
    marginRight: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f7fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3748",
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityTime: {
    fontSize: 12,
    color: "#a0aec0",
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#a0aec0",
    textAlign: "center",
    paddingVertical: 16,
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 16,
    textAlign: "center",
  },
})
