"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { createPayslip, type PayslipItem } from "../payslip-service"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"
import { Trash2 } from "lucide-react-native"

interface PayslipFormProps {
  employeeId: string
  onPayslipCreated: () => void
}

export const PayslipForm = ({ employeeId, onPayslipCreated }: PayslipFormProps) => {
  const [month, setMonth] = useState("")
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [grossSalary, setGrossSalary] = useState("")
  const [items, setItems] = useState<PayslipItem[]>([
    { label: "Base Salary", amount: 0, type: "earning" },
    { label: "Income Tax", amount: 0, type: "deduction" },
    { label: "Social Security", amount: 0, type: "deduction" },
  ])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAddItem = (type: "earning" | "deduction") => {
    setItems([...items, { label: "", amount: 0, type }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof PayslipItem, value: string | number) => {
    const newItems = [...items]
    if (field === "amount") {
      newItems[index].amount = typeof value === "string" ? Number.parseFloat(value) || 0 : value
    } else {
      newItems[index][field] = value
    }
    setItems(newItems)
  }

  const calculateNetSalary = (): number => {
    let net = 0
    items.forEach((item) => {
      if (item.type === "earning") {
        net += item.amount
      } else {
        net -= item.amount
      }
    })
    return net
  }

  const handleSubmit = async () => {
    if (!month || !year || !grossSalary) {
      setError("Month, year, and gross salary are required")
      return
    }

    const monthNum = Number.parseInt(month, 10)
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setError("Month must be a number between 1 and 12")
      return
    }

    const yearNum = Number.parseInt(year, 10)
    if (isNaN(yearNum)) {
      setError("Year must be a valid number")
      return
    }

    // Validate items
    for (const item of items) {
      if (!item.label) {
        setError("All items must have a label")
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      await createPayslip({
        employeeId,
        period: {
          month: monthNum,
          year: yearNum,
        },
        issueDate: new Date().toISOString(),
        grossSalary: Number.parseFloat(grossSalary),
        netSalary: calculateNetSalary(),
        items,
        status: "draft",
      })

      onPayslipCreated()
    } catch (err: any) {
      setError(err.message || "Failed to create payslip")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Create Payslip</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.periodContainer}>
          <View style={styles.periodField}>
            <Input
              label="Month (1-12)"
              placeholder="Month"
              value={month}
              onChangeText={setMonth}
              keyboardType="numeric"
              fullWidth
            />
          </View>
          <View style={styles.periodField}>
            <Input
              label="Year"
              placeholder="Year"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              fullWidth
            />
          </View>
        </View>

        <Input
          label="Gross Salary"
          placeholder="Enter gross salary"
          value={grossSalary}
          onChangeText={setGrossSalary}
          keyboardType="numeric"
          fullWidth
        />

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          {items
            .filter((item) => item.type === "earning")
            .map((item, index) => {
              const itemIndex = items.findIndex((i) => i === item)
              return (
                <View key={`earning-${index}`} style={styles.itemRow}>
                  <View style={styles.itemLabel}>
                    <Input
                      placeholder="Item name"
                      value={item.label}
                      onChangeText={(value) => handleItemChange(itemIndex, "label", value)}
                      fullWidth
                    />
                  </View>
                  <View style={styles.itemAmount}>
                    <Input
                      placeholder="Amount"
                      value={item.amount.toString()}
                      onChangeText={(value) => handleItemChange(itemIndex, "amount", value)}
                      keyboardType="numeric"
                      fullWidth
                    />
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(itemIndex)}>
                    <Trash2 size={20} color="#e53e3e" />
                  </TouchableOpacity>
                </View>
              )
            })}

          <Button
            title="Add Earning"
            variant="outline"
            onPress={() => handleAddItem("earning")}
            style={styles.addButton}
          />

          <Text style={styles.sectionTitle}>Deductions</Text>
          {items
            .filter((item) => item.type === "deduction")
            .map((item, index) => {
              const itemIndex = items.findIndex((i) => i === item)
              return (
                <View key={`deduction-${index}`} style={styles.itemRow}>
                  <View style={styles.itemLabel}>
                    <Input
                      placeholder="Item name"
                      value={item.label}
                      onChangeText={(value) => handleItemChange(itemIndex, "label", value)}
                      fullWidth
                    />
                  </View>
                  <View style={styles.itemAmount}>
                    <Input
                      placeholder="Amount"
                      value={item.amount.toString()}
                      onChangeText={(value) => handleItemChange(itemIndex, "amount", value)}
                      keyboardType="numeric"
                      fullWidth
                    />
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(itemIndex)}>
                    <Trash2 size={20} color="#e53e3e" />
                  </TouchableOpacity>
                </View>
              )
            })}

          <Button
            title="Add Deduction"
            variant="outline"
            onPress={() => handleAddItem("deduction")}
            style={styles.addButton}
          />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Net Salary:</Text>
          <Text style={styles.summaryValue}>{calculateNetSalary().toFixed(2)} €</Text>
        </View>

        <Button
          title={loading ? "Creating..." : "Create Payslip"}
          onPress={handleSubmit}
          disabled={loading}
          fullWidth
          style={styles.submitButton}
        />
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#2d3748",
  },
  periodContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  periodField: {
    flex: 1,
    marginRight: 8,
  },
  itemsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2d3748",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemLabel: {
    flex: 2,
    marginRight: 8,
  },
  itemAmount: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0070f3",
  },
  submitButton: {
    marginTop: 24,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
  },
})
