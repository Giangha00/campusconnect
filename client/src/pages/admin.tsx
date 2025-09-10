import { useMemo, useState } from "react";
import eventsData from "@/data/events.json";
import { Event } from "@/types/event";
import { useUser } from "@/contexts/user-context";
import { useRegistration } from "@/contexts/registration-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, EyeOff, Users } from "lucide-react";

export default function AdminPage() {
  const { user } = useUser();
  const { getRegistrationsByEvent, getRegistrationCount } = useRegistration();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const isAdmin = user && user.role === "faculty"; // simple guard

  const events = useMemo(() => {
    const list = eventsData as Event[];
    if (!query.trim()) return list;
    const q = query.toLowerCase().trim();
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isAdmin) {
    return (
      <div className="pt-20 max-w-3xl mx-auto px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
            <p className="text-muted-foreground">
              Trang này chỉ dành cho Giảng viên/Khoa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const exportCSV = (eventId: number) => {
    const regs = getRegistrationsByEvent(eventId);
    const headers = [
      "eventId",
      "userId",
      "name",
      "role",
      "department",
      "registeredAt",
    ];
    const rows = regs.map((r) => [
      r.eventId,
      r.userId,
      r.name,
      r.role,
      r.department || "",
      r.registeredAt,
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-event-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bảng điều khiển Admin</h1>
        <p className="text-muted-foreground">
          Quản lý sự kiện và xem danh sách người đăng ký
        </p>
      </div>

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Tìm kiếm sự kiện..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="input-admin-search"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(events as Event[]).map((event) => {
          const count = getRegistrationCount(event.id);
          const isOpen = !!expanded[event.id];
          const registrations = isOpen ? getRegistrationsByEvent(event.id) : [];
          return (
            <Card key={event.id} data-testid={`card-admin-event-${event.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{event.name}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {event.date} • {event.venue}
                    </div>
                    <div className="mt-2 flex gap-2 items-center text-sm">
                      <Badge>{event.category}</Badge>
                      {event.registrationRequired && (
                        <Badge variant="outline">Yêu cầu đăng ký</Badge>
                      )}
                      {typeof event.capacity === "number" && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" /> {count}/{event.capacity}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      title={isOpen ? "Ẩn danh sách" : "Xem danh sách"}
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [event.id]: !prev[event.id],
                        }))
                      }
                      data-testid={`button-toggle-registrants-${event.id}`}
                    >
                      {isOpen ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Xuất danh sách CSV"
                      onClick={() => exportCSV(event.id)}
                      data-testid={`button-export-csv-${event.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div
                    className="mt-4 border-t pt-4 space-y-3"
                    data-testid={`section-registrants-${event.id}`}
                  >
                    {registrations.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Chưa có người đăng ký
                      </div>
                    ) : (
                      registrations.map((r) => (
                        <div
                          key={r.userId}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-muted-foreground">
                              {r.role}
                              {r.department ? ` • ${r.department}` : ""}
                            </div>
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(r.registeredAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
