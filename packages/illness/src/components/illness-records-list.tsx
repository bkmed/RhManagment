"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from "react-native"
import { getIllnessRecordsByEmployeeId, type IllnessRecord, type IllnessStatus } from "../illness-service"
import { Card } from "../../../core/src/components/ui/card"
import { Badge } from "../../../core/src/components/ui/badge"
import { FileText, ChevronRight } from "lucide-react-native"

interface IllnessRecordsListProps {
  employeeId: string
  onSelectRecord?: (record: IllnessRecord) => void
}

export const IllnessRecordsList = ({ employeeId, onSelectRecord }: IllnessRecordsListProps) => {
  const [records, setRecords] = useState<IllnessRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedRecords = await getIllnessRecordsByEmployeeId(employeeId)
        setRecords(fetchedRecords)
      } catch (err: any) {
        setError(err.message || "Failed to fetch illness records")
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [employeeId])

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

  const renderItem = ({ item }: { item: IllnessRecord }) => (
    <TouchableOpacity style={styles.recordItem} onPress={() => onSelectRecord && onSelectRecord(item)}>
      <View style={styles.recordIcon}>
        <FileText size={24} color="#4a5568" />
      </View>
      <View style={styles.recordContent}>
        <View style={styles.recordHeader}>
          <Text style={styles.recordType}>
            {item.type === "sick_leave" && "Sick Leave"}
            {item.type === "work_accident" && "Work Accident"}
            {item.type === "long_term" && "Long Term Illness"}
            {item.type === "other" && "Other"}
          </Text>
          <Badge
            text={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            variant={getStatusBadgeVariant(item.status)}
          />
        </View>
        <Text style={styles.recordDates}>
          {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : "Ongoing"}
        </Text>
        <Text style={styles.recordDescription} numberOfLines={2}>
          {item.description}
        </Text>
        {item.followUpDate && <Text style={styles.followUpDate}>Follow-up: {formatDate(item.followUpDate)}</Text>}
      </View>
      <ChevronRight size={20} color="#a0aec0" />
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <Card style={styles.card}>
        <Text>Loading illness records...</Text>
      </Card>
    )
  }

  if (error) {
    return (
      <Card style={styles.card}>
        <Text style={styles.errorText}>{error}</Text>
      </Card>
    )
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Illness Records</Text>

      {records.length === 0 ? (
        <Text style={styles.emptyText}>No illness records found</Text>
      ) : (
        <FlatList data={records} renderItem={renderItem} keyExtractor={(item) => item.id} style={styles.list} />
      )}
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
  list: {
    width: "100%",
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  recordIcon: {
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recordType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
  },
  recordDates: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4,
  },
  recordDescription: {
    fontSize: 14,
    color: "#4a5568",
  },
  followUpDate: {
    fontSize: 13,
    color: "#805ad5",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#a0aec0",
    padding: 16,
  },
  errorText: {
    color: "#e53e3e",
    textAlign: "center",
    padding: 16,
  },
})
