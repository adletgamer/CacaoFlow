import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Originator,
  Plot,
  PlotDocument,
  PlotStatus,
  DocumentationStatus,
  DocumentType,
} from "@/lib/types";

// ─── ID generators ───────────────────────────────────────────

function uid() {
  return crypto.randomUUID().slice(0, 8);
}
function now() {
  return new Date().toISOString();
}

// ─── Store interface ─────────────────────────────────────────

interface AppStore {
  originators: Originator[];
  plots: Plot[];
  documents: PlotDocument[];

  // Originator actions
  addOriginator: (data: Omit<Originator, "id" | "created_at">) => Originator;

  // Plot actions
  addPlot: (
    data: Omit<Plot, "id" | "status" | "documentation_status" | "created_at" | "updated_at">,
    docs: Array<{ document_type: DocumentType; file_name: string }>
  ) => Plot;

  // Document actions
  addDocument: (plotId: string, doc: { document_type: DocumentType; file_name: string }) => PlotDocument;
  getDocumentsForPlot: (plotId: string) => PlotDocument[];

  // Plot queries
  getPlotById: (id: string) => Plot | undefined;
  getOriginatorById: (id: string) => Originator | undefined;
  getOriginatorForPlot: (plot: Plot) => Originator | undefined;

  // Plot mutations
  updatePlotStatus: (plotId: string, status: PlotStatus) => void;
}

// ─── Store implementation ────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      originators: [],
      plots: [],
      documents: [],

      addOriginator: (data) => {
        const originator: Originator = {
          ...data,
          id: `ORG-${uid()}`,
          created_at: now(),
        };
        set((s) => ({ originators: [...s.originators, originator] }));
        return originator;
      },

      addPlot: (data, docs) => {
        const hasEvidence = docs.length > 0;
        const status: PlotStatus = hasEvidence ? "ready_for_scoring" : "registered";
        const documentation_status: DocumentationStatus = hasEvidence ? "sufficient" : "insufficient";

        const plot: Plot = {
          ...data,
          id: `PLOT-${uid()}`,
          status,
          documentation_status,
          created_at: now(),
          updated_at: now(),
        };

        const plotDocs: PlotDocument[] = docs.map((d) => ({
          id: `DOC-${uid()}`,
          plot_id: plot.id,
          document_type: d.document_type,
          file_name: d.file_name,
          file_url: `local://${d.file_name}`,
          uploaded_at: now(),
        }));

        set((s) => ({
          plots: [plot, ...s.plots],
          documents: [...s.documents, ...plotDocs],
        }));

        return plot;
      },

      addDocument: (plotId, doc) => {
        const plotDoc: PlotDocument = {
          id: `DOC-${uid()}`,
          plot_id: plotId,
          document_type: doc.document_type,
          file_name: doc.file_name,
          file_url: `local://${doc.file_name}`,
          uploaded_at: now(),
        };

        set((s) => {
          const updatedDocs = [...s.documents, plotDoc];
          const hasDocs = updatedDocs.some((d) => d.plot_id === plotId);
          const updatedPlots = s.plots.map((p) => {
            if (p.id !== plotId) return p;
            return {
              ...p,
              documentation_status: (hasDocs ? "sufficient" : "insufficient") as DocumentationStatus,
              status: (hasDocs && p.status === "registered" ? "ready_for_scoring" : p.status) as PlotStatus,
              updated_at: now(),
            };
          });
          return { documents: updatedDocs, plots: updatedPlots };
        });

        return plotDoc;
      },

      getDocumentsForPlot: (plotId) => {
        return get().documents.filter((d) => d.plot_id === plotId);
      },

      getPlotById: (id) => {
        return get().plots.find((p) => p.id === id);
      },

      getOriginatorById: (id) => {
        return get().originators.find((o) => o.id === id);
      },

      getOriginatorForPlot: (plot) => {
        return get().originators.find((o) => o.id === plot.originator_id);
      },

      updatePlotStatus: (plotId, status) => {
        set((s) => ({
          plots: s.plots.map((p) =>
            p.id === plotId ? { ...p, status, updated_at: now() } : p
          ),
        }));
      },
    }),
    {
      name: "cacao-flow-store",
    }
  )
);
