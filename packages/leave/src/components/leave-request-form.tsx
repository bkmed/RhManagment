"use client"

import { useState } from "react"
import { View, StyleSheet, Text } from "react-native"
import { createLeaveRequest, type LeaveType } from "../leave-service"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"

interface LeaveRequestFormProps {
  employeeId: string
  onRequestSubmitted: () => void
}

export const LeaveRequestForm = ({ employeeId, onRequestSubmitted }: LeaveRequestFormProps) => {
  const [leaveType, setLeaveType] = useState<LeaveType>("vacation")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      setError("All fields are required")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await createLeaveRequest({
        employeeId,
        type: leaveType,
        startDate,
        endDate,
        reason,
      })

      // Reset form
      setLeaveType("vacation")
      setStartDate("")
      setEndDate("")
      setReason("")

      onRequestSubmitted()
    } catch (err: any) {
      setError(err.message || "Failed to submit leave request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Request Leave</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Leave Type</Text>
        <View style={styles.buttonGroup}>
          <Button
            title="Vacation"
            variant={leaveType === "vacation" ? "primary" : "outline"}
            onPress={() => setLeaveType("vacation")}
            style={styles.typeButton}
          />
          <Button
            title="Sick"
            variant={leaveType === "sick" ? "primary" : "outline"}
            onPress={() => setLeaveType("sick")}
            style={styles.typeButton}
          />
          <Button
            title="Personal"
            variant={leaveType === "personal" ? "primary" : "outline"}
            onPress={() => setLeaveType("personal")}
            style={styles.typeButton}
          />
          <Button
            title="Other"
            variant={leaveType === "other" ? "primary" : "outline"}
            onPress={() => setLeaveType("other")}
            style={styles.typeButton}
          />
        </View>
      </View>

      <Input label="Start Date" placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} fullWidth />

      <Input label="End Date" placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} fullWidth />

      <Input
        label="Reason"
        placeholder="Provide a reason for your leave request"
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
        style={styles.textArea}
        fullWidth
      />

      <Button
        title={loading ? "Submitting..." : "Submit Request"}
        onPress={handleSubmit}
        disabled={loading}
        fullWidth
        style={styles.submitButton}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3748",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#4a5568",
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  typeButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 16,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
  },
})
