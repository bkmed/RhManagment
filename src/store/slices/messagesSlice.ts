import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '../../database/schema';

interface MessagesState {
  items: ChatMessage[];
}

const initialState: MessagesState = {
  items: [
    {
      id: '1',
      text: 'Hello everyone! Welcome to the new internal chat.',
      senderId: 'admin',
      receiverId: 'all',
      createdAt: new Date().toISOString(),
    },
  ],
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.items = action.payload;
    },
    sendMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.items.push(action.payload);
    },
    clearMessages: state => {
      state.items = [];
    },
  },
});

export const { setMessages, sendMessage, clearMessages } =
  messagesSlice.actions;

export const selectAllMessages = (state: { messages: MessagesState }) =>
  state.messages.items;
export const selectMessagesByReceiver =
  (receiverId: string) => (state: { messages: MessagesState }) =>
    state.messages.items.filter(
      m => m.receiverId === receiverId || m.receiverId === 'all',
    );

export default messagesSlice.reducer;
