"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { createInvoice, type InvoiceItem } from "../invoice-service"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"
import { Trash, Plus } from "lucide-react-native"

interface InvoiceFormProps {
  employeeId: string
  onInvoiceCreated: (invoiceId: string) => void
}

interface InvoiceItemInput extends Omit<InvoiceItem, "id" | "amount"> {}

export const InvoiceForm = ({ employeeId, onInvoiceCreated }: InvoiceFormProps) => {
  const [items, setItems] = useState<InvoiceItemInput[]>([{ description: "", quantity: 1, unitPrice: 0 }])
  const [taxRate, setTaxRate] = useState(20) // Default tax rate (e.g., 20%)
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateTaxAmount = () => {
    return calculateSubtotal() * (taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount()
  }

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof InvoiceItemInput, value: string | number) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: field === "description" ? value : Number(value),
    }
    setItems(newItems)
  }

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!dueDate) {
        setError("Due date is required")
        return
      }

      if (items.some((item) => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
        setError("All items must have a description, quantity, and price")
        return
      }

      setLoading(true)
      setError(null)

      const invoice = await createInvoice(employeeId, items, taxRate, dueDate, notes)

      onInvoiceCreated(invoice.id)
    } catch (err: any) {
      setError(err.message || "Failed to create invoice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView>
      <Card style={styles.container}>
        <Text style={styles.title}>Create New Invoice</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>

          <Input label="Due Date" placeholder="YYYY-MM-DD" value={dueDate} onChangeText={setDueDate} fullWidth />

          <Input
            label="Tax Rate (%)"
            keyboardType="numeric"
            value={taxRate.toString()}
            onChangeText={(value) => setTaxRate(Number(value))}
            fullWidth
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Items</Text>

          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemFields}>
                <Input
                  label="Description"
                  placeholder="Item description"
                  value={item.description}
                  onChangeText={(value) => handleItemChange(index, "description", value)}
                  style={styles.descriptionInput}
                />

                <Input
                  label="Qty"
                  keyboardType="numeric"
                  value={item.quantity.toString()}
                  onChangeText={(value) => handleItemChange(index, "quantity", value)}
                  style={styles.qtyInput}
                />

                <Input
                  label="Unit Price"
                  keyboardType="numeric"
                  value={item.unitPrice.toString()}
                  onChangeText={(value) => handleItemChange(index, "unitPrice", value)}
                  style={styles.priceInput}
                />

                <Text style={styles.amountText}>{(item.quantity * item.unitPrice).toFixed(2)}</Text>
              </View>

              <Button variant="outline" onPress={() => handleRemoveItem(index)} style={styles.removeButton}>
                <Trash size={16} color="#e53e3e" />
              </Button>
            </View>
          ))}

          <Button title="Add Item" variant="outline" onPress={handleAddItem} style={styles.addButton}>
            <Plus size={16} color="#0070f3" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input
            placeholder="Additional notes or payment instructions"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
            fullWidth
          />
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{calculateSubtotal().toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax ({taxRate}%):</Text>
            <Text style={styles.summaryValue}>{calculateTaxAmount().toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryTotal}>{calculateTotal().toFixed(2)}</Text>
          </View>
        </View>

        <Button
          title={loading ? "Creating Invoice..." : "Create Invoice"}
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3748",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#4a5568",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  itemFields: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  descriptionInput: {
    flex: 3,
    marginRight: 8,
  },
  qtyInput: {
    flex: 1,
    marginRight: 8,
  },
  priceInput: {
    flex: 2,
    marginRight: 8,
  },
  amountText: {
    flex: 1,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "500",
    paddingBottom: 10,
  },
  removeButton: {
    marginLeft: 8,
    height: 40,
    width: 40,
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 8,
    color: "#0070f3",
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  summary: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#4a5568",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
  },
  submitButton: {
    marginTop: 16,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
  },
})
