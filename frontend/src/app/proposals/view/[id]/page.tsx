"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, FileText } from "lucide-react";

interface Section {
  id?: number | string;
  title: string;
  content: string;
  type: "text" | "list" | "image";
}

interface Proposal {
  id: number;
  title: string;
  sections: Section[];
}

export default function ProposalView() {
  const router = useRouter();
  const params = useParams();
  const [proposal, setProposal] = React.useState<Proposal | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProposal = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:3000/api/proposal/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch proposal");

        const data = await response.json();
        setProposal(data);
      } catch (error) {
        console.error("Error fetching proposal:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProposal();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Found</h2>
          <p className="text-gray-600 mb-4">
            This proposal could not be found.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Proposals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Proposals
          </button>
          <button
            onClick={() => router.push(`/proposals/edit/${proposal.id}`)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit Proposal
          </button>
        </div>
      </div>

      {/* Document View */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg">
          {/* Document Header */}
          <div className="p-8 border-b">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {proposal.title}
            </h1>
          </div>

          {/* Document Sections */}
          <div className="p-8">
            {proposal.sections.map((section, index) => (
              <div key={section.id || index} className="mb-8 last:mb-0">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {section.title}
                </h2>
                <div className="prose max-w-none">
                  {section.type === "list" ? (
                    <ul className="list-disc pl-4">
                      {section.content.split("\n").map((item, i) => (
                        <li key={i} className="mb-2">
                          {item.replace(/^[->•\s]+/, "")}
                        </li>
                      ))}
                    </ul>
                  ) : section.type === "image" ? (
                    <div className="my-4">
                      <img
                        src={section.content}
                        alt={section.title}
                        className="max-w-full rounded-lg shadow-md"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {section.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
