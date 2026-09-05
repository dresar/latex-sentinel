import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useMeasurements } from "@/hooks/use-measurements";
import { classifyLatex, type StatusColor } from "@/lib/latex-utils";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

function statusToColor(status: string): StatusColor {
  if (status === "Mutu Prima") return "success";
  if (status === "Mutu Rendah (Asam)") return "danger";
  return "warning";
}

const Measurements = () => {
  const { data: allData, loading } = useMeasurements();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return allData.filter((d) => {
      const matchSearch = d.owner_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allData, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Pengukuran</h1>
          <p className="text-sm text-muted-foreground">Data lengkap pengukuran kualitas lateks</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama pemilik..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Mutu Prima">Mutu Prima</SelectItem>
              <SelectItem value="Mutu Rendah (Asam)">Mutu Rendah</SelectItem>
              <SelectItem value="Terawetkan (Amonia)">Terawetkan</SelectItem>
              <SelectItem value="Indikasi Oplos Air">Oplos Air</SelectItem>
              <SelectItem value="Indikasi Kontaminasi">Kontaminasi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left font-medium text-muted-foreground">#</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Pemilik</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">pH</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">TDS</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Suhu</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Lokasi</th>
                    <th className="p-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => (
                    <tr key={m.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3 font-medium">{m.owner_name}</td>
                      <td className="p-3 font-mono">{m.ph_value}</td>
                      <td className="p-3 font-mono">{m.tds_value}</td>
                      <td className="p-3 font-mono">{m.temperature}°C</td>
                      <td className="p-3"><StatusBadge status={m.status} color={statusToColor(m.status)} /></td>
                      <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{m.latitude?.toFixed(4)}, {m.longitude?.toFixed(4)}</td>
                      <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{new Date(m.created_at).toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Tidak ada data yang cocok</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Measurements;
