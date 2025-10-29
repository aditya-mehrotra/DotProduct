"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { getBudgetStatus } from "../lib/api";

type BudgetStatusItem = {
  category: string;
  budgeted_amount: number;
  actual_amount: number;
  remaining: number;
  period: string; // 'Monthly', 'Weekly', etc. (from get_period_display)
};

type PreparedDatum = {
  category: string;
  remaining: number;
  budget: number;
  actual: number;
};

interface BudgetVsActualChartProps {
  width?: number;
  height?: number;
}

export default function BudgetVsActualChart({
  width = 860,
  height = 360,
}: BudgetVsActualChartProps) {
  const [data, setData] = useState<BudgetStatusItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getBudgetStatus()
      .then((res) => {
        if (!mounted) return;
        const items: BudgetStatusItem[] = res?.budget_status || [];
        // Filter to Monthly budgets only
        const monthly = items.filter((d) =>
          (d.period || "").toLowerCase().includes("month")
        );
        setData(monthly);
        setError(null);
      })
      .catch((e) => {
        setError("Failed to load budget status");
        // eslint-disable-next-line no-console
        console.error(e);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const prepared = useMemo<PreparedDatum[]>(() => {
    // Diverging bar: remaining = budget - actual (can be negative)
    return data.map((d) => ({
      category: d.category || "Unknown",
      remaining: (d.budgeted_amount || 0) - (d.actual_amount || 0),
      budget: Math.max(0, d.budgeted_amount || 0),
      actual: Math.max(0, d.actual_amount || 0),
    }));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || prepared.length === 0) return;

    const margin = { top: 16, right: 16, bottom: 60, left: 64 };
    const innerWidth = Math.max(300, width - margin.left - margin.right);
    const innerHeight = Math.max(150, height - margin.top - margin.bottom);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const categories = prepared.map((d: PreparedDatum) => d.category);

    const x = d3
      .scaleBand()
      .domain(categories)
      .range([0, innerWidth])
      .padding(0.25);

    const maxAbs =
      d3.max(prepared, (d: PreparedDatum) => Math.abs(d.remaining)) || 0;
    const y = d3
      .scaleLinear()
      .domain([-maxAbs, maxAbs])
      .nice()
      .range([innerHeight, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("font-size", 11)
      .attr("fill", "#374151")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end");

    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickFormat(
            (v: number) => formatCompactCurrency(Number(v)) as unknown as string
          )
      )
      .selectAll("text")
      .attr("font-size", 11)
      .attr("fill", "#374151");

    // Zero line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 1);

    // Colors
    const posColor = "#34d399"; // green (soothing)
    const negColor = "#f87171"; // soft red

    // Bars per category (remaining)
    g.selectAll("rect.bar")
      .data(prepared)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d: PreparedDatum) => x(d.category) || 0)
      .attr("width", x.bandwidth())
      .attr("y", (d: PreparedDatum) =>
        d.remaining >= 0 ? y(d.remaining) : y(0)
      )
      .attr("height", (d: PreparedDatum) => Math.abs(y(d.remaining) - y(0)))
      .attr("rx", 3)
      .attr("fill", (d: PreparedDatum) =>
        d.remaining >= 0 ? posColor : negColor
      )
      .append("title")
      .text(
        (d: PreparedDatum) =>
          `${d.category}: ${
            d.remaining >= 0 ? "Remaining" : "Over"
          } ${formatCurrency(Math.abs(d.remaining))}\n` +
          `Budget: ${formatCurrency(d.budget)} • Actual: ${formatCurrency(
            d.actual
          )}`
      );
  }, [prepared, width, height]);

  if (loading) {
    return <div className="text-muted text-sm">Loading budget…</div>;
  }
  if (error) {
    return <div className="text-error text-sm">{error}</div>;
  }
  if (prepared.length === 0) {
    return <div className="text-info text-sm">No monthly budgets found.</div>;
  }

  return <svg ref={svgRef} width={width} height={height} />;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatCompactCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
  }).format(amount || 0);
}
