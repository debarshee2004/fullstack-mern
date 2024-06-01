import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({});

// How to wrap the app in the main function
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>;
