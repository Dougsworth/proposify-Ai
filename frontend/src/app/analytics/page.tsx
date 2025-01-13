"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Activity,
  TrendingUp,
  Users,
  Sparkles,
  Clock,
  Target,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Proposal {
  id: number;
  title: string;
  updatedAt: string;
  createdAt: string;
}

const AnalyticsPage = () => {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month"); // week, month, year

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch proposals");
        const data = await response.json();
        setProposals(data);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [router]);

  // Enhanced metrics calculations
  const totalProposals = proposals.length;
  const completedProposals = proposals.filter(
    (p) => p.updatedAt !== p.createdAt
  ).length;
  const completionRate = totalProposals
    ? ((completedProposals / totalProposals) * 100).toFixed(1)
    : "0";

  // Calculate average time to completion
  const getAverageCompletionTime = () => {
    const completedProps = proposals.filter((p) => p.updatedAt !== p.createdAt);
    const avgTime =
      completedProps.reduce((acc, prop) => {
        const created = new Date(prop.createdAt);
        const updated = new Date(prop.updatedAt);
        return acc + (updated.getTime() - created.getTime());
      }, 0) / completedProps.length;

    return isNaN(avgTime) ? 0 : Math.round(avgTime / (1000 * 60 * 60 * 24)); // Convert to days
  };

  // Calculate proposal velocity (proposals per week)
  const getProposalVelocity = () => {
    if (proposals.length < 2) return 0;
    const firstDate = new Date(proposals[proposals.length - 1].createdAt);
    const lastDate = new Date(proposals[0].createdAt);
    const weeks = Math.max(
      1,
      Math.ceil(
        (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
      )
    );
    return (proposals.length / weeks).toFixed(1);
  };

  // Prepare chart data
  const getProposalsByPeriod = () => {
    const periodData: { [key: string]: number } = {};

    proposals.forEach((proposal) => {
      const date = new Date(proposal.createdAt);
      let periodKey;

      if (timeframe === "week") {
        const weekNumber = Math.ceil(
          (date.getDate() + firstDayOfMonth(date).getDay()) / 7
        );
        periodKey = `Week ${weekNumber}`;
      } else if (timeframe === "month") {
        periodKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
      } else {
        periodKey = date.getFullYear().toString();
      }

      periodData[periodKey] = (periodData[periodKey] || 0) + 1;
    });

    return Object.entries(periodData)
      .map(([period, count]) => ({
        period: timeframe === "month" ? period.split("-")[1] : period,
        proposals: count,
      }))
      .sort((a, b) =>
        timeframe === "week"
          ? parseInt(a.period.split(" ")[1]) - parseInt(b.period.split(" ")[1])
          : parseInt(a.period) - parseInt(b.period)
      );
  };

  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

  // Distribution by completion time
  const getCompletionTimeDistribution = () => {
    const completed = proposals.filter((p) => p.updatedAt !== p.createdAt);
    const distribution = completed.reduce(
      (acc: { [key: string]: number }, prop) => {
        const days = Math.floor(
          (new Date(prop.updatedAt).getTime() -
            new Date(prop.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const category =
          days <= 1
            ? "1 day"
            : days <= 3
            ? "2-3 days"
            : days <= 7
            ? "4-7 days"
            : "1+ week";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {}
    );

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const chartData = getProposalsByPeriod();
  const completionDistribution = getCompletionTimeDistribution();

  // Calculate growth
  const calculateGrowth = () => {
    if (chartData.length < 2) return "0";
    const lastPeriod = chartData[chartData.length - 1].proposals;
    const previousPeriod = chartData[chartData.length - 2].proposals;
    if (!previousPeriod) return "0";
    return (((lastPeriod - previousPeriod) / previousPeriod) * 100).toFixed(1);
  };

  const periodGrowth = calculateGrowth();
  const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 space-y-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
          </div>
          <div className="flex gap-2">
            {["week", "month", "year"].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeframe === period
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  title: "Total Proposals",
                  value: totalProposals,
                  subtext: `${periodGrowth}% from last ${timeframe}`,
                  icon: BarChart,
                },
                {
                  title: "Completion Rate",
                  value: `${completionRate}%`,
                  subtext: `${completedProposals} completed proposals`,
                  icon: Activity,
                },
                {
                  title: "Avg. Completion Time",
                  value: `${getAverageCompletionTime()} days`,
                  subtext: "From creation to completion",
                  icon: Clock,
                },
                {
                  title: "Proposal Velocity",
                  value: `${getProposalVelocity()}/week`,
                  subtext: "Average proposals per week",
                  icon: TrendingUp,
                },
              ].map((metric, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex flex-row items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      {metric.title}
                    </h3>
                    <metric.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </div>
                  <p className="text-xs text-blue-600">{metric.subtext}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Main Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Proposal Activity
                </h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="period"
                        tickFormatter={(value) => {
                          if (timeframe === "month") {
                            const months = [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "May",
                              "Jun",
                              "Jul",
                              "Aug",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dec",
                            ];
                            return months[parseInt(value) - 1];
                          }
                          return value;
                        }}
                        stroke="#374151"
                      />
                      <YAxis stroke="#374151" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="proposals"
                        stroke="#2563eb"
                        fill="#93c5fd"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Completion Time Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Completion Time Distribution
                </h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {completionDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
