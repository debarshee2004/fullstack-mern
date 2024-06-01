import { useMutation } from "@tanstack/react-query";

const useMutationFunc = () => {
  // mutate is a function
  // isError, isPending, isSuccess are boolean values
  const { mutate, isError, isPending, isSuccess } = useMutation({
    mutationFn: (newId) =>
      fetch("url", {
        method: "POST",
        body: JSON.stringify(),
      }).then((res) => res.json()),
  });
  return (
    <div>
      <button
        onClick={() =>
          mutate({
            data: "The Data you want to send",
          })
        }
      >
        Click Me
      </button>
    </div>
  );
};

export default useMutationFunc;
