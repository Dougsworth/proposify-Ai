"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ChevronRight, BarChart2, Sparkles } from "lucide-react";
import Navigation from "../components/Navigation";

interface Proposal {
  id: number;
  title: string;
  updatedAt: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:3000/api/proposal", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch proposals");
        }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (proposal: Proposal) => {
    return proposal.updatedAt !== proposal.createdAt
      ? "bg-blue-100 text-blue-800"
      : "bg-blue-50 text-blue-600";
  };

  const getStatusText = (proposal: Proposal) => {
    return proposal.updatedAt !== proposal.createdAt ? "Complete" : "Draft";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />

      {/* Analytics Section */}
      <div className="pt-16">
        <section className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white shadow-sm rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <BarChart2 className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                Total Proposals
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? "..." : proposals.length}
              </p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <BarChart2 className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                Completed Proposals
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {loading
                  ? "..."
                  : proposals.filter(
                      (proposal) => proposal.updatedAt !== proposal.createdAt
                    ).length}
              </p>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <BarChart2 className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                Draft Proposals
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {loading
                  ? "..."
                  : proposals.filter(
                      (proposal) => proposal.updatedAt === proposal.createdAt
                    ).length}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <header className="flex items-center gap-3 mb-8">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back!
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Manage and track all your business proposals in one place.
              </p>
            </div>
          </header>

          <section className="bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow">
            <div className="px-6 py-8">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-blue-600" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No proposals yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Start creating your first proposal now.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Last Edited
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {proposals.map((proposal) => (
                        <tr
                          key={proposal.id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {proposal.title}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                proposal
                              )}`}
                            >
                              {getStatusText(proposal)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(proposal.updatedAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-4">
                              <button
                                onClick={() =>
                                  router.push(`/proposals/view/${proposal.id}`)
                                }
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                View
                                <FileText className="w-4 h-4 ml-1" />
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/proposals/edit/${proposal.id}`)
                                }
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                Edit
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
