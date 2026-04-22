import { createClient } from "@supabase/supabase-js";
import { NEXT_PUBLIC_SUPABASE_URL } from "@/lib/env/client-env";
import { SUPABASE_SERVICE_ROLE_KEY } from "@/lib/env/server-env";

export const createServiceClient = () =>
  createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
