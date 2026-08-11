import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Priority = "P0" | "P1" | "P2" | "P3" | "P4";
type Status = "todo" | "in-progress" | "done";
type Who = "Amit" | "Intern" | "Amit+Intern";

interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  who: Who;
  why: string;
  when: string;
  created: string;
  completedAt: string | null;
  completedBy: string | null;
  prLink: string | null;
  notes: string;
}

interface DoneFormState {
  id: string;
  completedBy: string;
  prLink: string;
  notes: string;
}

interface NewTaskForm {
  title: string;
  priority: Priority;
  who: Who;
  why: string;
  when: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<Priority, { label: string; bg: string; text: string; border: string; dot: string }> = {
  P0: { label: "P0 — Critical", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-500"    },
  P1: { label: "P1 — High",     bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  P2: { label: "P2 — Medium",   bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
  P3: { label: "P3 — Low",      bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500"  },
  P4: { label: "P4 — Backlog",  bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500"   },
};

const WHO_COLORS: Record<Who, string> = {
  "Amit":       "bg-purple-100 text-purple-700",
  "Intern":     "bg-teal-100 text-teal-700",
  "Amit+Intern":"bg-indigo-100 text-indigo-700",
};

const TASK_SERVER = import.meta.env.VITE_TASK_SERVER_URL || "http://localhost:3001";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function nextId(tasks: Task[]): string {
  const nums = tasks
    .filter(t => t.id.startsWith("T"))
    .map(t => parseInt(t.id.slice(1), 10))
    .filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `T${String(max + 1).padStart(3, "0")}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function PriorityBadge({ p }: { p: Priority }) {
  const c = PRIORITY_CONFIG[p];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {p}
    </span>
  );
}

function WhoBadge({ who }: { who: Who }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${WHO_COLORS[who]}`}>{who}</span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    "todo":        "bg-gray-100 text-gray-600",
    "in-progress": "bg-blue-100 text-blue-700",
    "done":        "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {status === "in-progress" ? "In Progress" : status === "done" ? "Done" : "To Do"}
    </span>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
interface TaskCardProps {
  task: Task;
  expanded: boolean;
  onToggle: () => void;
  onStart: () => void;
  onDone: () => void;
  onPriorityChange: (p: Priority) => void;
  onSaveExpanded: (notes: string, prLink: string) => void;
}

function TaskCard({ task, expanded, onToggle, onStart, onDone, onPriorityChange, onSaveExpanded }: TaskCardProps) {
  const [notes, setNotes] = useState(task.notes);
  const [prLink, setPrLink] = useState(task.prLink ?? "");

  // Sync if task changes externally
  useEffect(() => { setNotes(task.notes); }, [task.notes]);
  useEffect(() => { setPrLink(task.prLink ?? ""); }, [task.prLink]);

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 ${expanded ? "border-purple-300 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}>
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onToggle}>
        <span className="text-xs font-mono text-gray-400 w-10 shrink-0">{task.id}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <WhoBadge who={task.who} />
          <StatusPill status={task.status} />
          <select
            value={task.priority}
            onClick={e => e.stopPropagation()}
            onChange={e => onPriorityChange(e.target.value as Priority)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 cursor-pointer focus:outline-none focus:border-purple-400"
          >
            {(["P0","P1","P2","P3","P4"] as Priority[]).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {task.status !== "in-progress" && task.status !== "done" && (
            <button
              onClick={e => { e.stopPropagation(); onStart(); }}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Start
            </button>
          )}
          {task.status !== "done" && (
            <button
              onClick={e => { e.stopPropagation(); onDone(); }}
              className="px-3 py-1 text-xs font-medium rounded-lg text-white transition-colors"
              style={{ background: "#1D9E75" }}
            >
              Done
            </button>
          )}
          <span className={`text-gray-400 text-sm transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Why</span>
              <p className="text-gray-700 mt-0.5">{task.why}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">When</span>
              <p className="text-gray-700 mt-0.5">{task.when}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">PR Link</label>
            <input
              type="text"
              value={prLink}
              onChange={e => setPrLink(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes, blockers, context..."
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => onSaveExpanded(notes, prLink)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white"
              style={{ background: "#378ADD" }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Done Form Modal ──────────────────────────────────────────────────────────
interface DoneFormProps {
  taskTitle: string;
  form: DoneFormState;
  onChange: (form: DoneFormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function DoneFormModal({ taskTitle, form, onChange, onSubmit, onCancel }: DoneFormProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Mark as Done</h3>
        <p className="text-sm text-gray-500 mb-4 truncate">{taskTitle}</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Completed by</label>
            <select
              value={form.completedBy}
              onChange={e => onChange({ ...form, completedBy: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-purple-400"
            >
              <option>Amit</option>
              <option>Intern</option>
              <option>Amit+Intern</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">PR Link <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.prLink}
              onChange={e => onChange({ ...form, prLink: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={form.notes}
              onChange={e => onChange({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Any notes about completion..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
            style={{ background: "#1D9E75" }}
          >
            Mark Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Task Modal ────────────────────────────────────────────────────────────
interface AddTaskModalProps {
  form: NewTaskForm;
  onChange: (f: NewTaskForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function AddTaskModal({ form, onChange, onSubmit, onCancel }: AddTaskModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Add New Task</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => onChange({ ...form, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => onChange({ ...form, priority: e.target.value as Priority })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-purple-400"
              >
                <option>P0</option><option>P1</option><option>P2</option><option>P3</option><option>P4</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Who</label>
              <select
                value={form.who}
                onChange={e => onChange({ ...form, who: e.target.value as Who })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-purple-400"
              >
                <option>Amit</option><option>Intern</option><option>Amit+Intern</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Why</label>
            <input
              type="text"
              value={form.why}
              onChange={e => onChange({ ...form, why: e.target.value })}
              placeholder="Reason / impact"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">When</label>
            <input
              type="text"
              value={form.when}
              onChange={e => onChange({ ...form, when: e.target.value })}
              placeholder="Today / This week / After T001 / etc."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={onSubmit}
            disabled={!form.title.trim()}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
            style={{ background: "#7C3AED" }}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [view, setView] = useState<"priority" | "kanban">("priority");
  const [filterWho, setFilterWho] = useState<string>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [doneForm, setDoneForm] = useState<DoneFormState | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDoneLog, setShowDoneLog] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({ title: "", priority: "P2", who: "Amit", why: "", when: "" });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${TASK_SERVER}/tasks`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Task[]) => { setTasks(data); setLoading(false); })
      .catch(() => {
        setError("Task server not running.\n\nStart it with:  node scripts/task-server.js");
        setLoading(false);
      });
  }, []);

  // ── Save to server ─────────────────────────────────────────────────────────
  const persistTasks = useCallback(async (updated: Task[]) => {
    setSaving(true);
    try {
      await fetch(`${TASK_SERVER}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setTasks(updated);
    } catch {
      alert("Could not save — is the task server running?");
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Task actions ───────────────────────────────────────────────────────────
  const startTask = (id: string) => {
    persistTasks(tasks.map(t => t.id === id ? { ...t, status: "in-progress" } : t));
  };

  const openDoneForm = (id: string) => {
    setDoneForm({ id, completedBy: "Amit", prLink: "", notes: "" });
  };

  const submitDone = () => {
    if (!doneForm) return;
    const now = new Date().toISOString().slice(0, 10);
    persistTasks(tasks.map(t =>
      t.id === doneForm.id
        ? { ...t, status: "done", completedAt: now, completedBy: doneForm.completedBy, prLink: doneForm.prLink || null, notes: doneForm.notes || t.notes }
        : t
    ));
    setDoneForm(null);
  };

  const reopenTask = (id: string) => {
    persistTasks(tasks.map(t =>
      t.id === id ? { ...t, status: "todo", completedAt: null, completedBy: null } : t
    ));
  };

  const changePriority = (id: string, p: Priority) => {
    persistTasks(tasks.map(t => t.id === id ? { ...t, priority: p } : t));
  };

  const saveExpanded = (id: string, notes: string, prLink: string) => {
    persistTasks(tasks.map(t =>
      t.id === id ? { ...t, notes, prLink: prLink || null } : t
    ));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const id = nextId(tasks);
    const task: Task = {
      id,
      title: newTask.title.trim(),
      priority: newTask.priority,
      status: "todo",
      who: newTask.who,
      why: newTask.why,
      when: newTask.when,
      created: new Date().toISOString().slice(0, 10),
      completedAt: null,
      completedBy: null,
      prLink: null,
      notes: "",
    };
    persistTasks([...tasks, task]);
    setNewTask({ title: "", priority: "P2", who: "Amit", why: "", when: "" });
    setShowAddModal(false);
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const activeTasks = tasks.filter(t => t.status !== "done");
  const doneTasks = tasks.filter(t => t.status === "done");
  const inProgress = tasks.filter(t => t.status === "in-progress");
  const critical = tasks.filter(t => t.priority === "P0" && t.status !== "done");

  const filtered = filterWho === "All" ? activeTasks : activeTasks.filter(t => t.who === filterWho);

  const priorityGroups = (["P0","P1","P2","P3","P4"] as Priority[])
    .map(p => ({ p, items: filtered.filter(t => t.priority === p) }))
    .filter(g => g.items.length > 0);

  const kanbanCols: { key: Status; label: string; color: string; tasks: Task[] }[] = [
    { key: "todo",        label: "To Do",       color: "bg-gray-100 text-gray-700",  tasks: filtered.filter(t => t.status === "todo") },
    { key: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-700",  tasks: filtered.filter(t => t.status === "in-progress") },
    { key: "done",        label: "Done",        color: "bg-green-100 text-green-700", tasks: doneTasks.filter(t => filterWho === "All" || t.who === filterWho) },
  ];

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center shadow-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Task Server Not Running</h2>
          <pre className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 text-left whitespace-pre-wrap">{error}</pre>
          <button
            onClick={() => { setLoading(true); setError(null); window.location.reload(); }}
            className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{ background: "#7C3AED" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "#1A1A2E" }}>T</div>
              <div>
                <h1 className="text-base font-bold text-gray-900">GrowVio Task Tracker</h1>
                <p className="text-xs text-gray-400">{saving ? "Saving..." : "Auto-saves to docs/TASKS.json"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Stats */}
              <span className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-600 font-medium">{activeTasks.length} active</span>
              <span className="px-2 py-1 rounded-lg bg-blue-100 text-xs text-blue-700 font-medium">{inProgress.length} in progress</span>
              <span className="px-2 py-1 rounded-lg bg-red-100 text-xs text-red-700 font-medium">{critical.length} critical</span>
              <span className="px-2 py-1 rounded-lg bg-green-100 text-xs text-green-700 font-medium">{doneTasks.length} done</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {/* View toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(["priority","kanban"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${view === v ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  {v === "priority" ? "Priority View" : "Kanban View"}
                </button>
              ))}
            </div>

            {/* Filter */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {["All","Amit","Intern","Amit+Intern"].map(w => (
                <button
                  key={w}
                  onClick={() => setFilterWho(w)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${filterWho === w ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  {w}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Add Task */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
              style={{ background: "#7C3AED" }}
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Priority View ── */}
        {view === "priority" && (
          <div className="space-y-8">
            {priorityGroups.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">No active tasks match this filter.</div>
            )}
            {priorityGroups.map(({ p, items }) => {
              const cfg = PRIORITY_CONFIG[p];
              return (
                <div key={p}>
                  <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                    <span className={`text-xs ${cfg.text} opacity-60`}>— {items.length} task{items.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        expanded={expanded === task.id}
                        onToggle={() => setExpanded(expanded === task.id ? null : task.id)}
                        onStart={() => startTask(task.id)}
                        onDone={() => openDoneForm(task.id)}
                        onPriorityChange={p => changePriority(task.id, p)}
                        onSaveExpanded={(n, pr) => saveExpanded(task.id, n, pr)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Kanban View ── */}
        {view === "kanban" && (
          <div className="grid grid-cols-3 gap-4">
            {kanbanCols.map(col => (
              <div key={col.key}>
                <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${col.color}`}>
                  <span className="text-sm font-bold">{col.label}</span>
                  <span className="text-xs opacity-60">— {col.tasks.length}</span>
                </div>
                <div className="space-y-2">
                  {col.tasks.map(task => (
                    <div key={task.id} className={`bg-white rounded-xl border p-3 transition-all ${expanded === task.id ? "border-purple-300 shadow-md" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="flex items-start justify-between gap-2 mb-2 cursor-pointer" onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-mono text-gray-400">{task.id}</span>
                          <p className="text-sm font-medium text-gray-900 mt-0.5 leading-snug">{task.title}</p>
                        </div>
                        <PriorityBadge p={task.priority} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <WhoBadge who={task.who} />
                        <div className="flex gap-1">
                          {task.status === "todo" && (
                            <button onClick={() => startTask(task.id)} className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600">Start</button>
                          )}
                          {task.status !== "done" && (
                            <button onClick={() => openDoneForm(task.id)} className="px-2 py-1 text-xs font-medium rounded-lg text-white" style={{ background: "#1D9E75" }}>Done</button>
                          )}
                          {task.status === "done" && (
                            <button onClick={() => reopenTask(task.id)} className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">Reopen</button>
                          )}
                        </div>
                      </div>
                      {expanded === task.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                          <p><strong>Why:</strong> {task.why}</p>
                          <p><strong>When:</strong> {task.when}</p>
                          {task.notes && <p><strong>Notes:</strong> {task.notes}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                  {col.tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-300 text-xs">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Done Log ── */}
        <div className="mt-10">
          <button
            onClick={() => setShowDoneLog(!showDoneLog)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className={`transition-transform text-gray-400 ${showDoneLog ? "rotate-90" : ""}`}>▶</span>
            Done Log
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">{doneTasks.length} completed</span>
          </button>

          {showDoneLog && (
            <div className="mt-3 space-y-2">
              {doneTasks.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No completed tasks yet.</p>
              )}
              {doneTasks.map(task => (
                <div key={task.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-10 shrink-0">{task.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {task.completedBy && <span>by {task.completedBy}</span>}
                      {task.completedAt && <span> · {task.completedAt}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.prLink && (
                      <a
                        href={task.prLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        PR ↗
                      </a>
                    )}
                    <WhoBadge who={task.who} />
                    <button
                      onClick={() => reopenTask(task.id)}
                      className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {doneForm && (
        <DoneFormModal
          taskTitle={tasks.find(t => t.id === doneForm.id)?.title ?? ""}
          form={doneForm}
          onChange={setDoneForm}
          onSubmit={submitDone}
          onCancel={() => setDoneForm(null)}
        />
      )}

      {showAddModal && (
        <AddTaskModal
          form={newTask}
          onChange={setNewTask}
          onSubmit={addTask}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
