import React, { useMemo, useRef, useState } from 'react';
import {
  Bell,
  CreditCard,
  ExternalLink,
  Link2,
  Loader2,
  Mail,
  MessageSquareQuote,
  Puzzle,
  Upload,
  Wand2
} from 'lucide-react';
import { generateAIResponse } from '../services/gemini';

const AutomationHub = ({ subscriptions, currency }) => {
  const receiptInputRef = useRef(null);
  const statementInputRef = useRef(null);

  const [receiptFile, setReceiptFile] = useState('');
  const [statementFile, setStatementFile] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [reminders, setReminders] = useState({});
  const [selectedSubId, setSelectedSubId] = useState('');
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [negotiationScript, setNegotiationScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeSubs = useMemo(
    () => subscriptions.filter((sub) => sub.status !== 'Canceled'),
    [subscriptions]
  );

  const handleFilePick = (event, setFileName) => {
    const file = event.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleReminderChange = (id, updates) => {
    setReminders((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const handleCopyAddress = async () => {
    const address = 'scan@subday.ai';
    try {
      await navigator.clipboard.writeText(address);
      setCopyStatus('Copied');
    } catch (error) {
      setCopyStatus('Copy failed');
    }
    setTimeout(() => setCopyStatus(''), 1500);
  };

  const handleOpenCancelGuide = (name) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(
      `${name} cancel subscription`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGenerateScript = async () => {
    if (!selectedSubId) return;
    const selectedSub = activeSubs.find((sub) => sub.id === selectedSubId);
    if (!selectedSub) return;

    setIsGenerating(true);
    setNegotiationScript('');

    const prompt = `Write a short, polite negotiation script to ask for a better price on the ${selectedSub.name} subscription. Current price: $${selectedSub.price}. Frequency: ${selectedSub.frequency}. Notes: ${negotiationNotes || 'None'}.`;

    try {
      const response = await generateAIResponse(prompt, subscriptions, currency);
      setNegotiationScript(response);
    } catch (error) {
      setNegotiationScript('Unable to generate a script right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#1C1C1E] rounded-[24px] md:rounded-[32px] p-4 md:p-6 border border-[#2C2C2E] h-[450px] md:h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 space-y-6">
        <section className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Smart Subscription Detection</p>
            <h3 className="text-lg md:text-xl font-bold">Auto-capture new subscriptions</h3>
          </div>

          <div className="grid gap-3 md:gap-4 md:grid-cols-3">
            <div className="bg-[#151516] border border-[#2C2C2E] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Upload size={16} className="text-blue-400" /> Receipt or Email
              </div>
              <p className="text-xs text-gray-400">Upload a screenshot or PDF to extract details.</p>
              <input
                ref={receiptInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
                onChange={(event) => handleFilePick(event, setReceiptFile)}
              />
              <button
                onClick={() => receiptInputRef.current?.click()}
                className="w-full bg-[#0A84FF] text-white text-xs font-bold py-2 rounded-xl"
              >
                Upload file
              </button>
              {receiptFile && <p className="text-[11px] text-gray-500 truncate">{receiptFile}</p>}
            </div>

            <div className="bg-[#151516] border border-[#2C2C2E] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CreditCard size={16} className="text-emerald-400" /> Bank Statement
              </div>
              <p className="text-xs text-gray-400">Detect recurring charges from statements.</p>
              <input
                ref={statementInputRef}
                type="file"
                accept=".csv,.pdf"
                className="hidden"
                onChange={(event) => handleFilePick(event, setStatementFile)}
              />
              <button
                onClick={() => statementInputRef.current?.click()}
                className="w-full bg-[#2C2C2E] text-white text-xs font-bold py-2 rounded-xl"
              >
                Upload statement
              </button>
              {statementFile && <p className="text-[11px] text-gray-500 truncate">{statementFile}</p>}
            </div>

            <div className="bg-[#151516] border border-[#2C2C2E] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Puzzle size={16} className="text-purple-400" /> Browser Extension
              </div>
              <p className="text-xs text-gray-400">Capture subscriptions when you sign up.</p>
              <button
                className="w-full bg-[#2C2C2E] text-gray-300 text-xs font-bold py-2 rounded-xl"
                disabled
              >
                Extension coming soon
              </button>
            </div>
          </div>

          <div className="bg-[#151516] border border-[#2C2C2E] rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Mail size={16} className="text-yellow-400" /> Forwarding inbox
            </div>
            <div className="flex-1 text-xs text-gray-400">Forward receipts to scan@subday.ai</div>
            <button
              onClick={handleCopyAddress}
              className="bg-[#2C2C2E] text-white text-xs font-bold px-3 py-2 rounded-xl"
            >
              {copyStatus || 'Copy address'}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Proactive Cancellation Assistant</p>
            <h3 className="text-lg md:text-xl font-bold">Stay ahead of renewals</h3>
          </div>

          <div className="bg-[#151516] border border-[#2C2C2E] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Bell size={16} className="text-orange-400" /> Free Trial Reminders
            </div>
            <div className="space-y-3">
              {activeSubs.length === 0 && (
                <p className="text-xs text-gray-500">No active subscriptions yet.</p>
              )}
              {activeSubs.map((sub) => {
                const reminder = reminders[sub.id] || { enabled: false, endDate: '' };
                return (
                  <div
                    key={sub.id}
                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b border-[#2C2C2E] pb-3 last:border-b-0"
                  >
                    <div className="flex-1 text-sm font-bold">{sub.name}</div>
                    <input
                      type="date"
                      value={reminder.endDate}
                      onChange={(event) =>
                        handleReminderChange(sub.id, { endDate: event.target.value })
                      }
                      className="bg-black border border-[#333] text-xs rounded-lg px-2 py-2"
                    />
                    <button
                      onClick={() =>
                        handleReminderChange(sub.id, { enabled: !reminder.enabled })
                      }
                      className={`text-xs font-bold px-3 py-2 rounded-xl min-w-[120px] ${
                        reminder.enabled ? 'bg-green-600 text-white' : 'bg-[#2C2C2E] text-gray-300'
                      }`}
                    >
                      {reminder.enabled ? 'Reminder on' : 'Enable reminder'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#151516] border border-[#2C2C2E] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Link2 size={16} className="text-sky-400" /> Cancellation Links
            </div>
            <div className="space-y-2">
              {activeSubs.length === 0 && (
                <p className="text-xs text-gray-500">Add a subscription to see links.</p>
              )}
              {activeSubs.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleOpenCancelGuide(sub.name)}
                  className="w-full flex items-center justify-between bg-[#2C2C2E] px-3 py-2 rounded-xl text-xs font-bold"
                >
                  <span>{sub.name}</span>
                  <ExternalLink size={14} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#151516] border border-[#2C2C2E] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <MessageSquareQuote size={16} className="text-indigo-400" /> Negotiation Scripts
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={selectedSubId}
                onChange={(event) => setSelectedSubId(event.target.value)}
                className="bg-black border border-[#333] text-xs rounded-lg px-2 py-2"
              >
                <option value="">Choose subscription</option>
                {activeSubs.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <input
                value={negotiationNotes}
                onChange={(event) => setNegotiationNotes(event.target.value)}
                placeholder="Any notes or goals"
                className="bg-black border border-[#333] text-xs rounded-lg px-2 py-2 md:col-span-2"
              />
            </div>
            <button
              onClick={handleGenerateScript}
              disabled={!selectedSubId || isGenerating}
              className="bg-[#0A84FF] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 disabled:opacity-60"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Generate script
            </button>
            {negotiationScript && (
              <div className="bg-black border border-[#333] rounded-2xl p-3 text-xs text-gray-200 whitespace-pre-wrap">
                {negotiationScript}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AutomationHub;
