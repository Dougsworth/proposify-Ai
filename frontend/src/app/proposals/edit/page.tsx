"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  Wand2,
  Layout,
  Type,
  Image,
  Columns,
  Save,
  Settings,
  MessageSquare,
  Plus,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Section {
  id: string;
  type: "text" | "image" | "list";
  content: string;
  title?: string;
}

export default function ProposalEditPage() {
  const router = useRouter();
  const params = useParams();
  const [sections, setSections] = useState<Section[]>([
    { id: "1", type: "text", content: "Executive Summary" },
    { id: "2", type: "text", content: "Project Scope" },
  ]);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("Untitled Proposal");

  // Fetch proposal data
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
        setProposalTitle(data.title || "Untitled Proposal");

        // Convert backend sections to editor sections
        const editorSections = data.sections.map((section: any) => ({
          id: section.id.toString(),
          type: "text", // You might want to adjust this based on your backend
          content: section.content,
          title: section.title,
        }));

        setSections(editorSections);
      } catch (error) {
        console.error("Error fetching proposal:", error);
        router.push("/dashboard");
      }
    };

    if (params.id) {
      fetchProposal();
    }
  }, [params.id, router]);

  const SidebarButton = ({
    icon: Icon,
    label,
    onClick,
  }: {
    icon: any;
    label: string;
    onClick?: () => void;
  }) => (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: "rgb(239 246 255)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center space-x-2 p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
    >
      <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
        <Icon className="text-blue-600" size={20} />
      </div>
      <span className="text-gray-700 font-medium">{label}</span>
      <ChevronRight
        size={16}
        className="ml-auto text-gray-400 group-hover:text-blue-500 transition-colors"
      />
    </motion.button>
  );

  const addNewSection = (type: "text" | "image" | "list") => {
    const newSection = {
      id: Date.now().toString(),
      type,
      content: type === "text" ? "Start typing..." : "",
    };
    setSections([...sections, newSection]);
    setIsAddingSection(false);
  };

  const handleSaveProposal = async () => {
    try {
      const token = localStorage.getItem("token");
      const proposalId = params.id as string;

      const response = await fetch(
        `http://localhost:3000/api/proposal/${proposalId}/sections`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sections: sections.map((section, index) => ({
              id: section.id,
              title: section.title || `Section ${index + 1}`,
              content: section.content,
              order: index,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save proposal");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving proposal:", error);
    }
  };
 
  const AIAssistant = () => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 border-l"
    >
      {/* AI Assistant content remains the same as in the previous component */}
    </motion.div>
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ProposifyAI</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddingSection(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus size={20} />
            <span>Add New Section</span>
          </motion.button>

          <AnimatePresence>
            {isAddingSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2 bg-gray-50 p-4 rounded-xl"
              >
                <SidebarButton
                  icon={Type}
                  label="Add Text Block"
                  onClick={() => addNewSection("text")}
                />
                <SidebarButton
                  icon={Image}
                  label="Add Image Block"
                  onClick={() => addNewSection("image")}
                />
                <SidebarButton
                  icon={Columns}
                  label="Add List Block"
                  onClick={() => addNewSection("list")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 px-2">
            Tools
          </h3>
          <div className="space-y-2">
            <SidebarButton
              icon={Wand2}
              label="AI Assist"
              onClick={() => setShowAIChat(true)}
            />
            <SidebarButton icon={Settings} label="Settings" />
            <SidebarButton
              icon={Save}
              label="Save Draft"
              onClick={handleSaveProposal}
            />
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm min-h-full p-8">
          {/* Proposal Title */}
          <div className="mb-8">
            <input
              type="text"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              className="w-full text-3xl font-bold text-gray-900 border-b-2 border-transparent focus:border-blue-500 focus:outline-none"
              placeholder="Untitled Proposal"
            />
          </div>

          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              layoutId={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`p-6 mb-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSection === section.id
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-transparent hover:border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={section.title || `Section ${index + 1}`}
                  onChange={(e) => {
                    const updatedSections = [...sections];
                    updatedSections[index].title = e.target.value;
                    setSections(updatedSections);
                  }}
                  className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {section.type}
                </span>
                {selectedSection === section.id && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAIChat(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <MessageSquare size={16} />
                  </motion.button>
                )}
              </div>
              <div
                contentEditable
                onInput={(e) => {
                  const updatedSections = [...sections];
                  updatedSections[index].content =
                    e.currentTarget.textContent || "";
                  setSections(updatedSections);
                }}
                className="focus:outline-none prose prose-lg max-w-none"
                suppressContentEditableWarning
              >
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <AnimatePresence>{showAIChat && <AIAssistant />}</AnimatePresence>
    </div>
  );
}
