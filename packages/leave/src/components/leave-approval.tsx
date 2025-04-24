"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList } from "react-native"
import { getPendingLeaveRequests, updateLeaveRequestStatus, type LeaveRequest } from "../leave-service"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Badge } from "../../../core/src/components/ui/badge"
import { sendNotificationToUsers } from "../../../notifications/src/notification-service"

interface LeaveApprovalProps {
  approverId: string
  approverName: string
}

export const LeaveApproval = ({ approverId, approverName }: LeaveApprovalProps) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const pendingRequests = await getPendingLeaveRequests()
      setRequests(pendingRequests)
    } catch (err: any) {
      setError(err.message || "Failed to load leave requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = async (request: LeaveRequest) => {
    try {
      await updateLeaveRequestStatus(request.id, "approved", approverId)

      // Send notification to employee
      await sendNotificationToUsers(
        [request.employeeId],
        "leave_approved",
        "Leave Request Approved",
        `Your leave request from ${request.startDate} to ${request.endDate} has been approved.`,
      )

      // Update local state
      setRequests(requests.filter((r) => r.id !== request.id))
    } catch (error) {
      console.error("Error approving request:", error)
    }
  }

  const handleReject = async (request: LeaveRequest) => {
    if (!rejectionReason) {
      setError("Please provide a reason for rejection")
      return
    }

    try {
      await updateLeaveRequestStatus(request.id, "rejected", approverId, rejectionReason)

      // Send notification to employee
      await sendNotificationToUsers(
        [request.employeeId],
        "leave_rejected",
        "Leave Request Rejected",
        `Your leave request from ${request.startDate} to ${request.endDate} has been rejected: ${rejectionReason}`,
      )

      // Update local state
      setRequests(requests.filter((r) => r.id !== request.id))
      setRejectionReason("")
      setRejectingRequestId(null)
    } catch (error) {
      console.error("Error rejecting request:", error)
    }
  }

  const renderRequestItem = ({ item }: { item: LeaveRequest }) => (
    <Card style={styles.requestItem}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)} Leave</Text>
        <Badge text="Pending" variant="warning" />
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.requestDetail}>
          <Text style={styles.detailLabel}>Employee ID:</Text>
          <Text style={styles.detailValue}>{item.employeeId}</Text>
        </View>

        <View style={styles.requestDetail}>
          <Text style={styles.detailLabel}>Start Date:</Text>
          <Text style={styles.detailValue}>{item.startDate}</Text>
        </View>

        <View style={styles.requestDetail}>
          <Text style={styles.detailLabel}>End Date:</Text>
          <Text style={styles.detailValue}>{item.endDate}</Text>
        </View>

        <View style={styles.requestDetail}>
          <Text style={styles.detailLabel}>Reason:</Text>
          <Text style={styles.detailValue}>{item.reason}</Text>
        </View>

        <View style={styles.requestDetail}>
          <Text style={styles.detailLabel}>Requested:</Text>
          <Text style={styles.detailValue}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button title="Approve" onPress={() => handleApprove(item)} style={styles.approveButton} />

        {rejectingRequestId === item.id ? (
          <View style={styles.rejectForm}>
            <Input
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              fullWidth
            />
            <View style={styles.rejectActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setRejectingRequestId(null)
                  setRejectionReason("")
                }}
                style={styles.cancelButton}
              />
              <Button title="Confirm Reject" variant="danger" onPress={() => handleReject(item)} />
            </View>
          </View>
        ) : (
          <Button
            title="Reject"
            variant="outline"
            onPress={() => setRejectingRequestId(item.id)}
            style={styles.rejectButton}
          />
        )}
      </View>
    </Card>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading leave requests...</Text>
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

  if (requests.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No pending leave requests</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Leave Requests</Text>
      <FlatList data={requests} renderItem={renderRequestItem} keyExtractor={(item) => item.id} style={styles.list} />
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
  requestItem: {
    marginBottom: 16,
    padding: 16,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
  },
  requestDetails: {
    marginBottom: 16,
  },
  requestDetail: {
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
    flex: 1,
  },
  actionButtons: {
    marginTop: 8,
  },
  approveButton: {
    marginBottom: 8,
  },
  rejectButton: {
    backgroundColor: "#fff5f5",
  },
  rejectForm: {
    marginTop: 8,
  },
  rejectActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelButton: {
    marginRight: 8,
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
