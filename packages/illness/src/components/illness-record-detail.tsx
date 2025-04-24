"use client"

import { useState } from "react"
import { View, StyleSheet, Text, ScrollView, Linking } from "react-native"
import { updateIllnessRecord, type IllnessRecord, type IllnessStatus } from "../illness-service"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { Badge } from "../../../core/src/components/ui/badge"
import { Input } from "../../../core/src/components/ui/input"
import { DatePicker } from "../../../core/src/components/ui/date-picker"
import { FileText, Calendar, FileCheck, ExternalLink } from "lucide-react-native"

interface IllnessRecordDetailProps {
  record: IllnessRecord
  userId: string
  canEdit: boolean
  onRecordUpdated: (updatedRecord: IllnessRecord) => void
}

export const IllnessRecordDetail = ({ record, userId, canEdit, onRecordUpdated }: IllnessRecordDetailProps) => {
  const [status, setStatus] = useState<IllnessStatus>(record.status)
  const [endDate, setEndDate] = useState(record.endDate || "")
  const [followUpDate, setFollowUpDate] = useState(record.followUpDate || "")
  const [notes, setNotes] = useState(record.notes || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateRecord = async () => {
    try {
      setLoading(true)
      setError(null)

      const updatedRecord = await updateIllnessRecord(record.id, {
        status,
        endDate: endDate || undefined,
        followUpDate: followUpDate || undefined,
        notes: notes || undefined,
        updatedBy: userId,
      })

      onRecordUpdated(updatedRecord)
    } catch (err: any) {
      setError(err.message || "Failed to update illness record")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: IllnessStatus) => {
    switch (status) {
      case "active":
        return "error"
      case "recovered":
        return "success"
      case "chronic":
        return "warning"
      default:
        return "default"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const openMedicalCertificate = () => {
    if (record.medicalCertificateUrl) {
      Linking.openURL(record.medicalCertificateUrl)
    }
  }

  return (
    <Card style={styles.card}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Illness Record</Text>
          <Badge
            text={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            variant={getStatusBadgeVariant(record.status)}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#4a5568" />
            <Text style={styles.sectionTitle}>Details</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>
              {record.type === "sick_leave" && "Sick Leave"}
              {record.type === "work_accident" && "Work Accident"}
              {record.type === "long_term" && "Long Term Illness"}
              {record.type === "other" && "Other"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Date:</Text>
            <Text style={styles.infoValue}>{formatDate(record.startDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Date:</Text>
            <Text style={styles.infoValue}>{formatDate(record.endDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.infoValue}>{record.description}</Text>
          </View>

          {record.medicalCertificateUrl && (
            <View style={styles.certificateContainer}>
              <Button
                title="View Medical Certificate"
                onPress={openMedicalCertificate}
                leftIcon={<FileCheck size={16} color="#fff" />}
                rightIcon={<ExternalLink size={16} color="#fff" />}
              />
            </View>
          )}
        </View>

        {canEdit && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#4a5568" />
              <Text style={styles.sectionTitle}>Update Record</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.buttonGroup}>
                <Button
                  title="Active"
                  variant={status === "active" ? "primary" : "outline"}
                  onPress={() => setStatus("active")}
                  style={styles.statusButton}
                />
                <Button
                  title="Recovered"
                  variant={status === "recovered" ? "primary" : "outline"}
                  onPress={() => setStatus("recovered")}
                  style={styles.statusButton}
                />
                <Button
                  title="Chronic"
                  variant={status === "chronic" ? "primary" : "outline"}
                  onPress={() => setStatus("chronic")}
                  style={styles.statusButton}
                />
              </View>
            </View>

            <DatePicker label="End Date (if recovered)" value={endDate} onChange={setEndDate} style={styles.input} />

            <DatePicker label="Follow-up Date" value={followUpDate} onChange={setFollowUpDate} style={styles.input} />

            <Input
              label="Additional Notes"
              placeholder="Any additional notes or updates"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.textArea}
              fullWidth
            />

            <Button
              title={loading ? "Updating..." : "Update Record"}
              onPress={handleUpdateRecord}
              disabled={loading}
              fullWidth
              style={styles.updateButton}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#4a5568" />
            <Text style={styles.sectionTitle}>Record Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(record.createdAt)}</Text>
          </View>

          {record.updatedAt !== record.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>{formatDate(record.updatedAt)}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5568",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: "500",
    color: "#718096",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#2d3748",
  },
  certificateContainer: {
    marginTop: 16,
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
  statusButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 8,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
  },
})
