import { useQuery } from "@tanstack/react-query";

const useQueryFunc = () => {
  // data, error are json objects
  // isLoading is boolean value
  const { data, error, isLoading } = useQuery({
    queryKey: ["todo"],
    queryFn: () => fetch("url").then((res) => res.json()),
  });

  if (error) {
    return <div>{error}</div>;
  }
  if (isLoading) {
    return <div>Spining...</div>;
  }
  return <div>{data}</div>;
};

export default useQueryFunc;
