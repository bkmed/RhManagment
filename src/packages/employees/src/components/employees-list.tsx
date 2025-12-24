"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from "react-native"
import { getAllEmployees, type Employee } from "../employee-service"
import { Card } from "../../../core/src/components/ui/card"
import { Avatar } from "../../../core/src/components/ui/avatar"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

export const EmployeesList = () => {
  const { t } = useTranslation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedEmployees = await getAllEmployees()
        setEmployees(fetchedEmployees)
        setFilteredEmployees(fetchedEmployees)
      } catch (err: any) {
        setError(err.message || t("common.error"))
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = employees.filter(
        (employee) =>
          employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredEmployees(filtered)
    } else {
      setFilteredEmployees(employees)
    }
  }, [searchQuery, employees])

  const navigation = useNavigation()

  const renderItem = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      style={styles.employeeItem}
      onPress={() => navigation.navigate("EmployeeDetails", { employeeId: item.id })}
    >
      <Avatar initials={`${item.firstName.charAt(0)}${item.lastName.charAt(0)}`} src={item.profilePicture} size="md" />
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{`${item.firstName} ${item.lastName}`}</Text>
        <Text style={styles.employeePosition}>{item.position}</Text>
        <Text style={styles.employeeDepartment}>{item.department}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("employeeDirectory.employeeDirectory")}</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Card style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("employeeDirectory.searchEmployees")}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Card>

      {loading ? (
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      ) : filteredEmployees.length === 0 ? (
        <Text style={styles.emptyText}>{t("employeeDirectory.noEmployees")}</Text>
      ) : (
        <FlatList
          data={filteredEmployees}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3748",
  },
  searchCard: {
    marginBottom: 16,
    padding: 8,
  },
  searchInput: {
    height: 40,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  listContent: {
    paddingBottom: 16,
  },
  employeeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  employeeInfo: {
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
  employeeDepartment: {
    fontSize: 14,
    color: "#718096",
  },
  loadingText: {
    textAlign: "center",
    color: "#718096",
  },
  emptyText: {
    textAlign: "center",
    color: "#718096",
  },
  errorText: {
    color: "#e53e3e",
    textAlign: "center",
  },
})
