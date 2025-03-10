declare module 'react';

declare module '@tanstack/react-query' {
  export function useQuery<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  >(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError>;

  export function useMutation<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
  >(options: UseMutationOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables, TContext>;
  
  export interface UseQueryResult<TData = unknown, TError = unknown> {
    data: TData | undefined;
    error: TError | null;
    isError: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    status: 'error' | 'loading' | 'success' | 'idle';
  }

  export interface UseMutationResult<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
  > {
    data: TData | undefined;
    error: TError | null;
    isError: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    mutate: (variables: TVariables, options?: MutateOptions<TData, TError, TVariables, TContext>) => void;
    mutateAsync: (variables: TVariables, options?: MutateOptions<TData, TError, TVariables, TContext>) => Promise<TData>;
  }

  export interface MutateOptions<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
  > {
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => Promise<unknown> | unknown;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => Promise<unknown> | unknown;
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => Promise<unknown> | unknown;
  }
  export interface UseQueryOptions<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  > {
    queryKey?: TQueryKey;
    queryFn?: QueryFunction<TQueryFnData, TQueryKey>;
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  }

  export interface UseMutationOptions<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
  > {
    mutationFn?: MutationFunction<TData, TVariables>;
    onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
    onSuccess?: (
      data: TData,
      variables: TVariables,
      context: TContext
    ) => Promise<unknown> | unknown;
    onError?: (
      error: TError,
      variables: TVariables,
      context: TContext | undefined
    ) => Promise<unknown> | unknown;
    onSettled?: (
      data: TData | undefined,
      error: TError | null,
      variables: TVariables,
      context: TContext | undefined
    ) => Promise<unknown> | unknown;
  }

  export type QueryFunction<
    T = unknown,
    TQueryKey extends QueryKey = QueryKey
  > = (context: QueryFunctionContext<TQueryKey>) => T | Promise<T>;

  export type MutationFunction<TData, TVariables> = (
    variables: TVariables
  ) => Promise<TData>;

  export type QueryKey = readonly unknown[];

  export interface QueryFunctionContext<TQueryKey extends QueryKey = QueryKey> {
    queryKey: TQueryKey;
    signal: AbortSignal;
  }
}
