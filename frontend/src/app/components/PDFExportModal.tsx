"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Settings,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PDFExportSettings {
  format: "a4" | "letter" | "legal";
  orientation: "portrait" | "landscape";
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  header: {
    enabled: boolean;
    includeDate: boolean;
    includePageNumber: boolean;
    customText: string;
  };
  footer: {
    enabled: boolean;
    companyName: string;
    includeConfidential: boolean;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
  };
}

interface PageContent {
  content: Array<{ title: string; content: string }>;
  pageNumber: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  proposal: any;
  onExport: (settings: PDFExportSettings) => void;
  calculatePages: () => PageContent[];
}

const PDFExportModal = ({
  isOpen,
  onClose,
  proposal,
  onExport,
  calculatePages,
}: Props) => {
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
  const [settings, setSettings] = useState<PDFExportSettings>({
    format: "a4",
    orientation: "portrait",
    margins: {
      top: 30,
      bottom: 30,
      left: 20,
      right: 20,
    },
    header: {
      enabled: true,
      includeDate: true,
      includePageNumber: true,
      customText: "",
    },
    footer: {
      enabled: true,
      companyName: "Your Company Name",
      includeConfidential: true,
    },
    branding: {
      primaryColor: "#2563eb",
      accentColor: "#1e40af",
    },
  });

  const pages = calculatePages();
  const totalPages = pages.length;

  const handlePreviousPage = () => {
    setCurrentPreviewPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPreviewPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Export PDF</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 gap-6 p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Settings Panel */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Document Settings
              </h3>

              {/* Page Setup */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <select
                      value={settings.format}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          format: e.target.value as "a4" | "letter" | "legal",
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 p-2"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orientation
                    </label>
                    <select
                      value={settings.orientation}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          orientation: e.target.value as
                            | "portrait"
                            | "landscape",
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 p-2"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Header Options */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Header Options
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.header.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          header: {
                            ...settings.header,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm text-gray-600">Enable Header</span>
                  </label>
                  {settings.header.enabled && (
                    <div className="pl-6 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.header.includeDate}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              header: {
                                ...settings.header,
                                includeDate: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-gray-300 text-blue-600 mr-2"
                        />
                        <span className="text-sm text-gray-600">
                          Include Date
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.header.includePageNumber}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              header: {
                                ...settings.header,
                                includePageNumber: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-gray-300 text-blue-600 mr-2"
                        />
                        <span className="text-sm text-gray-600">
                          Include Page Numbers
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Custom Header Text"
                        value={settings.header.customText}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            header: {
                              ...settings.header,
                              customText: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Options */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Footer Options
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.footer.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          footer: {
                            ...settings.footer,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm text-gray-600">Enable Footer</span>
                  </label>
                  {settings.footer.enabled && (
                    <div className="pl-6 space-y-2">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={settings.footer.companyName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            footer: {
                              ...settings.footer,
                              companyName: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.footer.includeConfidential}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              footer: {
                                ...settings.footer,
                                includeConfidential: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-gray-300 text-blue-600 mr-2"
                        />
                        <span className="text-sm text-gray-600">
                          Include Confidential Label
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Branding Colors */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Branding Colors
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          branding: {
                            ...settings.branding,
                            primaryColor: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={settings.branding.accentColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          branding: {
                            ...settings.branding,
                            accentColor: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPreviewPage === 1}
                  className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPreviewPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPreviewPage === totalPages}
                  className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="bg-white aspect-[1/1.4142] shadow-lg rounded-lg p-8 relative">
              <div className="border-b border-gray-200 pb-2 mb-4 text-sm text-gray-500">
                {settings.header.enabled && (
                  <div className="flex justify-between">
                    {settings.header.includeDate && (
                      <span>{new Date().toLocaleDateString()}</span>
                    )}
                    {settings.header.includePageNumber && (
                      <span>Page {currentPreviewPage}</span>
                    )}
                  </div>
                )}
                {settings.header.customText && (
                  <div className="text-center mt-1">
                    {settings.header.customText}
                  </div>
                )}
              </div>
              <div
                className="space-y-4 overflow-hidden"
                style={{ maxHeight: "calc(100% - 120px)" }}
              >
                {pages[currentPreviewPage - 1]?.content.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <h2
                      className={`${
                        index === 0 && currentPreviewPage === 1
                          ? "text-xl"
                          : "text-lg"
                      } font-bold`}
                      style={{
                        color:
                          index === 0 && currentPreviewPage === 1
                            ? settings.branding.primaryColor
                            : settings.branding.accentColor,
                      }}
                    >
                      {item.title}
                    </h2>
                    {item.content && (
                      <p className="text-sm text-gray-600">
                        {item.content.slice(0, 100)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {settings.footer.enabled && (
                <div className="absolute bottom-8 left-8 right-8 border-t border-gray-200 pt-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>{settings.footer.companyName}</span>
                    {settings.footer.includeConfidential && (
                      <span>Confidential</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onExport(settings);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFExportModal;
