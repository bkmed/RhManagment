import { store } from '../store';
import {
  addInvoice as addInvoiceAction,
  updateInvoice as updateInvoiceAction,
  deleteInvoice as deleteInvoiceAction,
  selectAllInvoices,
} from '../store/slices/invoicesSlice';
import { Invoice } from './schema';

export const invoicesDb = {
  // Get all invoices
  getAll: async (): Promise<Invoice[]> => {
    const invoices = selectAllInvoices(store.getState());
    return [...invoices].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  // Get invoice by ID
  getById: async (id: number): Promise<Invoice | null> => {
    const invoices = selectAllInvoices(store.getState());
    return invoices.find(i => i.id === id) || null;
  },

  // Add new invoice
  add: async (
    invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const now = new Date().toISOString();
    const id = Date.now();

    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt: now,
      updatedAt: now,
    };

    store.dispatch(addInvoiceAction(newInvoice));

    return id;
  },

  // Update invoice
  update: async (id: number, updates: Partial<Invoice>): Promise<void> => {
    const invoices = selectAllInvoices(store.getState());
    const existing = invoices.find(i => i.id === id);

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateInvoiceAction(updated));
    }
  },

  // Delete invoice
  delete: async (id: number): Promise<void> => {
    store.dispatch(deleteInvoiceAction(id));
  },
};
