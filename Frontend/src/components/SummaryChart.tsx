"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { getBudgetStatus, getFinancialSummary } from "../lib/api";

type FinancialSummary = {
  total_income: number;
  total_expenses: number;
  balance: number;
};

type BudgetStatusItem = {
  category: string;
  budgeted_amount: number;
  actual_amount: number;
  remaining: number;
  period: string;
};

interface SummaryChartProps {
  width?: number;
  height?: number;
}

export default function SummaryChart({
  width = 520,
  height = 320,
}: SummaryChartProps) {
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetStatusItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getBudgetStatus(), getFinancialSummary()])
      .then(([budgetRes, financialRes]) => {
        if (!mounted) return;
        const items: BudgetStatusItem[] = budgetRes?.budget_status || [];
        const monthly = items.filter((d) =>
          (d.period || "").toLowerCase().includes("month")
        );
        setBudgetData(monthly);
        setFinancialSummary(financialRes as FinancialSummary);
        setError(null);
      })
      .catch((e) => {
        setError("Failed to load financial summary");
        // eslint-disable-next-line no-console
        console.error(e);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalBudget = budgetData.reduce(
      (acc, d) => acc + (d.budgeted_amount || 0),
      0
    );
    const totalActual = budgetData.reduce(
      (acc, d) => acc + (d.actual_amount || 0),
      0
    );
    const remaining = Math.max(0, totalBudget - totalActual);
    const utilization = totalBudget > 0 ? totalActual / totalBudget : 0;
    return { totalBudget, totalActual, remaining, utilization };
  }, [budgetData]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 12;
    const inner = radius * 0.7;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${cx},${cy})`);

    // Soothing tones
    const trackColor = "#e5e7eb"; // gray-200
    const green = "#34d399"; // emerald-400
    const yellow = "#fbbf24"; // amber-400
    const red = "#f87171"; // red-400

    const utilization = totals.utilization;
    const color = utilization <= 0.8 ? green : utilization <= 1 ? yellow : red;

    // Angles for full circle gauge
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI * 1.5; // full circle ending at 270deg
    const progressEnd = startAngle + Math.min(utilization, 1) * (Math.PI * 2);

    const arc = d3.arc().innerRadius(inner).outerRadius(radius);

    // Track
    g.append("path")
      .attr("d", arc({ startAngle, endAngle } as any)!)
      .attr("fill", trackColor);

    // Progress
    g.append("path")
      .attr("d", arc({ startAngle, endAngle: progressEnd } as any) as string)
      .attr("fill", color);

    // Center labels
    const centerGroup = g.append("g");
    centerGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -4)
      .attr("font-size", 18)
      .attr("font-weight", 700)
      .attr("fill", "#111827")
      .text(
        `${formatCurrency(totals.totalActual)} / ${formatCurrency(
          totals.totalBudget
        )}`
      );
    centerGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 18)
      .attr("font-size", 12)
      .attr("fill", "#6b7280")
      .text(
        totals.totalBudget > 0
          ? `${(Math.min(utilization, 1) * 100).toFixed(
              0
            )}% used • ${formatCurrency(totals.remaining)} left`
          : "No monthly budget"
      );
  }, [totals, width, height]);

  if (loading) {
    return <div className="text-muted text-sm">Loading summary…</div>;
  }

  if (error) {
    return <div className="text-error text-sm">{error}</div>;
  }

  return (
    <div className="chart-flex">
      <div className="chart-area">
        <svg ref={svgRef} width={width} height={height} />
      </div>
      <div className="kpi-grid">
        <KpiCard
          label="Total Income"
          value={formatCurrency(financialSummary?.total_income || 0)}
          className="kpi-success"
        />
        <KpiCard
          label="Total Expenses"
          value={formatCurrency(financialSummary?.total_expenses || 0)}
          className="kpi-danger"
        />
        <KpiCard
          label="Balance"
          value={formatCurrency(financialSummary?.balance || 0)}
          className="kpi-info"
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${className}`}>{value}</div>
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
