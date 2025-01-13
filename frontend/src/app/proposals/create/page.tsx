"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, FileText, PenTool, X } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "../../styles/proposal.module.css";

// Types
interface Section {
  title: string;
  content: string;
}

interface Template {
  id: string;
  title: string;
  sections: Section[];
}

interface FormState {
  businessDescription: string;
  industry: string;
  targetAudience: string;
}

// Modal Component
const Modal: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}> = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={styles.modalContent}
        >
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ProposalCard Component
const ProposalCard: React.FC<{
  icon: typeof Wand2;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon: Icon, title, description, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={styles.card}
  >
    <div className={styles.cardContent}>
      <div className={styles.cardIconContainer}>
        <Icon className={styles.cardIcon} />
      </div>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </div>
  </motion.div>
);

// Form Field Component
const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, multiline }) => (
  <div>
    <label className={styles.label}>{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={styles.input}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    )}
  </div>
);

// Main Component
const ProposalCreate = () => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<FormState>({
    businessDescription: "",
    industry: "",
    targetAudience: "",
  });
  const [customSections, setCustomSections] = useState<Section[]>([
    { title: "", content: "" },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Templates data
  const templates: Template[] = [
    {
      id: "business",
      title: "Business Proposal",
      sections: [
        { title: "Executive Summary", content: "Overview of the proposal." },
        { title: "Business Analysis", content: "Detailed business analysis." },
      ],
    },
    {
      id: "marketing",
      title: "Marketing Proposal",
      sections: [
        { title: "Campaign Overview", content: "Marketing campaign details." },
        { title: "Target Market", content: "Market analysis and targeting." },
      ],
    },
  ];

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setModalOpen(true);
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      let payload;
      let endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/`;
      switch (selectedMethod) {
        case "ai":
          if (
            !formState.businessDescription ||
            !formState.industry ||
            !formState.targetAudience
          ) {
            throw new Error("Please fill all fields");
          }
          payload = formState;
          endpoint += "generate";
          break;

        case "template":
          if (!selectedTemplate) {
            throw new Error("Please select a template");
          }
          const template = templates.find((t) => t.id === selectedTemplate);
          payload = {
            title: template?.title,
            sections: template?.sections,
          };
          endpoint += "create";
          break;

        case "custom":
          const validSections = customSections.filter(
            (s) => s.title && s.content
          );
          if (validSections.length === 0) {
            throw new Error("Please add at least one section");
          }
          payload = {
            title: "Custom Proposal",
            sections: validSections,
          };
          endpoint += "create";
          break;

        default:
          throw new Error("Invalid method");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create proposal");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderAIForm = () => (
    <div className={styles.formContainer}>
      <h2 className={styles.modalTitle}>AI-Powered Proposal Generation</h2>
      <div className={styles.formFields}>
        <FormField
          label="Business Description"
          value={formState.businessDescription}
          onChange={(value) =>
            setFormState((prev) => ({ ...prev, businessDescription: value }))
          }
          placeholder="Describe your business..."
          multiline
        />
        <FormField
          label="Industry"
          value={formState.industry}
          onChange={(value) =>
            setFormState((prev) => ({ ...prev, industry: value }))
          }
          placeholder="e.g., Technology, Healthcare"
        />
        <FormField
          label="Target Audience"
          value={formState.targetAudience}
          onChange={(value) =>
            setFormState((prev) => ({ ...prev, targetAudience: value }))
          }
          placeholder="Who is your target audience?"
          multiline
        />
      </div>
    </div>
  );

  const renderTemplateSelector = () => (
    <div className={styles.formContainer}>
      <h2 className={styles.modalTitle}>Choose a Template</h2>
      <div className={styles.templateGrid}>
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`${styles.templateCard} ${
              selectedTemplate === template.id
                ? styles.templateCardSelected
                : ""
            }`}
          >
            <h3 className={styles.templateTitle}>{template.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCustomForm = () => (
    <div className={styles.formContainer}>
      <h2 className={styles.modalTitle}>Custom Proposal</h2>
      <div className={styles.customSections}>
        {customSections.map((section, index) => (
          <div key={index} className={styles.sectionContainer}>
            <FormField
              label="Section Title"
              value={section.title}
              onChange={(value) => {
                const newSections = [...customSections];
                newSections[index] = { ...section, title: value };
                setCustomSections(newSections);
              }}
              placeholder="Section title"
            />
            <FormField
              label="Content"
              value={section.content}
              onChange={(value) => {
                const newSections = [...customSections];
                newSections[index] = { ...section, content: value };
                setCustomSections(newSections);
              }}
              placeholder="Section content"
              multiline
            />
          </div>
        ))}
        <button
          onClick={() =>
            setCustomSections([...customSections, { title: "", content: "" }])
          }
          className={styles.addSectionButton}
        >
          + Add Section
        </button>
      </div>
    </div>
  );

  const renderModalContent = () => {
    switch (selectedMethod) {
      case "ai":
        return renderAIForm();
      case "template":
        return renderTemplateSelector();
      case "custom":
        return renderCustomForm();
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <Sparkles className={styles.icon} />
          <h1 className={styles.title}>Create Your Proposal</h1>
          <p className={styles.subtitle}>Choose how you'd like to start</p>
        </div>

        <div className={styles.cardGrid}>
          <ProposalCard
            icon={Wand2}
            title="AI Generation"
            description="Let AI create your proposal"
            onClick={() => handleMethodSelect("ai")}
          />
          <ProposalCard
            icon={FileText}
            title="Use Template"
            description="Start from a template"
            onClick={() => handleMethodSelect("template")}
          />
          <ProposalCard
            icon={PenTool}
            title="Custom Design"
            description="Build from scratch"
            onClick={() => handleMethodSelect("custom")}
          />
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          {error && <div className={styles.error}>{error}</div>}
          {renderModalContent()}
          <div className={styles.modalActions}>
            <button
              onClick={() => setModalOpen(false)}
              className={styles.buttonSecondary}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={styles.buttonPrimary}
            >
              {loading ? "Creating..." : "Create Proposal"}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProposalCreate;
