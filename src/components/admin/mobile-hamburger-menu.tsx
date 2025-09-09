"use client";

import React, { useState } from "react";
import { Menu, X, TrendingUp, Building2 } from "lucide-react";
import { useTabStore, TabType } from "../../app/store/useTabStore";

interface MobileHamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileHamburgerMenu({ isOpen, onToggle }: MobileHamburgerMenuProps) {
  const { activeTab, setActiveTab } = useTabStore();

  const additionalTabs = [
    {
      id: "analytics" as TabType,
      label: "Análises",
      icon: TrendingUp,
      description: "Análises detalhadas por profissional",
    },
    {
      id: "empresas" as TabType,
      label: "Empresas",
      icon: Building2,
      description: "Empresas parceiras e códigos",
    },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    onToggle(); // Fecha o menu após selecionar
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onToggle}
      />

      {/* Menu Panel */}
      <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-4">
          {additionalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-azul-escuro text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
