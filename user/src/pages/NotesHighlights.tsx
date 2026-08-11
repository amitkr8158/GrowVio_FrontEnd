import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, BookOpen, StickyNote, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  highlight?: string;
  createdAt: string;
}

function storageKey(bookId: string, userId: number) {
  return `growvio_notes_${userId}_${bookId}`;
}

export default function NotesHighlights() {
  const { id: bookId = "" } = useParams();
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const [notes, setNotes] = useState<Note[]>([]);
  const [newText, setNewText] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  // Load from localStorage on mount
  // TODO: Replace localStorage with /api/users/notes when backend API is stable
  useEffect(() => {
    if (!bookId || !userId) return;
    try {
      const raw = localStorage.getItem(storageKey(bookId, userId));
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      setNotes([]);
    }
  }, [bookId, userId]);

  const persist = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem(storageKey(bookId, userId), JSON.stringify(updated));
  };

  const addNote = () => {
    if (!newText.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      highlight: newHighlight.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    persist([note, ...notes]);
    setNewText("");
    setNewHighlight("");
    setAdding(false);
    toast.success("Note saved locally");
  };

  const deleteNote = (id: string) => {
    persist(notes.filter((n) => n.id !== id));
    toast.success("Note deleted");
  };

  const filtered = notes.filter(
    (n) =>
      n.text.toLowerCase().includes(search.toLowerCase()) ||
      (n.highlight ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-1">Notes & Highlights</h1>
            <p className="text-sm text-ink-3">
              {notes.length} note{notes.length !== 1 ? "s" : ""} saved locally
              <span className="ml-2 text-[10px] bg-surface-3 text-ink-3 px-2 py-0.5 rounded-full">Saved locally</span>
            </p>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />Add Note
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
          <Input
            placeholder="Search your notes..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Add note form */}
        {adding && (
          <div className="bg-background border border-primary/30 rounded-xl p-4 mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-ink-1">New Note</h3>
            <Input
              placeholder="Quote or highlight (optional)"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
            />
            <Textarea
              placeholder="Your thoughts..."
              className="h-24"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addNote} disabled={!newText.trim()}>Save Note</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="notes">
          <TabsList className="mb-4">
            <TabsTrigger value="notes" className="gap-1">
              <StickyNote className="h-4 w-4" />Notes ({filtered.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-ink-4 mx-auto mb-3" />
                <p className="font-medium text-ink-1">
                  {notes.length === 0 ? "No notes yet" : "No notes match your search"}
                </p>
                <p className="text-sm text-ink-3 mt-1">
                  {notes.length === 0 && "Click 'Add Note' to capture your thoughts while reading."}
                </p>
              </div>
            ) : (
              filtered.map((n) => (
                <div key={n.id} className="bg-background border border-border rounded-xl p-4">
                  {n.highlight && (
                    <p className="text-xs bg-warning/20 border-l-4 border-warning px-3 py-2 rounded italic text-ink-2 mb-3">
                      "{n.highlight}"
                    </p>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-ink-2 flex-1">{n.text}</p>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="text-ink-4 hover:text-danger transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-ink-4 mt-2">
                    {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
