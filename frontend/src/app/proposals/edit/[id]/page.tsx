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
  RefreshCw,
} from "lucide-react";
import PDFExportModal from "../../../components/PDFExportModal";
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

interface PDFConfig {
  maxWidth: number;
  pageHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  spacing: {
    afterTitle: number;
    afterSection: number;
    lineHeight: number;
  };
}

interface Proposal {
  id: number;
  title: string;
  sections: Section[];
}
// Theme types and configurations
interface Theme {
  background: string;
  headerBg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
}

const themes: Record<string, Theme> = {
  light: {
    background: "bg-gray-50",
    headerBg: "bg-white",
    cardBg: "bg-white",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-600",
    accent: "text-blue-600 hover:text-blue-800",
    border: "border-gray-200",
  },
  dark: {
    background: "bg-gray-900",
    headerBg: "bg-gray-800",
    cardBg: "bg-gray-800",
    textPrimary: "text-white",
    textSecondary: "text-gray-300",
    accent: "text-blue-400 hover:text-blue-300",
    border: "border-gray-700",
  },
  sepia: {
    background: "bg-amber-50",
    headerBg: "bg-amber-100",
    cardBg: "bg-white",
    textPrimary: "text-amber-900",
    textSecondary: "text-amber-700",
    accent: "text-amber-800 hover:text-amber-900",
    border: "border-amber-200",
  },
  modern: {
    background: "bg-gradient-to-br from-blue-50 to-indigo-100",
    headerBg: "bg-white bg-opacity-90 backdrop-blur-sm",
    cardBg: "bg-white bg-opacity-90 backdrop-blur-sm",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-600",
    accent: "text-indigo-600 hover:text-indigo-800",
    border: "border-blue-100",
  },
};

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
  const [regeneratingSections, setRegeneratingSections] = useState<Set<number>>(
    new Set()
  );
  const router = useRouter();
  const params = useParams();
  const [currentTheme, setCurrentTheme] = useState<string>("light");
  const theme = themes[currentTheme];
  // State Management
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSectionTypes, setShowSectionTypes] = useState(false);
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false);
  const [pdfExportModalOpen, setPdfExportModalOpen] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
        const response = await fetch(`${BASE_URL}/api/proposal/${proposalId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

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

  const calculatePages = () => {
    if (!proposal) return [];

    const pages: Array<{
      content: Array<{ title: string; content: string }>;
      pageNumber: number;
    }> = [{ content: [], pageNumber: 1 }];

    let currentPage = 0;
    let contentHeight = 0;
    const PAGE_HEIGHT = 800; // Approximate height in pixels for preview

    // Add title to first page
    pages[0].content.push({ title: proposal.title, content: "" });
    contentHeight += 60; // Approximate height for title

    proposal.sections.forEach((section) => {
      // Approximate height calculation
      const sectionHeight = 40 + Math.ceil(section.content.length / 4); // Rough estimate

      if (contentHeight + sectionHeight > PAGE_HEIGHT) {
        // Create new page
        currentPage++;
        pages.push({ content: [], pageNumber: currentPage + 1 });
        contentHeight = 0;
      }

      pages[currentPage].content.push({
        title: section.title,
        content: section.content,
      });
      contentHeight += sectionHeight;
    });

    return pages;
  };
  const regenerateSection = async (index: number) => {
    if (!proposal) return;

    const section = proposal.sections[index];
    setRegeneratingSections((prev) => new Set(prev).add(index));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/proposal/${proposal.id}/sections/${section.id}/regenerate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sectionTitle: section.title || "",
            currentContent: section.content || "",
            proposalTitle: proposal.title || "",
            sectionType: "text", // Explicitly set default type
            context: proposal.sections
              .filter((s, i) => i !== index)
              .map((s) => ({
                title: s.title || "",
                content: s.content || "",
              })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to regenerate section");
      }

      const { content } = await response.json();

      // Update the section in the proposal
      const updatedSections = [...proposal.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        content: content,
      };

      setProposal({
        ...proposal,
        sections: updatedSections,
      });

      showNotification("Section regenerated successfully!", "success");
    } catch (error) {
      console.error("Error regenerating section:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to regenerate section",
        "error"
      );
    } finally {
      setRegeneratingSections((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const ThemeSelector = () => (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2">
      {Object.keys(themes).map((themeName) => (
        <button
          key={themeName}
          onClick={() => setCurrentTheme(themeName)}
          className={`w-6 h-6 rounded-full ${
            themes[themeName].background
          } border-2 ${
            currentTheme === themeName ? "border-blue-500" : "border-gray-200"
          }`}
          title={`${themeName.charAt(0).toUpperCase()}${themeName.slice(
            1
          )} theme`}
        />
      ))}
    </div>
  );
  // Save Proposal
  // Updated handleSaveProposal function
  const handleSaveProposal = useCallback(async () => {
    if (!proposal) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/proposal/${proposal.id}/sections`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            sections: proposal.sections.map((section, index) => ({
              id: section.id || undefined, // Only include id if it exists
              title: section.title,
              content: section.content,
              order: index, // Use index as order to maintain sequence
              type: section.type,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save proposal");
      }

      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      successMessage.textContent = "Proposal saved successfully!";
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
      console.error("Error saving proposal:", error);

      // Show error message
      const errorMessage = document.createElement("div");
      errorMessage.className =
        "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      errorMessage.textContent =
        error instanceof Error
          ? error.message
          : "Failed to save proposal. Please try again.";
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    } finally {
      setSaving(false);
    }
  }, [proposal]);
  // Export Proposal as PDF
  interface PageConfig {
    margins: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
    lineHeight: number;
    titleSpacing: number;
    sectionSpacing: number;
    maxWidth: number;
  }

  const handleExportPDF = async (): Promise<void> => {
    if (!proposal) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true,
      });

      const pageConfig: PageConfig = {
        margins: {
          left: 20,
          right: 20,
          top: 30,
          bottom: 30,
        },
        lineHeight: 7,
        titleSpacing: 10,
        sectionSpacing: 15,
        maxWidth: 170,
      };

      let yPosition: number = pageConfig.margins.top;
      let pageNum: number = 1;

      const addHeader = (currentPage: number): void => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(new Date().toLocaleDateString(), pageConfig.margins.left, 15);
        doc.text(`Page ${currentPage}`, 210 - pageConfig.margins.right, 15, {
          align: "right",
        });
        doc.line(
          pageConfig.margins.left,
          20,
          210 - pageConfig.margins.right,
          20
        );
      };

      const addFooter = (): void => {
        const footerY = 297 - pageConfig.margins.bottom;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150);
        doc.text("© YourCompanyName", pageConfig.margins.left, footerY);
        doc.text("Confidential", 210 - pageConfig.margins.right, footerY, {
          align: "right",
        });
      };

      const checkAndAddNewPage = (): boolean => {
        if (
          yPosition >
          297 - pageConfig.margins.bottom - pageConfig.lineHeight
        ) {
          addFooter();
          doc.addPage();
          pageNum++;
          addHeader(pageNum);
          yPosition = pageConfig.margins.top;
          return true;
        }
        return false;
      };

      // Add initial header
      addHeader(pageNum);

      // Document Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40);
      doc.text(proposal.title, pageConfig.margins.left, yPosition);
      yPosition += pageConfig.titleSpacing + pageConfig.lineHeight;

      // Process each section
      proposal.sections.forEach((section: Section) => {
        checkAndAddNewPage();

        // Section Title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60);
        doc.text(section.title, pageConfig.margins.left, yPosition);
        yPosition += pageConfig.lineHeight;

        // Section Content
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);

        // Split content into lines that fit within margins
        const splitText: string[] = doc.splitTextToSize(
          section.content,
          pageConfig.maxWidth
        );

        // Process each line of text
        splitText.forEach((line: string) => {
          checkAndAddNewPage();
          doc.text(line, pageConfig.margins.left, yPosition);
          yPosition += pageConfig.lineHeight;
        });

        // Add spacing between sections
        yPosition += pageConfig.sectionSpacing;
      });

      // Add final footer
      addFooter();

      // Save the document
      const filename = `${proposal.title
        .replace(/[^a-zA-Z0-9]/g, "_")
        .trim()}_${new Date().toISOString().split("T")[0]}`;
      doc.save(`${filename}.pdf`);

      // Show success message
      showNotification("PDF exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showNotification("Failed to export PDF. Please try again.", "error");
    }
  };

  // Helper function for notifications
  const showNotification = (
    message: string,
    type: "success" | "error"
  ): void => {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
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
      <div
        className={`flex justify-center items-center min-h-screen ${theme.background}`}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.background}`}
      >
        <div className={`text-center ${theme.cardBg} p-8 rounded-lg shadow-lg`}>
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error || "Proposal not found"}
          </h2>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Proposals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} p-8`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
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
              onClick={() => setPdfExportModalOpen(true)}
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
                  className="space-y-4"
                >
                  {proposal.sections.map((section: Section, index: number) => (
                    <Draggable
                      key={section.id || `section-${index}`}
                      draggableId={`section-${section.id || index}`}
                      index={index}
                    >
                      {(provided: DraggableProvided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={false}
                          animate={{
                            scale: snapshot.isDragging ? 1.02 : 1,
                            boxShadow: snapshot.isDragging
                              ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                            borderColor: snapshot.isDragging
                              ? "rgba(59, 130, 246, 0.5)"
                              : "transparent",
                          }}
                          className={`${theme.cardBg} rounded-xl p-6 relative group border-2 transition-colors`}
                        >
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="absolute top-0 left-0 w-8 bottom-0 flex items-center justify-center cursor-move 
                             hover:bg-gray-100 transition-colors rounded-l-xl group"
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>

                          {/* Section Content */}
                          <div className="pl-8">
                            <div className="flex items-center justify-between mb-2">
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) =>
                                  updateSection(index, {
                                    title: e.target.value,
                                  })
                                }
                                className={`text-xl font-semibold w-full bg-transparent border-b border-transparent 
                                focus:border-blue-500 focus:outline-none ${theme.textPrimary}`}
                                placeholder="Section Title"
                              />
                            </div>

                            <textarea
                              value={section.content}
                              onChange={(e) =>
                                updateSection(index, {
                                  content: e.target.value,
                                })
                              }
                              className={`w-full min-h-[200px] mt-4 p-4 rounded-lg border ${theme.border} 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 
                              ${theme.cardBg} ${theme.textSecondary}`}
                              placeholder="Start typing your section content..."
                            />

                            {/* Section Actions */}
                            <div className="mt-4 flex justify-between items-center">
                              <button
                                onClick={() => regenerateSection(index)}
                                disabled={regeneratingSections.has(index)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                  ${
                                    regeneratingSections.has(index)
                                      ? "bg-blue-50 text-blue-400 cursor-not-allowed"
                                      : "text-blue-600 hover:bg-blue-50"
                                  }`}
                              >
                                <RefreshCw
                                  className={`w-4 h-4 ${
                                    regeneratingSections.has(index)
                                      ? "animate-spin"
                                      : ""
                                  }`}
                                />
                                {regeneratingSections.has(index)
                                  ? "Regenerating..."
                                  : "Regenerate"}
                              </button>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedSectionIndex(index);
                                    setAIAssistantOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 p-2 rounded-lg 
                                   hover:bg-blue-50 transition-colors"
                                >
                                  <Wand2 className="w-5 h-5" />
                                </button>
                                {proposal.sections.length > 1 && (
                                  <button
                                    onClick={() => removeSection(index)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg 
                                     hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
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
      <PDFExportModal
        isOpen={pdfExportModalOpen}
        onClose={() => setPdfExportModalOpen(false)}
        proposal={proposal}
        onExport={handleExportPDF}
        calculatePages={calculatePages}
      />
      <ThemeSelector />
    </div>
  );
}
