"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, Text, ScrollView } from "react-native"
import { getAllActiveIllnessRecords, getIllnessStatistics, type IllnessRecord } from "../illness-service"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { IllnessRecordDetail } from "./illness-record-detail"
import { Activity, Users, FileText, AlertCircle } from "lucide-react-native"

interface AdminIllnessManagementProps {
  userId: string
  onNavigate?: (screen: string, params?: any) => void
}

export const AdminIllnessManagement = ({ userId, onNavigate }: AdminIllnessManagementProps) => {
  const [activeRecords, setActiveRecords] = useState<IllnessRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<IllnessRecord | null>(null)
  const [statistics, setStatistics] = useState<{
    totalActive: number
    totalRecovered: number
    totalChronic: number
    byType: Record<string, number>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [fetchedRecords, fetchedStats] = await Promise.all([getAllActiveIllnessRecords(), getIllnessStatistics()])

        setActiveRecords(fetchedRecords)
        setStatistics(fetchedStats)
      } catch (err: any) {
        setError(err.message || "Failed to fetch illness data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRecordUpdated = (updatedRecord: IllnessRecord) => {
    setActiveRecords((prevRecords) => {
      // If the record is no longer active, remove it from the list
      if (updatedRecord.status !== "active") {
        return prevRecords.filter((record) => record.id !== updatedRecord.id)
      }

      // Otherwise, update it in the list
      return prevRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
    })

    setSelectedRecord(updatedRecord)
  }

  const renderStatistics = () => {
    if (!statistics) return null

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Activity size={20} color="#4a5568" />
          <Text style={styles.cardTitle}>Illness Statistics</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#fed7d7" }]}>
            <Text style={styles.statValue}>{statistics.totalActive}</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#c6f6d5" }]}>
            <Text style={styles.statValue}>{statistics.totalRecovered}</Text>
            <Text style={styles.statLabel}>Recovered</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#feebc8" }]}>
            <Text style={styles.statValue}>{statistics.totalChronic}</Text>
            <Text style={styles.statLabel}>Chronic</Text>
          </View>
        </View>

        <View style={styles.typeStats}>
          <Text style={styles.typeStatsTitle}>By Type:</Text>
          <View style={styles.typeStatsRow}>
            <Text style={styles.typeLabel}>Sick Leave:</Text>
            <Text style={styles.typeValue}>{statistics.byType.sick_leave}</Text>
          </View>
          <View style={styles.typeStatsRow}>
            <Text style={styles.typeLabel}>Work Accident:</Text>
            <Text style={styles.typeValue}>{statistics.byType.work_accident}</Text>
          </View>
          <View style={styles.typeStatsRow}>
            <Text style={styles.typeLabel}>Long Term:</Text>
            <Text style={styles.typeValue}>{statistics.byType.long_term}</Text>
          </View>
          <View style={styles.typeStatsRow}>
            <Text style={styles.typeLabel}>Other:</Text>
            <Text style={styles.typeValue}>{statistics.byType.other}</Text>
          </View>
        </View>
      </Card>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading illness management data...</Text>
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
      <Text style={styles.pageTitle}>Illness Management</Text>

      {renderStatistics()}

      <View style={styles.actionsContainer}>
        <Button
          title="View All Employees"
          onPress={() => onNavigate && onNavigate("Employees")}
          leftIcon={<Users size={16} color="#fff" />}
          style={styles.actionButton}
        />
        <Button
          title="View All Records"
          onPress={() => onNavigate && onNavigate("AllIllnessRecords")}
          leftIcon={<FileText size={16} color="#fff" />}
          style={styles.actionButton}
        />
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <AlertCircle size={20} color="#4a5568" />
          <Text style={styles.cardTitle}>Active Illness Cases</Text>
        </View>

        {activeRecords.length === 0 ? (
          <Text style={styles.emptyText}>No active illness cases</Text>
        ) : (
          activeRecords.map((record) => (
            <View key={record.id} style={styles.recordContainer}>
              <IllnessRecordDetail
                record={record}
                userId={userId}
                canEdit={true}
                onRecordUpdated={handleRecordUpdated}
              />
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7fafc",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3748",
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "31%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748",
  },
  statLabel: {
    fontSize: 12,
    color: "#4a5568",
  },
  typeStats: {
    backgroundColor: "#f7fafc",
    padding: 12,
    borderRadius: 8,
  },
  typeStatsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 8,
  },
  typeStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 14,
    color: "#4a5568",
  },
  typeValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3748",
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  recordContainer: {
    marginBottom: 16,
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
