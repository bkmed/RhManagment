"use client"

import { useState } from "react"
import { View, StyleSheet, Text, Platform } from "react-native"
import { createIllnessRecord, type IllnessType, type IllnessStatus } from "../illness-service"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"
import { DatePicker } from "../../../core/src/components/ui/date-picker"
import { FileUpload } from "../../../core/src/components/ui/file-upload"

interface IllnessRecordFormProps {
  employeeId: string
  userId: string
  onRecordSubmitted: () => void
}

export const IllnessRecordForm = ({ employeeId, userId, onRecordSubmitted }: IllnessRecordFormProps) => {
  const [illnessType, setIllnessType] = useState<IllnessType>("sick_leave")
  const [status, setStatus] = useState<IllnessStatus>("active")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [notes, setNotes] = useState("")
  const [medicalCertificate, setMedicalCertificate] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!startDate || !description) {
      setError("Start date and description are required")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await createIllnessRecord({
        employeeId,
        type: illnessType,
        status,
        startDate,
        endDate: endDate || undefined,
        description,
        followUpDate: followUpDate || undefined,
        notes: notes || undefined,
        createdBy: userId,
      })

      // Reset form
      setIllnessType("sick_leave")
      setStatus("active")
      setStartDate("")
      setEndDate("")
      setDescription("")
      setFollowUpDate("")
      setNotes("")
      setMedicalCertificate(null)

      onRecordSubmitted()
    } catch (err: any) {
      setError(err.message || "Failed to submit illness record")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Record Illness</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Illness Type</Text>
        <View style={styles.buttonGroup}>
          <Button
            title="Sick Leave"
            variant={illnessType === "sick_leave" ? "primary" : "outline"}
            onPress={() => setIllnessType("sick_leave")}
            style={styles.typeButton}
          />
          <Button
            title="Work Accident"
            variant={illnessType === "work_accident" ? "primary" : "outline"}
            onPress={() => setIllnessType("work_accident")}
            style={styles.typeButton}
          />
          <Button
            title="Long Term"
            variant={illnessType === "long_term" ? "primary" : "outline"}
            onPress={() => setIllnessType("long_term")}
            style={styles.typeButton}
          />
          <Button
            title="Other"
            variant={illnessType === "other" ? "primary" : "outline"}
            onPress={() => setIllnessType("other")}
            style={styles.typeButton}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.buttonGroup}>
          <Button
            title="Active"
            variant={status === "active" ? "primary" : "outline"}
            onPress={() => setStatus("active")}
            style={styles.typeButton}
          />
          <Button
            title="Recovered"
            variant={status === "recovered" ? "primary" : "outline"}
            onPress={() => setStatus("recovered")}
            style={styles.typeButton}
          />
          <Button
            title="Chronic"
            variant={status === "chronic" ? "primary" : "outline"}
            onPress={() => setStatus("chronic")}
            style={styles.typeButton}
          />
        </View>
      </View>

      <DatePicker label="Start Date" value={startDate} onChange={setStartDate} style={styles.input} />

      <DatePicker label="End Date (if known)" value={endDate} onChange={setEndDate} style={styles.input} />

      <Input
        label="Description"
        placeholder="Describe the illness or condition"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.textArea}
        fullWidth
      />

      <DatePicker
        label="Follow-up Date (if applicable)"
        value={followUpDate}
        onChange={setFollowUpDate}
        style={styles.input}
      />

      <Input
        label="Additional Notes"
        placeholder="Any additional notes or information"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.textArea}
        fullWidth
      />

      {Platform.OS !== "web" ? (
        <Text style={styles.label}>Medical Certificate (if available)</Text>
      ) : (
        <FileUpload
          label="Medical Certificate (if available)"
          accept="image/*,.pdf"
          onChange={(file) => setMedicalCertificate(file)}
          style={styles.fileUpload}
        />
      )}

      <Button
        title={loading ? "Submitting..." : "Submit Record"}
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
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  fileUpload: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
  },
})
