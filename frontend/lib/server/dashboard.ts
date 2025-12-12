import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api/client";

export interface DashboardData {
  activeEmployeesCount: number;
  activeEmployeesPercentChange?: number | null;
  activeEmployeesIsPositive?: boolean | null;
  documentsCount: number;
  userGroups: string[] | null;
}

export async function getDashboardData(): Promise<DashboardData> {
  const cookieHeader = cookies().toString();

  const employeesReq = fetch(`${API_BASE_URL}/api/metrics/active-employees/`);
  const docsReq = fetch(`${API_BASE_URL}/api/metrics/documents-count/`);
  const userReq = fetch(`${API_BASE_URL}/api/auth/me/`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  const [employeesRes, docsRes, userRes] = await Promise.all([
    employeesReq,
    docsReq,
    userReq.catch(() => null),
  ]);

  let activeEmployeesCount = 0;
  let activeEmployeesPercentChange: number | null = null;
  let activeEmployeesIsPositive: boolean | null = null;
  let documentsCount = 0;
  let userGroups: string[] | null = null;

  try {
    if (employeesRes && employeesRes.ok) {
      const data = await employeesRes.json();
      activeEmployeesCount = data?.count ?? 0;
      activeEmployeesPercentChange = data?.percent_change ?? null;
      activeEmployeesIsPositive =
        typeof data?.is_positive === "boolean" ? data.is_positive : null;
    }
  } catch (e) {
    // swallow
  }

  try {
    if (docsRes && docsRes.ok) {
      const data = await docsRes.json();
      documentsCount = data?.count ?? 0;
    }
  } catch (e) {
    // swallow
  }

  try {
    if (userRes && userRes.ok) {
      const data = await userRes.json();
      userGroups = data?.user?.groups ?? null;
    }
  } catch (e) {
    userGroups = null;
  }

  return {
    activeEmployeesCount,
    activeEmployeesPercentChange,
    activeEmployeesIsPositive,
    documentsCount,
    userGroups,
  };
}
