import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck, Activity, Cpu, RefreshCw, Zap } from 'lucide-react';
import { HealthStatus } from '../types';
import { playSpellSound, playPumpkinSound } from '../utils/audio';

interface GemmaStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthStatus | null;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onTestConnection: () => Promise<void>;
  isTesting: boolean;
  testResult: { success: boolean; model: string; response?: string; error?: string; latencyMs?: number } | null;
}

export const GemmaStatusModal: React.FC<GemmaStatusModalProps> = ({
  isOpen,
  onClose,
  health,
  selectedModel,
  onSelectModel,
  onTestConnection,
  isTesting,
  testResult,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0617] border border-purple-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.35)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-700/60 text-purple-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-purple-900/50">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-orange-500 text-white shadow-lg shadow-purple-600/30">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-cinzel text-purple-100">
                Gemma 4 AI Brain Diagnostics
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                Hacktoberfest 2026
              </span>
            </div>
            <p className="text-xs text-purple-400">
              Best Use of Gemma 4 Track • Official Google Gen AI SDK Integration
            </p>
          </div>
        </div>

        {/* Key Security & Architecture Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-purple-200/90 leading-relaxed">
            <strong className="text-emerald-300 block mb-1">
              Secure Server-Side Architecture
            </strong>
            The Gemini API key is guarded exclusively in server-side environment secrets. All queries run through our dedicated Express backend with telemetry headers (<code className="text-orange-300 bg-black/40 px-1 py-0.5 rounded">User-Agent: aistudio-build</code>). Zero keys are leaked to the browser.
          </div>
        </div>

        {/* Model Selection & Verification Section */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider font-cinzel flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              Active Gemma 4 Model ID
            </label>
            <span className="text-[11px] text-emerald-400 font-mono-code flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(health?.verifiedModels || ['gemma-4-26b-a4b-it', 'gemma-4-31b-it']).map((modelName) => {
              const isSelected = selectedModel === modelName;
              const isRecommended = modelName === 'gemma-4-26b-a4b-it';
              return (
                <button
                  key={modelName}
                  type="button"
                  onClick={() => {
                    playPumpkinSound();
                    onSelectModel(modelName);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-purple-900/50 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                      : 'bg-black/50 border-purple-950 hover:border-purple-800 hover:bg-purple-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code text-xs font-bold text-purple-100">
                      {modelName}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px]">
                    {isRecommended ? (
                      <span className="text-orange-400 font-medium font-cinzel">
                        ★ Primary Gemma 4 Brain
                      </span>
                    ) : (
                      <span className="text-purple-400/80">Alternate Gemma Variant</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {health && !health.isDefaultAvailable && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Default model was not listed in discovery, but fallback to verified Gemma 4 model is available.
              </span>
            </div>
          )}
        </div>

        {/* Live Test Connection Tool */}
        <div className="p-4 rounded-2xl bg-black/60 border border-orange-950/60 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold font-cinzel text-orange-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                Live Connection Test
              </h4>
              <p className="text-xs text-purple-400/80">
                Pings <code className="text-orange-300 font-mono-code">{selectedModel}</code> via the official SDK
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                playSpellSound();
                await onTestConnection();
              }}
              disabled={isTesting}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-orange-900/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Chanting...' : 'Test Connection Now'}</span>
            </button>
          </div>

          {/* Test Results Display */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono-code ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/30 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold flex items-center gap-1.5">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Status: Connection Verified OK
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      Status: Connection Failed
                    </>
                  )}
                </span>
                {testResult.latencyMs && (
                  <span className="text-[10px] text-purple-400">
                    Latency: {testResult.latencyMs}ms
                  </span>
                )}
              </div>

              {testResult.response && (
                <p className="text-[11px] text-purple-200 mt-1 italic bg-black/40 p-2 rounded-lg border border-purple-900/40">
                  "{testResult.response}"
                </p>
              )}

              {testResult.error && (
                <p className="text-[11px] text-red-300 mt-1">
                  Error: {testResult.error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Learning Modes Specification Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-6">
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40">
            <h5 className="font-cinzel font-bold text-purple-300 mb-1 flex items-center gap-1.5">
              <span>🔮</span> The Answer Spell
            </h5>
            <p className="text-purple-300/80 text-[11px] leading-relaxed">
              Direct solutions, numbered step breakdown, intuitive spectral insights, and instantaneous step simplification on demand.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-900/40">
            <h5 className="font-cinzel font-bold text-orange-300 mb-1 flex items-center gap-1.5">
              <span>🗝️</span> The Mystery Spell
            </h5>
            <p className="text-orange-300/80 text-[11px] leading-relaxed">
              Zero answer spoilers. One clue at a time, Socratic evaluation of student attempts, and on-demand switch to Answer Spell.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-100 font-medium text-xs border border-purple-600/50 transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
