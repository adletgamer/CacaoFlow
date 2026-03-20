"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { CandidateCard } from "@/components/features/CandidateCard";
import { StatCard } from "@/components/features/StatCard";
import { mockCandidates } from "@/lib/mockData";
import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";

export default function FinancingReviewPage() {
  const totalEligible = mockCandidates.reduce((s, c) => s + c.eligibleAmount, 0);
  const totalApproved = mockCandidates.reduce((s, c) => s + c.approvedAmount, 0);

  return (
    <>
      <PageHeader title="Financing Review" description="Pre-approved financing candidates based on auditable claims" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BarChart3} title="Candidates" value={mockCandidates.length} subtitle="pre-approved plots" delay={0} />
        <StatCard icon={DollarSign} title="Eligible Total" value={`$${totalEligible.toLocaleString()}`} subtitle="combined eligible amount" delay={0.05} />
        <StatCard icon={TrendingUp} title="Approved Capital" value={`$${totalApproved.toLocaleString()}`} subtitle={`${Math.round(totalApproved/totalEligible*100)}% of total`} delay={0.1} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCandidates.map((candidate, i) => (
          <CandidateCard key={candidate.lotId} candidate={candidate} delay={i * 0.05} />
        ))}
      </div>
    </>
  );
}
