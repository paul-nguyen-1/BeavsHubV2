import { useQuery } from "@tanstack/react-query";

export const fetchData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const useFetchData = (queryKey: string[], url: string) => {
  return useQuery({
    queryKey,
    queryFn: () => fetchData(url),
  });
};
