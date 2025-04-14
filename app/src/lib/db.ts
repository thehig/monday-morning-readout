import { supabase } from "./supabase";

export type ErrorResponse = {
  error: string;
};

export type SuccessResponse<T> = {
  data: T;
};

export type ApiResponse<T> = ErrorResponse | SuccessResponse<T>;

export const isErrorResponse = (
  response: unknown
): response is ErrorResponse => {
  return (
    typeof response === "object" && response !== null && "error" in response
  );
};

export async function fetchData<T>(
  table: string,
  query?: {
    select?: string;
    eq?: Array<[string, string | number | boolean]>;
    order?: Array<[string, "asc" | "desc"]>;
    limit?: number;
  }
): Promise<ApiResponse<T[]>> {
  try {
    let dbQuery = supabase.from(table).select(query?.select || "*");

    if (query?.eq) {
      query.eq.forEach(([column, value]) => {
        dbQuery = dbQuery.eq(column, value);
      });
    }

    if (query?.order) {
      query.order.forEach(([column, direction]) => {
        dbQuery = dbQuery.order(column, { ascending: direction === "asc" });
      });
    }

    if (query?.limit) {
      dbQuery = dbQuery.limit(query.limit);
    }

    const { data, error } = await dbQuery;

    if (error) {
      return { error: error.message };
    }

    return { data: data as T[] };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function insertData<T>(
  table: string,
  data: Partial<T>
): Promise<ApiResponse<T>> {
  try {
    const { data: insertedData, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: insertedData as T };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateData<T>(
  table: string,
  id: number,
  data: Partial<T>
): Promise<ApiResponse<T>> {
  try {
    const { data: updatedData, error } = await supabase
      .from(table)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: updatedData as T };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteData(
  table: string,
  id: number
): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      return { error: error.message };
    }

    return { data: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
