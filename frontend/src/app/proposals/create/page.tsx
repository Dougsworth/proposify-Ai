"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, FileText, PenTool, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface CardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  active: boolean;
}

const Card: React.FC<CardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  active,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
      active ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50"
    }`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-4">
      <div
        className={`p-3 rounded-lg ${active ? "bg-blue-500" : "bg-blue-100"}`}
      >
        <Icon size={24} className={active ? "text-white" : "text-blue-600"} />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className={`text-sm ${active ? "text-blue-100" : "text-gray-600"}`}>
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

const ProposalCreate = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessDescription: "",
    industry: "",
    targetAudience: "",
    customSections: [{ title: "", content: "" }],
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Templates for "Start from Template" option
  const templates = [
    {
      id: "template1",
      title: "Business Proposal",
      sections: [
        { title: "Introduction", content: "Overview of the business." },
        { title: "Objectives", content: "Key objectives of the business." },
      ],
    },
    {
      id: "template2",
      title: "Marketing Proposal",
      sections: [
        { title: "Executive Summary", content: "Summary of marketing goals." },
        { title: "Marketing Plan", content: "Detailed marketing strategies." },
      ],
    },
  ];

  const handleContinue = async () => {
    if (
      step === 2 &&
      (!formData.businessDescription ||
        !formData.industry ||
        !formData.targetAudience)
    ) {
      setError("Please fill in all fields for AI generation.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      let response;

      if (step === 2) {
        // AI-powered proposal generation
        response = await fetch("http://localhost:3000/api/proposal/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else if (step === 3) {
        // Start from Template
        if (!selectedTemplate) {
          setError("Please select a template.");
          setLoading(false);
          return;
        }

        const template = templates.find((t) => t.id === selectedTemplate);
        response = await fetch("http://localhost:3000/api/proposal/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: `Template: ${template?.title}`,
            sections: template?.sections || [],
          }),
        });
      } else if (step === 4) {
        // Custom Design
        response = await fetch("http://localhost:3000/api/proposal/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "Custom: New Proposal",
            sections: formData.customSections.filter(
              (section) => section.title && section.content
            ),
          }),
        });
      }

      if (response && !response.ok) {
        throw new Error("Failed to create proposal.");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating proposal:", error);
      setError("Failed to create proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const AIAssistantForm = () => (
    <div className="bg-white rounded-lg p-6 mt-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">AI Proposal Generation</h3>
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 p-4 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Business Description
          </label>
          <textarea
            value={formData.businessDescription}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                businessDescription: e.target.value,
              }))
            }
            placeholder="Describe your business..."
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, industry: e.target.value }))
            }
            placeholder="e.g., Technology, Healthcare"
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Target Audience
          </label>
          <textarea
            value={formData.targetAudience}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                targetAudience: e.target.value,
              }))
            }
            placeholder="Who is your target audience?"
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const TemplateSelector = () => (
    <div className="bg-white rounded-lg p-6 mt-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Select a Template</h3>
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => setSelectedTemplate(template.id)}
          className={`p-4 border rounded-lg cursor-pointer mb-4 ${
            selectedTemplate === template.id
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300"
          }`}
        >
          <h4 className="font-bold">{template.title}</h4>
        </div>
      ))}
    </div>
  );

  const CustomForm = () => (
    <div className="bg-white rounded-lg p-6 mt-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Custom Proposal Design</h3>
      {formData.customSections.map((section, index) => (
        <div key={index} className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => {
              const updatedSections = [...formData.customSections];
              updatedSections[index].title = e.target.value;
              setFormData({ ...formData, customSections: updatedSections });
            }}
            placeholder="Section title"
            className="w-full p-3 rounded-lg border"
          />
          <label className="block text-sm font-medium mt-4 mb-1">
            Section Content
          </label>
          <textarea
            value={section.content}
            onChange={(e) => {
              const updatedSections = [...formData.customSections];
              updatedSections[index].content = e.target.value;
              setFormData({ ...formData, customSections: updatedSections });
            }}
            placeholder="Section content"
            className="w-full p-3 rounded-lg border"
          />
        </div>
      ))}
      <button
        onClick={() =>
          setFormData((prev) => ({
            ...prev,
            customSections: [
              ...prev.customSections,
              { title: "", content: "" },
            ],
          }))
        }
        className="text-blue-600 hover:text-blue-800"
      >
        + Add Section
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <Sparkles className="h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold">Create Your Proposal</h1>
          <p className="text-lg text-gray-600">
            Choose how you'd like to start your proposal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            icon={Wand2}
            title="AI-Powered Generation"
            description="Let our AI help you create a personalized proposal"
            onClick={() => {
              setStep(2);
              setError("");
            }}
            active={step === 2}
          />
          <Card
            icon={FileText}
            title="Start from Template"
            description="Choose from our pre-built professional templates"
            onClick={() => {
              setStep(3);
              setError("");
            }}
            active={step === 3}
          />
          <Card
            icon={PenTool}
            title="Custom Design"
            description="Build your proposal from scratch"
            onClick={() => {
              setStep(4);
              setError("");
            }}
            active={step === 4}
          />
        </div>

        {step === 2 && <AIAssistantForm />}
        {step === 3 && <TemplateSelector />}
        {step === 4 && <CustomForm />}

        {step > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-end"
          >
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={loading}
              className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Continue"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProposalCreate;
