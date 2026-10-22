import React, { useState } from "react";
import { 
  Lock, 
  UserCheck, 
  Code2, 
  CheckCircle2, 
  Scale, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Coins, 
  HelpCircle,
  ChevronDown
} from "lucide-react";

interface HowItWorksPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      num: "01",
      title: "Create Bounty & Fund Escrow",
      actor: "Client / Poster",
      desc: "The client specifies the title, requirements, deadline, and reward. When submitted, the ALGO funds are committed into a non-custodial Algorand smart contract account. The platform does not hold custody of user private keys.",
      icon: <Lock className="w-5 h-5 text-[#C6FF4D]" />,
    },
    {
      num: "02",
      title: "Contributors Submit Proposals",
      actor: "Verified Contributor",
      desc: "Developers and designers review the public requirements and submit structured applications including verified skills, delivery timeline, motivation, and optional Algorand payout wallet.",
      icon: <UserCheck className="w-5 h-5 text-[#C6FF4D]" />,
    },
    {
      num: "03",
      title: "Worker Assignment & In-Progress Lock",
      actor: "Client / Poster",
      desc: "The poster reviews all proposals and selects the best candidate. The smart contract transitions the bounty from 'Open' to 'Acquired', locking the selected contributor as the sole authorized payee.",
      icon: <Code2 className="w-5 h-5 text-[#C6FF4D]" />,
    },
    {
      num: "04",
      title: "Deliverable Review & Approval",
      actor: "Both Parties",
      desc: "The contributor delivers code or design assets. Upon verifying that deliverables satisfy the original requirements, the poster signs a release transaction, and the smart contract pays out the full ALGO amount.",
      icon: <CheckCircle2 className="w-5 h-5 text-[#10B981]" />,
    },
    {
      num: "05",
      title: "Impartial On-Chain Dispute Arbitration",
      actor: "Designated Arbitrators",
      desc: "If deliverables are not delivered or requirements are contested, either party can raise a dispute. Escrow funds freeze while verified arbitrators inspect verifiable evidence and execute an irreversible on-chain settlement.",
      icon: <Scale className="w-5 h-5 text-amber-400" />,
    },
  ];

  const faqs = [
    {
      q: "Can BountyVault administrators steal or confiscate escrowed funds?",
      a: "No. The smart escrow is non-custodial and governed by Algorand TEAL contract rules. Funds can only transition to the designated contributor via poster sign-off, return to the poster if cancelled, or be settled via on-chain arbitrator verdicts. Platform administrators have no private backdoor keys.",
    },
    {
      q: "What blockchain network does BountyVault run on?",
      a: "BountyVault connects to Algorand Testnet with instant (~3.3s) transaction finality and deterministic state verification. Transactions are signed using Pera Wallet or verified Algorand accounts.",
    },
    {
      q: "What happens if a poster ignores a completed submission?",
      a: "The contributor can trigger a dispute. Once a dispute is registered, an arbitrator reviews repository links, commit histories, and task requirements to award the funds to the contributor if deliverables are verified.",
    },
    {
      q: "Are there platform fees on payouts?",
      a: "In the current testnet release, BountyVault charges 0% platform commissions. Users only pay standard Algorand network fees (typically <0.001 ALGO per transaction).",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs font-mono text-[#C6FF4D]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC ESCROW ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F0]">
          How BountyVault Works
        </h1>
        <p className="text-sm sm:text-base text-[#9A9E98] leading-relaxed">
          Decentralized escrow removes payment counterparty risk. Understand every phase from initial contract deployment to verifiable milestone settlement.
        </p>
      </div>

      {/* Visual Step-by-Step Flow */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F0] text-center">
          The 5-Stage Trustless Lifecycle
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className={`bg-[#141715] border border-[#2B302B] rounded-xl p-6 space-y-4 relative ${
                idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#6B7068] font-bold">{s.num}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] border border-[#2B302B] text-[#9A9E98]">
                  {s.actor}
                </span>
              </div>

              <div className="w-10 h-10 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center">
                {s.icon}
              </div>

              <h3 className="font-bold text-base text-[#F5F5F0]">{s.title}</h3>
              <p className="text-xs text-[#9A9E98] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role Comparison Table */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-[#F5F5F0]">Role Matrix & Cryptographic Permissions</h3>
          <p className="text-xs text-[#9A9E98] mt-1">
            BountyVault enforces strict role-based access control backed by smart contract preconditions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#2B302B] bg-[#191D19] font-mono text-[11px] text-[#6B7068] uppercase">
                <th className="py-3 px-4">Capability</th>
                <th className="py-3 px-4 text-[#C6FF4D]">Client / Poster</th>
                <th className="py-3 px-4 text-[#10B981]">Contributor / Worker</th>
                <th className="py-3 px-4 text-amber-400">Arbitrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B302B] text-[#9A9E98]">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Create Bounty & Commit Escrow</td>
                <td className="py-3 px-4 text-[#10B981]">Authorized</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Submit Applications</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
                <td className="py-3 px-4 text-[#10B981]">Authorized</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Select Worker & Assign Task</td>
                <td className="py-3 px-4 text-[#10B981]">Authorized</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Release Escrow to Contributor</td>
                <td className="py-3 px-4 text-[#10B981]">Authorized</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Raise Escrow Dispute</td>
                <td className="py-3 px-4 text-[#10B981]">Authorized</td>
                <td className="py-3 px-4 text-[#10B981]">Authorized</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Deliver Irreversible Dispute Verdict</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
                <td className="py-3 px-4 text-[#6B7068]">No</td>
                <td className="py-3 px-4 text-[#10B981]">Authorized</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-[#F5F5F0] text-center mb-6">
          Frequently Answered Questions
        </h3>
        {faqs.map((f, i) => (
          <div
            key={i}
            className="rounded-xl bg-[#141715] border border-[#2B302B] overflow-hidden transition-colors"
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[#F5F5F0] hover:text-[#C6FF4D]"
            >
              <span>{f.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#6B7068] transition-transform ${
                  openFaq === i ? "rotate-180 text-[#C6FF4D]" : ""
                }`}
              />
            </button>
            {openFaq === i && (
              <div className="p-4 pt-0 text-xs text-[#9A9E98] leading-relaxed border-t border-[#2B302B]/50">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <button
          onClick={() => onNavigate("marketplace")}
          className="px-6 py-3 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider inline-flex items-center gap-2"
        >
          <span>Explore Verified Marketplace</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
};
