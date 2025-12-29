"use client";

import { useState, useTransition } from "react";
import { upsertScore, clearUserData } from "@/lib/actions/score";
import { useUser } from "@clerk/nextjs";

export default function DebugScoreForm() {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Master",
    constValue: "14.5",
    score: "0",
  });

  const difficulties = ["Normal", "Hard", "Master", "Insanity", "Ravage"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
        setMessage("User not logged in");
        return;
    }

    startTransition(async () => {
      const res = await upsertScore(
        user.id,
        formData.title,
        formData.difficulty,
        parseFloat(formData.constValue),
        parseInt(formData.score, 10),
        new Date()
      );
      setMessage(res.message + (res.chartId ? ` (ID: ${res.chartId})` : ""));
    });
  };

  const handleClear = () => {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete ALL your score data?")) return;

    startTransition(async () => {
        const res = await clearUserData(user.id);
        setMessage(res.message);
    });
  };

  return (
    <div className="p-6 bg-slate-800 rounded-lg max-w-md mx-auto mt-10 text-white">
      <h2 className="text-xl font-bold mb-4">Debug: Score Upsert</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Const Value</label>
          <input
            type="number"
            step="0.1"
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            value={formData.constValue}
            onChange={(e) => setFormData({ ...formData, constValue: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Score</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            required
          />
        </div>

        <div className="pt-4 flex gap-4">
            <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
            >
                {isPending ? "Processing..." : "Register Upsert"}
            </button>
            <button
                type="button"
                onClick={handleClear}
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded disabled:opacity-50"
            >
                Clear All
            </button>
        </div>
      </form>

      {message && (
        <div className="mt-4 p-3 bg-slate-900 rounded text-sm font-mono overflow-x-auto">
          {message}
        </div>
      )}
    </div>
  );
}
