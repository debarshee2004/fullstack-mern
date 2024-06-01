import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeTodo } from "../todoSlice";

const DisplayTodo = () => {
  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();
  return (
    <>
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.text}
          <button
            onClick={() =>
              dispatch(
                removeTodo({
                  id: todo.id,
                })
              )
            }
          >
            Delete
          </button>
        </li>
      ))}
    </>
  );
};

export default DisplayTodo;
