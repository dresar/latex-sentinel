import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { classifyLatex } from "@/lib/latex-utils";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Measurement = Tables<"latex_measurements">;

export function useMeasurements() {
  const [data, setData] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: rows, error } = await supabase
      .from("latex_measurements")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && rows) setData(rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("latex_measurements_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "latex_measurements" },
        (payload: RealtimePostgresChangesPayload<Measurement>) => {
          if (payload.eventType === "INSERT") {
            setData((prev) => [payload.new as Measurement, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setData((prev) => prev.map((m) => m.id === (payload.new as Measurement).id ? (payload.new as Measurement) : m));
          } else if (payload.eventType === "DELETE") {
            setData((prev) => prev.filter((m) => m.id !== (payload.old as Measurement).id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { data, loading, refetch: fetchData };
}

export function useInsertMeasurement() {
  const insert = async (params: {
    ownerName: string;
    ph: number;
    tds: number;
    temperature: number;
    latitude?: number;
    longitude?: number;
    userId?: string;
  }) => {
    const { status } = classifyLatex(params.ph, params.tds);

    const { error } = await supabase.from("latex_measurements").insert({
      owner_name: params.ownerName,
      ph_value: params.ph,
      tds_value: params.tds,
      temperature: params.temperature,
      status,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      user_id: params.userId ?? null,
    });

    return { error };
  };

  return { insert };
}
