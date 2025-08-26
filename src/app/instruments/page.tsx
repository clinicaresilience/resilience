import { createClient } from "@/server/utils/supabase/server";
export const revalidate = 0;
export default async function Instruments() {
  const supabase = await createClient();
  const { data: instruments } = await supabase
    .from("instruments")
    .select("id, name");
  console.log("Instruments data:", instruments);

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}
