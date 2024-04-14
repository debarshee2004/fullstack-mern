import React from "react";

const App = () => {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  const addTodoHandler = (e) => {
    e.preventDefault();
    // dispature is ued to do change in the store
    dispatch(addTodo(input));
    setInput("");
  };

  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  return <div>App</div>;
};

export default App;
