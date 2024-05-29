import { createSlice, nanoid } from "@reduxjs/toolkit";

// Initial State of the store
const initialState = {
  todos: [{ id: 1, text: "Hello world" }],
};

export const todoSlice = createSlice({
  name: "todo",
  initialState,
  // Reducer which will manage the store in this project
  reducers: {
    addTodo: (state, action) => {
      const todo = {
        id: nanoid(),
        text: action.payload,
      };
      state.todos.push(todo);
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload);
    },
  },
});

// They need to the exported separately cause they will be used separately.
export const { addTodo, removeTodo } = todoSlice.actions;

export default todoSlice.reducer;
