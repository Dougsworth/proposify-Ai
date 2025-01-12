"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, FileText, ChevronRight, BarChart2 } from "lucide-react";

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
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (proposal: Proposal) => {
    return proposal.updatedAt !== proposal.createdAt ? "Complete" : "Draft";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-800">
                ProposifyAI
              </h1>
            </div>
            <div>
              <Link href="http://localhost:3001/proposals/create">
                <button className="flex items-center px-6 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  New Proposal
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Analytics Section */}
      <section className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <BarChart2 className="w-8 h-8 text-blue-500 mx-auto" />
            <h3 className="mt-2 text-lg font-semibold">Total Proposals</h3>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? "..." : proposals.length}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <BarChart2 className="w-8 h-8 text-green-500 mx-auto" />
            <h3 className="mt-2 text-lg font-semibold">Completed Proposals</h3>
            <p className="text-2xl font-bold text-gray-800">
              {loading
                ? "..."
                : proposals.filter(
                    (proposal) => proposal.updatedAt !== proposal.createdAt
                  ).length}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <BarChart2 className="w-8 h-8 text-yellow-500 mx-auto" />
            <h3 className="mt-2 text-lg font-semibold">Draft Proposals</h3>
            <p className="text-2xl font-bold text-gray-800">
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
        <header className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Welcome back!</h2>
          <p className="mt-2 text-lg text-gray-600">
            Manage and track all your business proposals in one place.
          </p>
        </header>

        <section className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-8">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-800">
                  No proposals yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Start creating your first proposal now.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Edited
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proposals.map((proposal) => (
                      <tr
                        key={proposal.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-800">
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
                          <button
                            onClick={() =>
                              router.push(`/proposals/edit/${proposal.id}`)
                            }
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            Edit
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
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

      {/* Footer */}
      {/* <footer className="bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            © 2025 ProposifyAI. All rights reserved.
          </p>
        </div>
      </footer> */}
    </div>
  );
}
