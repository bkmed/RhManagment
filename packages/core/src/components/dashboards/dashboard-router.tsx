"use client"

import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { EmployeeDashboard } from "./employee-dashboard"
import { AdvisorDashboard } from "./advisor-dashboard"
import { AdminDashboard } from "./admin-dashboard"
import { Error403 } from "../error-pages/error-403"

interface DashboardRouterProps {
  onNavigate: (screen: string, params?: any) => void
}

export const DashboardRouter = ({ onNavigate }: DashboardRouterProps) => {
  const { user } = useSelector((state: RootState) => state.auth)

  if (!user) {
    return <Error403 onGoHome={() => onNavigate("Login")} />
  }

  switch (user.role) {
    case "employee":
      return <EmployeeDashboard onNavigate={onNavigate} />
    case "advisor":
      return <AdvisorDashboard onNavigate={onNavigate} />
    case "admin":
      return <AdminDashboard onNavigate={onNavigate} />
    default:
      return <Error403 onGoHome={() => onNavigate("Login")} />
  }
}
