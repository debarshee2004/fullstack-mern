import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addTodo } from "../todoSlice";

const AddTodo = () => {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  const handleForm = (e) => {
    e.preventDefault();
    dispatch(addTodo(input));
    setInput("");
  };

  return <div>AddTodo</div>;
};

export default AddTodo;
