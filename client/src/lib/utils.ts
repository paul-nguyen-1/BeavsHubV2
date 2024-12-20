import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getAllCourses } from "./const";

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

export const fetchPaginationData = async (pageParam: number) => {
  const response = await fetch(`${getAllCourses}${pageParam}`);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

export const useInfiniteQueryData = (queryKey: string[], url: string) => {
  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => fetchData(`${url}${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
