import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getWorkspace, type Workspace } from "@/lib/school/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type SchoolContextValue = {
  workspace: Workspace | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  yearId: string | null;
  setYearId: (id: string) => void;
  schoolId: string | null;
  setSchoolId: (id: string) => void;
};

const SchoolContext = createContext<SchoolContextValue | null>(null);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const client = useQueryClient();
  const [schoolId, setSchoolIdState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [yearId, setYearIdState] = useState<string | null>(null);

  useEffect(() => {
    setSchoolIdState(localStorage.getItem("gep-school"));
    setReady(true);
  }, []);

  const query = useQuery({
    queryKey: ["workspace", user?.id, schoolId],
    enabled: Boolean(user) && ready,
    queryFn: () => getWorkspace({ data: { schoolId } }),
  });

  useEffect(() => {
    const data = query.data;
    if (!data) return;
    localStorage.setItem("gep-school", data.school.id);
    const stored = localStorage.getItem(`gep-year-${data.school.id}`);
    const active = data.years.find((year) => year.active)?.id ?? data.years[0]?.id ?? null;
    const next = stored && data.years.some((year) => year.id === stored) ? stored : active;
    setYearIdState(next);
  }, [query.data]);

  function setYearId(id: string) {
    setYearIdState(id);
    if (query.data) localStorage.setItem(`gep-year-${query.data.school.id}`, id);
  }

  function setSchoolId(id: string) {
    localStorage.setItem("gep-school", id);
    setSchoolIdState(id);
  }

  return (
    <SchoolContext.Provider
      value={{
        workspace: query.data ?? null,
        loading: !ready || query.isLoading,
        error: query.error instanceof Error ? query.error.message : query.error ? "Falha ao carregar a escola." : null,
        refresh: async () => {
          await client.invalidateQueries({ queryKey: ["workspace"] });
        },
        yearId,
        setYearId,
        schoolId: query.data?.school.id ?? schoolId,
        setSchoolId,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const value = useContext(SchoolContext);
  if (!value) throw new Error("Escola indisponível neste ponto da tela.");
  return value;
}
