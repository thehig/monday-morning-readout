"use client";

import { useSupabaseData, TestData } from "../hooks/useSupabaseData";

export const SupabaseTest = () => {
  const { data, isLoading, error } = useSupabaseData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Supabase Test</h2>
      {data?.map((item: TestData) => (
        <div key={item.id}>
          <p>{item.name}</p>
          <p>{item.created_at}</p>
        </div>
      ))}
    </div>
  );
};
