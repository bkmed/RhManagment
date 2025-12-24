"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Modal, Platform, TouchableOpacity } from "react-native"
import { createLeaveRequest, type LeaveType } from "../leave-service"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"
import { X } from "lucide-react-native"
import { useTranslation } from "react-i18next"

interface RequestLeaveModalProps {
  isVisible: boolean
  onClose: () => void
  onRequestSubmitted: () => void
  employeeId: string
  date: Date
  requestType?: "leave" | "authorization" | "illness"
}

export const RequestLeaveModal = ({
  isVisible,
  onClose,
  onRequestSubmitted,
  employeeId,
  date,
  requestType = "leave",
}: RequestLeaveModalProps) => {
  const { t } = useTranslation()
  const [leaveType, setLeaveType] = useState<LeaveType>(
    requestType === "illness" ? "sick" : requestType === "authorization" ? "personal" : "vacation",
  )
  const [startDate, setStartDate] = useState(date.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(date.toISOString().split("T")[0])
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      setError(t("leave.allFieldsRequired"))
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
      setLeaveType(requestType === "illness" ? "sick" : requestType === "authorization" ? "personal" : "vacation")
      setStartDate(date.toISOString().split("T")[0])
      setEndDate(date.toISOString().split("T")[0])
      setReason("")

      onRequestSubmitted()
      onClose()
    } catch (err: any) {
      setError(err.message || t("leave.failedToSubmit"))
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (requestType) {
      case "illness":
        return t("leave.reportIllness")
      case "authorization":
        return t("leave.requestAuthorization")
      default:
        return t("leave.requestLeave")
    }
  }

  const renderContent = () => (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{getTitle()}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#4a5568" />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("leave.leaveType")}</Text>
        <View style={styles.buttonGroup}>
          {requestType !== "illness" && (
            <Button
              title={t("leave.vacation")}
              variant={leaveType === "vacation" ? "primary" : "outline"}
              onPress={() => setLeaveType("vacation")}
              style={styles.typeButton}
            />
          )}
          {requestType === "illness" && (
            <Button
              title={t("leave.sick")}
              variant={leaveType === "sick" ? "primary" : "outline"}
              onPress={() => setLeaveType("sick")}
              style={styles.typeButton}
            />
          )}
          <Button
            title={t("leave.personal")}
            variant={leaveType === "personal" ? "primary" : "outline"}
            onPress={() => setLeaveType("personal")}
            style={styles.typeButton}
          />
          <Button
            title={t("leave.other")}
            variant={leaveType === "other" ? "primary" : "outline"}
            onPress={() => setLeaveType("other")}
            style={styles.typeButton}
          />
        </View>
      </View>

      <Input
        label={t("leave.startDate")}
        placeholder="YYYY-MM-DD"
        value={startDate}
        onChangeText={setStartDate}
        fullWidth
      />

      <Input label={t("leave.endDate")} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} fullWidth />

      <Input
        label={t("leave.reason")}
        placeholder={t("leave.reasonPlaceholder")}
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
        style={styles.textArea}
        fullWidth
      />

      <Button
        title={loading ? t("common.submitting") : t("common.submit")}
        onPress={handleSubmit}
        disabled={loading}
        fullWidth
        style={styles.submitButton}
      />
    </Card>
  )

  if (Platform.OS === "web") {
    if (!isVisible) return null

    return (
      <div style={webModalStyles.overlay}>
        <div style={webModalStyles.container}>{renderContent()}</div>
      </div>
    )
  }

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>{renderContent()}</View>
      </View>
    </Modal>
  )
}

// Web-specific styles
const webModalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    width: "90%",
    maxWidth: 500,
  },
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
  },
  card: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3748",
  },
  closeButton: {
    padding: 4,
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
