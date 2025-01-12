"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { PDFDocument, rgb } from "pdf-lib";
import { jsPDF } from "jspdf";

import {
  Save,
  PlusCircle,
  Trash2,
  Wand2,
  GripVertical,
  ChevronLeft,
  FileText,
  Settings,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";

// Types
interface Section {
  id?: number | string;
  title: string;
  content: string;
  order: number;
  type: "text" | "list" | "image";
}

interface Proposal {
  id: number;
  title: string;
  sections: Section[];
}

// Section Type Icons
const SectionTypeIcons = {
  text: <FileText />,
  list: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  image: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
};

export default function ProposalEditorV2() {
  const router = useRouter();
  const params = useParams();

  // State Management
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSectionTypes, setShowSectionTypes] = useState(false);
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<
    number | null
  >(null);

  // Fetch Proposal Data
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const proposalId = params.id as string;
        const response = await fetch(
          `http://localhost:3000/api/proposal/${proposalId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch proposal");
        }

        const data = await response.json();
        const sortedSections = [...data.sections].sort(
          (a, b) => a.order - b.order
        );
        setProposal({ ...data, sections: sortedSections });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching proposal:", err);
        setError("Failed to load proposal");
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProposal();
    }
  }, [params.id, router]);

  // Save Proposal
  const handleSaveProposal = useCallback(async () => {
    if (!proposal) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/proposal/${proposal.id}/sections`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sections: proposal.sections.map((section) => ({
              id: section.id,
              title: section.title,
              content: section.content,
              order: section.order,
              type: section.type,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save proposal: ${response.statusText}`);
      }

      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg";
      successMessage.textContent = "Proposal saved successfully!";
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
      console.error("Error saving proposal:", error);
      setError("Failed to save proposal");

      // Show error message
      const errorMessage = document.createElement("div");
      errorMessage.className =
        "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg";
      errorMessage.textContent = "Failed to save proposal. Please try again.";
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    } finally {
      setSaving(false);
    }
  }, [proposal]);

  // Export to PDF
  const handleExportPDF = async () => {
    if (!proposal) return;

    try {
      // Create new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(24);
      doc.text(proposal.title, 20, 20);

      // Add sections
      let yPosition = 40;
      proposal.sections.forEach((section) => {
        // Add section title
        doc.setFontSize(16);
        doc.text(section.title, 20, yPosition);
        yPosition += 10;

        // Add section content
        doc.setFontSize(12);
        const contentLines = doc.splitTextToSize(section.content, 170); // Split text to fit page width
        doc.text(contentLines, 20, yPosition);
        yPosition += 10 * contentLines.length + 20;

        // Add new page if needed
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Save the PDF
      doc.save(`${proposal.title.replace(/\s+/g, "_")}.pdf`);

      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg";
      successMessage.textContent = "PDF exported successfully!";
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
      console.error("Error exporting PDF:", error);

      // Show error message
      const errorMessage = document.createElement("div");
      errorMessage.className =
        "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg";
      errorMessage.textContent = "Failed to export PDF. Please try again.";
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    }
  };
  // Update Section
  const updateSection = (index: number, updates: Partial<Section>) => {
    if (!proposal) return;

    const updatedSections = [...proposal.sections];
    updatedSections[index] = { ...updatedSections[index], ...updates };

    setProposal({ ...proposal, sections: updatedSections });
  };

  // Add Section
  const addSection = (type: Section["type"] = "text") => {
    if (!proposal) return;

    const newSection: Section = {
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content:
        type === "text"
          ? "Start typing your section content..."
          : type === "list"
          ? "- Item 1\n- Item 2\n- Item 3"
          : "Add image URL or upload",
      order: proposal.sections.length,
      type,
    };

    setProposal({
      ...proposal,
      sections: [...proposal.sections, newSection],
    });
    setShowSectionTypes(false);
  };

  // Remove Section
  const removeSection = (index: number) => {
    if (!proposal || proposal.sections.length <= 1) return;

    const updatedSections = proposal.sections.filter((_, i) => i !== index);
    setProposal({ ...proposal, sections: updatedSections });
  };

  // Drag and Drop Handler
  const onDragEnd = (result: any) => {
    if (!result.destination || !proposal) return;

    const reorderedSections = Array.from(proposal.sections);
    const [reorderedItem] = reorderedSections.splice(result.source.index, 1);
    reorderedSections.splice(result.destination.index, 0, reorderedItem);

    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      order: index,
    }));

    setProposal({ ...proposal, sections: updatedSections });
  };

  // Loading and Error States
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error || "Proposal not found"}
          </h2>
          <button
            onClick={() => router.push("/proposals")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Proposals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/proposals")}
              className="hover:bg-white/20 p-2 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Edit Proposal</h1>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowSectionTypes(!showSectionTypes)}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Section</span>
              </button>
              {showSectionTypes && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-50 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden"
                >
                  {(["text", "list", "image"] as Section["type"][]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => addSection(type)}
                        className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-blue-50 transition"
                      >
                        {SectionTypeIcons[type]}
                        <span className="capitalize">{type} Section</span>
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </div>
            {/* Save Button */}

            <button
              onClick={handleSaveProposal}
              disabled={saving}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>
            {/* Export to PDF Button */}
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <FileText className="w-5 h-5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Proposal Content */}
        <div className="p-8">
          {/* Proposal Title */}
          <input
            type="text"
            value={proposal.title}
            onChange={(e) =>
              setProposal({ ...proposal, title: e.target.value })
            }
            className="w-full text-3xl font-bold text-gray-800 border-b-2 border-transparent focus:border-blue-500 focus:outline-none pb-2 mb-8"
            placeholder="Proposal Title"
          />

          {/* Drag and Drop Sections */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-6"
                >
                  {proposal.sections.map((section: Section, index: number) => (
                    <Draggable
                      key={section.id || `section-${index}`}
                      draggableId={`section-${section.id || index}`}
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white shadow-md rounded-xl p-6 relative group"
                        >
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="absolute top-4 left-4 cursor-move text-gray-400 hover:text-gray-600"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>

                          {/* Section Header */}
                          <div className="pl-8 mb-4 flex justify-between items-center">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) =>
                                updateSection(index, { title: e.target.value })
                              }
                              className="text-xl font-semibold text-gray-800 w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                              placeholder="Section Title"
                            />

                            {/* Section Type and Remove Button */}
                            <div className="flex items-center space-x-2">
                              <div className="text-gray-500">
                                {SectionTypeIcons[section.type]}
                              </div>
                              {proposal.sections.length > 1 && (
                                <button
                                  onClick={() => removeSection(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Section Content */}
                          <div className="pl-8">
                            <textarea
                              value={section.content}
                              onChange={(e) =>
                                updateSection(index, {
                                  content: e.target.value,
                                })
                              }
                              className="w-full min-h-[200px] bg-gray-50 p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Start typing your section content..."
                            />

                            {/* AI Assistant Button */}
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => {
                                  setSelectedSectionIndex(index);
                                  setAIAssistantOpen(true);
                                }}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
                              >
                                <Wand2 className="w-5 h-5" />
                                <span>AI Assistant</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </motion.div>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {aiAssistantOpen && selectedSectionIndex !== null && proposal && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 w-96 h-full bg-white shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">AI Assistant</h2>
              <button
                onClick={() => setAIAssistantOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Editing: {proposal.sections[selectedSectionIndex].title}
              </h3>
              <div className="space-y-4">
                <button className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left flex items-center">
                  <Wand2 className="mr-3 text-blue-600" />
                  Improve Clarity
                </button>
                <button className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left flex items-center">
                  <Settings className="mr-3 text-green-600" />
                  Expand Content
                </button>
                <button className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left flex items-center">
                  <FileText className="mr-3 text-purple-600" />
                  Summarize
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
