import { TextAnimate } from "@/components/magicui/text-animate";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip as RechartsTooltip } from "recharts";
import React from "react";

const chartData = [
  { year: "2020", positions: 271816, applicants: 400000 },
  { year: "2021", positions: 298850, applicants: 600000 },
  { year: "2022", positions: 315030, applicants: 900000 },
  { year: "2023", positions: 298850, applicants: 1300000 },
  { year: "2024", positions: 298850, applicants: 1900000 },
  { year: "2025", positions: 500000, applicants: 2700000 },
];

// Custom tooltip for the AreaChart
function CustomChartTooltip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  const platform = payload.find((p: any) => p.dataKey === "platform");
  const coldEmail = payload.find((p: any) => p.dataKey === "coldEmail");
  return (
    <div className="rounded-xl border border-gray-200 bg-white/90 px-4 py-2 shadow-xl text-sm text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-100">
      <div className="font-semibold mb-1">{label}</div>
      <div className="flex flex-col gap-1">
        {platform && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }} />
            <span>Via ResDex:</span>
            <span className="font-bold">{platform.value}</span>
          </div>
        )}
        {coldEmail && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#e5e5e5', border: '1px solid #bdbdbd' }} />
            <span>Cold Email:</span>
            <span className="font-bold">{coldEmail.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChartCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 w-full max-w-md flex flex-col">
      <div className="mb-2">
        <TextAnimate
          animation="fadeIn"
          by="line"
          as="div"
          className="text-lg font-semibold"
        >
          {`Research Positions vs. Applicants`}
        </TextAnimate>
        <TextAnimate
          animation="fadeIn"
          by="word"
          as="div"
          className="text-gray-500 text-sm"
          delay={0.2}
        >
          {`2020 - 2025`}
        </TextAnimate>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[220px]">
        <AreaChart
          width={320}
          height={160}
          data={chartData}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} stroke="#ececec" />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <RechartsTooltip content={({ active, payload, label }: any) => {
            if (!active || !payload || !payload.length) return null;
            const positions = payload.find((p: any) => p.dataKey === "positions");
            const applicants = payload.find((p: any) => p.dataKey === "applicants");
            return (
              <div className="rounded-xl border border-gray-200 bg-white/90 px-4 py-2 shadow-xl text-sm text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-100">
                <div className="font-semibold mb-1">{label}</div>
                <div className="flex flex-col gap-1">
                  {applicants && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }} />
                      <span>Applicants:</span>
                      <span className="font-bold">{applicants.value.toLocaleString()}+</span>
                    </div>
                  )}
                  {positions && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#bdbdbd', border: '1px solid #bdbdbd' }} />
                      <span>Positions:</span>
                      <span className="font-bold">{positions.value.toLocaleString()}+</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }} />
          <Area
            dataKey="positions"
            name="Positions"
            type="natural"
            fill="#bdbdbd"
            fillOpacity={0.8}
            stroke="#bdbdbd"
            stackId="a"
          />
          <Area
            dataKey="applicants"
            name="Applicants"
            type="natural"
            fill="#f5f5f5"
            fillOpacity={0.8}
            stroke="#f5f5f5"
            stackId="a"
          />
        </AreaChart>
      </div>
      <div className="mt-4">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              No. of Applicants up 675% since 2020<TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-400">
              2020 - Present
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 